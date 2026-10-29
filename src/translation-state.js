// 只记录本脚本修改过的界面文案，不记录用户输入。
const translationState = (() => {
    const texts = new WeakMap();
    const attributes = new WeakMap();
    let depth = 0;
    let pending = [];

    function text(node, value) {
        if (depth || node.data === value) return;
        const previous = texts.get(node);
        texts.set(node, {
            original: previous && node.data === previous.translated ? previous.original : node.data,
            translated: value,
        });
        node.data = value;
    }

    function attribute(element, name, value) {
        if (depth || element.getAttribute(name) === value) return;
        let records = attributes.get(element);
        if (!records) { records = new Map(); attributes.set(element, records); }
        const previous = records.get(name);
        const current = element.getAttribute(name);
        records.set(name, {
            original: previous && current === previous.translated ? previous.original : current,
            translated: value,
        });
        element.setAttribute(name, value);
    }

    function setAttribute(element, name, value) {
        if (value === null) element.removeAttribute(name);
        else element.setAttribute(name, value);
    }

    document.addEventListener('my_translate:export-start', () => {
        if (depth++ > 0) return;
        pending = [];
        const root = document.body || document.documentElement;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const record = texts.get(node);
            if (record && node.data === record.translated) {
                pending.push({ node, record });
                node.data = record.original;
            }
        }
        for (const element of [root, ...root.querySelectorAll('*')]) {
            const records = attributes.get(element);
            if (!records) continue;
            for (const [name, record] of records) {
                if (element.getAttribute(name) !== record.translated) continue;
                pending.push({ node: element, name, record });
                setAttribute(element, name, record.original);
            }
        }
    });

    document.addEventListener('my_translate:export-end', () => {
        if (!depth || --depth > 0) return;
        for (const { node, name, record } of pending) {
            if (!node.isConnected) continue;
            if (name) {
                if (node.getAttribute(name) === record.original) setAttribute(node, name, record.translated);
            } else if (node.data === record.original) node.data = record.translated;
        }
        pending = [];
    });

    return { text, attribute };
})();
