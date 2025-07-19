// Chrome Extension Manifest V3 Service Worker

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // 仅在安装时打开说明页，更新时不打开
        chrome.tabs.create({
            url: chrome.runtime.getURL('readme.html'),
            active: true
        });
    }
});

// Service Worker 激活监听
self.addEventListener('activate', (event) => {
    console.log('Colorful QRCode service worker activated');
});
