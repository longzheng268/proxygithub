// Cloudflare Worker for GitHub and Docker Hub Proxy
// Modular design: Each feature is independent for maximum reliability
// Supports both GitHub repository access and Docker registry mirroring

// ============================================
// Configuration Module
// ============================================
const CONFIG = {
	// Docker 配置
	docker: {
		hub_host: 'registry-1.docker.io',
		auth_url: 'https://auth.docker.io',
		workers_url: 'https://xxx/',
	},
	// 安全配置
	security: {
		blocked_user_agents: ['netcraft'],
	},
	// 功能开关
	features: {
		github_proxy: true,
		docker_proxy: true,
		show_homepage: true,
	}
};

// 动态变量（运行时修改）
let hub_host = CONFIG.docker.hub_host;
let workers_url = CONFIG.docker.workers_url;
let 屏蔽爬虫UA = [...CONFIG.security.blocked_user_agents];

// ============================================
// Docker Registry Routes Module
// ============================================
// 根据主机名选择对应的上游地址
function routeByHosts(host) {
	// 定义路由表
	const routes = {
		// 生产环境
		"quay": "quay.io",
		"gcr": "gcr.io",
		"k8s-gcr": "k8s.gcr.io",
		"k8s": "registry.k8s.io",
		"ghcr": "ghcr.io",
		"cloudsmith": "docker.cloudsmith.io",
		"nvcr": "nvcr.io",
		
		// 测试环境
		"test": "registry-1.docker.io",
	};

	if (host in routes) return [ routes[host], false ];
	else return [ hub_host, true ];
}

// ============================================
// Utility Functions Module
// ============================================
/** @type {RequestInit} */
const PREFLIGHT_INIT = {
	// 预检请求配置
	headers: new Headers({
		'access-control-allow-origin': '*', // 允许所有来源
		'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS', // 允许的HTTP方法
		'access-control-max-age': '1728000', // 预检请求的缓存时间
	}),
}

/**
 * 构造响应
 * @param {any} body 响应体
 * @param {number} status 响应状态码
 * @param {Object<string, string>} headers 响应头
 */
function makeRes(body, status = 200, headers = {}) {
	headers['access-control-allow-origin'] = '*' // 允许所有来源
	return new Response(body, { status, headers }) // 返回新构造的响应
}

/**
 * 构造新的URL对象
 * @param {string} urlStr URL字符串
 */
function newUrl(urlStr) {
	try {
		return new URL(urlStr) // 尝试构造新的URL对象
	} catch (err) {
		return null // 构造失败返回null
	}
}

function isUUID(uuid) {
	// 定义一个正则表达式来匹配 UUID 格式
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	
	// 使用正则表达式测试 UUID 字符串
	return uuidRegex.test(uuid);
}

// ============================================
// UI/HTML Rendering Module
// ============================================
async function nginx() {
	const text = `
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>
	
	<p>For online documentation and support please refer to
	<a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="http://nginx.com/">nginx.com</a>.</p>
	
	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>
	`
	return text;
}

