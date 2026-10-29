// ==UserScript==
// @name         netcup CCP 简体中文
// @namespace    local.my-translate.netcup
// @version      0.1.1
// @homepageURL  https://github.com/wayner6/my_translate
// @supportURL   https://github.com/wayner6/my_translate/issues
// @downloadURL  https://raw.githubusercontent.com/wayner6/my_translate/main/netcup-ccp-zh-cn.user.js
// @updateURL    https://raw.githubusercontent.com/wayner6/my_translate/main/netcup-ccp-zh-cn.user.js
// @description  本地词库汉化 netcup CCP 公共导航和概览页，不上传页面内容。
// @match        https://www.customercontrolpanel.de/*
// @run-at       document-end
// @grant        none
// @noframes
// ==/UserScript==

(() => {
    'use strict';

    const common = new Map(Object.entries({
        'Overview': '概览',
        'Products': '产品',
        'Domains': '域名',
        'Invoice': '账单',
        'Abuse Notices': '滥用通知',
        'Affiliate Program': '推广联盟',
        'Contact': '联系我们',
        'Master Data': '基本资料',
        'Logged in as': '当前登录用户',
        'netcup Help Center': 'netcup 帮助中心',
        'Log out': '退出登录',
        'netcup Shop': 'netcup 商店',
        'netcup Customer Forum': 'netcup 用户论坛',
    }));

    // 按文本节点匹配：保留原有链接、图标、强调标签和事件监听器。
    const overview = new Map(Object.entries({
        'Overview': '概览',
        'Welcome to the Customer Control Panel. Here you can get an overview of your domains, hosting packages and invoices. We also provide you with a contact form.':
            '欢迎使用客户控制面板。您可以在这里查看域名、主机套餐和账单概况，也可以通过联系表单与我们联系。',
        'Outstanding invoices': '待付账单',
        'You currently have no outstanding invoices stored in our system.': '您目前没有待付账单。',
        'Log in to other panels': '登录其他面板',
        'Connect your Forum account with your Customer account to receive additional permission in the netcup Customer Forum!':
            '将论坛账号与客户账号关联，即可获得 netcup 用户论坛的额外权限！',
        'The netcup Customer Forum enables you to exchange information with other Customers on topics such as Server Administration, Website Development, Programming Languages and much more. Once you have created our netcup Customer Forum account, you can link your Forum account here to receive additional permissions.':
            '您可以在 netcup 用户论坛与其他用户交流服务器管理、网站开发、编程语言等话题。创建 netcup 用户论坛账号后，可在此关联账号以获得额外权限。',
        'Our registration guide': '注册指南',
        'Your netcup Forum username:': 'netcup 论坛用户名：',
        'Your netcup Forum password:': 'netcup 论坛密码：',
        'Link CCP account with Forum account': '关联 CCP 账号与论坛账号',
        'Your rating on Trustpilot helps us': '您在 Trustpilot 上的评价对我们很有帮助',
        'We would be delighted if you would take a moment to share': '欢迎您抽空分享',
        'your experience': '您的使用体验',
        'with us': '，发布平台为',
        'on Trustpilot': 'Trustpilot',
        '. Your feedback will help others and show us what we can do better. To ensure that the review is based on a genuine customer experience, clicking the button will submit your name and email address to Trustpilot for review submission. Thank you for your support!':
            '。您的反馈可以帮助其他用户，也能帮助我们改进服务。为确保评价来自真实客户，点击按钮会将您的姓名和电子邮箱地址提交给 Trustpilot，用于发布评价。感谢您的支持！',
        'Submit Trustpilot rating': '提交 Trustpilot 评价',
        'Information: Data Verification for Domain Owners': '通知：域名持有人资料核验',
        'As part of the implementation of the EU NIS2 Directive, we may contact domain owners to verify their information.':
            '为落实欧盟 NIS2 指令，我们可能会联系域名持有人核验其资料。',
        'Please complete the necessary verification steps after receiving an email from': '收到以下邮箱的邮件后，请完成必要的核验步骤：',
        '. If you have any questions, our support team is always happy to assist you.': '。如有疑问，请联系我们的支持团队。',
        '5€ Voucher + Insider Access': '5 欧元优惠券及独家资讯',
        'Get insider knowledge on exclusive news, tips, and offers and secure a 5 euro welcome voucher by subscribing to our newsletter.':
            '订阅我们的邮件通讯，获取独家资讯、实用技巧及优惠信息，并领取一张 5 欧元迎新优惠券。',
        'Learn more': '了解更多',
        'job opportunities': '招聘信息',
        'WANTED: COLLEAGUES WANTED!': '诚聘新同事！',
        'We are looking for you as': '我们正在招聘：',
        'Senior Linux System Administrator - Infrastructure (m/w/d)': '高级 Linux 系统管理员 — 基础设施（不限性别）',
        'in Vienna, Graz, Klagenfurt, Karlsruhe, Nuremberg, Remote.': '，工作地点：维也纳、格拉茨、克拉根福、卡尔斯鲁厄、纽伦堡，或远程办公。',
        'Check job now >': '查看职位 >',
        "You're a Linux expert? Excited about working with cutting-edge hardware? Interested in managing large-scale server environments across multiple continents and further developing complex infrastructures? Perfect!":
            '您精通 Linux，热衷于使用前沿硬件，希望管理横跨多个大洲的大规模服务器环境并持续完善复杂的基础设施？这份工作正适合您！',
        "You can work fully remotely in this role or come to the office at any of our listed locations as often as you like. Sounds good? Then we'd love to hear from you!":
            '该职位支持完全远程办公，您也可以按自己的意愿前往上述任一办公地点。感兴趣的话，欢迎联系我们！',
        'CHECK OPEN VACANCIES >': '查看所有在招职位 >',
        "+++ BE YOURSELF - BECAUSE THAT'S HOW WE WANT YOU TO BE +++": '+++ 做真实的自己，我们期待这样的您 +++',
    }));

    const commonScope = '#navbarbase, #sidebar, #footer';
    const overviewScope = '#sitecontents';
    const skipped = 'script, style, noscript, textarea, select, option, pre, code, [contenteditable]:not([contenteditable="false"]), .notranslate, [translate="no"]';
    const isOverview = /^\/(?:run\/)?start\.php$/.test(location.pathname);
    const normalize = text => text.replace(/\s+/g, ' ').trim();

    function dictionaryFor(element) {
        if (element.closest(commonScope)) return common;
        if (isOverview && element.closest(overviewScope)) return overview;
        return null;
    }

    function replaceText(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest(skipped)) return;
        const dictionary = dictionaryFor(parent);
        if (!dictionary) return;
        const text = normalize(node.data);
        let translated = dictionary.get(text);
        // 只在卡片标题匹配欢迎语，保留姓名，不匹配用户正文。
        if (!translated && dictionary === overview && parent.matches('.panel-heading') && text.startsWith('Welcome ')) {
            translated = `欢迎您，${text.slice('Welcome '.length)}`;
        }
        if (translated) node.data = node.data.replace(/\S(?:[\s\S]*\S)?/, () => translated);
    }

    function translate(root) {
        if (root.nodeType === Node.TEXT_NODE) {
            replaceText(root);
            return;
        }
        if (root.nodeType !== Node.ELEMENT_NODE || root.closest(skipped)) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) replaceText(walker.currentNode);

        // 有 name 的按钮 value 可能参与表单提交，不能为了翻译改变业务参数。
        const buttons = [...root.querySelectorAll('input[type="submit"]:not([name]), input[type="button"]:not([name])')];
        if (root.matches('input[type="submit"]:not([name]), input[type="button"]:not([name])')) buttons.push(root);
        for (const button of buttons) {
            if (button.closest(skipped)) continue;
            const translated = dictionaryFor(button)?.get(normalize(button.value));
            if (translated) button.value = translated;
        }
    }

    // 只处理站点自身的区域，不扫描其他扩展注入的界面。
    for (const root of document.querySelectorAll(`${commonScope}${isOverview ? `, ${overviewScope}` : ''}`)) translate(root);

    const observer = new MutationObserver(records => {
        const pending = new Set();
        for (const record of records) {
            if (record.type === 'characterData' || record.type === 'attributes') pending.add(record.target);
            else for (const node of record.addedNodes) pending.add(node);
        }
        for (const node of pending) {
            if (!node.isConnected) continue;
            const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
            if (!element) continue;
            if (dictionaryFor(element)) translate(node);
            else if (element.nodeType === Node.ELEMENT_NODE) {
                for (const root of element.querySelectorAll(`${commonScope}${isOverview ? `, ${overviewScope}` : ''}`)) translate(root);
            }
        }
    });
    observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['value'],
    });
})();
