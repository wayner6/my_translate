const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { sanitizeSnapshot } = require('../snapshot-export.user.js');
const source = fs.readFileSync(path.join(__dirname, '../my_translate.user.js'), 'utf8');
const tick = dom => new Promise(resolve => dom.window.setTimeout(resolve, 0));
const create = (html, route) => new JSDOM(html, {
    url: `https://greencloudvps.com/billing/${route}`, runScripts: 'outside-only',
});

test('账户表单：保留个人资料、选择值及具名按钮参数，只翻译文案和取消按钮', async () => {
    const dom = create(`<section id="main-body"><form method="post"><label>First Name</label>
        <input name="firstname" value="English"><input name="email" value="example@example.invalid">
        <select name="country"><option value="US" selected>English</option></select>
        <select name="state"><option value="state-1" selected>Default</option></select>
        <select name="billingcid"><option value="0">Use Default Contact (Details Above)</option><option value="42" selected>Active</option></select>
        <select name="accountLanguage"><option value="english" selected>English</option><option value="chinese">Chinese</option></select>
        <input type="checkbox" name="generalemails" value="1" checked><input type="submit" name="save" value="Save Changes">
        <input type="reset" value="Cancel"></form></section>`, 'clientarea.php?action=details');
    const d = dom.window.document, form = d.querySelector('form');
    const before = [...new dom.window.FormData(form)];
    let events = 0;
    for (const event of ['submit', 'change', 'reset']) form.addEventListener(event, () => events++);
    dom.window.eval(source); await tick(dom);
    assert.equal(d.querySelector('label').textContent, '名');
    assert.equal(d.querySelector('[name=country] option').textContent, 'English');
    assert.equal(d.querySelector('[name=state] option').textContent, 'Default');
    assert.equal(d.querySelector('[name=billingcid] option[value="42"]').textContent, 'Active');
    assert.equal(d.querySelector('[name=billingcid] option[value="0"]').textContent, '使用默认联系人（上述资料）');
    assert.equal(d.querySelector('[name=accountLanguage] option[value=chinese]').textContent, '中文');
    assert.equal(d.querySelector('[name=save]').value, 'Save Changes');
    assert.equal(d.querySelector('[name=save]').title, '保存更改');
    assert.equal(d.querySelector('[name=save]').getAttribute('aria-label'), '保存更改');
    assert.equal(d.querySelector('input[type=reset]').value, '取消');
    assert.deepEqual([...new dom.window.FormData(form)], before);
    assert.equal(d.querySelector('[name=generalemails]').checked, true);
    assert.equal(events, 0);
    d.dispatchEvent(new dom.window.Event('my_translate:export-start'));
    assert.equal(d.querySelector('[name=save]').title, '');
    assert.equal(d.querySelector('input[type=reset]').value, 'Cancel');
    assert.equal(d.querySelector('[name=accountLanguage] option[value=chinese]').textContent, 'Chinese');
    d.dispatchEvent(new dom.window.Event('my_translate:export-end'));
    await tick(dom);
    assert.equal(d.querySelector('[name=save]').title, '保存更改');
    assert.deepEqual([...new dom.window.FormData(form)], before);
    dom.window.close();
});

test('用户管理：权限、邀请和删除仅翻译文案，不改变复选框或触发业务操作', async () => {
    const dom = create(`<section id="main-body"><p>12 Users Found</p>
        <table><tbody><tr><td>Active</td><td><span class="label">Owner</span><a class="btn">Remove Access</a></td></tr></tbody></table>
        <form><input type="email" name="inviteemail" value="example@example.invalid">
        <label><input type="radio" name="permissions" value="all" checked>All Permissions</label>
        <label><input type="checkbox" name="perms[profile]" value="profile">Modify Master Account Profile - Access and modify the client profile information</label>
        <button type="submit">Send Invite</button></form><div class="modal"><p>Are you sure you wish to remove this users access?</p></div></section>`, 'account/users');
    const d = dom.window.document, form = d.querySelector('form');
    const before = [...new dom.window.FormData(form)];
    let submits = 0; form.addEventListener('submit', () => submits++);
    dom.window.eval(source); await tick(dom);
    assert.equal(d.querySelector('p').textContent, '找到 12 位用户');
    assert.equal(d.querySelector('td').textContent, 'Active');
    assert.equal(d.querySelector('.label').textContent, '账户所有者');
    assert.equal(d.querySelector('.btn').textContent, '移除访问权限');
    assert.equal(d.querySelector('button').textContent, '发送邀请');
    assert.equal(d.querySelector('.modal p').textContent, '确定要移除此用户的访问权限吗？');
    assert.deepEqual([...new dom.window.FormData(form)], before);
    assert.equal(d.querySelector('input[type=checkbox]').checked, false);
    assert.equal(submits, 0);
    dom.window.close();
});

