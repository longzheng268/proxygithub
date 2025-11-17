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
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20px;
		}

		.container {
			background: rgba(255, 255, 255, 0.95);
			border-radius: 20px;
			box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
			max-width: 900px;
			width: 100%;
			padding: 40px;
			backdrop-filter: blur(10px);
		}

		h1 {
			text-align: center;
			color: #333;
			margin-bottom: 10px;
			font-size: 2.5em;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}

		.subtitle {
			text-align: center;
			color: #666;
			margin-bottom: 40px;
			font-size: 1.1em;
		}

		.tabs {
			display: flex;
			gap: 10px;
			margin-bottom: 30px;
			border-bottom: 2px solid #e0e0e0;
		}

		.tab {
			padding: 12px 24px;
			background: none;
			border: none;
			color: #666;
			font-size: 16px;
			cursor: pointer;
			position: relative;
			transition: all 0.3s ease;
			font-weight: 500;
		}

		.tab:hover {
			color: #667eea;
		}

		.tab.active {
			color: #667eea;
		}

		.tab.active::after {
			content: '';
			position: absolute;
			bottom: -2px;
			left: 0;
			right: 0;
			height: 2px;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
			background: #f8f9fa;
			padding: 25px;
			border-radius: 12px;
			margin-bottom: 20px;
		}

		.usage-section h3 {
			color: #333;
			margin-bottom: 15px;
			font-size: 1.3em;
			display: flex;
			align-items: center;
			gap: 10px;
		}

		.usage-section h3::before {
			content: '📌';
		}

		.code-block {
			background: #2d2d2d;
			color: #f8f8f2;
			padding: 15px;
			border-radius: 8px;
			margin: 10px 0;
			overflow-x: auto;
			font-family: 'Consolas', 'Monaco', monospace;
			font-size: 14px;
			line-height: 1.6;
			position: relative;
		}

		.code-block code {
			color: #a6e22e;
		}

		.example {
			margin: 15px 0;
		}

		.example-label {
			color: #667eea;
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
			background: white;
			padding: 20px;
			border-radius: 10px;
			box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
			transition: transform 0.3s ease, box-shadow 0.3s ease;
		}

		.feature-card:hover {
			transform: translateY(-5px);
			box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
		}

		.feature-card h4 {
			color: #667eea;
			margin-bottom: 10px;
			font-size: 1.1em;
		}

		.feature-card p {
			color: #666;
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
			border: 2px solid #e0e0e0;
			border-radius: 10px;
			font-size: 16px;
			transition: border-color 0.3s ease;
		}

		.search-input:focus {
			outline: none;
			border-color: #667eea;
		}

		.search-button {
			padding: 15px 30px;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			border: none;
			border-radius: 10px;
			font-size: 16px;
			font-weight: 600;
			cursor: pointer;
			transition: transform 0.2s ease, box-shadow 0.2s ease;
		}

		.search-button:hover {
			transform: translateY(-2px);
			box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
		}

		.search-button:active {
			transform: translateY(0);
		}

		.footer {
			text-align: center;
			margin-top: 40px;
			padding-top: 20px;
			border-top: 1px solid #e0e0e0;
			color: #666;
			font-size: 0.9em;
		}

		.footer a {
			color: #667eea;
			text-decoration: none;
		}

		.footer a:hover {
			text-decoration: underline;
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
	<div class="container">
		<h1>🚀 GitHub & Docker Hub 加速代理</h1>
		<p class="subtitle">快速、稳定、免费的代理服务</p>

		<div class="tabs">
			<button class="tab active" onclick="switchTab('github')">GitHub 代理</button>
			<button class="tab" onclick="switchTab('docker')">Docker 代理</button>
		</div>

		<div id="github-content" class="tab-content active">
			<div class="search-container">
				<input type="text" class="search-input" id="github-url" placeholder="输入 GitHub 仓库地址，例如：https://github.com/owner/repo">
				<button class="search-button" onclick="proxyGithub()">🔗 生成代理链接</button>
			</div>

			<div class="usage-section">
				<h3>GitHub 使用说明</h3>
				
				<div class="example">
					<div class="example-label">浏览仓库</div>
					<div class="code-block"><code>https://你的域名/https://github.com/OWNER/REPO</code></div>
				</div>

				<div class="example">
					<div class="example-label">浏览目录</div>
					<div class="code-block"><code>https://你的域名/https://github.com/OWNER/REPO/tree/BRANCH/path</code></div>
				</div>

				<div class="example">
					<div class="example-label">查看文件</div>
					<div class="code-block"><code>https://你的域名/https://github.com/OWNER/REPO/blob/BRANCH/path/to/file</code></div>
				</div>

				<div class="example">
					<div class="example-label">获取 Raw 文件</div>
					<div class="code-block"><code>https://你的域名/https://raw.githubusercontent.com/OWNER/REPO/BRANCH/path/to/file</code></div>
				</div>

				<div class="example">
					<div class="example-label">访问 API</div>
					<div class="code-block"><code>https://你的域名/https://api.github.com/repos/OWNER/REPO</code></div>
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
				<button class="search-button" onclick="searchDocker()">🔍 搜索镜像</button>
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
		function switchTab(tab) {
			// 更新标签页样式
			document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
			event.target.classList.add('active');

			// 显示对应内容
			document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
			document.getElementById(tab + '-content').classList.add('active');
		}

		function proxyGithub() {
			const input = document.getElementById('github-url').value.trim();
			if (!input) {
				alert('请输入 GitHub 地址');
				return;
			}

			const currentDomain = window.location.origin;
			let proxyUrl = '';

			if (input.startsWith('http://') || input.startsWith('https://')) {
				proxyUrl = currentDomain + '/' + input;
			} else {
				proxyUrl = currentDomain + '/https://github.com/' + input;
			}

			// 复制到剪贴板
			navigator.clipboard.writeText(proxyUrl).then(() => {
				alert('代理链接已复制到剪贴板：\\n' + proxyUrl);
			}).catch(() => {
				alert('代理链接：\\n' + proxyUrl);
			});
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
		
		// 添加 CORS 头部（仅在需要时）
		if (!responseHeaders.has('Access-Control-Allow-Origin')) {
			responseHeaders.set('Access-Control-Allow-Origin', '*');
		}
		
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
			// 替换 GitHub 域名链接为代理链接
			html = html.replace(/https?:\/\/(github\.com|raw\.githubusercontent\.com|api\.github\.com|gist\.github\.com|codeload\.github\.com)/g, 
				(match) => `${new URL(request.url).origin}/${match}`);
			
			return new Response(html, {
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
