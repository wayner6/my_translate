const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { sanitizeSnapshot, collectSecrets } = require('../snapshot-export.user.js');
const page = 'https://greencloudvps.com/billing/clientarea.php';

test('导出：移除个人资料、输入值、令牌、工单内容、资源和活动脚本，不修改原页面', () => {
    const dom = new JSDOM(`<!doctype html><html><head><script>var csrfToken = 'private-csrf-token';</script>
        <link href="https://example.invalid/private.css"><meta name="secret" content="other-private"></head><body>
        <!-- private-comment --><div data-token="data-private" onclick="deleteAccount()">Contact alice@example.invalid at 192.0.2.99</div>
        <li id="Secondary_Navbar-Account"><a>Hello, Alice!</a></li><div class="header-lined"><h1>Welcome Back, Alice</h1></div>
        <div menuitemname="Client Details"><div class="panel-body"><strong>Example Company</strong><em>Alice Smith</em>42 Example Street</div></div>
        <div class="div-service-name"><span>Private Plan</span><span>private-hostname</span></div>
        <div id="ticketsPanel"><a class="list-group-item" href="viewticket.php?tid=123456&amp;c=private-code">Private support subject<label class="label">Closed</label></a></div>
        <form action="clientarea.php?action=services&amp;id=123456"><input name="token" type="hidden" value="private-form-token">
        <input name="email" type="email" value="alice@example.invalid"><input type="password" value="initial-password">
        <textarea>private textarea</textarea><input type="submit" value="Login"></form>
        <a href="javascript:alert('private')">Bad</a><img src="captcha.php?token=private-image"><iframe src="private-chat"></iframe>
        <unknown-extension data-id="private-extension">private injection</unknown-extension>
        </body></html>`, { url: page });
    const d = dom.window.document;
    d.querySelector('input[type=password]').value = 'live-password';
    const before = d.documentElement.outerHTML;
    const html = sanitizeSnapshot(d, page);
    assert.ok(d.documentElement.outerHTML === before);
    assert.equal(d.querySelector('input[type=password]').value, 'live-password');
    const sensitive = ['Alice', 'Example Company', '42 Example Street', 'private', '192.0.2.99', 'alice@example.invalid', '123456', 'other-private', 'initial-password', 'live-password'];
    for (const value of sensitive) assert.ok(!html.includes(value), '敏感值残留');
    const clean = new JSDOM(html);
    const out = clean.window.document;
    assert.equal(out.querySelectorAll('script, link, iframe, [src], [data-token], [onclick], unknown-extension').length, 0);
    assert.ok(out.querySelector('meta[http-equiv="Content-Security-Policy"]'));
    assert.equal(out.querySelector('input[type=submit]').value, 'Login');
    assert.equal(out.querySelector('#ticketsPanel .label').textContent, 'Closed');
    assert.equal(new URL(out.querySelector('form').action).searchParams.get('action'), 'services');
    assert.equal(new URL(out.querySelector('form').action).searchParams.get('id'), '[REDACTED]');
    assert.equal(out.querySelector('input[type=password]').value, '[REDACTED]');
    assert.equal(sanitizeSnapshot(out, page), html);
    dom.window.close();
    clean.window.close();
});

test('跨页共享脱敏值；邮箱和 IPv4/IPv6 自动清除，保留公开客服邮箱', () => {
    const a = new JSDOM('<input name="email" value="member@example.invalid"><div class="navbar-title"><strong>Example Person</strong></div>');
    const b = new JSDOM('<p>Example Person, member@example.invalid, 2001:db8:abcd:1234::1, 198.51.100.2</p><p>sales@greencloudvps.com</p>');
    const html = sanitizeSnapshot(b.window.document, page, collectSecrets(a.window.document));
    assert.ok(!html.includes('Example Person') && !html.includes('member@example.invalid'));
    assert.ok(!html.includes('2001:db8:abcd:1234::1') && !html.includes('198.51.100.2'));
    assert.match(html, /sales@greencloudvps.com/);
    a.window.close(); b.window.close();
});

test('导出菜单和快捷键下载脱敏副本，不自动下载、点击业务控件或发网络请求', () => {
    const source = fs.readFileSync(path.join(__dirname, '../snapshot-export.user.js'), 'utf8');
    const dom = new JSDOM('<button id="delete">Delete</button><input name="token" type="hidden" value="private-token">', { url: page, runScripts: 'outside-only' });
    let menuAction, clicks = 0, fetches = 0;
    const downloads = [], blobs = [];
    dom.window.GM_registerMenuCommand = (name, action) => {
        assert.match(name, /导出当前页面/);
        menuAction = action;
    };
    dom.window.Blob = class { constructor(parts) { blobs.push(parts.join('')); } };
    dom.window.URL.createObjectURL = () => 'blob:local-snapshot';
    dom.window.URL.revokeObjectURL = () => {};
    dom.window.HTMLAnchorElement.prototype.click = function () { downloads.push(this.download); };
    dom.window.fetch = () => fetches++;
    dom.window.document.querySelector('button').addEventListener('click', () => clicks++);
    dom.window.eval(source);
    assert.equal(typeof menuAction, 'function');
    assert.equal(downloads.length, 0);
    menuAction();
    dom.window.document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { code: 'KeyE', altKey: true, shiftKey: true }));
    assert.equal(downloads.length, 2);
    for (const name of downloads) assert.match(name, /^greencloudvps\.com_billing_clientarea_php-\d+\.html$/);
    for (const html of blobs) assert.ok(!html.includes('private-token') && html.includes('snapshot-url'));
    assert.equal(dom.window.document.querySelector('input').value, 'private-token');
    assert.equal(clicks, 0);
    assert.equal(fetches, 0);
    dom.window.close();
});

for (const dir of ['Netcup', 'GreenCloud']) {
    const folder = path.join(__dirname, '../uploads', dir);
    for (const file of fs.existsSync(folder) ? fs.readdirSync(folder).filter(name => name.endsWith('.html')) : []) {
        test(`脱敏本地样本 ${dir}/${file}：无脚本、资源和原始输入值`, () => {
            const dom = new JSDOM(fs.readFileSync(path.join(folder, file), 'utf8'));
            const d = dom.window.document;
            assert.equal(d.querySelectorAll('script, iframe, [src], [onclick]').length, 0);
            assert.ok(d.querySelector('meta[name=snapshot-url]'));
            for (const input of d.querySelectorAll('input')) {
                if (!['button', 'submit', 'reset'].includes(input.type)) assert.ok(input.getAttribute('value') === '[REDACTED]', '未脱敏的输入值');
            }
            assert.equal(collectSecrets(d).length, 0, '仍存在已知类型的个人资料');
            dom.window.close();
        });
    }
}
