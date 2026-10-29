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
        <doubao-ai-csui data-id="private-extension">private injection</doubao-ai-csui>
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
    assert.equal(out.querySelectorAll('script, link, iframe, [src], [data-token], [onclick], doubao-ai-csui').length, 0);
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

test('新页面脱敏：工单嵌套主题、编号属性、续费主机及服务选项；保留空表提示', () => {
    const dom = new JSDOM(`<div class="recent-ticket"><div class="truncate" title="#987654 - private subject">#987654 - private subject</div></div>
        <a id="Ticket_#987654" menuitemname="Ticket #987654">View</a>
        <table id="tableServicesList"><tbody><tr><td><a>private-host</a></td><td class="dataTables_empty">No records found</td>
        <td><span class="label">Active</span></td><td><a class="btn">Manage Product</a></td></tr></tbody></table>
        <div class="ticket-subject">private subject</div><span class="ticket-number">#987654</span>
        <div class="service-renewal"><h3>Private Plan</h3><h4>private-host</h4></div>
        <select name="productid"><option value="secret-id">Private Plan - private-host</option></select>`);
    const html = sanitizeSnapshot(dom.window.document, page);
    for (const secret of ['987654', 'private-host', 'Private Plan', 'private subject', 'secret-id']) assert.ok(!html.includes(secret), '敏感值残留');
    const clean = new JSDOM(html);
    assert.equal(clean.window.document.querySelector('.dataTables_empty').textContent, 'No records found');
    assert.equal(clean.window.document.querySelector('.btn').textContent, 'Manage Product');
    assert.equal(clean.window.document.querySelector('.label').textContent, 'Active');
    dom.window.close(); clean.window.close();
});

test('导出文件名区分 action 和模块筛选，不泄露模块参数值', () => {
    const script = fs.readFileSync(path.join(__dirname, '../snapshot-export.user.js'), 'utf8');
    const dom = new JSDOM('<main></main>', { url: page + '?action=services&module=private-module', runScripts: 'outside-only' });
    let action, filename;
    dom.window.GM_registerMenuCommand = (label, callback) => { action = callback; };
    dom.window.URL.createObjectURL = () => 'blob:sample';
    dom.window.URL.revokeObjectURL = () => {};
    dom.window.HTMLAnchorElement.prototype.click = function () { filename = this.download; };
    dom.window.eval(script); action();
    assert.match(filename, /_clientarea_php_services_filtered-\d+\.html$/);
    assert.ok(!filename.includes('private-module'));
    dom.window.close();
});

test('保留网站自定义组件和交互定位属性，复制时不触发组件构造函数', () => {
    const dom = new JSDOM(`<app-settings><button data-toggle="modal" data-target="#settings-modal" data-token="example-secret">Settings</button></app-settings>
        <div id="settings-modal"><button data-dismiss="modal">Close</button></div><doubao-ai-csui>Extension</doubao-ai-csui>`, { url: page });
    let constructions = 0;
    dom.window.customElements.define('app-settings', class extends dom.window.HTMLElement {
        constructor() { super(); constructions++; }
    });
    assert.equal(constructions, 1);
    const before = dom.window.document.documentElement.outerHTML;
    const html = sanitizeSnapshot(dom.window.document, page);
    assert.equal(constructions, 1);
    assert.equal(dom.window.document.documentElement.outerHTML, before);
    const clean = new JSDOM(html), d = clean.window.document;
    assert.ok(d.querySelector('app-settings'));
    const button = d.querySelector('app-settings button');
    assert.equal(button.textContent, 'Settings');
    assert.equal(button.getAttribute('data-toggle'), 'modal');
    assert.equal(button.getAttribute('data-target'), '#settings-modal');
    assert.equal(d.querySelector('#settings-modal button').getAttribute('data-dismiss'), 'modal');
    assert.ok(!html.includes('example-secret'));
    assert.equal(d.querySelector('doubao-ai-csui'), null);
    dom.window.close(); clean.window.close();
});

test('保留静态 hash 页面路由，清除 fragment 中的访问令牌和编号', () => {
    for (const [hash, expected] of [
        ['#/settings', '#/settings'], ['#!/account/preferences', '#!/account/preferences'],
        ['#access_token=fragment-secret', ''], ['#/users/123456', ''],
    ]) {
        const dom = new JSDOM('<a href="#access_token=link-secret">Link</a><a href="#settings-modal">Settings</a>');
        const html = sanitizeSnapshot(dom.window.document, page + hash);
        const clean = new JSDOM(html), d = clean.window.document;
        const url = new URL(d.querySelector('meta[name="snapshot-url"]').content);
        assert.equal(url.hash, expected);
        assert.ok(!html.includes('fragment-secret') && !html.includes('link-secret') && !html.includes('123456'));
        assert.equal(d.querySelectorAll('a')[1].getAttribute('href'), '#settings-modal');
        dom.window.close(); clean.window.close();
    }
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
