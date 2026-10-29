// ==UserScript==
// @name         GreenCloud 简体中文
// @namespace    local.my-translate.greencloud
// @version      0.1.0
// @description  本地汉化绿云登录页和客户中心首页，保留产品名、用户资料及业务数据。
// @homepageURL  https://github.com/wayner6/my_translate
// @supportURL   https://github.com/wayner6/my_translate/issues
// @downloadURL  https://raw.githubusercontent.com/wayner6/my_translate/main/greencloud-zh-cn.user.js
// @updateURL    https://raw.githubusercontent.com/wayner6/my_translate/main/greencloud-zh-cn.user.js
// @match        https://greencloudvps.com/billing/*
// @run-at       document-end
// @grant        none
// @noframes
// ==/UserScript==

(() => {
    'use strict';
    const terms = new Map(Object.entries({
        'Toggle navigation': '展开 / 收起导航',
        'Docs': '文档',
        'Login': '登录',
        'Client Area': '客户中心',
        'Home': '首页',
        'Portal Home': '客户中心首页',
        'Store': '商店',
        'Browse All': '浏览全部',
        'Additional services': '附加服务',
        'Services': '服务',
        'My Services': '我的服务',
        'Proxy Products': '代理产品',
        'Renew Services': '续费服务',
        'Order New Services': '订购新服务',
        'View Available Addons': '查看可用附加组件',
        'Billing': '账务',
        'My Invoices': '我的账单',
        'My Quotes': '我的报价单',
        'Payment Methods': '付款方式',
        'Support': '支持',
        'Tickets': '工单',
        'Announcements': '公告',
        'Knowledgebase': '知识库',
        'Downloads': '下载',
        'Network Status': '网络状态',
        'Open Ticket': '提交工单',
        'Affiliates': '推广联盟',
        'Contact Us': '联系我们',
        'Account': '账户',
        'Account Details': '账户资料',
        'User Management': '用户管理',
        'Contacts': '联系人',
        'Account Security': '账户安全',
        'Email History': '邮件记录',
        'Your Profile': '个人资料',
        'Change Password': '修改密码',
        'Security Settings': '安全设置',
        'Logout': '退出登录',
        'English': '英语',
        'Notifications': '通知',
        'You have no notifications at this time.': '您目前没有通知。',
        'View Cart': '查看购物车',
        'Forgot Password?': '忘记密码？',
        'This page is restricted': '此页面需要登录后访问',
        'Email Address': '电子邮箱',
        'Enter email': '请输入电子邮箱',
        'Password': '密码',
        'Remember Me': '记住我',
        'Please enter the characters you see in the image below into the text box provided. This is required to prevent automated submissions.':
            '请在文本框中输入下方图片中的字符，以防止自动化提交。',
        'Your Info': '您的资料',
        'Update': '更新资料',
        'Quotes': '报价单',
        'Invoices': '账单',
        'Enter a question here to search our knowledgebase for answers...': '在此输入问题，搜索知识库中的答案……',
        'Your Active Products/Services': '您的有效产品 / 服务',
        'Suspended': '已暂停',
        'Active': '使用中',
        'View Details': '查看详情',
        'View More...': '查看更多……',
        'Open New Ticket': '提交新工单',
        'Recent Support Tickets': '最近的支持工单',
        'Closed': '已关闭',
        'View All': '查看全部',
        'Recent News': '最新消息',
        'No Contacts Found': '暂无联系人',
        'New Contact...': '新建联系人……',
        'Shortcuts': '快捷入口',
        'GreenCloud is a leading Infrastructure as a Service provider, offering top-tier VPS and dedicated servers to clients globally, supported by our exceptional 24/7 customer support.':
            'GreenCloud 是一家领先的基础设施即服务供应商，为全球客户提供优质 VPS 和独立服务器，并提供全天候客户支持。',
        'Company': '公司',
        'About Us': '关于我们',
        'Data Centers': '数据中心',
        'Blog': '博客',
        'Resources': '资源',
        'Terms of Service': '服务条款',
        'Privacy Policy': '隐私政策',
        'Affiliate Program': '推广联盟',
        'Close': '关闭',
        'Loading...': '加载中……',
        'Submit': '提交',
        'Generate Password': '生成密码',
        'Please enter a number between 8 and 64 for the password length': '请输入 8 至 64 之间的密码长度',
        'Password Length': '密码长度',
        'Generated Password': '生成的密码',
        'Generate new password': '生成新密码',
        'Copy': '复制',
        'Copy to clipboard and Insert': '复制到剪贴板并填入',
    }));
    const commonScope = '#header, #main-menu, #sub-menu, .content-overlay > h1, #footer';
    // WHMCS 的 clientarea.php 使用 action 区分子页面；未提供的子页只处理公共导航。
    const home = location.pathname.replace(/\/$/, '') === '/billing/clientarea.php' && !new URLSearchParams(location.search).get('action');
    const login = /^\/billing\/(?:login\/?|dologin\.php)$/.test(location.pathname);
    const homeScope = '.header-lined, .panel-heading, .panel-footer, .tiles .title, .home-kb-search, #servicesPanel .div-service-status, #servicesPanel .div-service-buttons, #servicesPanel .btn-view-more, #ticketsPanel .label, #ticketsPanel small, #Secondary_Sidebar-Client_Contacts-No_Contacts';
    const scope = `${commonScope}${home ? `, ${homeScope}` : ''}${login ? ', .logincontainer' : ''}${home || login ? ', #modalAjax, #modalGeneratePassword, #fullpage-overlay' : ''}`;
    const skipped = 'script, style, noscript, textarea, select, option, pre, code, #languageChooserContent, .div-service-name, [menuitemname="Client Details"] .panel-body, [contenteditable]:not([contenteditable="false"]), .notranslate, [translate="no"]';
    const normalize = text => text.replace(/\s+/g, ' ').trim();
    const eligible = el => !el.closest(skipped) && Boolean(el.closest(scope));

    function translateText(node) {
        const parent = node.parentElement;
        if (!parent || !eligible(parent)) return;
        const original = normalize(node.data);
        let translated = terms.get(original);
        // 只替换固定前缀，姓名和时间均原样保留，不写入词库。
        if (!translated && parent.matches('#Secondary_Navbar-Account > a')) {
            const match = /^Hello,\s*(.+)!$/.exec(original);
            if (match) translated = `您好，${match[1]}！`;
        }
        if (!translated && home && parent.matches('.header-lined h1')) {
            const match = /^Welcome Back,\s*(.+)$/.exec(original);
            if (match) translated = `欢迎回来，${match[1]}`;
        }
        if (!translated && parent.matches('#ticketsPanel small') && original.startsWith('Last Updated: ')) {
            translated = `最后更新：${original.slice('Last Updated: '.length)}`;
        }
        if (!translated && parent.matches('#footer .footer-copy')) {
            const match = /^Copyright © (\d{4}) GreenCloud\. All Rights Reserved\.$/.exec(original);
            if (match) translated = `版权所有 © ${match[1]} GreenCloud。保留所有权利。`;
        }
        if (translated && translated !== original) node.data = node.data.replace(/\S(?:[\s\S]*\S)?/, () => translated);
    }
    function translate(root) {
        if (root.nodeType === Node.TEXT_NODE) { translateText(root); return; }
        if (root.nodeType !== Node.ELEMENT_NODE || root.closest(skipped)) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) translateText(walker.currentNode);
        for (const el of [root, ...root.querySelectorAll('[title], [placeholder], [aria-label], input[type="submit"]:not([name]), input[type="button"]:not([name])')]) {
            if (!eligible(el)) continue;
            for (const attr of ['title', 'placeholder', 'aria-label']) {
                const translated = terms.get(normalize(el.getAttribute(attr) || ''));
                if (translated) el.setAttribute(attr, translated);
            }
            if (el.matches('input[type="submit"]:not([name]), input[type="button"]:not([name])')) {
                const translated = terms.get(normalize(el.value));
                if (translated) el.value = translated;
            }
        }
    }
    for (const root of document.querySelectorAll(scope)) translate(root);
    new MutationObserver(records => {
        const pending = new Set();
        for (const record of records) {
            if (record.type === 'childList') for (const node of record.addedNodes) pending.add(node);
            else pending.add(record.target);
        }
        for (const node of pending) if (node.isConnected) translate(node);
    }).observe(document.body, {
        subtree: true, childList: true, characterData: true, attributes: true,
        attributeFilter: ['title', 'placeholder', 'aria-label', 'value'],
    });
})();
