const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const translation = fs.readFileSync(path.join(__dirname, '../my_translate.user.js'), 'utf8');
const exporter = fs.readFileSync(path.join(__dirname, '../snapshot-export.user.js'), 'utf8');
const tick = dom => new Promise(resolve => dom.window.setTimeout(resolve, 0));

function setup(html, url) {
    const dom = new JSDOM(html, { url, runScripts: 'outside-only' });
    let exportPage, result;
    dom.window.GM_registerMenuCommand = (label, action) => { exportPage = action; };
    dom.window.Blob = class { constructor(parts) { result = parts.join(''); } };
    dom.window.URL.createObjectURL = () => 'blob:sample';
    dom.window.URL.revokeObjectURL = () => {};
    dom.window.HTMLAnchorElement.prototype.click = () => {};
    dom.window.eval(translation);
    dom.window.eval(exporter);
    return { dom, exportPage: () => exportPage(), snapshot: () => new JSDOM(result) };
}

test('无需关闭翻译：netcup 导出英文文本、标题和按钮，当前界面仍为中文', async () => {
    const { dom, exportPage, snapshot } = setup(`<div id="sidebar"><span>Overview</span></div>
        <div id="sitecontents"><h2>Outstanding invoices</h2><input type="submit" value="Link CCP account with Forum account"></div>`, 'https://www.customercontrolpanel.de/start.php');
    const d = dom.window.document;
    assert.equal(d.querySelector('span').textContent, '概览');
    const before = d.body.innerHTML;
    exportPage();
    assert.equal(d.body.innerHTML, before);
    const copy = snapshot();
    assert.equal(copy.window.document.querySelector('span').textContent, 'Overview');
    assert.equal(copy.window.document.querySelector('h2').textContent, 'Outstanding invoices');
    assert.equal(copy.window.document.querySelector('input').value, 'Link CCP account with Forum account');
    await tick(dom);
    assert.equal(d.body.innerHTML, before);
    copy.window.close(); dom.window.close();
});

test('绿云导出原始 placeholder 和按钮，不改变已输入的账号密码', async () => {
    const { dom, exportPage, snapshot } = setup(`<div class="logincontainer"><label>Email Address</label>
        <input type="email" name="username" placeholder="Enter email"><input type="password" name="password" placeholder="Password">
        <input type="submit" value="Login"></div>`, 'https://greencloudvps.com/billing/login');
    const d = dom.window.document;
    d.querySelector('[name=username]').value = 'example@example.invalid';
    d.querySelector('[name=password]').value = 'example-secret';
    assert.equal(d.querySelector('[name=username]').placeholder, '请输入电子邮箱');
    const before = d.body.innerHTML;
    exportPage();
    const copy = snapshot(), out = copy.window.document;
    assert.equal(out.querySelector('label').textContent, 'Email Address');
    assert.equal(out.querySelector('[name=username]').placeholder, 'Enter email');
    assert.equal(out.querySelector('[name=password]').placeholder, 'Password');
    assert.equal(out.querySelector('input[type=submit]').value, 'Login');
    assert.equal(out.querySelector('[name=password]').value, '[REDACTED]');
    await tick(dom);
    assert.equal(d.body.innerHTML, before);
    assert.equal(d.querySelector('[name=username]').value, 'example@example.invalid');
    assert.equal(d.querySelector('[name=password]').value, 'example-secret');
    copy.window.close(); dom.window.close();
});

test('动态文案记录最新英文；重复导出不会丢失原文或中文', async () => {
    const { dom, exportPage, snapshot } = setup('<div id="sidebar"><span title="Overview">Overview</span></div>', 'https://www.customercontrolpanel.de/start.php');
    const node = dom.window.document.querySelector('span');
    node.firstChild.data = 'Products';
    node.title = 'Products';
    await tick(dom);
    assert.equal(node.textContent, '产品');
    for (let i = 0; i < 2; i++) {
        exportPage();
        const copy = snapshot();
        assert.equal(copy.window.document.querySelector('span').textContent, 'Products');
        assert.equal(copy.window.document.querySelector('span').title, 'Products');
        assert.equal(node.textContent, '产品');
        assert.equal(node.title, '产品');
        copy.window.close();
        await tick(dom);
    }
    dom.window.close();
});

test('导出失败也恢复中文，不让页面停留在临时英文状态', async () => {
    const { dom, exportPage } = setup('<div id="sidebar">Overview</div>', 'https://www.customercontrolpanel.de/start.php');
    dom.window.document.implementation.createHTMLDocument = () => { throw new Error('example failure'); };
    assert.throws(exportPage, /example failure/);
    await tick(dom);
    assert.equal(dom.window.document.querySelector('#sidebar').textContent, '概览');
    dom.window.close();
});

test('临时还原期间不覆盖网站新写入的文本或属性', async () => {
    const { dom } = setup('<div id="sitecontents"><a title="Show Invoice Details">View Invoice</a></div>', 'https://www.customercontrolpanel.de/rechnungen.php');
    const d = dom.window.document, link = d.querySelector('a');
    d.dispatchEvent(new dom.window.Event('my_translate:export-start'));
    assert.equal(link.title, 'Show Invoice Details');
    link.title = 'Custom title';
    link.textContent = 'Custom content';
    d.dispatchEvent(new dom.window.Event('my_translate:export-end'));
    await tick(dom);
    assert.equal(link.title, 'Custom title');
    assert.equal(link.textContent, 'Custom content');
    dom.window.close();
});
