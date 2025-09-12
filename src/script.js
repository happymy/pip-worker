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
let countdownInterval = null; // 用于存储倒计时计时器ID
let hideTimeout = null; // 用于存储隐藏通知的计时器ID

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

// 显示通知
function showNotification(message, isError = false) {
    // 清除之前可能存在的计时器
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
    }
    
    let countdown = 10; // 初始倒计时10秒
    
    // 设置通知内容，包括倒计时
    notificationDiv.innerHTML = `${message} <span id="countdown">(${countdown}秒后隐藏本通知)</span>`;
    notificationDiv.style.display = 'block';
    if (isError) {
        notificationDiv.classList.add('error');
    } else {
        notificationDiv.classList.remove('error');
    }
    
    // 每秒更新倒计时
    countdownInterval = setInterval(() => {
        countdown--;
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            countdownElement.textContent = `(${countdown}秒后隐藏本通知)`;
        }
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            // 不再在这里隐藏通知，由setTimeout统一处理
        }
    }, 1000);
    
    // 10秒后自动隐藏通知
    hideTimeout = setTimeout(() => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        notificationDiv.style.display = 'none';
        hideTimeout = null;
    }, 10000);
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
        const country = (item.country || item.Country || item.location || item.Location || '未知国家');
        
        // 如果过滤条件为空，或IP地址包含过滤条件，或国家包含过滤条件
        if (!filterValue || ip.toLowerCase().includes(filterValue) || country.toLowerCase().includes(filterValue)) {
            if (!groupedData[country]) {
                groupedData[country] = [];
            }
            groupedData[country].push({
                ip: ip,
                country: country
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