// ===========================
// Smart Dashboard - Main Application
// ===========================

// DOM Elements
const elements = {
    themeToggle: document.getElementById('themeToggle'),
    menuToggle: document.getElementById('menuToggle'),
    sidebar: document.querySelector('.sidebar'),
    notificationBtn: document.getElementById('notificationBtn'),
    notificationPanel: document.getElementById('notificationPanel'),
    closePanel: document.getElementById('closePanel'),
    searchInput: document.getElementById('searchInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    taskModal: document.getElementById('taskModal'),
    closeModal: document.getElementById('closeModal'),
    cancelTask: document.getElementById('cancelTask'),
    saveTask: document.getElementById('saveTask'),
    taskTitle: document.getElementById('taskTitle'),
    taskPriority: document.getElementById('taskPriority'),
    taskDate: document.getElementById('taskDate'),
    tasksList: document.getElementById('tasksList'),
    activityList: document.getElementById('activityList'),
    notificationsList: document.getElementById('notificationsList'),
    toastContainer: document.getElementById('toastContainer'),
    currentDate: document.getElementById('currentDate'),
    currentTime: document.getElementById('currentTime'),
    progressFill: document.getElementById('progressFill'),
    progressPercent: document.getElementById('progressPercent'),
    chartLegend: document.getElementById('chartLegend'),
    particlesContainer: document.getElementById('particles'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    navItems: document.querySelectorAll('.nav-item'),
    quickActions: document.querySelectorAll('.quick-action')
};

// Initial Data
const initialTasks = [
    { id: 1, title: 'إعداد تقرير المبيعات الشهري', priority: 'high', date: '2026-01-14', completed: false },
    { id: 2, title: 'اجتماع مع فريق التطوير', priority: 'medium', date: '2026-01-13', completed: false },
    { id: 3, title: 'مراجعة عقود العملاء الجدد', priority: 'low', date: '2026-01-15', completed: true },
    { id: 4, title: 'تحديث واجهة المستخدم', priority: 'high', date: '2026-01-16', completed: false }
];

const activities = [
    { type: 'success', icon: 'check', title: 'تم إكمال المشروع بنجاح', time: 'منذ 5 دقائق' },
    { type: 'info', icon: 'user', title: 'انضمام عضو جديد للفريق', time: 'منذ 15 دقيقة' },
    { type: 'warning', icon: 'alert', title: 'تنبيه: موعد تسليم قريب', time: 'منذ 30 دقيقة' },
    { type: 'danger', icon: 'x', title: 'فشل في معالجة الدفعة', time: 'منذ ساعة' },
    { type: 'info', icon: 'message', title: 'رسالة جديدة من العميل', time: 'منذ ساعتين' }
];

const notifications = [
    { title: 'طلب جديد', desc: 'تم استلام طلب شراء جديد من أحمد علي', time: 'منذ 5 دقائق', unread: true, type: 'info' },
    { title: 'تحديث النظام', desc: 'تم تحديث النظام بنجاح إلى الإصدار 2.5', time: 'منذ 30 دقيقة', unread: true, type: 'success' },
    { title: 'تنبيه أمني', desc: 'تم تسجيل دخول من جهاز جديد', time: 'منذ ساعة', unread: true, type: 'warning' },
    { title: 'دفعة مالية', desc: 'تم استلام دفعة بقيمة $5,000', time: 'منذ ساعتين', unread: false, type: 'success' },
    { title: 'اشتراك جديد', desc: 'تم تسجيل مشترك جديد في الخطة المميزة', time: 'منذ 3 ساعات', unread: false, type: 'info' }
];

// Escape untrusted text before interpolating it into innerHTML templates
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// State
let tasks = [...initialTasks];
let currentTheme = 'dark';

// ===========================
// Initialization
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initParticles();
    initDateTime();
    initCharts();
    renderTasks();
    renderActivities();
    renderNotifications();
    animateStats();
    initEventListeners();
});

