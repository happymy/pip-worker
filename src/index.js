/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		// API 端点：获取 IP 数据
		if (url.pathname === '/api/ips') {
			try {
				const response = await fetch('https://raw.githubusercontent.com/happymy/Pip_Json_DEMO2/refs/heads/main/output.json');

				// 检查响应是否成功
				if (!response.ok) {
					// 如果无法获取远程数据，返回错误
					return new Response(JSON.stringify({ error: 'Failed to fetch IP data: ' + response.status + ' ' + response.statusText }), {
						status: 500,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
					});
				}

				const data = await response.json();
				return new Response(JSON.stringify(data), {
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				});
			} catch (error) {
				// 出现错误时返回错误信息
				console.error('获取IP数据时出错:', error);
				return new Response(JSON.stringify({ error: 'Failed to fetch IP data: ' + error.message }), {
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				});
			}
		}

		// 主页：返回 HTML 页面
		if (url.pathname === '/') {
			return new Response(this.getHTML(), {
				headers: {
					'Content-Type': 'text/html;charset=utf-8',
				},
			});
		}

		// 404 处理
		return new Response('Not Found', { status: 404 });
	},

	// 获取 HTML 内容
	getHTML() {
		return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proxy IP 选择器</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        /* 暗色主题样式 */
        [data-theme="dark"] {
            --bg-color: #1a1a1a;
            --container-bg: #2d2d2d;
            --text-color: #ffffff;
            --border-color: #444;
            --header-bg: #3d3d3d;
            --input-bg: #333;
            --input-border: #555;
            --button-bg: #4CAF50;
            --button-hover: #45a049;
            --button-disabled: #555;
            --notification-bg: #2d442d;
            --notification-border: #3c763d;
            --notification-text: #a9d9aa;
            --error-bg: #442d2d;
            --error-border: #763c3c;
            --error-text: #f2a8a8;
            --ip-option-hover: #3a3a3a;
            --selected-ip-bg: #3a3a3a;
            --country-header-bg: #3d3d3d;
            --ip-border: #444;
        }

        [data-theme="dark"] body {
            background-color: var(--bg-color);
            color: var(--text-color);
        }

        [data-theme="dark"] .container {
            background-color: var(--container-bg);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        [data-theme="dark"] h1 {
            color: var(--text-color);
        }

        [data-theme="dark"] .filter-input {
            background-color: var(--input-bg);
            border-color: var(--input-border);
            color: var(--text-color);
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="%23ccc" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>');
        }

        [data-theme="dark"] .filter-input:focus {
            border-color: var(--button-bg);
            box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
        }

        [data-theme="dark"] select {
            background-color: var(--input-bg);
            border-color: var(--input-border);
            color: var(--text-color);
        }

        [data-theme="dark"] .ip-display {
            background-color: var(--selected-ip-bg);
            border-color: var(--border-color);
            color: var(--text-color);
        }

        [data-theme="dark"] .ip-list-container {
            border-color: var(--border-color);
        }

        [data-theme="dark"] .no-results {
            color: #aaa;
        }

        [data-theme="dark"] .country-header {
            background-color: var(--country-header-bg);
            color: var(--text-color);
        }

        [data-theme="dark"] .ip-option {
            color: var(--text-color);
            border-bottom-color: var(--ip-border);
        }

        [data-theme="dark"] .ip-option:hover {
            background-color: var(--ip-option-hover);
        }

        [data-theme="dark"] .notification {
            background-color: var(--notification-bg);
            border-color: var(--notification-border);
            color: var(--notification-text);
        }

        [data-theme="dark"] .error {
            background-color: var(--error-bg);
            border-color: var(--error-border);
            color: var(--error-text);
        }
        
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: relative; /* 为按钮定位 */
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .controls {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 10px;
        }
        button {
            background-color: #4CAF50;
            border: none;
            color: white;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 4px;
        }
        button:hover {
            background-color: #45a049;
        }
        button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        
        /* 主题切换按钮样式 */
        .theme-toggle {
            position: absolute;
            top: 20px;
            right: 20px;
            background: transparent;
            border: 1px solid #ddd;
            font-size: 18px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 50%;
            padding: 0;
        }

        [data-theme="dark"] .theme-toggle {
            border-color: #555;
            color: #fff;
        }
        
        .filter-container {
            margin-bottom: 20px;
        }
        .filter-input {
            width: 100%;
            padding: 12px 20px;
            box-sizing: border-box;
            border: 2px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="%23999" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>');
            background-repeat: no-repeat;
            background-position: 10px center;
            background-size: 20px 20px;
            padding-left: 40px;
            transition: border-color 0.3s;
        }
        .filter-input:focus {
            border-color: #4CAF50;
            outline: none;
            box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
        }
        select {
            width: 100%;
            padding: 10px;
            margin-bottom: 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        .ip-display {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            font-size: 18px;
            text-align: center;
            margin-bottom: 20px;
            word-break: break-all;
        }
        .no-results {
            padding: 20px;
            text-align: center;
            color: #666;
            font-style: italic;
        }
        .country-group {
            margin-bottom: 10px;
        }
        .country-header {
            font-weight: bold;
            background-color: #e9e9e9;
            padding: 8px;
            cursor: pointer;
            border-radius: 4px;
        }
        .country-ips {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
        }
        .country-expanded .country-ips {
            max-height: 1000px;
            transition: max-height 0.5s ease-in;
        }
        .ip-option {
            display: block;
            padding: 8px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            color: #333;
        }
        .ip-option:hover {
            background-color: #f0f0f0;
        }
        .ip-list-container {
            border: 1px solid #ddd;
            border-radius: 4px;
            max-height: 400px;
            overflow-y: auto;
            margin-bottom: 20px;
        }
        .notification {
            padding: 10px;
            background-color: #dff0d8;
            border: 1px solid #d6e9c6;
            color: #3c763d;
            border-radius: 4px;
            margin-bottom: 20px;
            display: none;
        }
        .loading {
            text-align: center;
            padding: 20px;
        }
        .error {
            background-color: #f2dede;
            border-color: #ebccd1;
            color: #a94442;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Proxy IP 选择器</h1>
        
        <!-- 添加主题切换按钮 -->
        <button id="themeToggle" class="theme-toggle" aria-label="切换暗黑模式">🌙</button>
        
        <div class="controls">
            <button id="refreshBtn">刷新数据</button>
            <button id="copyBtn">复制到剪贴板</button>
        </div>
        
        <div class="filter-container">
            <input type="text" id="filterInput" placeholder="输入IP地址或国家名称进行过滤..." class="filter-input">
        </div>
        
        <div id="notification" class="notification"></div>
        <div id="loading" class="loading"></div>        
        
        <div id="ipList" class="ip-list-container"></div>
        
        <div id="selectedIp" class="ip-display">
            请从上面选择一个 IP 地址
        </div>
    </div>

    <script>
        // 页面元素
        const refreshBtn = document.getElementById('refreshBtn');
        const copyBtn = document.getElementById('copyBtn');
        const ipList = document.getElementById('ipList');
        const selectedIpDiv = document.getElementById('selectedIp');
        const notificationDiv = document.getElementById('notification');
        const loadingDiv = document.getElementById('loading');
        const filterInput = document.getElementById('filterInput');
        const themeToggle = document.getElementById('themeToggle'); // 主题切换按钮
        let selectedIp = '';
        let ipData = []; // 保存原始数据用于过滤

        // 主题切换功能
        function initTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggle.textContent = '☀️';
            } else {
                // 默认为亮色主题
                document.documentElement.removeAttribute('data-theme');
                themeToggle.textContent = '🌙';
            }
        }

        // 切换主题
        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeToggle.textContent = '🌙';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeToggle.textContent = '☀️';
            }
        }

        // 地理位置排序顺序
        const geoOrder = ['Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Africa', 'Unknown'];

        // 显示通知
        function showNotification(message, isError = false) {
            notificationDiv.textContent = message;
            notificationDiv.style.display = 'block';
            if (isError) {
                notificationDiv.classList.add('error');
            } else {
                notificationDiv.classList.remove('error');
            }
            
            // 3秒后自动隐藏通知
            setTimeout(() => {
                notificationDiv.style.display = 'none';
            }, 3000);
        }

        // 获取国家在排序数组中的索引
        function getCountryIndex(country) {
            const index = geoOrder.indexOf(country);
            return index === -1 ? geoOrder.length : index;
        }

        // 从位置信息中提取国家名
        function extractCountry(location) {
            if (!location) return 'Unknown';
            
            // 按逗号分割位置信息
            const parts = location.split(',').map(part => part.trim());
            
            // 返回最后一个部分作为国家名
            return parts.length > 0 ? parts[parts.length - 1] : 'Unknown';
        }

        // 过滤IP列表
        function filterIpList() {
            const filterValue = filterInput.value.toLowerCase();
            
            // 按国家分组
            const groupedData = {};
            ipData.forEach(item => {
                // 提取 IP 地址
                const ip = (item.ip || item.IP || item.address || item.Address || '未知IP');
                
                // 提取国家/位置信息
                const location = (item.location || item.Location || 'Unknown');
                const country = extractCountry(location);
                
                // 如果过滤条件为空，或IP地址包含过滤条件，或国家包含过滤条件，或位置信息包含过滤条件
                if (!filterValue || 
                    ip.toLowerCase().includes(filterValue) || 
                    country.toLowerCase().includes(filterValue) ||
                    location.toLowerCase().includes(filterValue)) {
                    if (!groupedData[country]) {
                        groupedData[country] = [];
                    }
                    groupedData[country].push({
                        ip: ip,
                        country: country,
                        location: location
                    });
                }
            });
            
            // 清空现有列表
            ipList.innerHTML = '';
            
            // 如果没有匹配的数据，显示提示信息
            if (Object.keys(groupedData).length === 0) {
                ipList.innerHTML = '<div class="no-results">没有找到匹配的IP地址</div>';
                return;
            }
            
            // 按预定义的地理顺序排序国家
            const sortedCountries = Object.keys(groupedData).sort((a, b) => {
                const indexA = getCountryIndex(a);
                const indexB = getCountryIndex(b);
                
                if (indexA !== indexB) {
                    return indexA - indexB;
                }
                return a.localeCompare(b);
            });
            
            // 创建国家分组
            sortedCountries.forEach(country => {
                const countryGroup = document.createElement('div');
                countryGroup.className = 'country-group';
                
                const countryHeader = document.createElement('div');
                countryHeader.className = 'country-header';
                countryHeader.textContent = country + ' (' + groupedData[country].length + ')';
                
                const countryIps = document.createElement('div');
                countryIps.className = 'country-ips';
                
                groupedData[country].forEach(item => {
                    const ipOption = document.createElement('div');
                    ipOption.className = 'ip-option';
                    // 显示IP地址和完整位置信息
                    ipOption.textContent = item.ip + ' (' + item.location + ')';
                    ipOption.addEventListener('click', () => {
                        selectedIp = item.ip;
                        selectedIpDiv.textContent = selectedIp;
                        showNotification('已选择 IP: ' + selectedIp);
                        
                        // 更新所有选项的样式
                        document.querySelectorAll('.ip-option').forEach(option => {
                            option.style.backgroundColor = '';
                            option.style.color = '';
                            option.style.fontWeight = '';
                        });
                        
                        // 高亮选中的选项
                        ipOption.style.backgroundColor = '#4CAF50';
                        ipOption.style.color = 'white';
                        ipOption.style.fontWeight = 'bold';
                    });
                    countryIps.appendChild(ipOption);
                });
                
                countryHeader.addEventListener('click', () => {
                    countryGroup.classList.toggle('country-expanded');
                });
                
                countryGroup.appendChild(countryHeader);
                countryGroup.appendChild(countryIps);
                ipList.appendChild(countryGroup);
            });
        }

        // 加载 IP 数据
        async function loadIpData() {
            try {
                loadingDiv.style.display = 'block';
                refreshBtn.disabled = true;
                
                const response = await fetch('/api/ips');
                const data = await response.json();
                
                // 检查是否有错误信息
                if (data.error) {
                    throw new Error(data.error);
                }
                
                // 保存原始数据
                ipData = data;
                
                // 显示过滤后的数据
                filterIpList();
                
                loadingDiv.style.display = 'none';
                refreshBtn.disabled = false;
                
                showNotification('数据加载成功');
            } catch (error) {
                loadingDiv.style.display = 'none';
                refreshBtn.disabled = false;
                
                showNotification('数据加载失败: ' + error.message, true);
                console.error('加载 IP 数据时出错:', error);
            }
        }

        // 复制到剪贴板
        async function copyToClipboard() {
            try {
                if (!selectedIp) {
                    showNotification('请先选择一个 IP 地址', true);
                    return;
                }
                
                await navigator.clipboard.writeText(selectedIp);
                showNotification('IP 地址已复制到剪贴板');
            } catch (error) {
                showNotification('复制失败: ' + error.message, true);
                console.error('复制到剪贴板时出错:', error);
            }
        }

        // 事件监听器
        refreshBtn.addEventListener('click', loadIpData);
        copyBtn.addEventListener('click', copyToClipboard);
        filterInput.addEventListener('input', filterIpList);
        themeToggle.addEventListener('click', toggleTheme); // 添加主题切换事件监听器

        // 页面加载完成后初始化数据和主题
        document.addEventListener('DOMContentLoaded', () => {
            initTheme(); // 初始化主题
            loadIpData(); // 加载数据
        });
    </script>
</body>
</html>`;
	},
};