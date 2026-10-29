const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../my_translate.user.js'), 'utf8');
const create = (html, route) => new JSDOM(html, {
    url: `https://greencloudvps.com/billing/${route}`, runScripts: 'outside-only',
});
const tick = dom => new Promise(resolve => dom.window.setTimeout(resolve, 0));

test('绿云列表：只翻译表头、状态和操作，不修改产品、主题或筛选参数', async () => {
    const dom = create(`<section id="main-body"><aside class="sidebar"><a data-filter="Active"><span class="badge">42</span><span>Active</span></a></aside>
        <table><thead><tr><th aria-label="Product/Service: activate to sort column descending">Product/Service</th></tr></thead>
        <tbody><tr><td><strong>Active</strong><a href="service.php?id=123">Login</a></td><td>$89.00 USD</td>
        <td><span class="label status-active">Active</span></td><td><a class="btn" href="clientarea.php?action=productdetails&id=123">Manage Product</a></td></tr></tbody></table>
        <div class="dataTables_info">Showing 1 to 10 of 1,200 entries (filtered from 9,000 total entries)</div>
        <div class="dataTables_length"><label>Show <select name="length"><option value="10">10</option><option value="-1">All</option></select> entries</label></div></section>`, 'clientarea.php?action=services');
    const d = dom.window.document;
    const link = d.querySelector('.btn'); let calls = 0;
    link.addEventListener('custom-test', () => calls++);
    dom.window.eval(source); await tick(dom);
    assert.equal(d.querySelector('tbody strong').textContent, 'Active');
    assert.equal(d.querySelector('tbody a:not(.btn)').textContent, 'Login');
    assert.equal(d.querySelector('.badge').textContent, '42');
    assert.equal(d.querySelector('[data-filter]').getAttribute('data-filter'), 'Active');
    assert.equal(d.querySelector('.label').textContent, '使用中');
    assert.equal(link.textContent, '管理产品');
    assert.equal(link.getAttribute('href'), 'clientarea.php?action=productdetails&id=123');
    link.dispatchEvent(new dom.window.Event('custom-test')); assert.equal(calls, 1);
    assert.equal(d.querySelector('th').getAttribute('aria-label'), '产品 / 服务：点击以降序排列');
    assert.equal(d.querySelector('.dataTables_info').textContent, '显示第 1 至 10 条，共 1,200 条（从 9,000 条记录中筛选）');
    assert.equal(d.querySelector('option[value="-1"]').textContent, '全部');
    assert.equal(d.querySelector('select').value, '10');
    d.querySelector('tbody').innerHTML = '<tr><td class="dataTables_empty">No matching records found</td></tr>';
    await tick(dom);
    assert.equal(d.querySelector('.dataTables_empty').textContent, '没有匹配的记录');
    dom.window.close();
});

test('绿云商店：参数说明完整保留，仅翻译库存、周期和订购按钮', async () => {
    const dom = create(`<section id="main-body"><div id="order-standard_cart"><div class="product">
        <header><span id="product999-name">RAM</span><span class="qty">7 Available</span></header>
        <div class="product-desc"><ul><li><span class="feature-value">Active</span> RAM</li>
        <li><span class="feature-value">1TB / 10Gbps</span> Bandwidth</li>
        <li><span class="feature-value">No refund/money back on this plan.</span><strong>Note</strong></li></ul></div>
        <div class="product-pricing"><span class="price">$12.34 USD</span> Annually</div><a class="btn">Order Now</a></div></div></section>`, 'store/13th-birthday-sale');
    const d = dom.window.document;
    const description = d.querySelector('.product-desc');
    const before = description.outerHTML;
    dom.window.eval(source);
    await tick(dom);
    assert.equal(d.querySelector('#product999-name').textContent, 'RAM');
    assert.equal(description.outerHTML, before);
    assert.equal(d.querySelector('.price').textContent, '$12.34 USD');
    assert.equal(d.querySelector('.qty').textContent, '剩余 7 件');
    assert.match(d.querySelector('.product-pricing').textContent, /每年/);
    assert.equal(d.querySelector('a').textContent, '立即订购');
    description.innerHTML = '<ul><li><span class="feature-value">Active</span> CPU</li><li>Control Panel</li><li>No refund/money back on this plan.</li></ul>';
    const dynamic = description.outerHTML;
    await tick(dom);
    dom.window.eval(source);
    await tick(dom);
    assert.equal(description.outerHTML, dynamic);
    dom.window.close();
});

test('绿云续费：保留服务名和日期后缀，不触发续费或删除', () => {
    const dom = create(`<section id="main-body"><form action="cart.php"><input type="hidden" name="token" value="example-token">
        <div class="service-renewal"><h3>Services</h3><h4>host.example.invalid</h4><p>Next Due Date: 1st January 2030</p>
        <div class="div-renewal-ineligible">This service is not within its renewal period.</div></div>
        <span class="amt">$12.34 USD</span><button type="submit">Yes</button></form></section>`, 'service-renewals');
    const d = dom.window.document, form = d.querySelector('form');
    let submissions = 0; form.addEventListener('submit', () => submissions++);
    const before = [...new dom.window.FormData(form)];
    dom.window.eval(source);
    assert.equal(d.querySelector('h3').textContent, 'Services');
    assert.equal(d.querySelector('h4').textContent, 'host.example.invalid');
    assert.equal(d.querySelector('p').textContent, '下次到期日：1st January 2030');
    assert.equal(d.querySelector('.amt').textContent, '$12.34 USD');
    assert.equal(d.querySelector('button').textContent, '是');
    assert.deepEqual([...new dom.window.FormData(form)], before);
    assert.equal(submissions, 0);
    dom.window.close();
});

