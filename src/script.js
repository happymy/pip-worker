/* 基础样式 */
body {
    font-family: Arial, sans-serif;
    margin: 20px;
    padding: 0;
    background-color: #f4f4f4;
}

/* 通知样式 */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background-color: #4CAF50;
    color: white;
    border-radius: 5px;
    display: none;
    z-index: 1000;
}

.notification.error {
    background-color: #f44336;
}

/* 加载提示 */
.loading {
    position: fixed;
    top: 20px;
    left: 20px;
    padding: 10px 20px;
    background-color: #2196F3;
    color: white;
    border-radius: 5px;
    display: none;
    z-index: 1000;
}

/* IP 列表容器 */
.ip-container {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

/* IP 列表标题 */
.ip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

/* 按钮样式 */
button {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 10px;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #0b7dda;
}

/* IP 列表 */
.ip-list {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 6px;
}

/* 国家分组 */
.country-group {
    margin-bottom: 15px;
}

.country-header {
    background-color: #f0f0f0;
    padding: 10px;
    cursor: pointer;
    border-left: 4px solid #ddd;
    transition: background-color 0.3s;
}

.country-group.country-expanded .country-header {
    background-color: #e0e0e0;
}

.country-ips {
    display: none;
    padding-left: 20px;
    margin-top: 5px;
}

.country-group.country-expanded .country-ips {
    display: block;
}

/* IP 选项 */
.ip-option {
    padding: 8px;
    border-bottom: 1px solid #eee;
    transition: all 0.3s;
}

.ip-option:hover {
    background-color: #f9f9f9;
}

/* 已选IP显示区域 */
.selected-ip {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.selected-ip-display {
    font-size: 1.2em;
    font-weight: bold;
    margin-top: 10px;
    color: #333;
}
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>IP 管理</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- 页面内容 -->
    <div id="notification" class="notification"></div>
    <div id="loading" class="loading">加载中...</div>
    
    <div class="ip-container">
        <div class="ip-header">
            <h2>IP 地址列表</h2>
            <button id="refreshBtn">刷新</button>
            <button id="copyBtn">复制选中IP</button>
        </div>
        <div id="ipList" class="ip-list"></div>
    </div>
    
    <div class="selected-ip">
        <h3>已选IP:</h3>
        <div id="selectedIp" class="selected-ip-display"></div>
    </div>

    <script src="script.js"></script>
</body>
</html>
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