// ==UserScript==
// @name         netcup CCP 简体中文
// @namespace    local.my-translate.netcup
// @version      0.2.0
// @homepageURL  https://github.com/wayner6/my_translate
// @supportURL   https://github.com/wayner6/my_translate/issues
// @downloadURL  https://raw.githubusercontent.com/wayner6/my_translate/main/netcup-ccp-zh-cn.user.js
// @updateURL    https://raw.githubusercontent.com/wayner6/my_translate/main/netcup-ccp-zh-cn.user.js
// @description  本地词库汉化 netcup CCP 概览、产品、域名、账单、滥用通知、推广联盟及基本资料，不上传页面内容。
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

    const listTerms = {
        'Search': '搜索',
        'Reset Search': '重置搜索',
        'Explanation': '说明',
        'Result': '结果',
        'Entries per Page': '每页条数',
        'All': '全部',
        'Hosting': '主机',
        'Order': '订购',
        'Error': '错误',
        'Close': '关闭',
    };
    const pageTerms = {
        produkte: {
            'Change of ownership': '所有权转移',
            'Category': '类别',
            'All Categories': '所有类别',
            'Web hosting': '网站托管',
            'Reseller Web Hosting': '分销网站托管',
            'managed private server': '托管私有服务器',
            'managed Cloud Cluster': '托管云集群',
            'Server': '服务器',
            'Software': '软件',
            'Network': '网络',
            'Service Level': '服务等级',
            'Reseller Level': '分销商等级',
            'GPU Server': 'GPU 服务器',
            'Storage Server': '存储服务器',
            'Individual': '定制产品',
            'Here you will find an overview of your currently booked products.': '您可以在这里查看当前已订购的产品。',
            'You have not ordered any products in this category.': '您尚未订购此类别的产品。',
        },
        domains: {
            'External domains': '外部域名',
            'Domain': '域名',
            'Type': '类型',
            'included': '套餐内含',
            'in addition': '额外订购',
            'Unassigned': '未分配',
            'Here you get an overview of your currently registered domains. Here you can make settings for your domains and order further domains.':
                '您可以在这里查看当前已注册的域名、修改域名设置，以及订购更多域名。',
            'You have not ordered any domains.': '您尚未订购任何域名。',
            'Order Domain': '订购域名',
        },
        rechnungen: {
            'Future invoice items': '待出账项目',
            'Invoice number': '账单编号',
            'Invoice Number': '账单编号',
            'Period from': '起始日期',
            'Period until': '结束日期',
            'Here you get an Overview of your Invoices and can view them in detail.': '您可以在这里查看账单概况和详细信息。',
            'Status': '状态',
            'Date': '日期',
            'Amount': '金额',
            'paid': '已支付',
            'Show Invoice Details': '查看账单详情',
            'Download PDF for invoice': '下载账单 PDF',
        },
        abuse: {
            'Here you will find your Abuse Notices.': '您可以在这里查看滥用通知。',
            'You currently have no outstanding abuse notices.': '您目前没有待处理的滥用通知。',
        },
        partnerprogramm: {
            'Affiliate program': '推广联盟',
            'Terms of contract': '合同条款',
            'Contractual conditions for participation in the partner program of netcup GmbH': '参与 netcup GmbH 推广联盟的合同条款',
            "Registration and participation in the affiliate program is free of charge. If you accept the rules and explanations mentioned here, check the box to accept these contractual terms and then click 'Sign up'. If you wish to cancel the registration, simply select another area in the menu on the left.":
                '注册及参与推广联盟均免费。如果您接受此处列出的规则和说明，请勾选复选框以接受合同条款，然后点击注册按钮。如果您不想注册，可直接选择左侧菜单中的其他栏目。',
            'Every customer of netcup GmbH and also external affiliates can participate in this affiliate program. The latter must be able to pay VAT.':
                'netcup GmbH 的所有客户及外部推广合作伙伴均可参与此推广联盟。外部推广合作伙伴须具备缴纳增值税的能力。',
            'The partner program can be used to recruit new customers for netcup GmbH. The partner program enables the recruiter of a new customer to automatically receive a 10% share of the revenue that the recruited customer brings to netcup GmbH. These revenues represent a commission that the referrer benefits from as a credit on his own invoices.':
                '您可以通过推广联盟为 netcup GmbH 推荐新客户。推荐人可自动获得被推荐客户为 netcup GmbH 带来收入的 10% 作为佣金，用于抵扣推荐人自己的账单。',
            'The recruited customers are assigned to the advertiser via a link in the form https://www.netcup.com/en?ref=IHREKUNDENNUMMER or vouchers.':
                '被推荐客户通过 https://www.netcup.com/en?ref=IHREKUNDENNUMMER 格式的链接或优惠券归属至推荐人（IHREKUNDENNUMMER 代表您的客户编号）。',
            'The advertiser can recruit customers via vouchers. For this purpose, the advertiser can create codes in the partner program, which the prospective customer can redeem with his first order. These codes are unique, so that the new customer can be assigned to his advertiser in the affiliate program.':
                '推荐人也可以通过优惠券吸引客户。您可以在推广联盟中创建优惠码，供潜在客户在首次下单时使用。每个优惠码都是唯一的，以便将新客户归属至相应推荐人。',
            'The allocation of the commission takes place automatically as soon as the recruited customer has paid his invoice.':
                '被推荐客户支付账单后，系统会自动分配相应佣金。',
            'The advertiser can view all the final amounts of the invoices of his recruited customers online and individually determine the timing of the settlement of his commissions.':
                '推荐人可以在线查看被推荐客户各笔账单的最终金额，并自行决定佣金结算时间。',
            "If the commission received by the Referrer is higher than the final amount of the Referrer's invoice, the difference can only be distributed to the Referrer if the latter is registered as a company with netcup GmbH. In the case of an end consumer, the excess commission will be forfeited in this case.":
                '如果推荐人获得的佣金高于其账单最终金额，仅当推荐人在 netcup GmbH 登记为企业时，超出部分才可支付给推荐人。如果推荐人为个人消费者，超出部分的佣金将作废。',
            'The Referrer will participate in the revenues of the Referred Customer as long as he and the Referred Customer are customers of netcup GmbH.':
                '只要推荐人和被推荐客户均仍是 netcup GmbH 的客户，推荐人就可以持续获得被推荐客户带来收入的相应分成。',
            'I accept the terms of the contract': '我接受合同条款',
            // 此页面的 Sign in 实际用于注册推广联盟，不是登录账号。
            'Sign in': '注册加入',
            'You must agree to the terms of the contract by confirming the checkbox.': '请勾选复选框以同意合同条款。',
            'ok': '确定',
        },
        daten_aendern: {
            'Payment provider': '支付服务商',
            'Order processing': '数据处理委托',
            'Name': '姓名',
            'How to change ownership': '如何变更所有权',
            'Street and house number': '街道及门牌号',
            'Postcode, Town / City': '邮政编码、城镇 / 城市',
            'Country': '国家 / 地区',
            'Contract Partner Mail address': '合同联系邮箱',
            'E-mail address for communication with our support relating all contractual topics, accounting department, confidential data, settings and password requests. Confidential details regarding your contract and your products are only communicated to this e-mail address. The specified e-mail address is also registered as owner and admin-c data for your domain registration.':
                '此邮箱用于与支持团队沟通合同、账务、机密资料、设置及密码请求等事宜。有关您的合同和产品的机密信息仅发送至此邮箱。该邮箱也会用于域名注册中的持有人及管理联系人（admin-c）资料。',
            'E-mail address invoices': '账单邮箱',
            'E-mail address for different invoicing': '用于单独接收账单的电子邮箱',
            'Invoice reference': '账单参考信息',
            'Invoice reference is displayed in the invoice and can be used for internal allocation in companies, for example.':
                '账单参考信息会显示在账单上，例如可用于企业内部的费用归属。',
            'Telephone': '电话',
            'Please include the country code. Example: +44123456789': '请包含国际区号，例如：+44123456789',
            'Fax': '传真',
            'Interface language': '界面语言',
            'Deutsch': '德语',
            'English (US)': '英语（美国）',
            '* Required fields': '* 必填项',
            'Edit data': '修改资料',
            'Change Password': '修改密码',
            'Current Password': '当前密码',
            'Your new Password': '新密码',
            'Confirm your new Password': '确认新密码',
            'Two-factor authentication (2FA)': '双重身份验证（2FA）',
            'Two-factor Authentication (2FA) is enabled.': '双重身份验证（2FA）已启用。',
            'Disable Two-factor Authentication': '停用双重身份验证',
        },
    };
    const pageName = /^\/(?:run\/)?([a-z_]+)\.php$/.exec(location.pathname)?.[1];
    const pageDictionary = pageName === 'start' ? overview : pageTerms[pageName]
        ? new Map([...common, ...Object.entries(listTerms), ...Object.entries(pageTerms[pageName])]) : null;
    const commonScope = '#navbarbase, #sidebar, #footer';
    const contentScope = '#sitecontents, #modalTermination, #modalRevokeTermination, #modal_hostingOwnerchange_incoming, #modal_hostingOwnerchange_outgoing, #modal_order, #modal_checkAgreement';
    const activeScope = `${commonScope}${pageDictionary ? `, ${contentScope}` : ''}`;
    // 没有显式 value 的 option 以文字作为提交值，必须保留原文。
    const skipped = 'script, style, noscript, textarea, option:not([value]), pre, code, [contenteditable]:not([contenteditable="false"]), .notranslate, [translate="no"]';
    const normalize = text => text.replace(/\s+/g, ' ').trim();

    function dictionaryFor(element) {
        if (element.closest(commonScope)) return common;
        if (pageDictionary && element.closest(contentScope)) return pageDictionary;
        return null;
    }

    function replaceText(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest(skipped)) return;
        const dictionary = dictionaryFor(parent);
        if (!dictionary) return;
        // 表格里的客户数据不翻译；仅允许账单状态标签匹配词库。
        if (parent.closest('tbody') && !(pageName === 'rechnungen' && parent.matches('span.text-success, span.text-warning, span.text-danger'))) return;
        const text = normalize(node.data);
        let translated = dictionary.get(text);
        if (!translated && pageName === 'rechnungen' && parent.matches('.panel-body')) {
            const match = /^Your individual billing date is the (\d{1,2}) of the month\.$/.exec(text);
            if (match) translated = `您的账单日为每月 ${match[1]} 日。`;
        }
        if (!translated && pageName === 'daten_aendern') {
            const country = /^(.*?)\s*\(This can only be changed by our Support\.\)$/.exec(text);
            if (country && parent.matches('label')) translated = `${country[1]}（仅可由我们的支持团队修改。）`;
            const vat = /^Your VAT rate is: ([\d.,]+)%\.$/.exec(text);
            if (vat && parent.matches('small')) translated = `您的增值税税率为：${vat[1]}%。`;
        }
        // 只在卡片标题匹配欢迎语，保留姓名，不匹配用户正文。
        if (!translated && dictionary === overview && parent.matches('.panel-heading') && text.startsWith('Welcome ')) {
            translated = `欢迎您，${text.slice('Welcome '.length)}`;
        }
        if (translated && translated !== text) node.data = node.data.replace(/\S(?:[\s\S]*\S)?/, () => translated);
    }

    function translate(root) {
        if (root.nodeType === Node.TEXT_NODE) {
            replaceText(root);
            return;
        }
        if (root.nodeType !== Node.ELEMENT_NODE || root.closest(skipped)) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) replaceText(walker.currentNode);

        for (const element of [root, ...root.querySelectorAll('[title]')]) {
            if (element.closest(skipped)) continue;
            const translated = dictionaryFor(element)?.get(normalize(element.getAttribute('title') || ''));
            if (translated) element.setAttribute('title', translated);
        }

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
    for (const root of document.querySelectorAll(activeScope)) translate(root);

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
                for (const root of element.querySelectorAll(activeScope)) translate(root);
            }
        }
    });
    observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['value', 'title'],
    });
})();
