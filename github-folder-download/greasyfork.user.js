// ==UserScript==
// @name         GitHub 文件夹下载器
// @namespace    https://github.com/anghunk/UserScript
// @version      1.0
// @description  点击按钮后跳转至 ztools.zishu.me 进行 GitHub 文件夹下载
// @author       anghunk
// @icon         https://www.google.com/s2/favicons?sz=96&domain_url=github.com
// @match        https://github.com/*
// @grant        none
// ==/UserScript==

(function () {
	'use strict';

	// 核心 UI 注入逻辑
	function addDownloadButton() {
		// 尝试插入到 overflow menu anchor 前面
		const anchorElement = document.querySelector('button[data-testid="tree-overflow-menu-anchor"]');
		if (anchorElement) {
			if (!document.getElementById('ztools-download-btn')) {
				const btn = document.createElement('a');
				btn.id = 'ztools-download-btn';
				btn.className = 'btn d-none d-md-block mr-2';
				btn.innerHTML = 'Download';
				btn.href = 'javascript:void(0);';
				btn.style.cssText = 'margin-right: 8px; margin-left: 8px;';

				btn.onclick = () => {
					const currentUrl = encodeURIComponent(window.location.href);
					window.open(`https://ztools.zishu.me/github-folder-download?url=${currentUrl}`, '_blank');
				};

				anchorElement.parentNode.insertBefore(btn, anchorElement);
				console.log('Download button added before tree-overflow-menu-anchor');
			}
			return;
		}
	}

	// 页面加载完成后初始化一次
	setTimeout(addDownloadButton, 1000);

	// 监听 DOM 变化以适配 SPA 路由切换
	const observer = new MutationObserver(() => {
		addDownloadButton();
	});
	observer.observe(document.body, { childList: true, subtree: true });
})();
