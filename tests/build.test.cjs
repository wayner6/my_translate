const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { JSDOM } = require('jsdom');
const { renderScripts } = require('../scripts/build.cjs');
const project = path.join(__dirname, '..');

function temporaryProject(callback) {
    const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'my-translate-build-'));
    try {
        fs.cpSync(path.join(project, 'src'), path.join(folder, 'src'), { recursive: true });
        fs.copyFileSync(path.join(project, 'package.json'), path.join(folder, 'package.json'));
        callback(folder);
    } finally {
        fs.rmSync(folder, { recursive: true, force: true });
    }
}

test('根目录安装脚本与源码构建一致，生成的 JavaScript 语法有效', () => {
    const outputs = renderScripts();
    assert.deepEqual(Object.keys(outputs), ['my_translate.user.js', 'snapshot-export.user.js']);
    for (const [name, content] of Object.entries(outputs)) {
        assert.equal(fs.readFileSync(path.join(project, name), 'utf8'), content);
        assert.equal((content.match(/\/\/ ==UserScript==/g) || []).length, 1);
        assert.doesNotThrow(() => new vm.Script(content, { filename: name }));
    }
});

test('新增站点只需源码和清单，无需改动构建器或已有站点', () => {
    temporaryProject(folder => {
        const file = path.join(folder, 'src/sites.json');
        const sites = JSON.parse(fs.readFileSync(file, 'utf8'));
        sites.push({ id: 'example', name: 'Example', matches: ['https://console.example.invalid/*'] });
        fs.writeFileSync(file, JSON.stringify(sites));
        fs.writeFileSync(path.join(folder, 'src/sites/example.js'), `(() => {
            if (location.origin !== 'https://console.example.invalid') return;
            document.querySelector('nav').textContent = '设置';
        })();`);
        const script = renderScripts(folder)['my_translate.user.js'];
        assert.match(script, /^\/\/ @match\s+https:\/\/console\.example\.invalid\/\*$/m);
        assert.match(script, /^\/\/ @match\s+https:\/\/www\.customercontrolpanel\.de\/\*$/m);
        const dom = new JSDOM('<nav>Settings</nav>', { url: 'https://console.example.invalid/settings', runScripts: 'outside-only' });
        dom.window.eval(script);
        assert.equal(dom.window.document.querySelector('nav').textContent, '设置');
        dom.window.close();
    });
});

test('构建拒绝重复/越界 id、无效匹配和站点内重复元数据', () => {
    temporaryProject(folder => {
        const file = path.join(folder, 'src/sites.json');
        const sites = JSON.parse(fs.readFileSync(file, 'utf8'));
        for (const invalid of [
            [...sites, sites[0]],
            [{ id: '../outside', name: 'Outside', matches: ['https://example.invalid/*'] }],
            [{ id: 'example', name: 'Example', matches: ['file:///*'] }],
        ]) {
            fs.writeFileSync(file, JSON.stringify(invalid));
            assert.throws(() => renderScripts(folder));
        }
        fs.writeFileSync(file, JSON.stringify(sites));
        fs.appendFileSync(path.join(folder, `src/sites/${sites[0].id}.js`), '\n// ==UserScript==\n');
        assert.throws(() => renderScripts(folder), /元数据/);
    });
});

test('build --check 检测过期产物但不覆盖，build 可重新生成', () => {
    temporaryProject(folder => {
        fs.mkdirSync(path.join(folder, 'scripts'));
        const build = path.join(folder, 'scripts/build.cjs');
        fs.copyFileSync(path.join(project, 'scripts/build.cjs'), build);
        const outputs = renderScripts(folder);
        for (const [name, content] of Object.entries(outputs)) fs.writeFileSync(path.join(folder, name), content);
        const run = args => spawnSync(process.execPath, [build, ...args], { encoding: 'utf8', timeout: 10000 });
        assert.equal(run(['--check']).status, 0);
        const file = path.join(folder, 'my_translate.user.js');
        fs.writeFileSync(file, 'stale');
        assert.notEqual(run(['--check']).status, 0);
        assert.equal(fs.readFileSync(file, 'utf8'), 'stale');
        assert.equal(run([]).status, 0);
        assert.equal(fs.readFileSync(file, 'utf8'), outputs['my_translate.user.js']);
    });
});
