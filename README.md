# pip-worker

一个基于 Cloudflare Workers 构建的轻量级代理 IP 选择器应用。

## 项目简介

pip-worker 是一个用于展示和选择代理 IP 地址的无服务器应用。它从远程 JSON 数据源获取代理 IP 列表，并以友好的界面展示给用户，允许用户选择并复制 IP 地址。

主要功能：
- 从远程数据源获取代理 IP 列表  https://raw.githubusercontent.com/happymy/Pip_Json_DEMO2/refs/heads/main/output.json
- 按国家/地区对 IP 进行分组显示
- 可展开/折叠的国家分组视图
- 一键复制选中 IP 到剪贴板
- 响应式设计，适配移动端和桌面端

## 技术栈

- Cloudflare Workers - 无服务器部署平台
- JavaScript - 主要编程语言
- HTML/CSS - 前端界面
- Vitest - 测试框架

## 快速开始

### 本地开发

1. 克隆项目代码：
   ```
   git clone <项目地址>
   ```

2. 安装依赖：
   ```
   npm install
   ```

3. 启动本地开发服务器：
   ```
   npm run dev
   ```
   或
   ```
   npm start
   ```

4. 在浏览器中访问 `http://localhost:8787` 查看应用

### 部署

部署到 Cloudflare Workers：
```
npm run deploy
```

### 测试

运行单元测试：
```
npm test
```

## API 端点

- `GET /` - 返回主页面
- `GET /api/ips` - 返回 JSON 格式的 IP 数据

## 许可证

本项目采用 MIT 许可证，详情请见 [LICENSE](LICENSE) 文件。
