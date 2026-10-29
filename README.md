# my_translate

针对特定网站界面的简体中文汉化项目，采用本地词库和站点专属规则，逐步增加网站适配。

当前首个适配站点为 **netcup CCP**，已覆盖概览及六个主要后台页面。安装时只需 `netcup-ccp-zh-cn.user.js`，无需安装 Node.js 或任何依赖。

## 安装

1. 浏览器安装并启用 Tampermonkey（篡改猴）。
2. 打开 [安装 / 更新脚本](https://raw.githubusercontent.com/wayner6/my_translate/main/netcup-ccp-zh-cn.user.js)，在 Tampermonkey 提示页点击安装。
3. 刷新 `https://www.customercontrolpanel.de/start.php`。

如果链接只显示代码，可手动添加新脚本，删除默认内容，粘贴链接中的全部代码后保存。

如果没有生效，检查脚本是否开启、Tampermonkey 是否有该站点访问权限，并按扩展提示开启“允许用户脚本”或开发者模式。测试时暂时关闭其他翻译扩展对该站点的翻译，避免反复替换。

停用：在 Tampermonkey 中关闭本脚本，然后刷新页面，即恢复原界面。

脚本已配置 GitHub 更新地址。后续发布时递增 `@version`，Tampermonkey 会按自身更新设置检查更新，也可以在管理面板手动检查，或重新打开安装链接更新。通过旧版代码手动安装的用户，请先用此链接重新安装一次以获得更新配置。

## 当前范围

- 公共顶部导航、侧边栏、页脚。
- `/start.php` 和 `/run/start.php` 概览页：欢迎语、待付账单、论坛关联、Trustpilot 评价、域名资料核验通知、邮件订阅、招聘文字及按钮。
- `/produkte.php` 产品页：分类筛选、搜索、空列表提示、所有权转移入口。
- `/domains.php` 域名页：筛选、搜索、空列表提示、外部域名及订购入口。
- `/rechnungen.php` 账单页：筛选、表头、已支付状态、账单日、详情及 PDF 图标提示。
- `/abuse.php` 滥用通知页：筛选、搜索和空列表提示。
- `/partnerprogramm.php` 推广联盟页：注册条款、复选框说明、注册按钮和条款确认提示。
- `/daten_aendern.php` 基本资料页：资料字段说明、密码修改和已启用的 2FA 界面。
- 上述页面的 `/run/` 路径同样支持；已知词条在动态加载后继续生效。
- 筛选下拉框只翻译显式设置了 `value` 的选项，不改变提交值或选中项。VPS、Root Server 等产品系列名保留。
- 其他标签页及详情页（如外部域名、待出账项目、支付服务商、API）、尚未提供的操作弹窗和错误提示，需后续补充样本。Contact 跳转的 netcup 官网不在当前范围。
- 图片中的英文暂不翻译。

汉化过程只使用本地词库，不调用翻译 API，不发送页面内容，不读取 Cookie 或密钥。脚本管理器检查及下载更新时会访问 GitHub。不改变链接地址、表单 action、隐藏字段或用户输入，不自动点击、提交表单或触发业务操作。只对不带 name 的 submit/button 输入按钮替换显示值，避免改变提交参数。

## 目录

```text
my_translate/
├── netcup-ccp-zh-cn.user.js   安装到 Tampermonkey 的脚本
├── uploads/                 后续上传的原始 HTML 样本（勿公开）
│   └── Netcup/              netcup 原始 HTML，仅保存在本地
├── tests/                   DOM 自动化测试
├── package.json             仅开发测试使用
└── package-lock.json
```

## 后续适配

将 netcup 后续页面的 HTML 放入 `uploads/Netcup/`（其他网站可另建文件夹），并说明对应网址的路径。弹窗请在打开后再复制 HTML。可附截图说明翻译偏好和排版问题。涉及账号、服务器等信息请先脱敏。

原始 HTML 可能含会话标识、CSRF 令牌、账号资料及浏览器扩展注入内容；本项目通过 `.gitignore` 排除上传样本，不将其打包进脚本。不要把原始 HTML 当作安全的离线预览直接打开。

## 开发验证

```sh
npm ci
npm test
node --check netcup-ccp-zh-cn.user.js
```

jsdom 仅用于开发测试，不是脚本运行依赖。测试不执行样本内脚本、不加载外部资源，检查词条覆盖、动态内容、图标/链接/监听器保留、表单字段不变和页面作用域。缺少本地样本时，样本测试会跳过，其余测试仍可运行。

### 0.2.0

新增产品、域名、账单、滥用通知、推广联盟及基本资料六页适配；增加下拉选项和图标悬浮提示翻译，保留业务数据及表单提交值。21 项 DOM 自动化测试通过，包含本地七页样本检查。

实际登录后台的渲染、排版和交互仍需安装后确认。
