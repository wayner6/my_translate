const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const source = fs.readFileSync(path.join(__dirname, '../netcup-ccp-zh-cn.user.js'), 'utf8');
function create(html, page) {
    return new JSDOM(html, {
        url: `https://www.customercontrolpanel.de/${page}`,
        runScripts: 'outside-only',
    });
}
const tick = dom => new Promise(resolve => dom.window.setTimeout(resolve, 0));

for (const [page, english, chinese] of [
    ['produkte.php', 'Category', '类别'],
    ['domains.php', 'External domains', '外部域名'],
    ['rechnungen.php', 'Future invoice items', '待出账项目'],
    ['abuse.php', 'Here you will find your Abuse Notices.', '您可以在这里查看滥用通知。'],
    ['partnerprogramm.php', 'I accept the terms of the contract', '我接受合同条款'],
    ['daten_aendern.php', 'Disable Two-factor Authentication', '停用双重身份验证'],
]) {
    test(`页面路由和 /run/ 路由：${page}`, () => {
        for (const route of [page, `run/${page}`]) {
            const dom = create(`<div id="sitecontents"><span>${english}</span></div><div id="external">${english}</div>`, route);
            dom.window.eval(source);
            assert.equal(dom.window.document.querySelector('#sitecontents').textContent, chinese);
            assert.equal(dom.window.document.querySelector('#external').textContent, english);
            dom.window.close();
        }
    });
}

test('下拉选项翻译不改变选中项、提交值；不改无显式 value 的选项', async () => {
    const dom = create(`<div id="sitecontents"><form><select name="type_id">
        <option value="0">All</option><option value="1" selected>included</option>
        <option>All</option></select><input name="search" value="Domains">
        <input type="hidden" name="token" value="Search"><button type="submit" name="action" value="lookup">Search</button>
        <input type="checkbox" name="agreement" value="accepted"></form></div>`, 'domains.php');
    const d = dom.window.document;
    const form = d.querySelector('form');
    const select = d.querySelector('select');
    const values = () => [...new dom.window.FormData(form).entries()];
    const before = values();
    let submits = 0;
    form.addEventListener('submit', event => { submits++; event.preventDefault(); });
    dom.window.eval(source);
    await tick(dom);
    assert.deepEqual(values(), before);
    assert.equal(select.selectedIndex, 1);
    assert.equal(select.value, '1');
    assert.equal(select.options[0].textContent, '全部');
    assert.equal(select.options[1].textContent, '套餐内含');
    assert.equal(select.options[2].textContent, 'All');
    assert.equal(select.options[2].value, 'All');
    assert.equal(d.querySelector('button').textContent, '搜索');
    assert.equal(d.querySelector('button').value, 'lookup');
    assert.equal(d.querySelector('input[type=checkbox]').checked, false);
    assert.equal(submits, 0);
    const option = d.createElement('option');
    option.value = '2';
    option.textContent = 'in addition';
    select.append(option);
    await tick(dom);
    assert.equal(option.textContent, '额外订购');
    assert.deepEqual(values(), before);
    dom.window.close();
});

test('账单日期、状态、悬浮提示及动态结果；不翻译表格里的客户数据', async () => {
    const dom = create(`<div id="sitecontents"><div class="panel-body">Your individual billing date is the 12 of the month.</div>
        <table><tbody><tr><td>Search</td><td>nc-example</td><td><span class="text-success">paid</span></td>
        <td><a href="pdf.php?id=example" title="Download PDF for invoice">PDF</a></td></tr></tbody></table></div>`, 'rechnungen.php');
    const d = dom.window.document;
    dom.window.eval(source);
    assert.equal(d.querySelector('.panel-body').textContent, '您的账单日为每月 12 日。');
    assert.equal(d.querySelector('td').textContent, 'Search');
    assert.equal(d.querySelector('span').textContent, '已支付');
    assert.equal(d.querySelector('a').title, '下载账单 PDF');
    const result = d.createElement('div');
    result.innerHTML = '<span>Status</span><a title="Show Invoice Details">Details</a>';
    d.querySelector('#sitecontents').append(result);
    await tick(dom);
    assert.equal(result.querySelector('span').textContent, '状态');
    assert.equal(result.querySelector('a').title, '查看账单详情');
    result.querySelector('a').title = 'Download PDF for invoice';
    await tick(dom);
    assert.equal(result.querySelector('a').title, '下载账单 PDF');
    dom.window.close();
});

test('基本资料中仅翻译说明、保留国家和个人信息，不停用 2FA', async () => {
    const dom = create(`<div id="sitecontents"><form action="/run/daten_aendern.php" method="post">
        <label>Exampleland (This can only be changed by our Support.)<small>Your VAT rate is: 19%.</small></label>
        <input name="email" value="sample@example.invalid"><input type="password" name="password" value="Example">
        <input type="hidden" name="action" value="remove_2fa_token"><button type="submit">Disable Two-factor Authentication</button>
        </form></div>`, 'daten_aendern.php');
    const d = dom.window.document;
    let submits = 0;
    d.querySelector('form').addEventListener('submit', () => submits++);
    const before = [...new dom.window.FormData(d.querySelector('form'))];
    dom.window.eval(source);
    await tick(dom);
    assert.match(d.querySelector('label').textContent, /Exampleland（仅可由我们的支持团队修改。\uff09/);
    assert.equal(d.querySelector('small').textContent, '您的增值税税率为：19%。');
    assert.equal(d.querySelector('button').textContent, '停用双重身份验证');
    assert.deepEqual([...new dom.window.FormData(d.querySelector('form'))], before);
    assert.equal(submits, 0);
    dom.window.close();
});

