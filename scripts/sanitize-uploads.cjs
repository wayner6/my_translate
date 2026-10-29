const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { sanitizeSnapshot, collectSecrets } = require('../snapshot-export.user.js');

const pages = {
    'Netcup/netcup_ccp.html': 'https://www.customercontrolpanel.de/start.php',
    'Netcup/netcup_products.html': 'https://www.customercontrolpanel.de/produkte.php',
    'Netcup/netcup_domains.html': 'https://www.customercontrolpanel.de/domains.php',
    'Netcup/netcup_invoice.html': 'https://www.customercontrolpanel.de/rechnungen.php',
    'Netcup/netcup_abuse.html': 'https://www.customercontrolpanel.de/abuse.php',
    'Netcup/netcup_affiliate.html': 'https://www.customercontrolpanel.de/partnerprogramm.php',
    'Netcup/netcup_master.html': 'https://www.customercontrolpanel.de/daten_aendern.php',
    'GreenCloud/login.html': 'https://greencloudvps.com/billing/login',
    'GreenCloud/clientarea.html': 'https://greencloudvps.com/billing/clientarea.php',
};
const samples = [];
const uploads = path.join(__dirname, '../uploads');
for (const name of fs.readdirSync(uploads, { recursive: true }).filter(name => name.endsWith('.html'))) {
    const file = path.join(uploads, name);
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'));
    const address = dom.window.document.querySelector('meta[name="snapshot-url"]')?.content || pages[name];
    if (!address) throw new Error(`样本缺少网址，未覆盖文件：${name}`);
    const url = new URL(address);
    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error(`样本网址必须使用 HTTP/HTTPS，未覆盖文件：${name}`);
    }
    samples.push({ file, url: url.href, dom });
}
// 跨页共享已识别的隐私值，避免同一姓名/邮箱在其他页面中残留。
const secrets = [...new Set(samples.flatMap(sample => collectSecrets(sample.dom.window.document)))];
const outputs = samples.map(sample => ({
    ...sample,
    html: sanitizeSnapshot(sample.dom.window.document, sample.url, secrets),
}));
// 全部检查成功才覆盖，不创建仍含隐私的备份，也不打印隐私值。
for (const { html } of outputs) {
    if (secrets.some(secret => html.includes(secret))) throw new Error('脱敏检查失败，未覆盖文件。');
    const check = new JSDOM(html);
    if (check.window.document.querySelector('script, iframe, [onclick], [src]')) throw new Error('存在活动内容，未覆盖文件。');
    check.window.close();
}
for (const { file, html, dom } of outputs) {
    fs.writeFileSync(file, html, 'utf8');
    dom.window.close();
}
console.log(`已原地脱敏 ${outputs.length} 个样本；未保留原始敏感副本。`);
