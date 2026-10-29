# my_translate

为尚未提供中文界面、但菜单和提示等内容相对固定的网站制作简体中文翻译。通过站点专属规则替换界面文案，保留产品名称、配置和用户数据，减少整页翻译带来的误译。

项目同时提供页面导出脚本：将常用网站的界面导出为 HTML，再交给 AI 或开发者编写翻译规则，按自己的需要扩展网站适配。

## 支持网站

- [netcup CCP](https://www.customercontrolpanel.de/)
- [GreenCloud（绿云）](https://greencloudvps.com/billing/)

## 安装

1. 安装并启用 Tampermonkey（篡改猴）。
2. [安装 / 更新翻译脚本](https://raw.githubusercontent.com/wayner6/my_translate/main/my_translate.user.js)。
3. 刷新目标网页。

## 页面导出（可选）

[安装 / 更新导出脚本](https://raw.githubusercontent.com/wayner6/my_translate/main/snapshot-export.user.js)，当前适用于上述网站。

关闭翻译并刷新页面后，按 **Alt + Shift + E**，或从篡改猴菜单选择“导出当前页面”，即可下载包含页面结构、文案和经过脱敏处理的网址的 HTML 文件，用于制作或补充翻译规则。