// ===========================
// Theme Management
// ===========================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    showToast('success', `تم التبديل إلى الوضع ${newTheme === 'dark' ? 'الداكن' : 'الفاتح'}`);
}

// ===========================
// Particles Background
// ===========================
function initParticles() {
    const container = elements.particlesContainer;
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.width = `${Math.random() * 4 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.animationDuration = `${Math.random() * 20 + 15}s`;
        container.appendChild(particle);
    }
}

// ===========================
// Date & Time
// ===========================
function initDateTime() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elements.currentDate.textContent = now.toLocaleDateString('ar-SA', options);
    elements.currentTime.textContent = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ===========================
// Animated Statistics
// ===========================
function animateStats() {
    const stats = [
        { element: document.getElementById('revenueValue'), value: 156420, prefix: '$', suffix: '' },
        { element: document.getElementById('usersValue'), value: 12847, prefix: '', suffix: '' },
        { element: document.getElementById('projectsValue'), value: 342, prefix: '', suffix: '' },
        { element: document.getElementById('conversionValue'), value: 24.8, prefix: '', suffix: '%' }
    ];
    
    stats.forEach(stat => {
        animateValue(stat.element, 0, stat.value, 2000, stat.prefix, stat.suffix);
    });
    
    // Animate total sales
    const totalSales = document.getElementById('totalSales');
    animateValue(totalSales, 0, 85420, 2000, '$', '');
    
    // Animate progress
    setTimeout(() => {
        const completedTasks = tasks.filter(t => t.completed).length;
        const progress = Math.round((completedTasks / tasks.length) * 100);
        elements.progressFill.style.width = `${progress}%`;
        elements.progressPercent.textContent = `${progress}%`;
    }, 500);
}

function animateValue(element, start, end, duration, prefix = '', suffix = '') {
    const startTime = performance.now();
    const isFloat = end % 1 !== 0;
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeOutQuart(progress);
        const current = start + (end - start) * easeProgress;
        
        const displayValue = isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString();
        element.textContent = `${prefix}${displayValue}${suffix}`;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}

// ===========================
// Charts
// ===========================
function initCharts() {
    initMiniCharts();
    initMainChart();
    initDoughnutChart();
}

function initMiniCharts() {
    const chartConfigs = [
        { id: 'revenueChart', color: '#00d9ff', data: [30, 45, 35, 50, 40, 60, 55] },
        { id: 'usersChart', color: '#8b5cf6', data: [20, 35, 30, 45, 40, 50, 48] },
        { id: 'projectsChart', color: '#f472b6', data: [25, 40, 35, 55, 45, 65, 60] },
        { id: 'conversionChart', color: '#10b981', data: [35, 30, 40, 35, 45, 40, 38] }
    ];
    
    chartConfigs.forEach(config => {
        const ctx = document.getElementById(config.id);
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['', '', '', '', '', '', ''],
                datasets: [{
                    data: config.data,
                    borderColor: config.color,
                    borderWidth: 2,
                    fill: true,
                    backgroundColor: `${config.color}20`,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    });
}

function initMainChart() {
    const ctx = document.getElementById('mainChart');
    if (!ctx) return;
    
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(0, 217, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
    
    const gradient2 = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient2.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
    gradient2.addColorStop(1, 'rgba(139, 92, 246, 0)');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
            datasets: [
                {
                    label: 'الإيرادات',
                    data: [12000, 19000, 15000, 22000, 18000, 25000, 28000],
                    borderColor: '#00d9ff',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#00d9ff',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6
                },
                {
                    label: 'المصروفات',
                    data: [8000, 11000, 9000, 14000, 12000, 16000, 15000],
                    borderColor: '#8b5cf6',
                    backgroundColor: gradient2,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        color: '#9ca3af',
                        font: { family: 'Cairo', size: 12 },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleFont: { family: 'Cairo' },
                    bodyFont: { family: 'Cairo' },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#6b7280', font: { family: 'Cairo' } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#6b7280',
                        font: { family: 'Outfit' },
                        callback: (value) => '$' + value.toLocaleString()
                    }
                }
            }
        }
    });
}

function initDoughnutChart() {
    const ctx = document.getElementById('doughnutChart');
    if (!ctx) return;
    
    const data = {
        labels: ['المنتجات', 'الخدمات', 'الاشتراكات', 'الاستشارات'],
        datasets: [{
            data: [35, 25, 25, 15],
            backgroundColor: ['#00d9ff', '#8b5cf6', '#f472b6', '#10b981'],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };
    
    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleFont: { family: 'Cairo' },
                    bodyFont: { family: 'Cairo' },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => `${context.label}: ${context.parsed}%`
                    }
                }
            }
        }
    });
    
    // Create custom legend
    const colors = ['#00d9ff', '#8b5cf6', '#f472b6', '#10b981'];
    const labels = ['المنتجات', 'الخدمات', 'الاشتراكات', 'الاستشارات'];
    
    labels.forEach((label, i) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<span class="legend-color" style="background: ${colors[i]}"></span><span>${label}</span>`;
        elements.chartLegend.appendChild(item);
    });
}