async function renderHomePage() {
	const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>GitHub & Docker Hub 加速代理</title>
	<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23181717'%3E%3Cpath d='M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z'/%3E%3C/svg%3E">
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			font-family: 'Courier New', 'Consolas', monospace;
			background: #0a0e27;
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20px;
			position: relative;
			overflow-x: hidden;
		}

		/* 赛博朋克网格背景 */
		body::before {
			content: '';
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: 
				linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px),
				linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px);
			background-size: 50px 50px;
			animation: grid-move 20s linear infinite;
			z-index: 0;
		}

		@keyframes grid-move {
			0% { transform: translateY(0); }
			100% { transform: translateY(50px); }
		}

		/* 扫描线效果 */
		body::after {
			content: '';
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: linear-gradient(
				transparent 0%,
				rgba(0, 255, 255, 0.05) 50%,
				transparent 100%
			);
			background-size: 100% 4px;
			animation: scan 8s linear infinite;
			pointer-events: none;
			z-index: 999;
		}

		@keyframes scan {
			0% { transform: translateY(-100%); }
			100% { transform: translateY(100vh); }
		}

		/* 鼠标追踪光效 - 霓虹风格 */
		#cursor-glow {
			position: fixed;
			width: 600px;
			height: 600px;
			border-radius: 50%;
			background: radial-gradient(
				circle,
				rgba(0, 255, 255, 0.3) 0%,
				rgba(255, 0, 255, 0.2) 30%,
				rgba(0, 255, 255, 0.1) 50%,
				transparent 70%
			);
			pointer-events: none;
			transform: translate(-50%, -50%);
			z-index: 1;
			transition: opacity 0.3s ease;
			opacity: 0;
			filter: blur(40px);
			mix-blend-mode: screen;
		}

		body:hover #cursor-glow {
			opacity: 1;
		}

		/* 霓虹波纹效果 */
		.ripple {
			position: absolute;
			border-radius: 50%;
			border: 2px solid rgba(0, 255, 255, 0.8);
			background: transparent;
			box-shadow: 0 0 20px rgba(0, 255, 255, 0.6), inset 0 0 20px rgba(0, 255, 255, 0.3);
			transform: scale(0);
			animation: neon-ripple-animation 1s ease-out;
			pointer-events: none;
		}

		@keyframes neon-ripple-animation {
			to {
				transform: scale(6);
				opacity: 0;
				border-width: 0;
			}
		}

		/* 科技粒子效果 */
		.particle {
			position: fixed;
			width: 3px;
			height: 3px;
			background: rgba(0, 255, 255, 0.8);
			border-radius: 50%;
			pointer-events: none;
			z-index: 0;
			animation: float 4s ease-in-out infinite;
			box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
		}

		@keyframes float {
			0%, 100% { 
				transform: translateY(0) translateX(0) scale(1);
				opacity: 0.8;
			}
			50% { 
				transform: translateY(-30px) translateX(15px) scale(1.5);
				opacity: 1;
			}
		}

		/* 主容器 - 赛博朋克风格 */
		.container {
			background: rgba(10, 14, 39, 0.85);
			border-radius: 0;
			border: 2px solid rgba(0, 255, 255, 0.3);
			box-shadow: 
				0 0 40px rgba(0, 255, 255, 0.3),
				0 0 80px rgba(255, 0, 255, 0.2),
				inset 0 0 60px rgba(0, 255, 255, 0.05);
			max-width: 900px;
			width: 100%;
			padding: 40px;
			backdrop-filter: blur(20px);
			position: relative;
			z-index: 2;
			animation: container-glitch 0.8s ease-out;
			clip-path: polygon(
				0 0, 
				calc(100% - 20px) 0, 
				100% 20px, 
				100% 100%, 
				20px 100%, 
				0 calc(100% - 20px)
			);
		}

		/* 容器边角装饰 */
		.container::before,
		.container::after {
			content: '';
			position: absolute;
			width: 30px;
			height: 30px;
			border: 2px solid rgba(0, 255, 255, 0.8);
			animation: corner-pulse 2s ease-in-out infinite;
		}

		.container::before {
			top: -2px;
			left: -2px;
			border-right: none;
			border-bottom: none;
			box-shadow: -5px -5px 20px rgba(0, 255, 255, 0.5);
		}

		.container::after {
			bottom: -2px;
			right: -2px;
			border-left: none;
			border-top: none;
			box-shadow: 5px 5px 20px rgba(255, 0, 255, 0.5);
		}

		@keyframes corner-pulse {
			0%, 100% { opacity: 1; }
			50% { opacity: 0.5; }
		}

		@keyframes container-glitch {
			0% {
				opacity: 0;
				transform: translateX(-20px) skew(-5deg);
				filter: hue-rotate(90deg);
			}
			20% {
				transform: translateX(10px) skew(5deg);
			}
			40% {
				transform: translateX(-5px) skew(-2deg);
			}
			60% {
				transform: translateX(3px) skew(1deg);
			}
			80% {
				filter: hue-rotate(0deg);
			}
			100% {
				opacity: 1;
				transform: translateX(0) skew(0);
				filter: hue-rotate(0deg);
			}
		}

		h1 {
			text-align: center;
			color: #00ffff;
			margin-bottom: 10px;
			font-size: 2.5em;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 4px;
			animation: title-glitch 0.8s ease-out, neon-glow 2s ease-in-out infinite;
			text-shadow: 
				0 0 10px rgba(0, 255, 255, 0.8),
				0 0 20px rgba(0, 255, 255, 0.6),
				0 0 30px rgba(0, 255, 255, 0.4),
				0 0 40px rgba(0, 255, 255, 0.2);
		}

		@keyframes title-glitch {
			0% {
				transform: scale(0.8) skewX(-10deg);
				opacity: 0;
				filter: hue-rotate(90deg);
			}
			20% {
				transform: scale(1.05) skewX(5deg);
				opacity: 0.8;
			}
			40% {
				transform: scale(0.95) skewX(-3deg);
			}
			60% {
				transform: scale(1.02) skewX(2deg);
			}
			100% {
				transform: scale(1) skewX(0);
				opacity: 1;
				filter: hue-rotate(0deg);
			}
		}

		@keyframes neon-glow {
			0%, 100% {
				text-shadow: 
					0 0 10px rgba(0, 255, 255, 0.8),
					0 0 20px rgba(0, 255, 255, 0.6),
					0 0 30px rgba(0, 255, 255, 0.4),
					0 0 40px rgba(0, 255, 255, 0.2);
			}
			50% {
				text-shadow: 
					0 0 20px rgba(0, 255, 255, 1),
					0 0 30px rgba(0, 255, 255, 0.8),
					0 0 40px rgba(0, 255, 255, 0.6),
					0 0 50px rgba(0, 255, 255, 0.4),
					0 0 60px rgba(255, 0, 255, 0.4);
			}
		}

		.subtitle {
			text-align: center;
			color: #ff00ff;
			margin-bottom: 40px;
			font-size: 1.1em;
			text-transform: uppercase;
			letter-spacing: 3px;
			font-weight: 600;
			animation: subtitle-flicker 3s ease-in-out infinite;
			text-shadow: 0 0 10px rgba(255, 0, 255, 0.8);
		}

		@keyframes subtitle-flicker {
			0%, 100% { opacity: 1; }
			50% { opacity: 0.8; }
			75% { opacity: 0.9; }
		}

		.tabs {
			display: flex;
			gap: 10px;
			margin-bottom: 30px;
			border-bottom: 2px solid rgba(0, 255, 255, 0.3);
			position: relative;
		}

		.tabs::after {
			content: '';
			position: absolute;
			bottom: -2px;
			left: 0;
			height: 2px;
			width: 50%;
			background: linear-gradient(90deg, rgba(0, 255, 255, 0.8), rgba(255, 0, 255, 0.8));
			transition: all 0.3s ease;
			box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
		}

		.tab {
			padding: 12px 24px;
			background: transparent;
			border: 2px solid rgba(0, 255, 255, 0.3);
			color: #00ffff;
			font-size: 16px;
			cursor: pointer;
			position: relative;
			transition: all 0.3s ease;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 2px;
			clip-path: polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
		}

		.tab::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 255, 255, 0.1);
			opacity: 0;
			transition: opacity 0.3s ease;
		}

		.tab:hover {
			color: #ffffff;
			border-color: rgba(0, 255, 255, 0.8);
			text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
			transform: translateY(-2px);
			box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
		}

		.tab:hover::before {
			opacity: 1;
		}

		.tab.active {
			color: #ffffff;
			background: rgba(0, 255, 255, 0.2);
			border-color: rgba(0, 255, 255, 0.8);
			text-shadow: 0 0 10px rgba(0, 255, 255, 1);
			box-shadow: 
				0 0 20px rgba(0, 255, 255, 0.5),
				inset 0 0 20px rgba(0, 255, 255, 0.2);
		}

		.tab-content {
			display: none;
		}

		.tab-content.active {
			display: block;
			animation: fadeIn 0.3s ease;
		}

		@keyframes fadeIn {
			from { opacity: 0; transform: translateY(10px); }
			to { opacity: 1; transform: translateY(0); }
		}

		.usage-section {
			background: rgba(0, 20, 40, 0.6);
			padding: 25px;
			border: 1px solid rgba(0, 255, 255, 0.3);
			border-radius: 0;
			margin-bottom: 20px;
			box-shadow: inset 0 0 30px rgba(0, 255, 255, 0.1);
			clip-path: polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%);
		}

		.usage-section h3 {
			color: #00ffff;
			margin-bottom: 15px;
			font-size: 1.3em;
			display: flex;
			align-items: center;
			gap: 10px;
			text-transform: uppercase;
			letter-spacing: 2px;
			font-weight: 700;
			text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
		}

		.usage-section h3::before {
			content: '▶';
			color: #ff00ff;
			animation: blink 1.5s ease-in-out infinite;
		}

		@keyframes blink {
			0%, 100% { opacity: 1; }
			50% { opacity: 0.3; }
		}

		.code-block {
			background: rgba(0, 0, 0, 0.8);
			color: #00ff00;
			padding: 15px;
			border: 1px solid rgba(0, 255, 0, 0.3);
			border-left: 3px solid rgba(0, 255, 255, 0.8);
			margin: 10px 0;
			overflow-x: auto;
			font-family: 'Courier New', 'Consolas', monospace;
			font-size: 14px;
			line-height: 1.6;
			position: relative;
			box-shadow: 
				0 0 20px rgba(0, 255, 0, 0.2),
				inset 0 0 20px rgba(0, 255, 255, 0.05);
		}

		.code-block::before {
			content: '>';
			position: absolute;
			left: 5px;
			color: #ff00ff;
			animation: cursor-blink 1s step-end infinite;
		}

		@keyframes cursor-blink {
			50% { opacity: 0; }
		}

		.code-block code {
			color: #00ff00;
			text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
		}

		.example {
			margin: 15px 0;
		}

		.example-label {
			color: #ff00ff;
			font-weight: 600;
			margin-bottom: 8px;
			display: flex;
			align-items: center;
			gap: 8px;
		}

		.example-label::before {
			content: '▸';
			font-size: 1.2em;
		}

		.feature-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 20px;
			margin-top: 20px;
		}

		.feature-card {
			background: rgba(0, 20, 40, 0.8);
			padding: 20px;
			border: 2px solid rgba(0, 255, 255, 0.3);
			box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
			transition: transform 0.3s ease, box-shadow 0.3s ease;
			cursor: pointer;
			position: relative;
			overflow: hidden;
			clip-path: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px);
		}

		.feature-card::before {
			content: '';
			position: absolute;
			top: -50%;
			left: -50%;
			width: 200%;
			height: 200%;
			background: linear-gradient(
				45deg,
				transparent,
				rgba(0, 255, 255, 0.1),
				transparent
			);
			transform: rotate(45deg);
			transition: all 0.6s ease;
		}

		.feature-card:hover::before {
			transform: rotate(45deg) translate(50%, 50%);
		}

		.feature-card:hover {
			transform: translateY(-5px) scale(1.02) rotateZ(1deg);
			box-shadow: 
				0 0 30px rgba(0, 255, 255, 0.4),
				0 0 60px rgba(255, 0, 255, 0.2);
			border-color: rgba(0, 255, 255, 0.8);
		}

		.feature-card:active {
			transform: translateY(-3px) scale(0.98);
		}

		.feature-card h4 {
			color: #00ffff;
			margin-bottom: 10px;
			font-size: 1.1em;
			text-transform: uppercase;
			letter-spacing: 2px;
			font-weight: 700;
			text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
		}

		.feature-card p {
			color: #a0a0ff;
			line-height: 1.6;
			font-size: 0.95em;
		}

		.search-container {
			display: flex;
			gap: 10px;
			margin: 30px 0;
		}

		.search-input {
			flex: 1;
			padding: 15px 20px;
			background: rgba(0, 0, 0, 0.5);
			border: 2px solid rgba(0, 255, 255, 0.3);
			color: #00ffff;
			font-size: 16px;
			font-family: 'Courier New', monospace;
			transition: all 0.3s ease;
			box-shadow: inset 0 0 20px rgba(0, 255, 255, 0.1);
		}

		.search-input::placeholder {
			color: rgba(0, 255, 255, 0.5);
		}

		.search-input:focus {
			outline: none;
			border-color: rgba(0, 255, 255, 0.8);
			box-shadow: 
				0 0 20px rgba(0, 255, 255, 0.3),
				inset 0 0 20px rgba(0, 255, 255, 0.2);
			text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
		}

		.search-button {
			padding: 15px 30px;
			background: linear-gradient(135deg, rgba(0, 255, 255, 0.3) 0%, rgba(255, 0, 255, 0.3) 100%);
			color: #00ffff;
			border: 2px solid rgba(0, 255, 255, 0.5);
			font-size: 16px;
			font-weight: 700;
			cursor: pointer;
			transition: all 0.3s ease;
			position: relative;
			overflow: hidden;
			text-transform: uppercase;
			letter-spacing: 2px;
			clip-path: polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
			box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
		}

		.search-button::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: 0;
			height: 0;
			border-radius: 50%;
			background: rgba(0, 255, 255, 0.5);
			transform: translate(-50%, -50%);
			transition: width 0.6s ease, height 0.6s ease;
		}

		.search-button:hover::before {
			width: 400px;
			height: 400px;
		}

		.search-button:hover {
			transform: translateY(-3px) scale(1.05);
			box-shadow: 
				0 0 30px rgba(0, 255, 255, 0.6),
				0 0 60px rgba(255, 0, 255, 0.3);
			border-color: rgba(0, 255, 255, 1);
			text-shadow: 0 0 10px rgba(0, 255, 255, 1);
		}

		.search-button:active {
			transform: translateY(0) scale(0.95);
		}

		.search-button span {
			position: relative;
			z-index: 1;
		}

		.footer {
			text-align: center;
			margin-top: 40px;
			padding-top: 20px;
			border-top: 1px solid rgba(0, 255, 255, 0.3);
			color: #00ffff;
			font-size: 0.9em;
			text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
		}

		.footer a {
			color: #ff00ff;
			text-decoration: none;
			text-shadow: 0 0 5px rgba(255, 0, 255, 0.5);
			transition: all 0.3s ease;
		}

		.footer a:hover {
			color: #00ffff;
			text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
		}

		.quick-nav {
			display: flex;
			gap: 10px;
			margin-bottom: 20px;
			flex-wrap: wrap;
		}

		.quick-nav-button {
			padding: 10px 20px;
			background: rgba(0, 255, 255, 0.1);
			color: #00ffff;
			border: 2px solid rgba(0, 255, 255, 0.5);
			font-size: 14px;
			font-weight: 700;
			cursor: pointer;
			transition: all 0.3s ease;
			text-decoration: none;
			display: inline-flex;
			align-items: center;
			gap: 8px;
			text-transform: uppercase;
			letter-spacing: 1px;
			clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
			box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
		}

		.quick-nav-button:hover {
			background: rgba(0, 255, 255, 0.3);
			color: #ffffff;
			transform: translateY(-2px) scale(1.05);
			box-shadow: 
				0 0 25px rgba(0, 255, 255, 0.5),
				0 0 50px rgba(255, 0, 255, 0.3);
			border-color: rgba(0, 255, 255, 1);
			text-shadow: 0 0 10px rgba(0, 255, 255, 1);
		}

		.quick-nav-button:active {
			transform: translateY(0) scale(0.98);
		}

		.quick-nav-button svg {
			width: 18px;
			height: 18px;
			filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.8));
		}

		.command-options {
			display: flex;
			gap: 10px;
			margin-bottom: 20px;
			flex-wrap: wrap;
		}

		.command-option {
			padding: 10px 20px;
			background: rgba(0, 255, 255, 0.1);
			color: #00ffff;
			border: 2px solid rgba(0, 255, 255, 0.3);
			font-size: 14px;
			font-weight: 600;
			cursor: pointer;
			transition: all 0.3s ease;
			text-transform: uppercase;
			letter-spacing: 1px;
			clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
			box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
		}

		.command-option:hover {
			background: rgba(0, 255, 255, 0.3);
			color: #ffffff;
			transform: translateY(-2px) scale(1.05);
			box-shadow: 
				0 0 25px rgba(0, 255, 255, 0.5),
				0 0 50px rgba(255, 0, 255, 0.3);
			border-color: rgba(0, 255, 255, 1);
			text-shadow: 0 0 10px rgba(0, 255, 255, 1);
		}

		.command-option.active {
			background: rgba(0, 255, 255, 0.3);
			color: #ffffff;
			border-color: rgba(0, 255, 255, 0.8);
			text-shadow: 0 0 10px rgba(0, 255, 255, 1);
			box-shadow: 
				0 0 20px rgba(0, 255, 255, 0.5),
				inset 0 0 20px rgba(0, 255, 255, 0.2);
		}

		.command-output {
			background: rgba(0, 0, 0, 0.8);
			color: #00ff00;
			padding: 15px;
			border: 1px solid rgba(0, 255, 0, 0.3);
			border-left: 3px solid rgba(0, 255, 255, 0.8);
			margin: 20px 0;
			font-family: 'Courier New', 'Consolas', monospace;
			font-size: 14px;
			line-height: 1.6;
			position: relative;
			box-shadow: 
				0 0 20px rgba(0, 255, 0, 0.2),
				inset 0 0 20px rgba(0, 255, 255, 0.05);
			display: none;
			word-wrap: break-word;
			white-space: pre-wrap;
		}

		.command-output.show {
			display: block;
			animation: fadeIn 0.3s ease;
		}

		.command-output code {
			color: #00ff00;
			text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
		}

		.copy-button {
			background: rgba(255, 0, 255, 0.2);
			border: 1px solid rgba(255, 0, 255, 0.5);
			color: #ff00ff;
			padding: 5px 15px;
			margin-top: 10px;
			cursor: pointer;
			font-size: 12px;
			text-transform: uppercase;
			letter-spacing: 1px;
			transition: all 0.3s ease;
			clip-path: polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%);
		}

		.copy-button:hover {
			background: rgba(255, 0, 255, 0.4);
			color: #ffffff;
			text-shadow: 0 0 10px rgba(255, 0, 255, 1);
			border-color: rgba(255, 0, 255, 1);
			box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
		}
		}

		@media (max-width: 768px) {
			.container {
				padding: 20px;
			}

			h1 {
				font-size: 1.8em;
			}

			.tabs {
				overflow-x: auto;
				-webkit-overflow-scrolling: touch;
			}

			.feature-grid {
				grid-template-columns: 1fr;
			}

			.search-container {
				flex-direction: column;
			}
		}
	</style>
