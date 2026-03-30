// 内容脚本 - 用于获取当前页面信息
(function() {
  'use strict';

  // 监听来自扩展的消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_CURRENT_PAGE_INFO') {
      // 返回当前页面的信息
      sendResponse({
        title: document.title,
        url: window.location.href,
        favicon: getFavicon()
      });
    }
  });

  // 获取页面favicon的辅助函数
  function getFavicon() {
    let favicon = '';
    const nodeList = document.getElementsByTagName('link');
    for (let i = 0; i < nodeList.length; i++) {
      if (nodeList[i].getAttribute('rel') === 'icon' || nodeList[i].getAttribute('rel') === 'shortcut icon') {
        favicon = nodeList[i].getAttribute('href');
        break;
      }
    }
    
    // 如果相对路径，转换为绝对路径
    if (favicon && favicon.startsWith('/')) {
      favicon = window.location.origin + favicon;
    } else if (favicon && !favicon.startsWith('http')) {
      favicon = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + favicon;
    }
    
    return favicon || '';
  }
})();