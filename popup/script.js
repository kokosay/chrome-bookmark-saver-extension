// DOM元素引用
const refreshBookmarksBtn = document.getElementById('saveCurrentPage'); // 重用按钮ID，但功能改为刷新
const bookmarksContainer = document.getElementById('bookmarksContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const searchInput = document.getElementById('searchInput');

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * 初始化应用
 */
async function initializeApp() {
    // 更新按钮文本为"刷新书签"
    if (refreshBookmarksBtn) {
        refreshBookmarksBtn.textContent = '刷新书签';
        refreshBookmarksBtn.title = '刷新Chrome书签列表';
    }
    
    // 加载Chrome书签
    await loadBookmarks();

    // 绑定事件监听器
    bindEventListeners();
}

/**
 * 绑定事件监听器
 */
function bindEventListeners() {
    // 刷新书签按钮点击事件
    if (refreshBookmarksBtn) {
        refreshBookmarksBtn.addEventListener('click', handleRefreshBookmarks);
    }

    // 搜索输入框事件
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}
/**
 * 刷新Chrome书签列表
 */
async function handleRefreshBookmarks() {
    try {
        // 显示加载状态
        if (loadingSpinner) {
            loadingSpinner.classList.remove('hidden');
        }
        
        // 重新加载书签
        await loadBookmarks();
    }
    catch (error) {
        console.error('刷新书签失败:', error);
        
        // 隐藏加载状态
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
        }
    }
}
/**
 * 加载Chrome书签列表
 */
async function loadBookmarks() {
    try {
        // 显示加载状态
        if (loadingSpinner) {
            loadingSpinner.classList.remove('hidden');
        }

        // 从后台获取Chrome书签数据
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: 'GET_CHROME_BOOKMARKS' }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                else {
                    resolve(response);
                }
            });
        });

        // 隐藏加载状态
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
        }

        // 渲染书签列表
        renderBookmarks(response.bookmarks || []);
    }
    catch (error) {
        console.error('加载书签失败:', error);
        
        // 隐藏加载状态
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
        }
        
        // 显示错误状态
        bookmarksContainer.innerHTML = `
      <div class="empty-state">
        <p>加载书签时出现错误</p>
        <p class="error">${error instanceof Error ? error.message : '未知错误'}</p>
      </div>
    `;
    }
}
/**
 * 渲染书签列表
 * @param bookmarks 书签数组
 */
function renderBookmarks(bookmarks) {
    if (!bookmarksContainer)
        return;
    // 如果没有书签，显示空状态
    if (bookmarks.length === 0) {
        bookmarksContainer.innerHTML = `
      <div class="empty-state">
        <p>暂无Chrome书签</p>
        <p>请前往书签管理器添加书签</p>
      </div>
    `;
        return;
    }
    // 生成书签项HTML
    const bookmarksHTML = bookmarks.map(bookmark => `
    <div class="bookmark-item" data-id="${bookmark.id}">
      <a href="${bookmark.url}" target="_blank" class="bookmark-title" title="${bookmark.title}">${bookmark.title}</a>
      <div class="bookmark-url" title="${bookmark.url}">${formatUrl(bookmark.url)}</div>
      <div class="bookmark-meta">
        <span>${formatDate(bookmark.dateAdded)}</span>
      </div>
    </div>
  `).join('');
    // 设置容器内容
    bookmarksContainer.innerHTML = bookmarksHTML;
}
/**
 * 处理搜索事件
 */
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
        // 如果搜索词为空，重新加载所有书签
        loadBookmarks();
        return;
    }
    
    // 重新加载所有书签并进行客户端过滤
    chrome.runtime.sendMessage({ type: 'GET_CHROME_BOOKMARKS' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('获取书签失败:', chrome.runtime.lastError);
            return;
        }
        
        // 过滤书签
        const filteredBookmarks = (response.bookmarks || []).filter((bookmark) => 
            bookmark.title.toLowerCase().includes(searchTerm) ||
            bookmark.url.toLowerCase().includes(searchTerm)
        );
        
        // 渲染过滤后的书签
        renderBookmarks(filteredBookmarks);
    });
}
/**
 * 格式化URL显示
 * @param url URL字符串
 * @returns 格式化后的URL
 */
function formatUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname + urlObj.pathname;
    }
    catch {
        return url.length > 50 ? url.substring(0, 50) + '...' : url;
    }
}
/**
 * 格式化日期
 * @param dateStr 日期字符串
 * @returns 格式化后的日期
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
        return '今天';
    }
    else if (diffDays === 2) {
        return '昨天';
    }
    else if (diffDays <= 7) {
        return `${diffDays - 1}天前`;
    }
    else {
        return date.toLocaleDateString('zh-CN');
    }
}
//# sourceMappingURL=script.js.map