</head>
<body>
	<!-- 鼠标追踪光效 -->
	<div id="cursor-glow"></div>
	
	<div class="container">
		<h1>🚀 GitHub & Docker Hub 加速代理</h1>
		<p class="subtitle">快速、稳定、免费的代理服务</p>

		<div class="tabs">
			<button class="tab active" onclick="switchTab('github')">GitHub 代理</button>
			<button class="tab" onclick="switchTab('docker')">Docker 代理</button>
		</div>

		<div id="github-content" class="tab-content active">
			<div class="quick-nav">
				<a href="javascript:void(0)" class="quick-nav-button" onclick="openGitHubProxy('https://github.com')">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
					</svg>
					GitHub 首页
				</a>
				<a href="javascript:void(0)" class="quick-nav-button" onclick="openGitHubProxy('https://github.com/trending')">
					🔥 热门项目
				</a>
				<a href="javascript:void(0)" class="quick-nav-button" onclick="openGitHubProxy('https://github.com/explore')">
					🧭 探索
				</a>
			</div>

			<div class="search-container">
				<input type="text" class="search-input" id="github-url" placeholder="输入 GitHub 仓库地址，例如：https://github.com/owner/repo">
			</div>

			<div class="command-options">
				<button class="command-option active" onclick="selectCommandType('url')">📋 代理链接</button>
				<button class="command-option" onclick="selectCommandType('clone')">📦 Git Clone</button>
				<button class="command-option" onclick="selectCommandType('wget')">⬇️ Wget</button>
				<button class="command-option" onclick="selectCommandType('curl')">🔄 Curl</button>
			</div>

			<div class="search-container">
				<button class="search-button" onclick="generateCommand()" style="width: 100%;"><span>✨ 生成命令</span></button>
			</div>

			<div id="command-output" class="command-output">
				<code id="command-text"></code>
				<div>
					<button class="copy-button" onclick="copyCommand()">📋 复制到剪贴板</button>
				</div>
			</div>

			<div class="usage-section">
				<h3>GitHub 使用说明</h3>
				
				<div class="example">
					<div class="example-label">Git Clone 仓库</div>
					<div class="code-block"><code>git clone https://你的域名/https://github.com/OWNER/REPO.git</code></div>
				</div>

				<div class="example">
					<div class="example-label">浏览仓库</div>
					<div class="code-block"><code>https://你的域名/https://github.com/OWNER/REPO</code></div>
				</div>

				<div class="example">
					<div class="example-label">下载文件 (Wget)</div>
					<div class="code-block"><code>wget https://你的域名/https://github.com/OWNER/REPO/archive/refs/heads/main.zip</code></div>
				</div>

				<div class="example">
					<div class="example-label">获取 Raw 文件 (Curl)</div>
					<div class="code-block"><code>curl -L https://你的域名/https://raw.githubusercontent.com/OWNER/REPO/BRANCH/path/to/file</code></div>
				</div>
			</div>

			<div class="feature-grid">
				<div class="feature-card">
					<h4>🌍 全球加速</h4>
					<p>利用 Cloudflare 全球 CDN 网络，为您提供最快的访问速度</p>
				</div>
				<div class="feature-card">
					<h4>🔒 安全可靠</h4>
					<p>所有请求通过 HTTPS 加密传输，保护您的数据安全</p>
				</div>
				<div class="feature-card">
					<h4>💰 完全免费</h4>
					<p>基于 Cloudflare Workers，无需任何费用即可使用</p>
				</div>
			</div>
		</div>

		<div id="docker-content" class="tab-content">
			<div class="search-container">
				<input type="text" class="search-input" id="docker-query" placeholder="搜索 Docker 镜像...">
				<button class="search-button" onclick="searchDocker()"><span>🔍 搜索镜像</span></button>
			</div>

			<div class="usage-section">
				<h3>Docker Hub 使用说明</h3>
				
				<div class="example">
					<div class="example-label">配置 Docker 镜像加速</div>
					<div class="code-block"><code>{
  "registry-mirrors": ["https://你的域名"]
}</code></div>
					<p style="margin-top: 10px; color: #666; font-size: 0.9em;">
						将以上内容添加到 <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">/etc/docker/daemon.json</code> 文件中
					</p>
				</div>

				<div class="example">
					<div class="example-label">拉取镜像示例</div>
					<div class="code-block"><code>docker pull 你的域名/library/nginx:latest</code></div>
				</div>

				<div class="example">
					<div class="example-label">支持的镜像仓库</div>
					<div class="code-block"><code># Docker Hub (默认)