test('站点弹窗可翻译，但其他扩展的弹窗不受影响', async () => {
    const dom = create('<div id="sitecontents">Affiliate program</div>', 'partnerprogramm.php');
    dom.window.eval(source);
    const d = dom.window.document;
    const modal = d.createElement('div');
    modal.id = 'modal_checkAgreement';
    modal.innerHTML = '<h3>Terms of contract</h3><p>You must agree to the terms of the contract by confirming the checkbox.</p><button>ok</button>';
    d.body.append(modal);
    const external = d.createElement('div');
    external.className = 'modal';
    external.textContent = 'Terms of contract';
    d.body.append(external);
    await tick(dom);
    assert.equal(modal.querySelector('h3').textContent, '合同条款');
    assert.equal(modal.querySelector('p').textContent, '请勾选复选框以同意合同条款。');
    assert.equal(modal.querySelector('button').textContent, '确定');
    assert.equal(external.textContent, 'Terms of contract');
    dom.window.close();
});

const samples = [
    ['products', 'produkte.php'], ['domains', 'domains.php'], ['invoice', 'rechnungen.php'],
    ['abuse', 'abuse.php'], ['affiliate', 'partnerprogramm.php'], ['master', 'daten_aendern.php'],
];
for (const [name, page] of samples) {
    const file = path.join(__dirname, `../uploads/Netcup/netcup_${name}.html`);
    test(`本地样本 ${name}：界面覆盖、表单和脚本不变`, { skip: !fs.existsSync(file) }, async () => {
        const html = fs.readFileSync(file, 'utf8');
        const dom = create(html, page);
        const d = dom.window.document;
        const forms = [...d.querySelectorAll('form')];
        const dataBefore = forms.map(form => [...new dom.window.FormData(form)]);
        const scriptsBefore = [...d.querySelectorAll('script')].map(el => el.outerHTML);
        const inputsBefore = [...d.querySelectorAll('input')].map(el => el.outerHTML);
        const attrsBefore = [...d.querySelectorAll('a, form, button, select, option')].map(el =>
            [...el.attributes].filter(a => a.name !== 'title').map(a => [a.name, a.value]));
        const checkboxesBefore = [...d.querySelectorAll('input[type=checkbox]')].map(el => el.checked);
        let submits = 0;
        for (const form of forms) form.addEventListener('submit', () => submits++);
        dom.window.eval(source);
        await tick(dom);
        // 用布尔断言避免失败时把原始账号信息打印到测试日志。
        assert.ok(JSON.stringify(forms.map(form => [...new dom.window.FormData(form)])) === JSON.stringify(dataBefore), '表单提交数据改变');
        assert.ok(JSON.stringify([...d.querySelectorAll('script')].map(el => el.outerHTML)) === JSON.stringify(scriptsBefore), '原站脚本改变');
        assert.ok(JSON.stringify([...d.querySelectorAll('input')].map(el => el.outerHTML)) === JSON.stringify(inputsBefore), '原始输入字段改变');
        assert.ok(JSON.stringify([...d.querySelectorAll('a, form, button, select, option')].map(el =>
            [...el.attributes].filter(a => a.name !== 'title').map(a => [a.name, a.value]))) === JSON.stringify(attrsBefore), '业务属性改变');
        assert.deepEqual([...d.querySelectorAll('input[type=checkbox]')].map(el => el.checked), checkboxesBefore);
        assert.equal(submits, 0);

        const allowed = new Set(['API', 'VPS x86', 'VPS Lite', 'VPS ARM', 'Root Server']);
        let untranslated = 0;
        for (const root of d.querySelectorAll('#sitecontents, .modal')) {
            const walker = d.createTreeWalker(root, dom.window.NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const node = walker.currentNode;
                const parent = node.parentElement;
                if (parent.closest('script, style, noscript, textarea, pre, code')) continue;
                if (parent.closest('tbody') && !parent.matches('span.text-success, span.text-warning, span.text-danger')) continue;
                if (parent.matches('label') && parent.querySelector('a[href*="change-of-ownership"]')) continue;
                const text = node.data.replace(/\s+/g, ' ').trim();
                if (/[a-z]{3}/i.test(text) && !/[\u3400-\u9fff]/.test(text) && !allowed.has(text)) untranslated++;
            }
        }
        assert.equal(untranslated, 0, '存在未覆盖的界面文字');
        const before = d.querySelector('#sitecontents').innerHTML;
        dom.window.eval(source);
        await tick(dom);
        assert.ok(d.querySelector('#sitecontents').innerHTML === before, '重复运行改变内容');
        dom.window.close();
    });
}
