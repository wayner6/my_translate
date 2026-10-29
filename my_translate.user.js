// ==UserScript==
// @name         my_translate
// @namespace    local.my-translate
// @version      0.5.1
// @description  指定网站界面的本地简体中文汉化，支持 netcup CCP 和 GreenCloud，保留用户数据及产品名称。
// @homepageURL  https://github.com/wayner6/my_translate
// @supportURL   https://github.com/wayner6/my_translate/issues
// @downloadURL  https://raw.githubusercontent.com/wayner6/my_translate/main/my_translate.user.js
// @updateURL    https://raw.githubusercontent.com/wayner6/my_translate/main/my_translate.user.js
// @match        https://www.customercontrolpanel.de/*
// @match        https://greencloudvps.com/billing/*
// @run-at       document-end
// @grant        none
// @noframes
// ==/UserScript==


// netcup CCP
(() => {
    'use strict';
    if (location.origin !== 'https://www.customercontrolpanel.de') return;

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


// GreenCloud
(() => {
    'use strict';
    if (location.origin !== 'https://greencloudvps.com' || !location.pathname.startsWith('/billing/')) return;
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
        'My Products & Services': '我的产品与服务',
        'View': '查看',
        'Pending': '待处理',
        'Terminated': '已终止',
        'Cancelled': '已取消',
        'Product/Service': '产品 / 服务',
        'Pricing': '价格',
        'Next Due Date': '下次到期日',
        'Status': '状态',
        'Manage Product': '管理产品',
        'Previous': '上一页',
        'Next': '下一页',
        'Show': '每页显示',
        'entries': '条',
        'All': '全部',
        'Actions': '操作',
        'Place a New Order': '提交新订单',
        'Search': '搜索',
        'No records found': '暂无记录',
        'No data available in table': '暂无数据',
        'No matching records found': '没有匹配的记录',
        'Your invoice history with us': '您在本站的账单记录',
        'You have no unpaid invoices at this time.': '您目前没有未付账单。',
        'Paid': '已支付',
        'Unpaid': '未支付',
        'Refunded': '已退款',
        'Invoice #': '账单编号',
        'Invoice Date': '账单日期',
        'Due Date': '到期日',
        'Total': '总额',
        'View Invoice': '查看账单',
        'Quotes we have generated for you': '我们为您生成的报价单',
        'Stage': '阶段',
        'Delivered': '已发送',
        'Accepted': '已接受',
        'Quote #': '报价单编号',
        'Subject': '主题',
        'Date Created': '创建日期',
        'Valid Until': '有效期至',
        'An overview of your payment methods and settings.': '查看您的付款方式及相关设置。',
        'Add New Credit Card': '添加信用卡',
        'Name': '名称',
        'Description': '说明',
        'Are you sure?': '确定要继续吗？',
        'Are you sure you want to delete this payment method? This action cannot be undone.': '确定要删除此付款方式吗？此操作无法撤销。',
        'No': '否',
        'Yes': '是',
        'Support Tickets': '支持工单',
        'My Support Tickets': '我的支持工单',
        'Your ticket history': '您的工单记录',
        'Open': '待处理',
        'Answered': '已回复',
        'Customer-Reply': '客户已回复',
        'Department': '部门',
        'Last Updated': '最后更新',
        'News': '新闻',
        'All the latest from GreenCloud': 'GreenCloud 最新动态',
        'By Month': '按月份查看',
        'Older Announcements...': '更早的公告……',
        'View RSS Feed': '查看 RSS 订阅',
        'No announcements to display': '暂无公告',
        'Manuals, programs, and other files': '手册、程序及其他文件',
        'No Downloads to Display': '暂无可下载文件',
        'Server Status': '服务器状态',
        'News & Information': '新闻与信息',
        'Scheduled': '已安排',
        'Resolved': '已解决',
        'There are no Network Issues Currently': '目前没有网络故障',
        '< Prev Page': '< 上一页',
        'Next Page >': '下一页 >',
        'Submit Ticket': '提交工单',
        "If you can't find a solution to your problems in our knowledgebase, you can submit a ticket by selecting the appropriate department below.":
            '如果知识库中没有解决您问题的方法，请在下方选择合适的部门提交工单。',
        'Sales': '销售',
        'Sales related inquiries': '销售相关咨询',
        'For billing inquiries': '账务相关咨询',
        'Technical Support': '技术支持',
        'For any and all technical support questions. This department is available 24/7. Please note that for unmanaged services, you might be charged an additional fee for troubleshooting/assisting outside of our support for hardware/network related issues: https://greencloudvps.com/billing/store/additional-services':
            '处理各类技术支持问题，全天候提供服务。请注意：对于非托管服务，超出硬件及网络支持范围的故障排查或协助可能会收取额外费用：https://greencloudvps.com/billing/store/additional-services',
        'Your Recent Tickets': '您最近的工单',
        'Activate Affiliate Account': '启用推广账户',
        'Get Paid for Referring Customers to Us': '推荐客户，赚取佣金',
        'Activate your affiliate account and start earning money today...': '启用您的推广账户，开始赚取佣金……',
        'We pay commissions for every signup that comes via your custom signup link.': '通过您的专属注册链接带来的每次注册，我们都会支付佣金。',
        "We track the visitors you refer to us using cookies, so users you refer don't have to purchase instantly for you to receive your commission. Cookies last for up to 90 days following the initial visit.":
            '我们使用 Cookie 追踪您推荐的访客，因此被推荐用户无需立即购买，您仍有机会获得佣金。Cookie 自首次访问起最长保留 90 天。',
        'If you would like to find out more, please contact us.': '如需了解更多信息，请联系我们。',
        'Categories': '类别',
        'Account/Billing': '账户 / 账务',
        'Pre-Sales': '售前咨询',
        'Common questions about accounts and billing': '账户及账务常见问题',
        'Articles related to your KVM VPS': 'KVM VPS 相关文章',
        'Pre-sales Questions & Answers': '售前问答',
        'Most Popular Articles': '热门文章',
        'How to Install Windows Updates on a Windows 2012, 2008 R2 and 2003 Server': '如何在 Windows Server 2012、2008 R2 和 2003 上安装更新',
        'Windows updates are commonly scheduled in our environment on a staggered basis. However, should...': '我们通常会分批安排 Windows 更新。不过，如果……',
        'How do I upgrade or downgrade my service?': '如何升级或降级我的服务？',
        'I. If you would like to upgrade your service, we have a convenient process to do just that....': 'I. 如果您希望升级服务，我们提供了便捷的操作流程……',
        'Red Hat / CentOS IPv6 Network Configuration': 'Red Hat / CentOS IPv6 网络配置',
        'Firstly, log in to your SolusVM Control Panel, choose your VPS and navigate to the Network...': '首先登录 SolusVM 控制面板，选择 VPS，然后进入网络设置……',
        'How to enable .NET Framework 3.5 on Windows Server 2008/2012': '如何在 Windows Server 2008/2012 上启用 .NET Framework 3.5',
        'I. Windows Server 2008:The .NET Framework 3.5 SP1 (also referred to as .NET Framework 3.5.1) is a...': 'I. Windows Server 2008：.NET Framework 3.5 SP1（也称为 .NET Framework 3.5.1）是……',
        'How to Extend the Hard drive after upgrading VPS': '升级 VPS 后如何扩展硬盘',
        '1. For KVM VPS.First log in to your SolusVM Control Panel, mount the Gparted iso and Choose the...': '1. 对于 KVM VPS，首先登录 SolusVM 控制面板，挂载 Gparted ISO，并选择……',
        'Product Addons': '产品附加组件',
        'Renew Domains': '续费域名',
        '- Choose Another Category -': '- 选择其他类别 -',
        'Order Now': '立即订购',
        'Renew Service': '服务续费',
        'Hide Non-Renewable Items': '隐藏不可续费的项目',
        'Show Non-Renewable Items': '显示不可续费的项目',
        'Renewal Unavailable': '暂不可续费',
        'This service is not within its renewal period.': '此服务尚未进入可续费期。',
        'Order Summary': '订单摘要',
        'Subtotal:': '小计：',
        'Total Due Today': '今日应付总额',
        'Remove Item': '移除项目',
        'Are you sure you want to remove this item from your cart?': '确定要从购物车中移除此项目吗？',
        'New deals will be updated frequently.': '优惠方案将持续更新。',
        'No refunds/money back on those plans. Please ping/test our IPs before making purchases: https://greencloudvps.com/data-centers.php .Unpaid orders will be cancelled after 30 minutes':
            '这些套餐不支持退款。购买前请先测试我们的 IP：https://greencloudvps.com/data-centers.php 。未付款的订单将在 30 分钟后取消。',
        'Triennially': '每三年',
        'Annually': '每年',
        'Added to Cart': '已加入购物车',
        'Based on this product, we recommend:': '根据此产品，我们为您推荐：',
        'Continue': '继续',
        'FREE!': '免费！',
        'Setup Fee': '设置费',
        'Add to Cart': '加入购物车',
        'A description (tagline) is not available for this product.': '此产品暂无简介。',
    }));
    const commonScope = '#header, #main-menu, #sub-menu, .content-overlay > h1, #footer';
    // WHMCS 的 clientarea.php 使用 action 区分子页面；未提供的子页只处理公共导航。
    const path = location.pathname.replace(/\/$/, '');
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    const home = path === '/billing/clientarea.php' && !action;
    const login = /^\/billing\/(?:login|dologin\.php)$/.test(path);
    const lists = path === '/billing/clientarea.php' && ['services', 'invoices', 'quotes'].includes(action);
    const addons = path === '/billing/cart.php' && (params.get('gid') === 'addons' || Boolean(document.querySelector('#Secondary_Sidebar-Categories-Addons.active')));
    const ticketDepartments = path === '/billing/submitticket.php' && !params.has('step') && !params.has('deptid');
    const supported = home || login || lists || addons || ticketDepartments || [
        '/billing/account/paymentmethods', '/billing/affiliates.php', '/billing/announcements',
        '/billing/download', '/billing/knowledgebase', '/billing/serverstatus.php',
        '/billing/service-renewals', '/billing/store/13th-birthday-sale', '/billing/supporttickets.php',
    ].includes(path);
    const homeScope = '.header-lined, .panel-heading, .panel-footer, .tiles .title, .home-kb-search, #servicesPanel .div-service-status, #servicesPanel .div-service-buttons, #servicesPanel .btn-view-more, #ticketsPanel .label, #ticketsPanel small, #Secondary_Sidebar-Client_Contacts-No_Contacts';
    const scope = `${commonScope}${home ? `, ${homeScope}` : ''}${login ? ', .logincontainer' : ''}${supported ? ', #main-body, #modalAjax, #modalGeneratePassword, #fullpage-overlay, #recommendationsModal' : ''}`;
    const skipped = 'script, style, noscript, textarea, option:not([value]), select[name="productid"], pre, code, #languageChooserContent, .div-service-name, [menuitemname="Client Details"] .panel-body, .ticket-number, .ticket-subject, .recent-ticket .truncate, .recent-ticket .pull-right, .service-renewal h3, .service-renewal h4, .product-desc, .feature-value, .summary-totals .float-right, .price, .amt, .stat, .badge, [contenteditable]:not([contenteditable="false"]), .notranslate, [translate="no"]';
    const normalize = text => text.replace(/\s+/g, ' ').trim();
    function eligible(el) {
        if (el.closest(skipped) || !el.closest(scope)) return false;
        if (el.closest('.product header') && !el.closest('.qty')) return false;
        // 正文数据和主题不做词库匹配；只处理已识别的状态、操作按钮及空表提示。
        if (el.closest('tbody td') && !el.closest('.btn, button, .label, .status, .textgreen, .textgrey, .dataTables_empty')) return false;
        if (el.closest('#ticketsPanel .list-group-item') && !el.closest('.label, small')) return false;
        return true;
    }

    function translateText(node) {
        const parent = node.parentElement;
        if (!parent || !eligible(parent)) return;
        const original = normalize(node.data);
        let translated = terms.get(original);
        if (!translated && parent.matches('.dataTables_info')) {
            const match = /^Showing ([\d,]+) to ([\d,]+) of ([\d,]+) entries(?: \(filtered from ([\d,]+) total entries\))?$/.exec(original);
            if (match) translated = `显示第 ${match[1]} 至 ${match[2]} 条，共 ${match[3]} 条${match[4] ? `（从 ${match[4]} 条记录中筛选）` : ''}`;
        }
        if (!translated && parent.matches('.panel-title')) {
            const match = /^(\d+) Invoices? Due$/.exec(original);
            if (match) translated = `${match[1]} 张待付账单`;
        }
        if (!translated && parent.matches('.qty')) {
            const match = /^(\d+) Available$/.exec(original);
            if (match) translated = `剩余 ${match[1]} 件`;
        }
        if (!translated && parent.matches('.service-renewal > p') && original.startsWith('Next Due Date: ')) {
            translated = `下次到期日：${original.slice('Next Due Date: '.length)}`;
        }
        if (!translated && parent.closest('.kbcategories, .sidebar, .sidebar-collapsed')) {
            const match = /^(Account\/Billing|Pre-Sales) (\(\d+\))$/.exec(original);
            if (match) translated = `${terms.get(match[1])} ${match[2]}`;
        }
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
                const original = normalize(el.getAttribute(attr) || '');
                let translated = terms.get(original);
                if (!translated && attr === 'aria-label' && el.matches('th')) {
                    const match = /^(.*): activate to sort column (ascending|descending)$/.exec(original);
                    if (match) translated = `${terms.get(match[1]) || match[1]}${match[1] ? '：' : ''}点击以${match[2] === 'ascending' ? '升序' : '降序'}排列`;
                }
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