docker pull 你的域名/library/nginx

# Google Container Registry
docker pull gcr.你的域名/PROJECT/IMAGE

# GitHub Container Registry
docker pull ghcr.你的域名/OWNER/IMAGE

# Quay.io
docker pull quay.你的域名/REPO/IMAGE

# Kubernetes Registry
docker pull k8s.你的域名/IMAGE</code></div>
				</div>
			</div>

			<div class="feature-grid">
				<div class="feature-card">
					<h4>⚡ 高速下载</h4>
					<p>通过国内优化节点，显著提升 Docker 镜像下载速度</p>
				</div>
				<div class="feature-card">
					<h4>🔄 多源支持</h4>
					<p>支持 Docker Hub、GCR、GHCR 等多个镜像仓库</p>
				</div>
				<div class="feature-card">
					<h4>🛡️ 稳定可靠</h4>
					<p>7x24 小时稳定运行，无需担心服务中断</p>
				</div>
			</div>
		</div>

		<div class="footer">
			<p>由 <a href="https://www.cloudflare.com" target="_blank">Cloudflare Workers</a> 强力驱动</p>
			<p style="margin-top: 5px;">开源项目 | <a href="https://github.com/longzheng268/proxygithub" target="_blank">GitHub</a></p>
		</div>
	</div>

	<script>
		let currentCommandType = 'url';

		function switchTab(tab) {
			// 更新标签页样式
			document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
			event.target.classList.add('active');

			// 显示对应内容
			document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
			document.getElementById(tab + '-content').classList.add('active');
		}

		function openGitHubProxy(githubUrl) {
			const currentDomain = window.location.origin;
			const proxyUrl = currentDomain + '/' + githubUrl;
			window.location.href = proxyUrl;
		}

		function selectCommandType(type) {
			currentCommandType = type;
			// 更新按钮样式
			document.querySelectorAll('.command-option').forEach(btn => btn.classList.remove('active'));
			event.target.classList.add('active');
			// 隐藏输出
			document.getElementById('command-output').classList.remove('show');
		}

		function generateCommand() {
			const input = document.getElementById('github-url').value.trim();
			if (!input) {
				alert('请输入 GitHub 地址');
				return;
			}

			const currentDomain = window.location.origin;
			let githubUrl = '';

			// 处理输入 - 提取 GitHub URL
			if (input.startsWith('http://') || input.startsWith('https://')) {
				githubUrl = input;
			} else {
				githubUrl = 'https://github.com/' + input;
			}

			// 生成代理 URL
			const proxyUrl = currentDomain + '/' + githubUrl;
			
			let command = '';
			let commandText = '';

			switch(currentCommandType) {
				case 'url':
					command = proxyUrl;
					commandText = '代理链接：\\n' + command;
					break;
				case 'clone':
					command = 'git clone ' + proxyUrl + '.git';
					commandText = 'Git Clone 命令：\\n' + command;
					break;
				case 'wget':
					// 对于 wget，如果是仓库地址，下载 archive
					let wgetUrl = proxyUrl;
					if (githubUrl.match(/^https:\\/\\/github\\.com\\/[^\\/]+\\/[^\\/]+\\/?$/)) {
						wgetUrl = proxyUrl + '/archive/refs/heads/main.zip';
					}
					command = 'wget ' + wgetUrl;
					commandText = 'Wget 命令：\\n' + command;
					break;
				case 'curl':
					command = 'curl -L ' + proxyUrl;
					commandText = 'Curl 命令：\\n' + command;
					break;
			}

			// 显示命令
			document.getElementById('command-text').textContent = commandText;
			document.getElementById('command-output').classList.add('show');

			// 自动复制到剪贴板
			copyToClipboard(command);
		}

		function copyCommand() {
			const commandElement = document.getElementById('command-text');
			const lines = commandElement.textContent.split('\\n');
			const command = lines.length > 1 ? lines.slice(1).join('\\n') : commandElement.textContent;
			copyToClipboard(command);
		}

		function copyToClipboard(text) {
			navigator.clipboard.writeText(text).then(() => {
				// 显示成功提示
				const btn = event.target;
				const originalText = btn.textContent;
				btn.textContent = '✓ 已复制';
				setTimeout(() => {
					btn.textContent = originalText;
				}, 2000);
			}).catch(() => {
				alert('复制失败，请手动复制');
			});
		}

		function proxyGithub() {
			// 保持向后兼容
			generateCommand();
		}

		function searchDocker() {
			const query = document.getElementById('docker-query').value.trim();
			if (query) {
				window.location.href = '/search?q=' + encodeURIComponent(query);
			} else {
				alert('请输入搜索关键词');
			}
		}

		// 回车键支持
		document.getElementById('github-url')?.addEventListener('keypress', function(e) {
			if (e.key === 'Enter') proxyGithub();
		});

		document.getElementById('docker-query')?.addEventListener('keypress', function(e) {
			if (e.key === 'Enter') searchDocker();
		});

		// ==========================================
		// 鼠标追踪光效
		// ==========================================
		const cursorGlow = document.getElementById('cursor-glow');
		let mouseX = 0, mouseY = 0;
		let glowX = 0, glowY = 0;

		document.addEventListener('mousemove', function(e) {
			mouseX = e.clientX;
			mouseY = e.clientY;
		});

		// 平滑追踪动画
		function animateGlow() {
			glowX += (mouseX - glowX) * 0.1;
			glowY += (mouseY - glowY) * 0.1;
			
			if (cursorGlow) {
				cursorGlow.style.left = glowX + 'px';
				cursorGlow.style.top = glowY + 'px';
			}
			
			requestAnimationFrame(animateGlow);
		}
		animateGlow();

		// ==========================================
		// 点击波纹效果
		// ==========================================
		document.addEventListener('click', function(e) {
			const ripple = document.createElement('div');
			ripple.className = 'ripple';
			ripple.style.left = e.clientX + 'px';
			ripple.style.top = e.clientY + 'px';
			ripple.style.width = '20px';
			ripple.style.height = '20px';
			
			document.body.appendChild(ripple);
			
			setTimeout(() => {
				ripple.remove();
			}, 600);
		});

		// ==========================================
		// 生成背景粒子
		// ==========================================
		function createParticles() {
			const particleCount = 15;
			for (let i = 0; i < particleCount; i++) {
				const particle = document.createElement('div');
				particle.className = 'particle';
				particle.style.left = Math.random() * 100 + '%';
				particle.style.top = Math.random() * 100 + '%';
				particle.style.animationDelay = Math.random() * 3 + 's';
				particle.style.animationDuration = (3 + Math.random() * 2) + 's';
				document.body.appendChild(particle);
			}
		}
		createParticles();

		// ==========================================
		// 卡片悬浮动画增强
		// ==========================================
		document.querySelectorAll('.feature-card').forEach(card => {
			card.addEventListener('mouseenter', function() {
				this.style.transform = 'translateY(-5px) scale(1.02) rotateZ(' + (Math.random() * 2 - 1) + 'deg)';
			});
			
			card.addEventListener('mouseleave', function() {
				this.style.transform = '';
			});
		});
	</script>
