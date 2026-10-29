const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { JSDOM } = require('jsdom');
const project = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(project, 'snapshot-export.user.js'), 'utf8');

test('导出器权限支持所有 HTTP/HTTPS，不新增网络或自动执行权限', () => {
    assert.deepEqual([...source.matchAll(/^\/\/ @match\s+(.+)$/gm)].map(match => match[1]), [
        'http://*/*', 'https://*/*',
    ]);
    assert.deepEqual([...source.matchAll(/^\/\/ @grant\s+(.+)$/gm)].map(match => match[1]), ['GM_registerMenuCommand']);
    assert.match(source, /^\/\/ @version\s+0\.1\.3$/m);
    assert.doesNotMatch(source, /^\/\/ @connect\s/m);
});

test('任意 HTTP/HTTPS 站点可手动导出，初始不采集、不发请求、不改变页面', () => {
    for (const scheme of ['http', 'https']) {
        const address = `${scheme}://console.example.invalid/settings`;
        const dom = new JSDOM('<nav>Settings</nav><input type="password" value="example-password"><input type="hidden" name="token" value="example-token">', {
            url: address, runScripts: 'outside-only',
        });
        const before = dom.window.document.documentElement.outerHTML;
        let exportPage, requests = 0, downloads = 0, content;
        dom.window.GM_registerMenuCommand = (label, callback) => { exportPage = callback; };
        dom.window.fetch = () => requests++;
        dom.window.Blob = class { constructor(parts) { content = parts.join(''); } };
        dom.window.URL.createObjectURL = () => 'blob:snapshot';
        dom.window.URL.revokeObjectURL = () => {};
        dom.window.HTMLAnchorElement.prototype.click = function () { downloads++; };
        dom.window.eval(source);
        assert.equal(typeof exportPage, 'function');
        assert.equal(downloads, 0);
        assert.equal(content, undefined);
        exportPage();
        assert.equal(downloads, 1);
        assert.equal(requests, 0);
        assert.equal(dom.window.document.documentElement.outerHTML, before);
        assert.ok(!content.includes('example-password') && !content.includes('example-token'));
        const snapshot = new JSDOM(content);
        assert.equal(snapshot.window.document.querySelector('meta[name="snapshot-url"]').content, address);
        assert.equal(snapshot.window.document.querySelector('nav').textContent, 'Settings');
        snapshot.window.close(); dom.window.close();
    }
});

test('非 HTTP/HTTPS 文档不注册导出入口', () => {
    for (const url of ['file:///example.html', 'about:blank']) {
        const dom = new JSDOM('<p>Example</p>', { url, runScripts: 'outside-only' });
        let registrations = 0;
        dom.window.GM_registerMenuCommand = () => registrations++;
        dom.window.eval(source);
        assert.equal(registrations, 0);
        dom.window.close();
    }
});

test('本地脱敏工具接受新站点的 HTTP/HTTPS 样本，拒绝非网页协议', () => {
    const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'my-translate-export-'));
    try {
        fs.mkdirSync(path.join(folder, 'scripts'));
        fs.mkdirSync(path.join(folder, 'uploads/Example'), { recursive: true });
        fs.copyFileSync(path.join(project, 'scripts/sanitize-uploads.cjs'), path.join(folder, 'scripts/sanitize-uploads.cjs'));
        fs.copyFileSync(path.join(project, 'snapshot-export.user.js'), path.join(folder, 'snapshot-export.user.js'));
        const files = [];
        for (const scheme of ['http', 'https']) {
            const file = path.join(folder, `uploads/Example/${scheme}.html`);
            const url = `${scheme}://console.example.invalid/settings`;
            fs.writeFileSync(file, `<html><head><meta name="snapshot-url" content="${url}"></head><body><input type="password" value="example-secret"><p>Settings</p></body></html>`);
            files.push([file, url]);
        }
        const run = () => spawnSync(process.execPath, [path.join(folder, 'scripts/sanitize-uploads.cjs')], {
            encoding: 'utf8', timeout: 30000,
            env: { ...process.env, NODE_PATH: path.join(project, 'node_modules') },
        });
        const result = run();
        assert.equal(result.status, 0, result.stderr);
        for (const [file, url] of files) {
            const html = fs.readFileSync(file, 'utf8');
            assert.ok(!html.includes('example-secret'));
            const dom = new JSDOM(html);
            assert.equal(dom.window.document.querySelector('meta[name="snapshot-url"]').content, url);
            dom.window.close();
        }
        const invalid = path.join(folder, 'uploads/Example/invalid.html');
        const html = '<html><head><meta name="snapshot-url" content="file:///example.html"></head><body>Example</body></html>';
        fs.writeFileSync(invalid, html);
        assert.notEqual(run().status, 0);
        assert.equal(fs.readFileSync(invalid, 'utf8'), html);
    } finally {
        fs.rmSync(folder, { recursive: true, force: true });
    }
});
