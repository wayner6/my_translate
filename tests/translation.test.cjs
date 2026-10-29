const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const source = fs.readFileSync(path.join(__dirname, '../netcup-ccp-zh-cn.user.js'), 'utf8');
function setup(html, page = 'start.php') {
    // outside-only 不执行样本内的脚本，也不加载网络资源。
    const dom = new JSDOM(html, {
        url: `https://www.customercontrolpanel.de/${page}`,
        runScripts: 'outside-only',
    });
    dom.window.eval(source);
    return dom;
}
const tick = dom => new Promise(resolve => dom.window.setTimeout(resolve, 0));

test('翻译文字和按钮，保留图标、链接、监听器及表单数据', () => {
    const dom = new JSDOM(`<div id="sidebar"><a href="produkte.php"><i class="icon"></i> <span>Products</span></a></div>
        <div id="sitecontents"><div class="panel-heading"> Welcome Sample User </div>
        <input type="hidden" name="token" value="Overview"><input name="username" value="Products">
        <input type="password" value="Products"><input type="submit" value="Link CCP account with Forum account">
        <input type="submit" name="action" value="Submit Trustpilot rating">
        <textarea>Overview</textarea><code>Products</code><div contenteditable="true">Products</div>
        <p translate="no">Overview</p><p class="notranslate">Overview</p><script>const label = 'Products';</script></div>
        <div id="other-extension">Overview</div>`, { url: 'https://www.customercontrolpanel.de/start.php', runScripts: 'outside-only' });
    const document = dom.window.document;
    const anchor = document.querySelector('a');
    const icon = document.querySelector('i');
    const before = [...document.querySelectorAll('input[name], input[type=password]')].map(el => el.outerHTML);
    let clicked = false;
    anchor.addEventListener('custom-test', () => { clicked = true; });
    dom.window.eval(source);
    assert.equal(anchor.querySelector('span').textContent, '产品');
    assert.equal(anchor.getAttribute('href'), 'produkte.php');
    assert.equal(anchor.querySelector('i'), icon);
    anchor.dispatchEvent(new dom.window.Event('custom-test'));
    assert.ok(clicked);
    assert.equal(document.querySelector('.panel-heading').textContent.trim(), '欢迎您，Sample User');
    assert.equal(document.querySelector('input[type=submit]:not([name])').value, '关联 CCP 账号与论坛账号');
    assert.deepEqual([...document.querySelectorAll('input[name], input[type=password]')].map(el => el.outerHTML), before);
    for (const selector of ['textarea', 'code', '[contenteditable]', '[translate=no]', '.notranslate', '#other-extension']) {
        assert.match(document.querySelector(selector).textContent, /^(Overview|Products)$/);
    }
    assert.equal(document.querySelector('script').textContent, "const label = 'Products';");
    dom.window.close();
});

test('动态插入、修改文字及按钮；重复运行不会破坏页面', async () => {
    const dom = setup('<div id="sitecontents"></div>');
    const root = dom.window.document.querySelector('#sitecontents');
    const heading = dom.window.document.createElement('h2');
    heading.textContent = 'Outstanding invoices';
    root.append(heading);
    await tick(dom);
    assert.equal(heading.textContent, '待付账单');
    heading.firstChild.data = 'Overview';
    await tick(dom);
    assert.equal(heading.textContent, '概览');
    const button = dom.window.document.createElement('input');
    button.type = 'button';
    button.value = 'Submit Trustpilot rating';
    root.append(button);
    await tick(dom);
    assert.equal(button.value, '提交 Trustpilot 评价');
    button.setAttribute('value', 'Link CCP account with Forum account');
    await tick(dom);
    assert.equal(button.value, '关联 CCP 账号与论坛账号');
    const before = root.innerHTML;
    dom.window.eval(source);
    await tick(dom);
    assert.equal(root.innerHTML, before);
    dom.window.close();
});

test('其他页面只翻译公共导航，不碰未知正文', () => {
    const dom = setup('<div id="sidebar">Products</div><div id="sitecontents">Overview</div>', 'produkte.php');
    assert.equal(dom.window.document.querySelector('#sidebar').textContent, '产品');
    assert.equal(dom.window.document.querySelector('#sitecontents').textContent, 'Overview');
    dom.window.close();
});

test('动态替换整个导航区域也可翻译', async () => {
    const dom = setup('<main></main>');
    dom.window.document.querySelector('main').innerHTML = '<div id="sidebar"><span>Products</span></div>';
    await tick(dom);
    assert.equal(dom.window.document.querySelector('#sidebar').textContent, '产品');
    dom.window.close();
});

const samplePath = path.join(__dirname, '../uploads/netcup_ccp.html');
test('上传样本：整页文字覆盖及敏感字段不变（不执行原站脚本）', { skip: !fs.existsSync(samplePath) }, () => {
    const html = fs.readFileSync(samplePath, 'utf8');
    const baseline = new JSDOM(html);
    const dom = setup(html);
    const document = dom.window.document;
    const selectors = ['script', 'input[name]', 'a[href]', 'img[src]', '.navbar-title strong'];
    for (const selector of selectors) {
        const original = [...baseline.window.document.querySelectorAll(selector)];
        const translated = [...document.querySelectorAll(selector)];
        assert.equal(translated.length, original.length);
        original.forEach((node, i) => {
            if (selector === 'a[href]') assert.equal(translated[i].getAttribute('href'), node.getAttribute('href'));
            else assert.ok(translated[i].outerHTML === node.outerHTML, `${selector}: 原始数据被改动`);
        });
    }
    assert.equal(document.querySelectorAll('#sidebar span').length, 8);
    assert.equal(document.querySelector('#sidebar span').textContent, '概览');
    assert.equal(document.querySelector('input[type=password]').value, '');
    assert.match(document.querySelector('#sitecontents').textContent, /点击按钮会将您的姓名和电子邮箱地址提交给 Trustpilot/);
    const walker = document.createTreeWalker(document.querySelector('#sitecontents'), dom.window.NodeFilter.SHOW_TEXT);
    const untranslated = [];
    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement.closest('script, noscript')) continue;
        const value = node.data.replace(/\s+/g, ' ').trim();
        if (/[a-z]{3}/i.test(value) && !/[\u3400-\u9fff]/.test(value) && value !== 'noreply@netcup.com' && value !== 'Trustpilot') {
            untranslated.push(value);
        }
    }
    assert.equal(untranslated.length, 0, '存在未翻译的界面文本');
    baseline.window.close();
    dom.window.close();
});