test('绿云工单：主题、编号和相对时间不翻译，状态可翻译', () => {
    const dom = create(`<section id="main-body"><div class="recent-ticket"><div class="truncate" title="Custom Subject">Open</div>
        <small><span class="pull-right">3 days ago</span><span>Closed</span></small></div>
        <table><tbody><tr><td><a><span class="ticket-number">#123456</span><span class="ticket-subject">Active</span>
        <span class="label">Closed</span></a></td></tr></tbody></table></section>`, 'supporttickets.php');
    dom.window.eval(source); const d = dom.window.document;
    assert.equal(d.querySelector('.truncate').textContent, 'Open');
    assert.equal(d.querySelector('.truncate').title, 'Custom Subject');
    assert.equal(d.querySelector('.ticket-subject').textContent, 'Active');
    assert.equal(d.querySelector('.ticket-number').textContent, '#123456');
    assert.equal(d.querySelector('.pull-right').textContent, '3 days ago');
    assert.equal(d.querySelector('.label').textContent, '已关闭');
    dom.window.close();
});

test('未知购物车、工单表单和服务详情不套用列表正文规则', () => {
    for (const route of ['cart.php?a=checkout', 'submitticket.php?step=2&deptid=1', 'clientarea.php?action=productdetails&id=123']) {
        const dom = create('<section id="main-body"><p>Active</p></section>', route);
        dom.window.eval(source);
        assert.equal(dom.window.document.querySelector('p').textContent, 'Active');
        dom.window.close();
    }
});

const samples = {
    services: '我的产品与服务', services_filtered: '我的产品与服务', service_renewals: '服务续费',
    store_13th_birthday_sale: '优惠方案将持续更新。', product_addons: '产品附加组件',
    invoices: '我的账单', quotes: '我的报价单', payment_methods: '付款方式',
    support_tickets: '我的支持工单', announcements: '新闻', knowledgebase: '知识库', downloads: '下载',
    network_status: '网络状态', submit_ticket: '提交工单', affiliates: '启用推广账户',
};
for (const [file, heading] of Object.entries(samples)) {
    const sample = path.join(__dirname, `../uploads/GreenCloud/${file}.html`);
    test(`绿云新增样本 ${file}：固定文案、变量和业务参数`, { skip: !fs.existsSync(sample) }, async () => {
        const html = fs.readFileSync(sample, 'utf8');
        const dom = new JSDOM(html, { runScripts: 'outside-only' });
        const d = dom.window.document;
        dom.reconfigure({ url: d.querySelector('meta[name="snapshot-url"]').content });
        const forms = [...d.querySelectorAll('form')];
        const businessData = () => JSON.stringify(forms.map(form => [...new dom.window.FormData(form)]));
        const beforeData = businessData();
        const variableSelectors = '.price, .amt, .stat, .badge, .product-desc, .summary-totals .float-right, .ticket-number, .ticket-subject, .recent-ticket .truncate, .recent-ticket .pull-right, .service-renewal h3, .service-renewal h4, select[name="productid"], .product header span:not(.qty), .feature-value';
        const variables = [...d.querySelectorAll(variableSelectors)];
        const beforeVariables = variables.map(el => el.outerHTML);
        const attributes = () => JSON.stringify([...d.querySelectorAll('a, form, button, input, select, option')].map(el =>
            [...el.attributes].filter(attr => !['title', 'placeholder', 'aria-label'].includes(attr.name) && !(attr.name === 'value' && el.matches('input[type="submit"]:not([name]), input[type="button"]:not([name])'))).map(attr => [attr.name, attr.value])));
        const beforeAttrs = attributes();
        let actions = 0;
        for (const event of ['submit', 'change']) d.addEventListener(event, () => actions++);
        dom.window.eval(source); await tick(dom);
        assert.match(d.querySelector('#main-body').textContent, new RegExp(heading));
        assert.ok(businessData() === beforeData, '表单数据改变');
        assert.ok(attributes() === beforeAttrs, '链接、权限或业务参数改变');
        assert.ok(JSON.stringify(variables.map(el => el.outerHTML)) === JSON.stringify(beforeVariables), '用户变量被翻译');
        assert.equal(actions, 0);
        const missing = [];
        const walker = d.createTreeWalker(d.querySelector('#main-body'), dom.window.NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode, parent = node.parentElement;
            if (parent.closest('script, style, textarea, .price, .amt, .badge, .product-desc, .summary-totals .float-right, .feature-value, .ticket-number, .ticket-subject, .recent-ticket .truncate, .recent-ticket .pull-right, .service-renewal h3, .service-renewal h4, select[name="productid"], .product header span:not(.qty)')) continue;
            if (parent.closest('tbody td') && !parent.closest('.btn, .label, .status, .textgreen, .textgrey, .dataTables_empty')) continue;
            if (parent.closest('[menuitemname="Categories"] .list-group, #order-standard_cart .sidebar-collapsed option')) continue;
            const text = node.data.replace(/\s+/g, ' ').trim();
            if (text === '[REDACTED]' || /^(?:IPv4|IPv6|IP|KVM VPS|Windows VPS)(?: \(\d+\))?$/.test(text) || /^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/.test(text)) continue;
            if (/[a-z]{3}/i.test(text) && !/[\u3400-\u9fff]/.test(text)) missing.push(text);
        }
        assert.equal(missing.length, 0, '存在未覆盖的固定文案');
        const after = d.body.innerHTML;
        dom.window.eval(source); await tick(dom);
        assert.ok(d.body.innerHTML === after, '重复运行改变页面');
        dom.window.close();
    });
}