</body>
</html>
	`;
	return html;
}

async function searchInterface() {
	const text = `
	<!DOCTYPE html>
	<html>
	<head>
		<title>Docker Hub Search</title>
		<style>
		body {
			font-family: Arial, sans-serif;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			height: 100vh;
			margin: 0;
			background: linear-gradient(to right, rgb(28, 143, 237), rgb(29, 99, 237));
		}
		.logo {
			margin-bottom: 20px;
		}
		.search-container {
			display: flex;
			align-items: center;
		}
		#search-input {
			padding: 10px;
			font-size: 16px;
			border: 1px solid #ddd;
			border-radius: 4px;
			width: 300px;
			margin-right: 10px;
		}
		#search-button {
			padding: 10px;
			background-color: rgba(255, 255, 255, 0.2); /* 设置白色，透明度为10% */
			border: none;
			border-radius: 4px;
			cursor: pointer;
			width: 44px;
			height: 44px;
			display: flex;
			align-items: center;
			justify-content: center;
		}			
		#search-button svg {
			width: 24px;
			height: 24px;
		}
		</style>
	</head>
	<body>
		<div class="logo">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 18" fill="#ffffff" width="100" height="75">
			<path d="M23.763 6.886c-.065-.053-.673-.512-1.954-.512-.32 0-.659.03-1.01.087-.248-1.703-1.651-2.533-1.716-2.57l-.345-.2-.227.328a4.596 4.596 0 0 0-.611 1.433c-.23.972-.09 1.884.403 2.666-.596.331-1.546.418-1.744.42H.752a.753.753 0 0 0-.75.749c-.007 1.456.233 2.864.692 4.07.545 1.43 1.355 2.483 2.409 3.13 1.181.725 3.104 1.14 5.276 1.14 1.016 0 2.03-.092 2.93-.266 1.417-.273 2.705-.742 3.826-1.391a10.497 10.497 0 0 0 2.61-2.14c1.252-1.42 1.998-3.005 2.553-4.408.075.003.148.005.221.005 1.371 0 2.215-.55 2.68-1.01.505-.5.685-.998.704-1.053L24 7.076l-.237-.19Z"></path>
			<path d="M2.216 8.075h2.119a.186.186 0 0 0 .185-.186V6a.186.186 0 0 0-.185-.186H2.216A.186.186 0 0 0 2.031 6v1.89c0 .103.083.186.185.186Zm2.92 0h2.118a.185.185 0 0 0 .185-.186V6a.185.185 0 0 0-.185-.186H5.136A.185.185 0 0 0 4.95 6v1.89c0 .103.083.186.186.186Zm2.964 0h2.118a.186.186 0 0 0 .185-.186V6a.186.186 0 0 0-.185-.186H8.1A.185.185 0 0 0 7.914 6v1.89c0 .103.083.186.186.186Zm2.928 0h2.119a.185.185 0 0 0 .185-.186V6a.185.185 0 0 0-.185-.186h-2.119a.186.186 0 0 0-.185.186v1.89c0 .103.083.186.185.186Zm-5.892-2.72h2.118a.185.185 0 0 0 .185-.186V3.28a.186.186 0 0 0-.185-.186H5.136a.186.186 0 0 0-.186.186v1.89c0 .103.083.186.186.186Zm2.964 0h2.118a.186.186 0 0 0 .185-.186V3.28a.186.186 0 0 0-.185-.186H8.1a.186.186 0 0 0-.186.186v1.89c0 .103.083.186.186.186Zm2.928 0h2.119a.185.185 0 0 0 .185-.186V3.28a.186.186 0 0 0-.185-.186h-2.119a.186.186 0 0 0-.185.186v1.89c0 .103.083.186.185.186Zm0-2.72h2.119a.186.186 0 0 0 .185-.186V.56a.185.185 0 0 0-.185-.186h-2.119a.186.186 0 0 0-.185.186v1.89c0 .103.083.186.185.186Zm2.955 5.44h2.118a.185.185 0 0 0 .186-.186V6a.185.185 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.186v1.89c0 .103.083.186.185.186Z"></path>
		</svg>
		</div>
		<div class="search-container">
		<input type="text" id="search-input" placeholder="Search Docker Hub">
		<button id="search-button">
			<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="white" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
			</svg>
		</button>
		</div>
		<script>
		function performSearch() {
			const query = document.getElementById('search-input').value;
			if (query) {
			window.location.href = '/search?q=' + encodeURIComponent(query);
			}
		}
	
		document.getElementById('search-button').addEventListener('click', performSearch);
		document.getElementById('search-input').addEventListener('keypress', function(event) {
			if (event.key === 'Enter') {
			performSearch();
			}
		});
		</script>
	</body>
	</html>
	`;
	return text;
}

/**
 * 返回 GitHub 风格的 favicon
 */
function handleFavicon() {
	// GitHub SVG icon as ICO (using SVG data URI)
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#181717"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`;
	
	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': 'public, max-age=86400', // 缓存1天
		}
	});
}

