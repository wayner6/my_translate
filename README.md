# netcup CCP 简体中文汉化

基于上传的 netcup CCP 英文概览页开发的油猴脚本。安装时只需 `netcup-ccp-zh-cn.user.js`，无需安装 Node.js 或任何依赖。

## 安装

1. 浏览器安装并启用 Tampermonkey（篡改猴）。
2. 打开 [安装 / 更新脚本](https://raw.githubusercontent.com/wayner6/netcup-ccp-zh-cn/main/netcup-ccp-zh-cn.user.js)，在 Tampermonkey 提示页点击安装。
3. 刷新 `https://www.customercontrolpanel.de/start.php`。

如果链接只显示代码，可手动添加新脚本，删除默认内容，粘贴链接中的全部代码后保存。

如果没有生效，检查脚本是否开启、Tampermonkey 是否有该站点访问权限，并按扩展提示开启“允许用户脚本”或开发者模式。测试时暂时关闭其他翻译扩展对该站点的翻译，避免反复替换。

停用：在 Tampermonkey 中关闭本脚本，然后刷新页面，即恢复原界面。

脚本已配置 GitHub 更新地址。后续发布时递增 `@version`，Tampermonkey 会按自身更新设置检查更新，也可以在管理面板手动检查，或重新打开安装链接更新。通过旧版代码手动安装的用户，请先用此链接重新安装一次以获得更新配置。

## 当前范围

- 公共顶部导航、侧边栏、页脚。
- `/start.php` 和 `/run/start.php` 概览页：欢迎语、待付账单、论坛关联、Trustpilot 评价、域名资料核验通知、邮件订阅、招聘文字及按钮。
- 同一区域后续动态插入的已知文字也会翻译。
- 其他页面目前仅翻译公共导航；其正文需提供样本后适配。
- 图片中的英文、未提供的弹窗和未知提示暂不翻译。

汉化过程只使用本地词库，不调用翻译 API，不发送页面内容，不读取 Cookie 或密钥。脚本管理器检查及下载更新时会访问 GitHub。不改变链接地址、表单 action、隐藏字段或用户输入，不自动点击、提交表单或触发业务操作。只对不带 name 的 submit/button 输入按钮替换显示值，避免改变提交参数。

## 目录

```text
my_translate/
├── netcup-ccp-zh-cn.user.js   安装到 Tampermonkey 的脚本
├── uploads/                 后续上传的原始 HTML 样本（勿公开）
│   └── netcup_ccp.html       本次上传的原始文件，已从根目录移入
├── tests/                   DOM 自动化测试
├── package.json             仅开发测试使用
└── package-lock.json
```

## 后续适配

将产品页、账单页等 HTML 放入 `uploads/`，并说明对应网址的路径。弹窗请在打开后再复制 HTML。可附截图说明翻译偏好和排版问题。涉及账号、服务器等信息请先脱敏。

原始 HTML 可能含会话标识、CSRF 令牌、账号资料及浏览器扩展注入内容；本项目通过 `.gitignore` 排除上传样本，不将其打包进脚本。不要把原始 HTML 当作安全的离线预览直接打开。

## 开发验证

```sh
npm ci
npm test
node --check netcup-ccp-zh-cn.user.js
```

jsdom 仅用于开发测试，不是脚本运行依赖。测试不执行样本内脚本、不加载外部资源，检查词条覆盖、动态内容、图标/链接/监听器保留、表单字段不变和页面作用域。缺少本地样本时，样本测试会跳过，其余测试仍可运行。

已通过 DOM 自动化测试；实际登录后台的渲染、排版和交互仍需安装后确认。
