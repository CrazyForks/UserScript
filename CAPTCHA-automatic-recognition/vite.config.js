import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		monkey({
			entry: 'src/main.js',
			userscript: {
				icon: 'https://raw.githubusercontent.com/anghunk/UserScript/refs/heads/main/CAPTCHA-automatic-recognition/src/assets/logo.png',
				name: 'AI验证码自动识别填充',
				namespace: 'https://github.com/anghunk/UserScript',
				description: '自动识别网页上的验证码并填充到输入框中，点击识别图标触发识别。',
				version: pkg.version,
				match: ['*://*/*'], // 可以根据需要限制匹配的网站
				grant: ['GM_xmlhttpRequest', 'GM_addStyle', 'GM_setValue', 'GM_getValue', 'GM_registerMenuCommand'],
			},
			build: {
				externalGlobals: {
					// require 引入
					vue: cdn.unpkg('Vue', 'dist/vue.global.prod.js'),
				},
				minify: false, // 不混淆
			},
		}),
	],
});