// ============================================
// Main Router Module
// ============================================
export default {
	async fetch(request, env, ctx) {
		try {
			return await handleRequest(request, env, ctx);
		} catch (error) {
			// 错误处理：确保即使出错也返回有用的响应
			console.error('Worker error:', error);
			return new Response(`Service temporarily unavailable: ${error.message}`, {
				status: 503,
				headers: {
					'Content-Type': 'text/plain; charset=UTF-8',
					'Access-Control-Allow-Origin': '*',
				}
			});
		}
	}
};

/**
 * 主请求处理函数 - 模块化路由
 */
async function handleRequest(request, env, ctx) {
	const getReqHeader = (key) => request.headers.get(key);
	let url = new URL(request.url);
	const userAgentHeader = request.headers.get('User-Agent');
	const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
	
	// 初始化配置
	if (env.UA) 屏蔽爬虫UA = 屏蔽爬虫UA.concat(await ADD(env.UA));
	workers_url = `https://${url.hostname}`;
	const pathname = url.pathname;

	// 特殊路由: Favicon 处理
	if (pathname === '/favicon.ico') {
		return handleFavicon();
	}

	// 模块1: GitHub 代理 (最高优先级 - 确保基本 git clone 功能)
	if (CONFIG.features.github_proxy && isGitHubProxyRequest(pathname)) {
		try {
			return await handleGitHubProxy(request, pathname);
		} catch (error) {
			console.error('GitHub proxy error:', error);
			// GitHub 代理失败时返回明确错误，不影响其他功能
			return new Response(`GitHub proxy error: ${error.message}`, {
				status: 502,
				headers: {
					'Content-Type': 'text/plain; charset=UTF-8',
					'Access-Control-Allow-Origin': '*',
				}
			});
		}
	}

	// 模块2: Docker 代理处理
	if (CONFIG.features.docker_proxy) {
		try {
			return await handleDockerProxy(request, env, url, pathname, userAgent, getReqHeader);
		} catch (error) {
			console.error('Docker proxy error:', error);
			// Docker 代理失败不影响 GitHub 功能
			return new Response(`Docker proxy error: ${error.message}`, {
				status: 502,
				headers: {
					'Content-Type': 'text/plain; charset=UTF-8',
					'Access-Control-Allow-Origin': '*',
				}
			});
		}
	}

	// 默认响应
	return new Response('Service not configured', { status: 404 });
}

