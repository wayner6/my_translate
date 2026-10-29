# 二次开发

项目使用原生 JavaScript 和 Node.js 构建脚本，无需打包框架。安装到浏览器的仍是一个翻译脚本和一个独立导出脚本。

## 目录

```text
src/
├── sites.json              站点清单、名称和 @match 范围
├── sites/
│   ├── netcup.js           netcup 独立词库、定位及动态内容处理
│   └── greencloud.js       GreenCloud 独立词库、定位及动态内容处理
└── exporter.js             导出器源码、独立版本及权限元数据
scripts/
├── build.cjs               生成并检查安装文件
└── sanitize-uploads.cjs    本地样本脱敏
my_translate.user.js        生成的翻译安装文件，不直接编辑
snapshot-export.user.js     生成的导出安装文件，不直接编辑
tests/                      自动化测试
uploads/                    本地 HTML 样本，被 Git 忽略
```

每个站点保留独立作用域和自己的处理逻辑，避免不同网站互相影响。当前无需先改造通用翻译引擎才能增加一个网站。

## 开始开发

先 Fork 仓库，在自己的 Fork 中添加日常需要的站点，无需追求覆盖所有网站。需要 Node.js 22 或更新版本。

```sh
npm ci
npm run build
npm test
```

构建仅合并站点源码、生成元数据并复制导出脚本，没有运行时外部依赖。普通用户直接安装根目录的 `.user.js`，不需要 Node.js。

## 新增站点

1. 用导出脚本采集英文界面，样本放在 `uploads/<站点>/`。从 HTML 中的 `meta[name="snapshot-url"]` 读取网址；占位符不能当作真实账号、参数值或翻译词条。不要执行样本脚本。
2. 在 `src/sites/<id>.js` 编写适配代码。可参考已有站点：使用独立 IIFE，首先检查 `location.origin`、路径及必要的查询/hash 路由，再创建词库和监听器。文件内不添加 `==UserScript==` 元数据。
3. 在 `src/sites.json` 增加站点。例如：

   ```json
   {
     "id": "example",
     "name": "Example",
     "matches": ["https://console.example.com/*"]
   }
   ```

   `id` 对应 `src/sites/example.js`，必须唯一。只申请目标站点需要的权限；网站运行时检查也必须与清单对应。
4. 在 `tests/<id>.test.cjs` 中补充合成 HTML 测试。测试通过 `fs.readFileSync` 加载根目录的构建产物，再用 jsdom 的 `runScripts: 'outside-only'` 执行翻译脚本，不运行网页自己的脚本。
5. 在 README 的网站列表中增加站点。发布翻译更新时递增 `package.json` 的版本；更新导出器时递增 `src/exporter.js` 的 `@version`。
6. 执行以下命令，并提交源码、清单、测试和重新生成的根目录脚本。

   ```sh
   npm run build
   npm test
   ```

`npm test` 会先检查产物是否与源码一致；如果提示未同步，先重新构建。`npm run build:check` 可单独检查，不修改文件。

## 适配原则

- 只翻译已确认的固定界面文案，按上下文定位，不全页盲目替换。
- 产品名称、配置说明、代码、用户资料、编号、IP、域名、价格、日期和工单正文保持原样。动态句子只替换固定部分，保留变量。
- 修改文本节点和必要的显示属性，不使用 `innerHTML` 重建已有界面。不修改链接、表单提交参数、隐藏值或用户输入，不自动点击或提交。
- 处理动态节点时只匹配已知文案，翻译结果不能再次触发相同替换。跳过脚本、样式、输入区域及站点的数据区域。
- 未提供的页面、弹窗、Shadow DOM 或嵌入内容不猜测适配。选择器缺乏依据时补充样本。
- 导出工具适用于 HTTP/HTTPS，不代表翻译脚本也应申请所有网站权限。

## 验证

至少检查：固定文字确实翻译；产品名、配置和数据不变；链接、表单值、选中项及事件保留；动态插入后仍生效；重复执行不改变已翻译页面；其他域名和未知页面不受影响。

合成测试随仓库提交。本地脱敏样本可用于补充验证，但不要提交 HTML、账号信息或令牌。需要重新清理本地样本时运行 `npm run sanitize`。

DOM 测试不等于完整浏览器交互测试，实际站点还需确认排版、菜单、筛选和表单操作未受影响。

## Fork 后分发

将 `package.json` 的 `repository.url` 改为自己的 GitHub HTTPS 仓库地址，例如 `https://github.com/你的用户名/my_translate.git`。`npm run build` 会统一生成翻译脚本与导出器的主页和安装/更新地址，默认使用 `main` 分支；无需在站点源码或导出器中重复配置这些 URL。

同时将 README 中的安装链接指向自己的 Fork，再提交构建产物。这样更新仍来自自己的仓库，不会被上游覆盖。
