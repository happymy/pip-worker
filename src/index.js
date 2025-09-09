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

		// 静态文件由 wrangler 的 site 配置自动处理
		// 不需要额外的处理逻辑
		
		// 默认响应：返回 index.html 用于 SPA 路由
		if (env.ASSETS) {
			return env.ASSETS.fetch(request);
		}
		
		// 如果没有 ASSETS 绑定（如在测试环境中），返回一个简单的 HTML 响应
		return new Response('测试环境中静态资源不可用', {
			status: 200,
			headers: { 'Content-Type': 'text/html' }
		});
	},
};