/**
 * 检查是否是 GitHub 代理请求
 */
function isGitHubProxyRequest(pathname) {
	const githubPatterns = [
		'/https://github.com',
		'/https://raw.githubusercontent.com',
		'/https://api.github.com',
		'/https://gist.github.com',
		'/https://codeload.github.com'
	];
	return githubPatterns.some(pattern => pathname.startsWith(pattern));
}

/**
 * Docker 代理处理模块
 */
async function handleDockerProxy(request, env, url, pathname, userAgent, getReqHeader) {

	// 获取请求参数中的 ns
	const ns = url.searchParams.get('ns'); 
	const hostname = url.searchParams.get('hubhost') || url.hostname;
	const hostTop = hostname.split('.')[0]; // 获取主机名的第一部分

	let checkHost; // 在这里定义 checkHost 变量
	// 如果存在 ns 参数，优先使用它来确定 hub_host
	if (ns) {
		if (ns === 'docker.io') {
			hub_host = 'registry-1.docker.io'; // 设置上游地址为 registry-1.docker.io
		} else {
			hub_host = ns; // 直接使用 ns 作为 hub_host
		}
	} else {
		checkHost = routeByHosts(hostTop);
		hub_host = checkHost[0]; // 获取上游地址
	}

	const fakePage = checkHost ? checkHost[1] : false; // 确保 fakePage 不为 undefined
	console.log(`域名头部: ${hostTop}\n反代地址: ${hub_host}\n伪装首页: ${fakePage}`);
	const isUuid = isUUID(pathname.split('/')[1].split('/')[0]);

	if (屏蔽爬虫UA.some(fxxk => userAgent.includes(fxxk)) && 屏蔽爬虫UA.length > 0) {
		// 首页改成一个nginx伪装页
		return new Response(await nginx(), {
			headers: {
				'Content-Type': 'text/html; charset=UTF-8',
			},
		});
	}

	const conditions = [
		isUuid,
		pathname.includes('/_'),
		pathname.includes('/r/'),
		pathname.includes('/v2/repositories'),
		pathname.includes('/v2/user'),
		pathname.includes('/v2/orgs'),
		pathname.includes('/v2/_catalog'),
		pathname.includes('/v2/categories'),
		pathname.includes('/v2/feature-flags'),
		pathname.includes('search'),
		pathname.includes('source'),
		pathname == '/',
		pathname == '/favicon.ico',
		pathname == '/auth/profile',
	];

	if (conditions.some(condition => condition) && (fakePage === true || hostTop == 'docker')) {
		if (env.URL302) {
			return Response.redirect(env.URL302, 302);
		} else if (env.URL) {
			if (env.URL.toLowerCase() == 'nginx') {
				//首页改成一个nginx伪装页
				return new Response(await nginx(), {
					headers: {
						'Content-Type': 'text/html; charset=UTF-8',
					},
				});
			} else return fetch(new Request(env.URL, request));
		} else if (url.pathname == '/'){
			return new Response(await renderHomePage(), {
				headers: {
				  'Content-Type': 'text/html; charset=UTF-8',
				},
			});
		}
		
		const newUrl = new URL("https://registry.hub.docker.com" + pathname + url.search);

		// 复制原始请求的标头
		const headers = new Headers(request.headers);

		// 确保 Host 头部被替换为 hub.docker.com
		headers.set('Host', 'registry.hub.docker.com');

		const newRequest = new Request(newUrl, {
				method: request.method,
				headers: headers,
				body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null,
				redirect: 'follow'
		});

		return fetch(newRequest);
	}

	// 修改包含 %2F 和 %3A 的请求
	if (!/%2F/.test(url.search) && /%3A/.test(url.toString())) {
		let modifiedUrl = url.toString().replace(/%3A(?=.*?&)/, '%3Alibrary%2F');
		url = new URL(modifiedUrl);
		console.log(`handle_url: ${url}`);
	}

	// 处理token请求
	if (url.pathname.includes('/token')) {
		let token_parameter = {
			headers: {
				'Host': 'auth.docker.io',
				'User-Agent': getReqHeader("User-Agent"),
				'Accept': getReqHeader("Accept"),
				'Accept-Language': getReqHeader("Accept-Language"),
				'Accept-Encoding': getReqHeader("Accept-Encoding"),
				'Connection': 'keep-alive',
				'Cache-Control': 'max-age=0'
			}
		};
		let token_url = CONFIG.docker.auth_url + url.pathname + url.search;
		return fetch(new Request(token_url, request), token_parameter);
	}

	// 修改 /v2/ 请求路径
	if ( hub_host == 'registry-1.docker.io' && /^\/v2\/[^/]+\/[^/]+\/[^/]+$/.test(url.pathname) && !/^\/v2\/library/.test(url.pathname)) {
		//url.pathname = url.pathname.replace(/\/v2\//, '/v2/library/');
		url.pathname = '/v2/library/' + url.pathname.split('/v2/')[1];
		console.log(`modified_url: ${url.pathname}`);
	}

	// 更改请求的主机名
	url.hostname = hub_host;

	// 构造请求参数
	let parameter = {
		headers: {
			'Host': hub_host,
			'User-Agent': getReqHeader("User-Agent"),
			'Accept': getReqHeader("Accept"),
			'Accept-Language': getReqHeader("Accept-Language"),
			'Accept-Encoding': getReqHeader("Accept-Encoding"),
			'Connection': 'keep-alive',
			'Cache-Control': 'max-age=0'
		},
		cacheTtl: 3600 // 缓存时间
	};

	// 添加Authorization头
	if (request.headers.has("Authorization")) {
		parameter.headers.Authorization = getReqHeader("Authorization");
	}

	// 发起请求并处理响应
	let original_response = await fetch(new Request(url, request), parameter);
	let original_response_clone = original_response.clone();
	let original_text = original_response_clone.body;
	let response_headers = original_response.headers;
	let new_response_headers = new Headers(response_headers);
	let status = original_response.status;

	// 修改 Www-Authenticate 头
	if (new_response_headers.get("Www-Authenticate")) {
		let auth = new_response_headers.get("Www-Authenticate");
		let re = new RegExp(CONFIG.docker.auth_url, 'g');
		new_response_headers.set("Www-Authenticate", response_headers.get("Www-Authenticate").replace(re, workers_url));
	}

	// 处理重定向
	if (new_response_headers.get("Location")) {
		return httpHandler(request, new_response_headers.get("Location"));
	}

	// 返回修改后的响应
	let response = new Response(original_text, {
		status,
		headers: new_response_headers
	});
	return response;
}

// ============================================
// GitHub Proxy Module
// ============================================
/**
 * 处理 GitHub 代理请求
 * 关键功能：确保 git clone、git pull 等基本操作正常工作
 * @param {Request} request 原始请求
 * @param {string} pathname 请求路径
 */
