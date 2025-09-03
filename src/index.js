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
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
        }
        .ip-option:hover {
            background-color: #f0f0f0;
        }
        .ip-list-container {
            border: 1px solid #ddd;
            border-radius: 4px;
            max-height: 400px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Proxy IP 选择器</h1>
        
        <div class="controls">
            <button id="refreshBtn">刷新数据</button>
            <button id="copyBtn">复制到剪贴板</button>
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
        let selectedIp = '';

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
                
                // 按国家分组
                const groupedData = {};
                data.forEach(item => {
                    // 提取 IP 地址
                    const ip = (item.ip || item.IP || item.address || item.Address || '未知IP');
                    
                    // 提取国家/位置信息
                    const country = (item.country || item.Country || item.location || item.Location || '未知国家');
                    
                    if (!groupedData[country]) {
                        groupedData[country] = [];
                    }
                    groupedData[country].push({
                        ip: ip,
                        country: country
                    });
                });
                
                // 清空现有列表
                ipList.innerHTML = '';
                
                // 创建国家分组
                Object.keys(groupedData).sort().forEach(country => {
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
                        ipOption.textContent = item.ip;
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

        // 页面加载完成后初始化数据
        document.addEventListener('DOMContentLoaded', loadIpData);
    </script>
</body>
</html>`;
	},
};
