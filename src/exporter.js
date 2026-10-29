// ==UserScript==
// @name         my_translate 一键脱敏导出
// @namespace    local.my-translate.export
// @version      0.2.1
// @description  导出当前已加载的 HTML 样本，清除已知个人资料、令牌、输入值和脚本；不自动点击或上传。
// @match        http://*/*
// @match        https://*/*
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @noframes
// ==/UserScript==

(() => {
    'use strict';
    const redacted = '[REDACTED]';
    const privateRegions = '[menuitemname="Client Details"] .panel-body, .div-service-name, [menuitemname="Client Contacts"] .list-group-item:not([menuitemname="No Contacts"]), .ticket-number, .ticket-subject, .recent-ticket .truncate, .service-renewal h3, .service-renewal h4, select[name="productid"] option, select[name="contactid"] option, select[name="billingcid"] option, #tableServicesList tbody td a:not(.btn)';
    const publicContactOption = element => element.matches('option') && element.closest('select[name="contactid"], select[name="billingcid"]') && ['Add New Contact', 'Use Default Contact (Details Above)'].includes(element.textContent.trim());
    const publicEmails = new Set(['sales@greencloudvps.com', 'noreply@netcup.com']);

    function collectSecrets(doc) {
        const values = new Set();
        const add = value => { if (value && value !== redacted && value.trim().length >= 3) values.add(value.trim()); };
        for (const el of doc.querySelectorAll('input')) {
            if (['text', 'email', 'password', 'tel'].includes(el.type) || /token|secret|csrf|session/i.test(el.name)) add(el.value);
        }
        for (const el of doc.querySelectorAll('.navbar-title strong')) add(el.textContent);
        for (const el of doc.querySelectorAll('.navbar-title small')) {
            const match = /\((\d+)\)/.exec(el.textContent);
            if (match) add(match[1]);
        }
        for (const el of doc.querySelectorAll('#Secondary_Navbar-Account > a, .header-lined h1')) {
            const match = /^(?:Hello,\s*|Welcome Back,\s*)(.+?)(?:!)?$/.exec(el.textContent.trim());
            if (match) add(match[1]);
        }
        for (const el of doc.querySelectorAll(privateRegions)) {
            if (publicContactOption(el)) continue;
            const walker = doc.createTreeWalker(el, 4);
            while (walker.nextNode()) add(walker.currentNode.data);
            for (const match of el.textContent.matchAll(/#\d{4,}/g)) add(match[0]);
        }
        for (const el of doc.querySelectorAll('#ticketsPanel .list-group-item')) {
            for (const node of el.childNodes) if (node.nodeType === 3) add(node.data);
        }
        for (const script of doc.querySelectorAll('script')) {
            for (const match of script.textContent.matchAll(/(?:sessionhash|nocsrftoken|csrfToken)\s*=\s*["']([^"']+)["']/g)) add(match[1]);
        }
        return [...values].sort((a, b) => b.length - a.length);
    }

    function sanitizeSnapshot(doc, pageUrl, extraSecrets = []) {
        // 在没有应用组件注册表的文档中复制，避免触发原站自定义元素的构造函数。
        const snapshot = doc.implementation.createHTMLDocument('');
        const root = snapshot.importNode(doc.documentElement, true);
        const secrets = [...new Set([...collectSecrets(doc), ...extraSecrets])].filter(v => v && v !== redacted).sort((a, b) => b.length - a.length);
        const scrub = text => {
            for (const secret of secrets) text = text.split(secret).join(redacted);
            return text
                .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, email => publicEmails.has(email.toLowerCase()) ? email : redacted)
                .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, redacted)
                .replace(/\b(?:[a-f0-9]{0,4}:){3,}[a-f0-9:]{0,39}\b/gi, redacted);
        };
        function safeUrl(raw) {
            if (!raw || raw === '#') return raw || '#';
            if (/^#[a-z][a-z0-9_-]*$/i.test(raw)) return scrub(raw);
            let url;
            try { url = new URL(raw, pageUrl); } catch { return '#redacted'; }
            if (!['http:', 'https:'].includes(url.protocol)) return '#redacted';
            url.username = '';
            url.password = '';
            // 保留静态 SPA 路由；含参数、编号或访问令牌的片段不保留。
            if (!/^#!?\/(?:[a-z_-]+\/?)*$/i.test(url.hash)) url.hash = '';
            for (const [key, value] of [...url.searchParams]) {
                if (!(['action', 'a', 'language'].includes(key) && /^[a-z_-]{1,40}$/i.test(value))) url.searchParams.set(key, redacted);
            }
            return scrub(url.href);
        }

        // 删除脚本、嵌入内容、样式资源和浏览器扩展注入物，避免令牌和追踪参数残留。
        for (const el of root.querySelectorAll('script, style, link, base, iframe, object, embed, template, noscript, svg, canvas, meta:not([charset]), doubao-ai-csui, [id^="doubao-"], [id^="kiss-"], #pv-float-bar-container')) el.remove();
        for (const el of root.querySelectorAll(privateRegions)) {
            if (publicContactOption(el)) continue;
            const walker = doc.createTreeWalker(el, 4);
            while (walker.nextNode()) if (walker.currentNode.data.trim()) walker.currentNode.data = redacted;
        }
        for (const el of root.querySelectorAll('#ticketsPanel .list-group-item')) {
            for (const node of el.childNodes) if (node.nodeType === 3 && node.data.trim()) node.data = redacted;
        }
        // 表格正文保留状态标签和操作图标，其余客户业务数据不需要用于汉化。
        for (const cell of root.querySelectorAll('tbody td')) {
            const walker = doc.createTreeWalker(cell, 4);
            while (walker.nextNode()) {
                const node = walker.currentNode;
                if (node.data.trim() && !node.parentElement.closest('.btn, button, .label, .status, .text-success, .text-danger, .text-warning, .textgreen, .textgrey, .dataTables_empty')) node.data = redacted;
            }
        }
        for (const input of root.querySelectorAll('input')) {
            if (!['button', 'submit', 'reset'].includes(input.type)) input.setAttribute('value', redacted);
            input.removeAttribute('checked');
        }
        for (const area of root.querySelectorAll('textarea')) area.textContent = redacted;
        for (const node of root.querySelectorAll('option[value]')) {
            // 选项的有无 value 需保留；具体提交值不参与样本分析。
            node.setAttribute('value', redacted);
        }
        const kept = /^(?:id|class|lang|dir|name|type|role|aria-[\w-]+|value|placeholder|title|alt|for|colspan|rowspan|selected|disabled|multiple|required|readonly|min|max|step|href|action|method|charset|menuitemname|data-(?:toggle|target|dismiss))$/i;
        for (const el of [root, ...root.querySelectorAll('*')]) {
            for (const attr of [...el.attributes]) {
                if (!kept.test(attr.name)) el.removeAttribute(attr.name);
                else if (['href', 'action'].includes(attr.name)) el.setAttribute(attr.name, safeUrl(attr.value));
                else el.setAttribute(attr.name, scrub(attr.value));
            }
            // 资源路径可能携带验证码/资源 ID；图片只保留结构和替代文字。
            if (el.matches('img, video, audio, source')) el.removeAttribute('src');
        }
        const walker = doc.createTreeWalker(root, 4 | 128);
        const comments = [];
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node.nodeType === 8) comments.push(node);
            else node.data = scrub(node.data);
        }
        for (const comment of comments) comment.remove();
        const head = root.querySelector('head');
        if (head) {
            head.querySelectorAll('meta').forEach(el => el.remove());
            const charset = doc.createElement('meta');
            charset.setAttribute('charset', 'utf-8');
            const csp = doc.createElement('meta');
            csp.setAttribute('http-equiv', 'Content-Security-Policy');
            csp.setAttribute('content', "default-src 'none'; base-uri 'none'; form-action 'none'");
            const origin = doc.createElement('meta');
            origin.setAttribute('name', 'snapshot-url');
            origin.setAttribute('content', safeUrl(pageUrl));
            head.prepend(charset, csp, origin);
        }
        return '<!doctype html>\n' + root.outerHTML;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { sanitizeSnapshot, collectSecrets };
        return;
    }
    if (!['http:', 'https:'].includes(location.protocol)) return;

    function download() {
        let html;
        try {
            document.dispatchEvent(new Event('my_translate:export-start'));
            html = sanitizeSnapshot(document, location.href);
        } finally {
            document.dispatchEvent(new Event('my_translate:export-end'));
        }
        const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        const route = location.pathname.replace(/[^a-z0-9_-]+/gi, '_').slice(0, 80);
        const params = new URLSearchParams(location.search);
        const action = params.get('action');
        const suffix = ['services', 'invoices', 'quotes', 'details', 'productdetails'].includes(action) ? `_${action}` : '';
        const moduleFilter = params.has('module') ? '_filtered' : '';
        link.download = `${location.hostname}${route}${suffix}${moduleFilter}-${Date.now()}.html`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
    GM_registerMenuCommand('导出当前页面（自动脱敏，分享前仍需检查）', download);
    document.addEventListener('keydown', event => {
        if (event.altKey && event.shiftKey && event.code === 'KeyE' && !event.repeat) {
            event.preventDefault();
            download();
        }
    });
})();
