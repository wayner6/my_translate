const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'my_translate.user.js'), 'utf8');

function create(url) {
    const dom = new JSDOM('<div id="sidebar">Products</div><section id="main-menu">Services</section>', {
        url, runScripts: 'outside-only',
    });
    const OriginalObserver = dom.window.MutationObserver;
    let observers = 0;
    dom.window.MutationObserver = class extends OriginalObserver {
        constructor(callback) { super(callback); observers++; }
    };
    return { dom, observerCount: () => observers };
}

test('单一翻译脚本入口、通用身份、站点权限和更新地址', () => {
    assert.equal((source.match(/\/\/ ==UserScript==/g) || []).length, 1);
    assert.match(source, /^\/\/ @name\s+my_translate$/m);
    assert.equal(/^\/\/ @version\s+(.+)$/m.exec(source)[1], require('../package.json').version);
    const repository = require('../package.json').repository.url.replace(/\.git$/, '');
    const download = repository.replace('https://github.com/', 'https://raw.githubusercontent.com/') + '/main/my_translate.user.js';
    assert.equal(/^\/\/ @homepageURL\s+(.+)$/m.exec(source)[1], repository);
    assert.equal(/^\/\/ @downloadURL\s+(.+)$/m.exec(source)[1], download);
    assert.equal(/^\/\/ @updateURL\s+(.+)$/m.exec(source)[1], download);
    assert.deepEqual(source.match(/^\/\/ @match\s+(.+)$/gm).map(line => line.split(/\s+/).at(-1)), [
        ...new Set(require('../src/sites.json').flatMap(site => site.matches)),
    ]);
    assert.deepEqual(fs.readdirSync(root).filter(file => file.endsWith('.user.js')).sort(), [
        'my_translate.user.js', 'snapshot-export.user.js',
    ]);
});

for (const [url, sidebar, menu] of [
    ['https://www.customercontrolpanel.de/start.php', '产品', 'Services'],
    ['https://greencloudvps.com/billing/clientarea.php', 'Products', '服务'],
]) {
    test(`域名隔离：${new URL(url).hostname} 只启用自己的词库和监听器`, () => {
        const { dom, observerCount } = create(url);
        dom.window.eval(source);
        assert.equal(dom.window.document.querySelector('#sidebar').textContent, sidebar);
        assert.equal(dom.window.document.querySelector('#main-menu').textContent, menu);
        assert.equal(observerCount(), 1);
        dom.window.close();
    });
}

test('未授权域名、非 HTTPS 和绿云非 billing 路径不初始化翻译', () => {
    for (const url of [
        'https://example.invalid/start.php',
        'http://www.customercontrolpanel.de/start.php',
        'https://greencloudvps.com/outside',
    ]) {
        const { dom, observerCount } = create(url);
        const before = dom.window.document.body.innerHTML;
        dom.window.eval(source);
        assert.equal(dom.window.document.body.innerHTML, before);
        assert.equal(observerCount(), 0);
        dom.window.close();
    }
});