test('SSO 设置：翻译开关说明但不切换状态或提交表单', () => {
    const dom = create(`<section id="main-body"><form><input type="hidden" name="action" value="toggle_sso">
        <span>ON</span><span>OFF</span><input type="checkbox" name="allow_sso" value="1" checked>
        <span id="ssoStatusTextEnabled">Single Sign-On is currently permitted for your account.</span>
        <span id="ssoStatusTextDisabled" class="hidden">Single Sign-On is currently disabled for your account.</span></form></section>`, 'clientarea.php?action=security');
    const d = dom.window.document;
    const before = [...new dom.window.FormData(d.querySelector('form'))];
    dom.window.eval(source);
    assert.equal(d.querySelector('span').textContent, '开启');
    assert.equal(d.querySelector('#ssoStatusTextEnabled').textContent, '您的账户目前允许单点登录。');
    assert.equal(d.querySelector('#ssoStatusTextDisabled').className, 'hidden');
    assert.deepEqual([...new dom.window.FormData(d.querySelector('form'))], before);
    assert.equal(d.querySelector('[name=allow_sso]').checked, true);
    dom.window.close();
});

test('联系人导出：清除动态联系人选项，保留固定的新增及默认联系人文案', () => {
    const dom = create(`<select name="contactid"><option value="new">Add New Contact</option><option value="42">Example Person</option></select>
        <select name="billingcid"><option value="0">Use Default Contact (Details Above)</option><option value="42">Example Person</option></select>`, 'account/contacts');
    const html = sanitizeSnapshot(dom.window.document, dom.window.location.href);
    assert.ok(!html.includes('Example Person'));
    const clean = new JSDOM(html);
    assert.match(clean.window.document.querySelector('[name=contactid]').textContent, /Add New Contact/);
    assert.match(clean.window.document.querySelector('[name=billingcid]').textContent, /Use Default Contact \(Details Above\)/);
    dom.window.close(); clean.window.close();
});

const samples = {
    account_details: '账户资料', user_management: '用户管理', contacts: '联系人',
    account_security: '账户安全', email_history: '我的邮件',
};
for (const [name, heading] of Object.entries(samples)) {
    const file = path.join(__dirname, `../uploads/GreenCloud/${name}.html`);
    test(`绿云账户样本 ${name}：固定文案覆盖、个人数据和参数保留`, { skip: !fs.existsSync(file) }, async () => {
        const html = fs.readFileSync(file, 'utf8');
        const dom = new JSDOM(html, { runScripts: 'outside-only' }), d = dom.window.document;
        dom.reconfigure({ url: d.querySelector('meta[name=snapshot-url]').content });
        const forms = [...d.querySelectorAll('form')];
        const formData = () => JSON.stringify(forms.map(form => [...new dom.window.FormData(form)]));
        const dataBefore = formData();
        // 无 name 的按钮不参与提交，允许改变显示值。
        const businessInputs = () => [...d.querySelectorAll('input[name]')].map(el => [el.name, el.value, el.checked]);
        const inputsBefore = JSON.stringify(businessInputs());
        const regions = [...d.querySelectorAll('.country-list, .selected-flag, .selected-dial-code, select[name=country], select[name=state]')];
        const regionBefore = regions.map(el => el.outerHTML);
        const links = () => JSON.stringify([...d.querySelectorAll('a')].map(el => [el.getAttribute('href'), el.getAttribute('onclick')]));
        const linksBefore = links();
        let actions = 0;
        for (const event of ['submit', 'change', 'reset']) d.addEventListener(event, () => actions++);
        dom.window.eval(source); await tick(dom);
        assert.ok(d.querySelector('#main-body').textContent.includes(heading));
        assert.ok(formData() === dataBefore, '表单数据改变');
        assert.ok(JSON.stringify(businessInputs()) === inputsBefore, '输入值或勾选状态改变');
        assert.ok(JSON.stringify(regions.map(el => el.outerHTML)) === JSON.stringify(regionBefore), '地区数据改变');
        assert.ok(links() === linksBefore, '业务链接改变');
        assert.equal(actions, 0);
        const allowed = new Set(['[REDACTED]', 'Google', 'Bing', 'Web Hosting Talk', 'Lowendtalk', 'BTC/USDT (TRC-20)']);
        let missing = 0;
        const walker = d.createTreeWalker(d.querySelector('#main-body'), dom.window.NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode, parent = node.parentElement;
            if (parent.closest('script, style, .country-list, .selected-dial-code, .selected-flag, select[name=country], select[name=state]')) continue;
            if (parent.closest('tbody td') && !parent.closest('.btn, button, .label, .status, .dataTables_empty')) continue;
            const text = node.data.replace(/\s+/g, ' ').trim();
            if (/[a-z]{3}/i.test(text) && !/[\u3400-\u9fff]/.test(text) && !allowed.has(text)) missing++;
        }
        assert.equal(missing, 0, '固定文案存在漏译');
        if (d.querySelector('input[name=save]')) {
            assert.equal(d.querySelector('input[name=save]').value, 'Save Changes');
            assert.equal(d.querySelector('input[name=save]').title, '保存更改');
        }
        const after = d.body.innerHTML;
        dom.window.eval(source); await tick(dom);
        assert.ok(d.body.innerHTML === after, '重复执行改变页面');
        dom.window.close();
    });
}