async function handleGitHubProxy(request, pathname) {
	// 提取目标 URL
	const targetUrl = pathname.substring(1); // 移除开头的 /
	
	try {
		const url = new URL(targetUrl);
		
		// 创建新的请求头 - 保持最小修改以确保兼容性
		const newHeaders = new Headers(request.headers);
		newHeaders.set('Host', url.host);
		
		// 清理 Cloudflare 特定的头部
		const cfHeaders = [
			'CF-Connecting-IP', 'CF-RAY', 'CF-IPCountry', 'CF-Visitor', 
			'CF-Worker', 'X-Forwarded-For', 'X-Forwarded-Proto'
		];
		cfHeaders.forEach(header => newHeaders.delete(header));
		
		// 创建新的请求
		const newRequest = new Request(url, {
			method: request.method,
			headers: newHeaders,
			body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
			redirect: 'follow', // 重要：跟随重定向以确保 git clone 正常工作
		});
		
		// 发起请求
		const response = await fetch(newRequest);
		
		// 创建新的响应头
		const responseHeaders = new Headers(response.headers);
		
		// 添加 CORS 头部以支持浏览器中的 API 调用
		responseHeaders.set('Access-Control-Allow-Origin', '*');
		responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		responseHeaders.set('Access-Control-Allow-Headers', '*');
		responseHeaders.set('Access-Control-Expose-Headers', '*');
		
		// 对于 git 操作，保持原始响应不变
		// 只有对于浏览器请求（HTML）才进行链接替换
		const contentType = response.headers.get('content-type') || '';
		const acceptHeader = request.headers.get('accept') || '';
		
		// 判断是否是 git 客户端请求
		const isGitClient = 
			acceptHeader.includes('application/x-git') ||
			contentType.includes('application/x-git') ||
			pathname.includes('/info/refs') ||
			pathname.includes('/git-upload-pack') ||
			pathname.includes('/git-receive-pack');
		
		// Git 客户端请求：直接返回原始响应，不做任何修改
		if (isGitClient) {
			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: responseHeaders,
			});
		}
		
		// HTML 响应：替换链接以提供更好的浏览器体验
		if (contentType.includes('text/html')) {
			let html = await response.text();
			const proxyOrigin = new URL(request.url).origin;
			
			// 替换 GitHub 域名链接为代理链接
			html = html.replace(/https?:\/\/(github\.com|raw\.githubusercontent\.com|api\.github\.com|gist\.github\.com|codeload\.github\.com)/g, 
				(match) => `${proxyOrigin}/${match}`);
			
			// 替换相对路径的链接 - 修复分支列表、分页等功能
			// 更精确的正则表达式，避免错误替换
			html = html.replace(/(href|src|action|data-url|data-turbo-frame-src)="\/([^"]*?)"/g, (match, attr, path) => {
				// 跳过已经是代理路径、data URI、锚点、或JavaScript的路径
				if (path.startsWith('https://') || 
				    path.startsWith('http://') || 
				    path.startsWith('data:') || 
				    path.startsWith('#') || 
				    path.startsWith('javascript:')) {
					return match;
				}
				// 添加代理前缀
				return `${attr}="${proxyOrigin}/https://${url.host}/${path}"`;
			});
			
			// 替换JSON中的相对路径 - 用于API端点
			html = html.replace(/("url"|"api"|"href"):\s*"\/([^"]*?)"/g, (match, key, path) => {
				// 跳过已经是完整URL的路径
				if (path.startsWith('https://') || path.startsWith('http://')) {
					return match;
				}
				// 添加代理前缀
				return `${key}:"${proxyOrigin}/https://${url.host}/${path}"`;
			});
			
			return new Response(html, {
				status: response.status,
				statusText: response.statusText,
				headers: responseHeaders,
			});
		}
		
		// JSON/API 响应：替换其中的 URL
		if (contentType.includes('application/json')) {
			let json = await response.text();
			const proxyOrigin = new URL(request.url).origin;
			
			// 替换 JSON 中的 GitHub URL
			json = json.replace(/https?:\/\/(github\.com|raw\.githubusercontent\.com|api\.github\.com|gist\.github\.com|codeload\.github\.com)/g, 
				(match) => `${proxyOrigin}/${match}`);
			
			return new Response(json, {
				status: response.status,
				statusText: response.statusText,
				headers: responseHeaders,
			});
		}
		
		// 其他类型响应：直接返回
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders,
		});
	} catch (error) {
		// 错误处理：返回详细错误信息以便调试
		console.error('GitHub proxy error:', error);
		return new Response(`GitHub Proxy Error: ${error.message}\n\nURL: ${targetUrl}`, { 
			status: 502,
			headers: {
				'Content-Type': 'text/plain; charset=UTF-8',
				'Access-Control-Allow-Origin': '*',
			}
		});
	}
}

// ============================================
// HTTP Proxy Handler Module
// ============================================
/**
 * 处理HTTP请求
 * @param {Request} req 请求对象
 * @param {string} pathname 请求路径
 */
function httpHandler(req, pathname) {
	const reqHdrRaw = req.headers;

	// 处理预检请求
	if (req.method === 'OPTIONS' &&
		reqHdrRaw.has('access-control-request-headers')
	) {
		return new Response(null, PREFLIGHT_INIT);
	}

	let rawLen = '';

	const reqHdrNew = new Headers(reqHdrRaw);

	const refer = reqHdrNew.get('referer');

	let urlStr = pathname;

	const urlObj = newUrl(urlStr);

	/** @type {RequestInit} */
	const reqInit = {
		method: req.method,
		headers: reqHdrNew,
		redirect: 'follow',
		body: req.body
	};
	return proxy(urlObj, reqInit, rawLen);
}

/**
 * 代理请求
 * @param {URL} urlObj URL对象
 * @param {RequestInit} reqInit 请求初始化对象
 * @param {string} rawLen 原始长度
 */
async function proxy(urlObj, reqInit, rawLen) {
	const res = await fetch(urlObj.href, reqInit);
	const resHdrOld = res.headers;
	const resHdrNew = new Headers(resHdrOld);

	// 验证长度
	if (rawLen) {
		const newLen = resHdrOld.get('content-length') || '';
		const badLen = (rawLen !== newLen);

		if (badLen) {
			return makeRes(res.body, 400, {
				'--error': `bad len: ${newLen}, except: ${rawLen}`,
				'access-control-expose-headers': '--error',
			});
		}
	}
	const status = res.status;
	resHdrNew.set('access-control-expose-headers', '*');
	resHdrNew.set('access-control-allow-origin', '*');
	resHdrNew.set('Cache-Control', 'max-age=1500');

	// 删除不必要的头
	resHdrNew.delete('content-security-policy');
	resHdrNew.delete('content-security-policy-report-only');
	resHdrNew.delete('clear-site-data');

	return new Response(res.body, {
		status,
		headers: resHdrNew
	});
}

async function ADD(envadd) {
	var addtext = envadd.replace(/[	 |"'\r\n]+/g, ',').replace(/,+/g, ',');	// 将空格、双引号、单引号和换行符替换为逗号
	if (addtext.charAt(0) == ',') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == ',') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split(',');
	return add;
}
