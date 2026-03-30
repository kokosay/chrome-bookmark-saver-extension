// 当扩展安装时触发
chrome.runtime.onInstalled.addListener(() => {
    console.log('Chrome收藏夹查看器扩展已安装');
});

// 接收来自弹窗的消息
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    switch (request.type) {
        case 'GET_CHROME_BOOKMARKS':
            getChromeBookmarks().then(bookmarks => {
                sendResponse({ bookmarks });
            }).catch(error => {
                console.error('获取Chrome书签失败:', error);
                sendResponse({ success: false, error: error.message });
            });
            // 异步响应需要返回true
            return true;
        default:
            sendResponse({ success: false, error: 'Unknown message type' });
            return false;
    }
});

/**
 * 获取Chrome书签
 * @returns 书签数组
 */
async function getChromeBookmarks() {
    try {
        // 获取所有书签
        const bookmarkTreeNodes = await chrome.bookmarks.getTree();
        
        // 递归提取书签URL
        const bookmarks = [];
        extractBookmarks(bookmarkTreeNodes, bookmarks);
        
        return bookmarks;
    } catch (error) {
        console.error('获取书签失败:', error);
        throw error;
    }
}

/**
 * 递归提取书签
 * @param nodes 书签节点
 * @param bookmarks 书签数组
 */
function extractBookmarks(nodes, bookmarks) {
    for (const node of nodes) {
        if (node.url) {
            // 这是一个书签
            bookmarks.push({
                id: node.id,
                title: node.title || '无标题',
                url: node.url,
                dateAdded: node.dateAdded ? new Date(node.dateAdded).toISOString() : new Date().toISOString(),
                parentId: node.parentId
            });
        }
        
        if (node.children) {
            // 递归处理子节点
            extractBookmarks(node.children, bookmarks);
        }
    }
}
//# sourceMappingURL=background.js.map