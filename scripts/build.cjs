const fs = require('node:fs');
const path = require('node:path');

const project = path.join(__dirname, '..');
const banner = '// 由 scripts/build.cjs 自动生成，请修改 src/ 中的源码。';

function renderScripts(root = project) {
    const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    const sites = JSON.parse(fs.readFileSync(path.join(root, 'src/sites.json'), 'utf8'));
    if (!Array.isArray(sites) || !sites.length) throw new Error('src/sites.json 必须包含至少一个站点。');
    const ids = new Set();
    for (const site of sites) {
        if (!site || typeof site.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(site.id) || ids.has(site.id)) {
            throw new Error('站点 id 必须唯一，且只能包含小写字母、数字和连字符。');
        }
        if (typeof site.name !== 'string' || !site.name.trim() || /[\r\n]/.test(site.name)) throw new Error(`站点 ${site.id} 缺少有效名称。`);
        if (!Array.isArray(site.matches) || !site.matches.length || site.matches.some(value => typeof value !== 'string' || !/^https?:\/\/[^\s/]+\/[^\s]*$/.test(value))) {
            throw new Error(`站点 ${site.id} 必须配置 HTTP/HTTPS 匹配规则。`);
        }
        ids.add(site.id);
    }
    const matches = [...new Set(sites.flatMap(site => site.matches))];
    const bodies = sites.map(site => {
        const body = fs.readFileSync(path.join(root, `src/sites/${site.id}.js`), 'utf8').trim();
        if (!body || body.includes('// ==UserScript==')) throw new Error(`站点 ${site.id} 的源码应为不含用户脚本元数据的独立作用域。`);
        return `// ${site.name}\n${body}`;
    });
    const translation = `// ==UserScript==
// @name         my_translate
// @namespace    local.my-translate
// @version      ${version}
// @description  指定网站界面的本地简体中文汉化，按站点选择规则，保留用户数据及产品名称。
// @homepageURL  https://github.com/wayner6/my_translate
// @supportURL   https://github.com/wayner6/my_translate/issues
// @downloadURL  https://raw.githubusercontent.com/wayner6/my_translate/main/my_translate.user.js
// @updateURL    https://raw.githubusercontent.com/wayner6/my_translate/main/my_translate.user.js
${matches.map(value => `// @match        ${value}`).join('\n')}
// @run-at       document-end
// @grant        none
// @noframes
// ==/UserScript==

${banner}

${bodies.join('\n\n')}
`;
    const exporterSource = fs.readFileSync(path.join(root, 'src/exporter.js'), 'utf8');
    const metadataEnd = '// ==/UserScript==';
    if (!exporterSource.includes(metadataEnd)) throw new Error('src/exporter.js 缺少用户脚本元数据。');
    const exporter = exporterSource.replace(metadataEnd, `${metadataEnd}\n\n${banner}`);
    return { 'my_translate.user.js': translation, 'snapshot-export.user.js': exporter };
}

if (require.main === module) {
    const check = process.argv.includes('--check');
    const outputs = renderScripts();
    // 先生成全部内容，校验成功后再写入，避免源文件缺失时覆盖部分产物。
    for (const [name, content] of Object.entries(outputs)) {
        const file = path.join(project, name);
        if (check) {
            if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content) throw new Error(`${name} 未同步，请先执行 npm run build。`);
        } else fs.writeFileSync(file, content);
    }
    console.log(check ? '构建产物与源码一致。' : '已生成翻译脚本和导出脚本。');
}

module.exports = { renderScripts };
