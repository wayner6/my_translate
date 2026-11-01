// 各站点共用的小工具；范围、词库和匹配规则仍由站点自己决定。
const siteKit = (() => {
    const normalize = text => text.replace(/\s+/g, ' ').trim();

    // 只替换首尾空白之间的文字，保留原有缩进和换行。
    function replaceText(node, translated) {
        translationState.text(node, node.data.replace(/\S(?:[\s\S]*\S)?/, () => translated));
    }

    // 合并同一批变动；范围外的节点只检查其中新出现的翻译区域，不逐个遍历文字。
    function observe(scope, translate, attributeFilter) {
        new MutationObserver(records => {
            const pending = new Set();
            for (const record of records) {
                if (record.type === 'childList') for (const node of record.addedNodes) pending.add(node);
                else pending.add(record.target);
            }
            for (const node of pending) {
                if (!node.isConnected) continue;
                const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
                if (!element) continue;
                if (element.closest(scope)) translate(node);
                else if (node === element) for (const root of element.querySelectorAll(scope)) translate(root);
            }
        }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter });
    }

    return { normalize, replaceText, observe };
})();