// ===========================
// Tasks Management
// ===========================
function renderTasks() {
    elements.tasksList.innerHTML = '';
    
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        elements.tasksList.appendChild(taskElement);
    });
    
    updateProgress();
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-item ${task.completed ? 'completed' : ''}`;
    div.dataset.taskId = task.id;
    
    const priorityLabels = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
    
    div.innerHTML = `
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${escapeHtml(task.id)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M20 6L9 17l-5-5"/>
            </svg>
        </div>
        <div class="task-content">
            <div class="task-title">${escapeHtml(task.title)}</div>
            <div class="task-meta">
                <span class="task-date">${escapeHtml(formatDate(task.date))}</span>
                <span class="task-priority ${escapeHtml(task.priority)}">${escapeHtml(priorityLabels[task.priority])}</span>
            </div>
        </div>
    `;
    
    // Add click handler for checkbox
    const checkbox = div.querySelector('.task-checkbox');
    checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTask(task.id);
    });
    
    return div;
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
        showToast('success', task.completed ? 'تم إكمال المهمة' : 'تم إلغاء إكمال المهمة');
    }
}

function addTask(title, priority, date) {
    const newTask = {
        id: Date.now(),
        title,
        priority,
        date,
        completed: false
    };
    
    tasks.unshift(newTask);
    renderTasks();
    showToast('success', 'تمت إضافة المهمة بنجاح');
}

function updateProgress() {
    const completedTasks = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    elements.progressFill.style.width = `${progress}%`;
    elements.progressPercent.textContent = `${progress}%`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
}

// ===========================
// Activities
// ===========================
function renderActivities() {
    elements.activityList.innerHTML = '';
    
    const icons = {
        check: '<path d="M20 6L9 17l-5-5"/>',
        user: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        alert: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
        x: '<path d="M18 6L6 18M6 6l12 12"/>',
        message: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>'
    };
    
    activities.forEach(activity => {
        const div = document.createElement('div');
        div.className = 'activity-item';
        div.innerHTML = `
            <div class="activity-icon ${escapeHtml(activity.type)}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${icons[activity.icon]}
                </svg>
            </div>
            <div class="activity-content">
                <div class="activity-title">${escapeHtml(activity.title)}</div>
                <div class="activity-time">${escapeHtml(activity.time)}</div>
            </div>
        `;
        elements.activityList.appendChild(div);
    });
}

// ===========================
// Notifications
// ===========================
function renderNotifications() {
    elements.notificationsList.innerHTML = '';
    
    const icons = {
        info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
        success: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>',
        warning: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/>'
    };
    
    const colors = {
        info: 'rgba(0, 217, 255, 0.15)',
        success: 'rgba(16, 185, 129, 0.15)',
        warning: 'rgba(245, 158, 11, 0.15)'
    };
    
    const textColors = {
        info: '#00d9ff',
        success: '#10b981',
        warning: '#f59e0b'
    };
    
    notifications.forEach(notification => {
        const div = document.createElement('div');
        div.className = `notification-item ${notification.unread ? 'unread' : ''}`;
        div.innerHTML = `
            <div class="notification-icon" style="background: ${colors[notification.type]}; color: ${textColors[notification.type]}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${icons[notification.type]}
                </svg>
            </div>
            <div class="notification-content">
                <div class="notification-title">${escapeHtml(notification.title)}</div>
                <div class="notification-desc">${escapeHtml(notification.desc)}</div>
                <div class="notification-time">${escapeHtml(notification.time)}</div>
            </div>
        `;
        elements.notificationsList.appendChild(div);
    });
}

// ===========================
// Toast Notifications
// ===========================
function showToast(type, message) {
    const icons = {
        success: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>',
        error: '<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>',
        warning: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
        info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${escapeHtml(type)}`;
    toast.innerHTML = `
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${icons[type]}
        </svg>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ===========================
// Event Listeners
// ===========================
function initEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Menu toggle (mobile)
    elements.menuToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('open');
    });
    
    // Notification panel
    elements.notificationBtn.addEventListener('click', () => {
        elements.notificationPanel.classList.add('open');
    });
    
    elements.closePanel.addEventListener('click', () => {
        elements.notificationPanel.classList.remove('open');
    });
    
    // Modal
    elements.addTaskBtn.addEventListener('click', () => {
        elements.taskModal.classList.add('open');
        elements.taskTitle.focus();
    });
    
    elements.closeModal.addEventListener('click', closeModal);
    elements.cancelTask.addEventListener('click', closeModal);
    
    elements.saveTask.addEventListener('click', () => {
        const title = elements.taskTitle.value.trim();
        const priority = elements.taskPriority.value;
        const date = elements.taskDate.value || new Date().toISOString().split('T')[0];
        
        if (title) {
            addTask(title, priority, date);
            closeModal();
        } else {
            showToast('error', 'يرجى إدخال عنوان المهمة');
        }
    });
    
    // Close modal on outside click
    elements.taskModal.addEventListener('click', (e) => {
        if (e.target === elements.taskModal) {
            closeModal();
        }
    });
    
    // Close notification panel on outside click
    document.addEventListener('click', (e) => {
        if (!elements.notificationPanel.contains(e.target) && 
            !elements.notificationBtn.contains(e.target) &&
            elements.notificationPanel.classList.contains('open')) {
            elements.notificationPanel.classList.remove('open');
        }
    });
    
    // Filter buttons
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showToast('info', `تم تحديد فترة: ${btn.textContent}`);
        });
    });
    
    // Navigation items
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            elements.navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            showToast('info', `الانتقال إلى: ${item.querySelector('span').textContent}`);
            
            // Close sidebar on mobile
            if (window.innerWidth <= 1024) {
                elements.sidebar.classList.remove('open');
            }
        });
    });
    
    // Quick actions
    elements.quickActions.forEach(action => {
        action.addEventListener('click', () => {
            const actionType = action.dataset.action;
            const messages = {
                report: 'جاري إنشاء تقرير جديد...',
                invoice: 'جاري فتح نموذج الفاتورة...',
                message: 'جاري فتح نافذة الرسائل...',
                export: 'جاري تصدير البيانات...'
            };
            showToast('info', messages[actionType]);
        });
    });
    
    // Search
    elements.searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && elements.searchInput.value.trim()) {
            showToast('info', `البحث عن: ${elements.searchInput.value}`);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            elements.searchInput.focus();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            closeModal();
            elements.notificationPanel.classList.remove('open');
        }
    });
}

function closeModal() {
    elements.taskModal.classList.remove('open');
    elements.taskTitle.value = '';
    elements.taskPriority.value = 'medium';
    elements.taskDate.value = '';
}

// ===========================
// Initialize on load complete
// ===========================
window.addEventListener('load', () => {
    // Add loaded class for any CSS-based animations
    document.body.classList.add('loaded');
});
