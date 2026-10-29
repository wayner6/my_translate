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
        'First Name': '名',
        'Last Name': '姓',
        'Company Name': '公司名称',
        'Phone Number': '电话号码',
        'Address 1': '地址 1',
        'Address 2': '地址 2',
        'City': '城市',
        'State/Region': '州 / 省 / 地区',
        'Zip Code': '邮政编码',
        'Country': '国家 / 地区',
        'Payment Method': '付款方式',
        'Use Default (Set Per Order)': '使用默认方式（按订单设置）',
        'Crypto (BTC/ETH/BNB/USDT/etc)': '加密货币（BTC/ETH/BNB/USDT 等）',
        'Alipay': '支付宝',
        'Unionpay': '银联',
        'Bank Transfer (USA - Stripe ACH)': '银行转账（美国 - Stripe ACH）',
        'Bank Transfer (Manual EU/UK/USA)': '银行转账（人工处理，欧盟 / 英国 / 美国）',
        'Default Billing Contact': '默认账单联系人',
        'Use Default Contact (Details Above)': '使用默认联系人（上述资料）',
        'Language': '语言',
        'Default': '默认',
        'Arabic': '阿拉伯语',
        'Azerbaijani': '阿塞拜疆语',
        'Catalan': '加泰罗尼亚语',
        'Chinese': '中文',
        'Croatian': '克罗地亚语',
        'Czech': '捷克语',
        'Danish': '丹麦语',
        'Dutch': '荷兰语',
        'Estonian': '爱沙尼亚语',
        'Farsi': '波斯语',
        'French': '法语',
        'German': '德语',
        'Hebrew': '希伯来语',
        'Hungarian': '匈牙利语',
        'Italian': '意大利语',
        'Macedonian': '马其顿语',
        'Norwegian': '挪威语',
        'Portuguese-br': '葡萄牙语（巴西）',
        'Portuguese-pt': '葡萄牙语（葡萄牙）',
        'Romanian': '罗马尼亚语',
        'Russian': '俄语',
        'Spanish': '西班牙语',
        'Swedish': '瑞典语',
        'Turkish': '土耳其语',
        'Ukranian': '乌克兰语',
        'How did you find us?': '您是如何了解到我们的？',
        'None': '无',
        'Other Search Engine': '其他搜索引擎',
        'Friend': '朋友推荐',
        'Other': '其他',
        'Email Preferences': '邮件偏好设置',
        'General Emails - All account related emails': '常规邮件 — 所有账户相关邮件',
        'Invoice Emails - New Invoices, Reminders, & Overdue Notices': '账单邮件 — 新账单、付款提醒及逾期通知',
        'Support Emails - Receive a CC of all Support Ticket Communications': '支持邮件 — 接收所有工单往来邮件的抄送',
        'Product Emails - Welcome Emails, Suspensions & Other Lifecycle Notifications': '产品邮件 — 欢迎邮件、暂停服务及其他服务状态通知',
        'Domain Emails - Registration/Transfer Confirmation & Renewal Notices': '域名邮件 — 注册 / 转移确认及续费通知',
        'Affiliate Emails - Receive Affiliate Notifications': '推广邮件 — 接收推广联盟通知',
        'Choose Contact': '选择联系人',
        'Add New Contact': '添加新联系人',
        'Go': '前往',
        'General Emails - General Announcements & Password Reminders': '常规邮件 — 常规公告及密码提醒',
        'Invoice Emails - Invoices & Billing Reminders': '账单邮件 — 账单及付款提醒',
        'Support Emails - Receive a copy of all support ticket communications created by the parent account holder': '支持邮件 — 接收主账户持有人创建的所有工单往来邮件副本',
        'Product Emails - Order Details, Welcome Emails, etc...': '产品邮件 — 订单详情、欢迎邮件等',
        'Domain Emails - Renewal Notices, Registration Confirmations, etc...': '域名邮件 — 续费通知、注册确认等',
        'Save Changes': '保存更改',
        'Cancel': '取消',
        'Email Address / Last Login': '电子邮箱 / 上次登录',
        'Owner': '账户所有者',
        'Manage Permissions': '管理权限',
        'Remove Access': '移除访问权限',
        '* Account owners always have full permissions over a client account.': '* 账户所有者始终拥有客户账户的全部权限。',
        'Invite New User': '邀请新用户',
        'Inviting a new user allows you to invite a new user to your account. If the invitee already has an existing user account, they will be able to access your account using their existing login credentials. If the user does not yet have a user account, they will be able to create one.':
            '您可以邀请新用户访问您的账户。如果受邀人已有用户账户，可使用现有登录凭据访问您的账户；如果尚无用户账户，则可以创建一个。',
        'All Permissions': '全部权限',
        'Choose Permissions': '选择权限',
        'Modify Master Account Profile - Access and modify the client profile information': '修改主账户资料 — 访问并修改客户资料',
        'View & Manage Contacts - Access and manage contacts': '查看和管理联系人 — 访问并管理联系人',
        'View Products & Services - View access to products, services and addons': '查看产品与服务 — 查看产品、服务及附加组件',
        'View & Modify Product Passwords - Allow password resets and other actions': '查看和修改产品密码 — 允许重置密码及其他操作',
        'Perform Single Sign-On - Allow single sign-on into services': '使用单点登录 — 允许通过单点登录进入服务',
        'View Domains - View access to domain registrations': '查看域名 — 查看域名注册信息',
        'Manage Domain Settings - Allow domain management eg. nameservers/whois/transfers': '管理域名设置 — 管理域名服务器、WHOIS 信息、转移等',
        'View & Pay Invoices - View and payment access to invoices': '查看和支付账单 — 查看账单并付款',
        'View & Accept Quotes - View and acceptance permissions for quotes': '查看和接受报价 — 查看并接受报价单',
        'View & Open Support Tickets - Access to open, respond and manage support tickets': '查看和提交工单 — 提交、回复及管理支持工单',
        'View & Manage Affiliate Account - Access to view and request withdrawals': '查看和管理推广账户 — 查看推广账户并申请提现',
        'View Emails - Access to view account email history': '查看邮件 — 查看账户邮件记录',
        'Place New Orders/Upgrades/Cancellations - Allow placing of new orders': '提交订单 / 升级 / 取消 — 允许提交新订单',
        'Send Invite': '发送邀请',
        'Are you sure you wish to remove this users access?': '确定要移除此用户的访问权限吗？',
        'They will no longer be able to access or administer this account.': '移除后，该用户将无法再访问或管理此账户。',
        'Confirm': '确认',
        'Cancel Invite': '取消邀请',
        'Are you sure you wish to cancel this invite?': '确定要取消此邀请吗？',
        'The user will not be notified of this cancellation.': '取消邀请不会通知该用户。',
        'Single Sign-On': '单点登录',
        'Third party applications leverage the Single Sign-On functionality to provide direct access to your billing account without you having to re-authenticate.': '第三方应用可以通过单点登录功能直接访问您的账务账户，无需再次认证。',
        'ON': '开启',
        'OFF': '关闭',
        'Single Sign-On is currently permitted for your account.': '您的账户目前允许单点登录。',
        'Single Sign-On is currently disabled for your account.': '您的账户目前已禁用单点登录。',
        'You may wish to disable this functionality if you provide access to any of your third party applications to users who you do not wish to be able to access your billing account.': '如果您允许某些用户访问第三方应用，但不希望他们访问您的账务账户，建议禁用此功能。',
        'My Emails': '我的邮件',
        'Your email history with us': '您在本站的邮件记录',
        'Date Sent': '发送日期',
        'Message Subject': '邮件主题',
        'View Message': '查看邮件',
    }));
    const commonScope = '#header, #main-menu, #sub-menu, .content-overlay > h1, #footer';
    // WHMCS 的 clientarea.php 使用 action 区分子页面；未提供的子页只处理公共导航。
    const path = location.pathname.replace(/\/$/, '');
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    const home = path === '/billing/clientarea.php' && !action;
    const login = /^\/billing\/(?:login|dologin\.php)$/.test(path);
    const lists = path === '/billing/clientarea.php' && ['services', 'invoices', 'quotes', 'details', 'security', 'emails'].includes(action);
    const addons = path === '/billing/cart.php' && (params.get('gid') === 'addons' || Boolean(document.querySelector('#Secondary_Sidebar-Categories-Addons.active')));
    const ticketDepartments = path === '/billing/submitticket.php' && !params.has('step') && !params.has('deptid');
    const supported = home || login || lists || addons || ticketDepartments || [
        '/billing/account/paymentmethods', '/billing/account/contacts', '/billing/account/users', '/billing/affiliates.php', '/billing/announcements',
        '/billing/download', '/billing/knowledgebase', '/billing/serverstatus.php',
        '/billing/service-renewals', '/billing/store/13th-birthday-sale', '/billing/supporttickets.php',
    ].includes(path);
    const homeScope = '.header-lined, .panel-heading, .panel-footer, .tiles .title, .home-kb-search, #servicesPanel .div-service-status, #servicesPanel .div-service-buttons, #servicesPanel .btn-view-more, #ticketsPanel .label, #ticketsPanel small, #Secondary_Sidebar-Client_Contacts-No_Contacts';
    const scope = `${commonScope}${home ? `, ${homeScope}` : ''}${login ? ', .logincontainer' : ''}${supported ? ', #main-body, #modalAjax, #modalGeneratePassword, #fullpage-overlay, #recommendationsModal' : ''}`;
    const skipped = 'script, style, noscript, textarea, option:not([value]), select[name="productid"], select[name="country"], select[name="state"], .country-list, .selected-dial-code, .selected-flag, pre, code, #languageChooserContent, .div-service-name, [menuitemname="Client Details"] .panel-body, .ticket-number, .ticket-subject, .recent-ticket .truncate, .recent-ticket .pull-right, .service-renewal h3, .service-renewal h4, .product-desc, .feature-value, .summary-totals .float-right, .price, .amt, .stat, .badge, [contenteditable]:not([contenteditable="false"]), .notranslate, [translate="no"]';
    const normalize = text => text.replace(/\s+/g, ' ').trim();
    function eligible(el) {
        if (el.closest(skipped) || !el.closest(scope)) return false;
        if (el.closest('.product header') && !el.closest('.qty')) return false;
        if (el.closest('select[name="contactid"], select[name="billingcid"]') && !['Add New Contact', 'Use Default Contact (Details Above)'].includes(normalize(el.textContent))) return false;
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
        if (!translated && path === '/billing/account/users' && parent.matches('p')) {
            const match = /^([\d,]+) Users? Found$/.exec(original);
            if (match) translated = `找到 ${match[1]} 位用户`;
        }
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
        if (translated && translated !== original) translationState.text(node, node.data.replace(/\S(?:[\s\S]*\S)?/, () => translated));
    }
    function translate(root) {
        if (root.nodeType === Node.TEXT_NODE) { translateText(root); return; }
        if (root.nodeType !== Node.ELEMENT_NODE || root.closest(skipped)) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) translateText(walker.currentNode);
        for (const el of [root, ...root.querySelectorAll('[title], [placeholder], [aria-label], input[type="submit"], input[type="button"]:not([name]), input[type="reset"]:not([name])')]) {
            if (!eligible(el)) continue;
            for (const attr of ['title', 'placeholder', 'aria-label']) {
                const original = normalize(el.getAttribute(attr) || '');
                let translated = terms.get(original);
                if (!translated && attr === 'aria-label' && el.matches('th')) {
                    const match = /^(.*): activate to sort column (ascending|descending)$/.exec(original);
                    if (match) translated = `${terms.get(match[1]) || match[1]}${match[1] ? '：' : ''}点击以${match[2] === 'ascending' ? '升序' : '降序'}排列`;
                }
                if (translated) translationState.attribute(el, attr, translated);
            }
            if (el.matches('input[type="submit"]:not([name]), input[type="button"]:not([name]), input[type="reset"]:not([name])')) {
                const translated = terms.get(normalize(el.value));
                if (translated) translationState.attribute(el, 'value', translated);
            } else if (el.matches('input[type="submit"][name]')) {
                // 具名提交按钮的 value 会参与提交，只增加中文提示，不改变业务值。
                const translated = terms.get(normalize(el.value));
                if (translated) {
                    if (!el.hasAttribute('title')) translationState.attribute(el, 'title', translated);
                    if (!el.hasAttribute('aria-label')) translationState.attribute(el, 'aria-label', translated);
                }
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
