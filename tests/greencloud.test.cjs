const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../my_translate.user.js'), 'utf8');
const create = (html, page = 'clientarea.php') => new JSDOM(html, {
    url: `https://greencloudvps.com/billing/${page}`, runScripts: 'outside-only',
});
const tick = dom => new Promise(resolve => dom.window.setTimeout(resolve, 0));

test('绿云：固定文案翻译，产品名、配置、域名、金额、时间和用户资料不变', async () => {
    const dom = create(`<section id="main-menu"><li id="Secondary_Navbar-Account"><a>Hello, Alice $&!</a></li></section>
        <section id="main-body"><div class="header-lined"><h1>Welcome Back, Alice $&</h1></div>
        <div menuitemname="Client Details"><div class="panel-body">Services, 192.0.2.1, 42 Example Road</div></div>
        <div id="servicesPanel"><div class="panel-heading">Your Active Products/Services</div>
        <div class="div-service-name"><span>Services</span><span>Custom Plan 16GB $23.99</span><span>host.example.invalid</span></div>
        <div class="div-service-status"><span>Active</span></div><div class="div-service-buttons"><button>View Details</button></div></div>
        <div id="ticketsPanel"><div class="list-group-item">Services - custom ticket text<label class="label">Closed</label><small>Last Updated: 1st January 2030</small></div></div>
        <div class="tile"><div class="stat">99</div></div></section>`);
    const d = dom.window.document;
    const variables = ['.div-service-name', '[menuitemname="Client Details"] .panel-body', '.stat'];
    const before = variables.map(s => d.querySelector(s).outerHTML);
    dom.window.eval(source);
    await tick(dom);
    assert.deepEqual(variables.map(s => d.querySelector(s).outerHTML), before);
    assert.equal(d.querySelector('#Secondary_Navbar-Account a').textContent, '您好，Alice $&！');
    assert.equal(d.querySelector('h1').textContent, '欢迎回来，Alice $&');
    assert.equal(d.querySelector('.div-service-status').textContent, '使用中');
    assert.equal(d.querySelector('button').textContent, '查看详情');
    assert.equal(d.querySelector('#ticketsPanel .list-group-item').firstChild.data, 'Services - custom ticket text');
    assert.equal(d.querySelector('#ticketsPanel .label').textContent, '已关闭');
    assert.equal(d.querySelector('#ticketsPanel small').textContent, '最后更新：1st January 2030');
    d.querySelector('.div-service-name span').firstChild.data = 'Login';
    const button = d.createElement('button');
    button.textContent = 'View Details';
    d.querySelector('.div-service-buttons').append(button);
    await tick(dom);
    assert.equal(button.textContent, '查看详情');
    assert.equal(d.querySelector('.div-service-name span').textContent, 'Login');
    dom.window.close();
});

test('绿云登录：不读取或改变密码、验证码、令牌，不触发登录', async () => {
    const dom = create(`<div class="logincontainer"><form action="dologin.php" method="post">
        <label>Email Address</label><input type="email" name="username" placeholder="Enter email" value="alice@example.invalid">
        <input type="password" name="password" placeholder="Password" value="ExampleSecret"><input name="code" value="1234">
        <input type="hidden" name="token" value="example-token"><input type="checkbox" name="rememberme" checked>
        <input type="submit" value="Login"><button name="action" value="login">Login</button></form></div>`, 'login');
    const d = dom.window.document, form = d.querySelector('form');
    const before = [...new dom.window.FormData(form)];
    let submits = 0;
    form.addEventListener('submit', () => submits++);
    dom.window.eval(source);
    await tick(dom);
    assert.deepEqual([...new dom.window.FormData(form)], before);
    assert.equal(d.querySelector('input[type=email]').placeholder, '请输入电子邮箱');
    assert.equal(d.querySelector('input[type=password]').placeholder, '密码');
    assert.equal(d.querySelector('input[type=submit]').value, '登录');
    assert.equal(d.querySelector('button').value, 'login');
    assert.equal(submits, 0);
    dom.window.close();
});

test('绿云：带 action 的未知子页面不套用首页规则，语言选项不翻译', () => {
    const dom = create('<section id="main-menu">Services</section><div class="panel-heading">Services</div><div id="languageChooserContent">English</div>', 'clientarea.php?action=services');
    dom.window.eval(source);
    assert.equal(dom.window.document.querySelector('#main-menu').textContent, '服务');
    assert.equal(dom.window.document.querySelector('.panel-heading').textContent, 'Services');
    assert.equal(dom.window.document.querySelector('#languageChooserContent').textContent, 'English');
    dom.window.close();
});

for (const file of ['login', 'clientarea']) {
    const sample = path.join(__dirname, `../uploads/GreenCloud/${file}.html`);
    test(`绿云本地样本 ${file}：文案覆盖及业务字段保留`, { skip: !fs.existsSync(sample) }, async () => {
        const dom = create(fs.readFileSync(sample, 'utf8'), file === 'login' ? 'login' : 'clientarea.php');
        const d = dom.window.document;
        const businessFields = () => [...d.querySelectorAll('input[name], textarea, select')].map(e => {
            const clone = e.cloneNode(true);
            for (const attr of ['placeholder', 'title', 'aria-label']) clone.removeAttribute(attr);
            return clone.outerHTML;
        });
        const controls = businessFields();
        const variables = [...d.querySelectorAll('.div-service-name, [menuitemname="Client Details"] .panel-body')].map(e => e.outerHTML);
        const links = [...d.querySelectorAll('a')].map(e => e.getAttribute('href'));
        dom.window.eval(source);
        await tick(dom);
        // placeholder 是显示文案，允许改变；表单值和业务属性必须不变。
        assert.ok(JSON.stringify(businessFields()) === JSON.stringify(controls), '业务输入字段改变');
        assert.ok(JSON.stringify([...d.querySelectorAll('.div-service-name, [menuitemname="Client Details"] .panel-body')].map(e => e.outerHTML)) === JSON.stringify(variables));
        assert.ok(JSON.stringify([...d.querySelectorAll('a')].map(e => e.getAttribute('href'))) === JSON.stringify(links));
        assert.match(d.querySelector('h1').textContent, /客户中心|登录/);
        assert.match(d.querySelector('#main-menu').textContent, /首页/);
        if (file === 'login') assert.equal(d.querySelector('#login').value, '登录');
        else assert.match(d.querySelector('#servicesPanel .panel-heading').textContent, /您的有效产品/);
        const allowed = new Set(['[REDACTED]', 'sales@greencloudvps.com', 'Windows VPS', 'KVM VPS']);
        let missing = 0;
        for (const root of d.querySelectorAll('.logincontainer, .header-lined, .panel-heading, .panel-footer, .tiles .title, #servicesPanel .div-service-status, #servicesPanel .div-service-buttons, #servicesPanel .btn-view-more, #ticketsPanel .label, #ticketsPanel small, #footer')) {
            const walker = d.createTreeWalker(root, dom.window.NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const node = walker.currentNode, parent = node.parentElement;
                if (parent.closest('.footer-links, script, style')) continue; // 产品系列名保留。
                const text = node.data.replace(/\s+/g, ' ').trim();
                if (/[a-z]{3}/i.test(text) && !/[\u3400-\u9fff]/.test(text) && !allowed.has(text)) missing++;
            }
        }
        assert.equal(missing, 0, '固定文案存在漏译');
        const before = d.body.innerHTML;
        dom.window.eval(source);
        await tick(dom);
        assert.ok(d.body.innerHTML === before);
        dom.window.close();
    });
}
