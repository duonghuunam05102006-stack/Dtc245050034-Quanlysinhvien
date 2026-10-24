/**
 * HUST Student Management & Training System - Advanced Application Logic
 * Đại học Bách Khoa Hà Nội
 */

// Global State
let currentUser = null;
let students = [];
let classes = [];
let teachers = [];
let availableCourses = [];
let studentRequests = [];
let currentAdminTab = 'home';
let currentTeacherTab = 'homeroom';
let currentStudentTab = 'overview';
let currentSemester = 'hk1_2025';
let currentPage = 1;
const pageSize = 5;
let searchQuery = '';
let filterClass = '';
let filterStatus = '';
let sortDirection = 'desc';
let deleteTargetId = null;
let activeAuthMode = null; // null | 'login' | 'register'

// Chart Instances
let semesterChartInstance = null;
let classChartInstance = null;
let gradeDistChartInstance = null;

// Sound Synthesizer
const soundFX = {
    ctx: null,
    init() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playTone(freq, type = 'sine', duration = 0.12) {
        try {
            this.init();
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    },
    success() {
        this.playTone(587.33, 'sine', 0.1);
        setTimeout(() => this.playTone(880, 'sine', 0.15), 90);
    },
    click() {
        this.playTone(450, 'triangle', 0.04);
    },
    delete() {
        this.playTone(280, 'sawtooth', 0.15);
    }
};

// =========================================================================
// Initialization
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadStoredData();
    initClock();
    checkAuthStatus();
    setupKeyboardShortcuts();
});

function loadStoredData() {
    const storedStudents = localStorage.getItem('hust_students_v2');
    if (storedStudents) {
        try { 
            students = JSON.parse(storedStudents); 
            if (students.length < INITIAL_STUDENTS.length) {
                students = [...INITIAL_STUDENTS];
                saveStudents();
            }
        } 
        catch (e) { students = [...INITIAL_STUDENTS]; }
    } else {
        students = [...INITIAL_STUDENTS];
        saveStudents();
    }

    const storedClasses = localStorage.getItem('hust_classes_v2');
    if (storedClasses) {
        try { classes = JSON.parse(storedClasses); }
        catch (e) { classes = [...INITIAL_CLASSES]; }
    } else {
        classes = [...INITIAL_CLASSES];
        saveClasses();
    }

    const storedTeachers = localStorage.getItem('hust_teachers_v2');
    if (storedTeachers) {
        try { teachers = JSON.parse(storedTeachers); }
        catch (e) { teachers = [...INITIAL_TEACHERS]; }
    } else {
        teachers = [...INITIAL_TEACHERS];
        saveTeachers();
    }

    const storedCourses = localStorage.getItem('hust_courses_v2');
    if (storedCourses) {
        try { availableCourses = JSON.parse(storedCourses); }
        catch (e) { availableCourses = [...AVAILABLE_COURSES]; }
    } else {
        availableCourses = [...AVAILABLE_COURSES];
    }

    studentRequests = [...STUDENT_REQUESTS];

    const storedUser = localStorage.getItem('hust_current_user_v2');
    if (storedUser) {
        try { currentUser = JSON.parse(storedUser); } 
        catch (e) { currentUser = DEFAULT_USERS[0]; }
    } else {
        currentUser = DEFAULT_USERS[0];
    }
}

function saveStudents() {
    localStorage.setItem('hust_students_v2', JSON.stringify(students));
    updateStatCounts();
}

function saveClasses() {
    localStorage.setItem('hust_classes_v2', JSON.stringify(classes));
}

function saveTeachers() {
    localStorage.setItem('hust_teachers_v2', JSON.stringify(teachers));
}

function saveCourses() {
    localStorage.setItem('hust_courses_v2', JSON.stringify(availableCourses));
}

// =========================================================================
// Compact Auth Toggle (Ấn mới trượt hiện form)
// =========================================================================

function toggleAuthForm(mode) {
    soundFX.click();
    const box = document.getElementById('auth-expandable-box');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const btnLogin = document.getElementById('btn-trigger-login');
    const btnRegister = document.getElementById('btn-trigger-register');
    const guideText = document.getElementById('auth-subtext-guide');

    if (activeAuthMode === mode && box.classList.contains('expanded')) {
        // Clicked again -> collapse
        collapseAuthForm();
        return;
    }

    activeAuthMode = mode;
    box.classList.add('expanded');

    if (mode === 'login') {
        btnLogin.classList.add('active');
        btnRegister.classList.remove('active');
        formLogin.classList.remove('hidden');
        formRegister.classList.add('hidden');
        guideText.textContent = 'Đang mở form Đăng nhập tài khoản Bách Khoa';
        setTimeout(() => document.getElementById('login-username')?.focus(), 250);
    } else {
        btnRegister.classList.add('active');
        btnLogin.classList.remove('active');
        formLogin.classList.add('hidden');
        formRegister.classList.remove('hidden');
        guideText.textContent = 'Đang mở form Đăng ký tài khoản sinh viên K68';
        setTimeout(() => document.getElementById('reg-fullname')?.focus(), 250);
    }
}

function collapseAuthForm() {
    soundFX.click();
    activeAuthMode = null;
    const box = document.getElementById('auth-expandable-box');
    box.classList.remove('expanded');
    document.getElementById('btn-trigger-login')?.classList.remove('active');
    document.getElementById('btn-trigger-register')?.classList.remove('active');
    document.getElementById('auth-subtext-guide').textContent = 'Nhấn vào tác vụ bên dưới để mở form thao tác';
}

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? '👁️' : '🙈';
}

function getUsers() {
    const stored = localStorage.getItem('hust_users_v2');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error(e);
        }
    }
    return [...DEFAULT_USERS];
}

function saveUsers(users) {
    localStorage.setItem('hust_users_v2', JSON.stringify(users));
}

function quickFillLogin(role) {
    const users = getUsers();
    const user = users.find(u => u.username === role) || DEFAULT_USERS.find(u => u.username === role);
    if (!user) return;
    soundFX.success();
    showToast(`Đăng nhập quyền: ${user.fullName} (${user.role})`, 'success');
    currentUser = user;
    localStorage.setItem('hust_current_user_v2', JSON.stringify(currentUser));
    setTimeout(checkAuthStatus, 250);
}

function switchRoleTo(roleKey) {
    const users = getUsers();
    let target = null;
    if (roleKey === 'admin') {
        target = users.find(u => u.role === 'Quản trị viên') || DEFAULT_USERS.find(u => u.username === 'admin');
    } else if (roleKey === 'teacher') {
        target = users.find(u => u.role === 'Giảng viên') || DEFAULT_USERS.find(u => u.username === 'teacher');
    } else if (roleKey === 'student') {
        target = users.find(u => u.role === 'Sinh viên') || DEFAULT_USERS.find(u => u.username === 'student');
    }
    if (!target) return;
    currentUser = target;
    localStorage.setItem('hust_current_user_v2', JSON.stringify(currentUser));
    soundFX.success();
    showToast(`Đã chuyển sang vai trò: ${currentUser.role} (${currentUser.fullName})`, 'info');
    checkAuthStatus();
}

function toggleUserRoleQuick() {
    if (currentUser.role === 'Quản trị viên') {
        switchRoleTo('teacher');
    } else if (currentUser.role === 'Giảng viên') {
        switchRoleTo('student');
    } else {
        switchRoleTo('admin');
    }
}

function switchToLoginView() {
    currentUser = null;
    localStorage.removeItem('hust_current_user_v2');
    checkAuthStatus();
    soundFX.click();
    showToast('Đang hiển thị màn hình Đăng nhập Bách Khoa', 'info');
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username) {
        showToast('Vui lòng nhập mã sinh viên hoặc tài khoản!', 'warning');
        return;
    }

    const users = getUsers();
    const matched = users.find(u => u.username.toLowerCase() === username.toLowerCase() || (u.email && u.email.toLowerCase() === username.toLowerCase()));
    
    if (matched) {
        if (password && matched.password && password !== matched.password) {
            soundFX.warning();
            showToast('Mật khẩu không chính xác! Vui lòng kiểm tra lại.', 'error');
            return;
        }
        currentUser = matched;
    } else {
        currentUser = {
            username: username,
            password: password,
            fullName: username.toUpperCase(),
            role: (username.startsWith('2023') || username.toLowerCase().includes('student')) ? 'Sinh viên' : 'Quản trị viên',
            studentId: username,
            class: 'KHMT 01 - K68',
            faculty: 'Trường CNTT & TT - HUST',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            email: `${username}@sis.hust.edu.vn`,
            gpa: 8.0,
            gpa4: 3.3,
            drl: 85,
            creditsCompleted: 45,
            totalCredits: 156,
            tuitionDue: 18500000,
            tuitionStatus: 'Chờ nộp'
        };
        users.push(currentUser);
        saveUsers(users);
    }

    localStorage.setItem('hust_current_user_v2', JSON.stringify(currentUser));
    soundFX.success();
    showToast(`Đăng nhập thành công! Chào mừng ${currentUser.fullName}`, 'success');
    collapseAuthForm();
    checkAuthStatus();
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    const fullName = document.getElementById('reg-fullname').value.trim();
    const studentId = document.getElementById('reg-username').value.trim();
    const major = document.getElementById('reg-major').value;
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    if (!fullName || !studentId || !password) {
        showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'warning');
        return;
    }

    const users = getUsers();
    const existing = users.find(u => u.username.toLowerCase() === studentId.toLowerCase() || (email && u.email && u.email.toLowerCase() === email.toLowerCase()));

    const newUser = {
        username: studentId,
        password: password,
        fullName: fullName,
        role: 'Sinh viên',
        studentId: studentId,
        class: `${major} - K68`,
        major: major,
        faculty: 'Trường CNTT & TT - HUST',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        email: email || `${studentId}@sis.hust.edu.vn`,
        phone: '0988 567 890',
        gpa: 8.2,
        gpa4: 3.4,
        drl: 85,
        creditsCompleted: 45,
        totalCredits: 156,
        tuitionDue: 18500000,
        tuitionStatus: 'Chờ nộp',
        subjects: {
            'Giải tích 1': { cc: 9, gk: 8.5, ck: 8.5, total: 8.5, credits: 4, letter: 'A' },
            'Đại số tuyến tính': { cc: 10, gk: 8.0, ck: 8.5, total: 8.5, credits: 3, letter: 'A' },
            'Lập trình C/C++': { cc: 9.5, gk: 9.0, ck: 9.0, total: 9.0, credits: 4, letter: 'A+' },
            'Vật lý đại cương 1': { cc: 8.5, gk: 7.5, ck: 8.0, total: 8.0, credits: 3, letter: 'B+' }
        }
    };

    if (existing) {
        Object.assign(existing, newUser);
    } else {
        users.push(newUser);
    }
    saveUsers(users);

    // Đồng bộ vào danh sách sinh viên toàn trường để hiển thị trên cả Admin portal & Cổng sinh viên
    let studentRecord = students.find(s => s.studentId === studentId);
    if (!studentRecord) {
        studentRecord = {
            id: Date.now(),
            studentId: studentId,
            fullName: fullName,
            email: newUser.email,
            phone: newUser.phone,
            gender: 'Nam',
            birthDate: '2005-09-15',
            class: newUser.class,
            faculty: newUser.faculty,
            avatar: newUser.avatar,
            gpa: 8.2,
            gpa4: 3.4,
            drl: 85,
            status: 'Đang học',
            scholarship: 'Học bổng Khuyến khích HT',
            creditsCompleted: 45,
            tuitionStatus: 'Chờ nộp',
            subjects: newUser.subjects
        };
        students.unshift(studentRecord);
        saveStudents();
    }

    // Tự động liên kết và đăng nhập thẳng vào hệ thống
    currentUser = newUser;
    localStorage.setItem('hust_current_user_v2', JSON.stringify(currentUser));
    soundFX.success();
    showToast(`Đăng ký thành công! Đang trực tiếp chuyển vào Cổng Sinh Viên Bách Khoa...`, 'success');
    collapseAuthForm();
    checkAuthStatus();
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('hust_current_user_v2');
    toggleUserMenu(false);
    showToast('Đã đăng xuất khỏi hệ thống HUST', 'info');
    checkAuthStatus();
    soundFX.click();
}

// =========================================================================
// Role Views & Header
// =========================================================================

function checkAuthStatus() {
    const authView = document.getElementById('auth-view');
    const dashView = document.getElementById('dashboard-view');
    
    if (currentUser) {
        authView.style.display = 'none';
        dashView.style.display = 'flex';
        updateHeaderUserInfo();
        renderSidebarNav();
        renderCurrentRoleView();
    } else {
        authView.style.display = 'flex';
        dashView.style.display = 'none';
    }
}

function updateHeaderUserInfo() {
    if (!currentUser) return;
    document.getElementById('header-user-avatar').src = currentUser.avatar;
    document.getElementById('header-user-name').textContent = currentUser.fullName.split(' ').pop();
    document.getElementById('header-user-role').textContent = currentUser.role;
    document.getElementById('menu-user-fullname').textContent = currentUser.fullName;
    document.getElementById('menu-user-email').textContent = currentUser.email;

    const roleTag = document.getElementById('sidebar-role-tag');
    if (roleTag) {
        if (currentUser.role === 'Sinh viên') {
            roleTag.textContent = 'SINH VIÊN';
            roleTag.className = 'text-[10px] bg-blue-700/60 text-blue-200 px-1.5 py-0.5 rounded border border-blue-500/40 font-bold';
        } else if (currentUser.role === 'Giảng viên') {
            roleTag.textContent = 'GV CHỦ NHIỆM';
            roleTag.className = 'text-[10px] bg-emerald-700/60 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-500/40 font-bold';
        } else {
            roleTag.textContent = 'ADMIN TOÀN TRƯỜNG';
            roleTag.className = 'text-[10px] bg-red-700/60 text-amber-300 px-1.5 py-0.5 rounded border border-red-500/40 font-bold';
        }
    }

    // Role switcher active styling
    const btnAdmin = document.getElementById('role-btn-admin');
    const btnTeacher = document.getElementById('role-btn-teacher');
    const btnStudent = document.getElementById('role-btn-student');

    if (btnAdmin && btnTeacher && btnStudent) {
        [btnAdmin, btnTeacher, btnStudent].forEach(b => {
            b.className = 'px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800';
        });
        if (currentUser.role === 'Quản trị viên') {
            btnAdmin.className = 'px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 bg-red-700 text-white shadow-sm';
        } else if (currentUser.role === 'Giảng viên') {
            btnTeacher.className = 'px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 bg-emerald-700 text-white shadow-sm';
        } else {
            btnStudent.className = 'px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 bg-blue-700 text-white shadow-sm';
        }
    }
}

function renderSidebarNav() {
    const container = document.getElementById('sidebar-nav-container');
    if (!container) return;

    if (currentUser.role === 'Sinh viên') {
        container.innerHTML = `
            <button onclick="switchStudentTab('overview')" id="snav-overview" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-700 text-white font-semibold shadow-md transition-all">
                <span>🎓</span><span>Tổng quan sinh viên</span>
            </button>
            <button onclick="switchStudentTab('timetable')" id="snav-timetable" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>📅</span><span>Thời khóa biểu tuần</span>
            </button>
            <button onclick="switchStudentTab('courses')" id="snav-courses" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>📚</span><span>Đăng ký tín chỉ online</span>
                <span class="ml-auto text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Mở</span>
            </button>
            <button onclick="switchStudentTab('grades')" id="snav-grades" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>📊</span><span>Bảng điểm học tập</span>
            </button>
            <button onclick="switchStudentTab('exams')" id="snav-exams" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>📝</span><span>Lịch thi học phần</span>
            </button>
            <button onclick="switchStudentTab('tuition')" id="snav-tuition" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>💳</span><span>Học phí & VietQR Pay</span>
            </button>
            <button onclick="switchStudentTab('services')" id="snav-services" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>🏢</span><span>Dịch vụ Một Cửa SV</span>
            </button>
        `;
    } else if (currentUser.role === 'Giảng viên') {
        container.innerHTML = `
            <div class="px-3 py-2 mb-1 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs">
                <span class="font-bold block text-emerald-300">👨‍🏫 Cổng Giảng Viên & Cố Vấn</span>
                <span class="text-[11px] opacity-80">Lớp: ${currentUser.homeroomClass || 'IT1-01-K68'}</span>
            </div>
            <button onclick="switchTeacherTab('homeroom')" id="tnav-homeroom" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-700 text-white font-semibold shadow-md transition-all">
                <span>🎓</span><span>Lớp Chủ Nhiệm Của Tôi</span>
            </button>
            <button onclick="switchTeacherTab('grades')" id="tnav-grades" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>📊</span><span>Nhập & Sửa Điểm Lớp Tôi</span>
            </button>
            <button onclick="switchTeacherTab('teaching')" id="tnav-teaching" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>📅</span><span>Lịch Giảng Dạy Của Tôi</span>
            </button>
            <button onclick="switchTeacherTab('notices')" id="tnav-notices" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>📢</span><span>Thông Báo Lớp Chủ Nhiệm</span>
            </button>
        `;
    } else {
        container.innerHTML = `
            <button onclick="switchAdminTab('home')" id="nav-home" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-700 text-white font-semibold shadow-md transition-all">
                <span>🏛️</span><span>Trang chủ & Thống kê</span>
            </button>
            <button onclick="switchAdminTab('students')" id="nav-students" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>👥</span><span>Hồ sơ sinh viên K68</span>
                <span class="ml-auto text-[10px] bg-white/10 text-amber-300 px-2 py-0.5 rounded-full font-bold" id="badge-total-students">${students.length}</span>
            </button>
            <button onclick="switchAdminTab('classes')" id="nav-classes" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>🏫</span><span>Quản lý Lớp học (CRUD)</span>
                <span class="ml-auto text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold">${classes.length}</span>
            </button>
            <button onclick="switchAdminTab('teachers')" id="nav-teachers" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>👨‍🏫</span><span>Giảng viên & Phân công</span>
                <span class="ml-auto text-[10px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full font-bold">${teachers.length}</span>
            </button>
            <button onclick="switchAdminTab('grades')" id="nav-grades" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>📈</span><span>Sổ điểm & Khảo thí (CRUD)</span>
            </button>
            <button onclick="switchAdminTab('scholarships')" id="nav-scholarships" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>🏆</span><span>Hội đồng xét học bổng</span>
                <span class="ml-auto text-[10px] bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-bold">Kỳ 1</span>
            </button>
            <button onclick="switchAdminTab('warnings')" id="nav-warnings" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>⚠️</span><span>Cảnh báo học vụ & Nợ môn</span>
                <span class="ml-auto text-[10px] bg-red-600/40 text-red-300 px-2 py-0.5 rounded-full font-bold">1</span>
            </button>
            <button onclick="switchAdminTab('exams')" id="nav-exams" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>📑</span><span>Lập lịch thi & Phòng thi</span>
            </button>
            <button onclick="switchAdminTab('finance')" id="nav-finance" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <span>💰</span><span>Quản lý tài chính học phí</span>
            </button>
            <button onclick="switchAdminTab('database')" id="nav-database" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all border border-amber-500/30">
                <span>🐬</span><span>CSDL MySQL phpMyAdmin</span>
            </button>
        `;
    }
}

function renderCurrentRoleView() {
    if (currentUser.role === 'Sinh viên') {
        renderStudentPortalView();
    } else if (currentUser.role === 'Giảng viên') {
        renderTeacherPortalView();
    } else {
        renderAdminDashboardView();
    }
}

// =========================================================================
// ADMIN MODULES (8 RICH TABS)
// =========================================================================

function switchAdminTab(tab) {
    currentAdminTab = tab;
    soundFX.click();

    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-red-700', 'text-white', 'shadow-md');
        el.classList.add('text-slate-300', 'hover:bg-white/10');
    });

    const activeNav = document.getElementById(`nav-${tab}`);
    if (activeNav) {
        activeNav.classList.remove('text-slate-300', 'hover:bg-white/10');
        activeNav.classList.add('bg-red-700', 'text-white', 'shadow-md');
    }

    renderAdminDashboardView();
}

function renderAdminDashboardView() {
    const mainZone = document.getElementById('main-content-zone');
    if (!mainZone) return;

    if (currentAdminTab === 'students') {
        renderAdminStudentsTab(mainZone);
        return;
    }
    if (currentAdminTab === 'scholarships') {
        renderAdminScholarshipsTab(mainZone);
        return;
    }
    if (currentAdminTab === 'warnings') {
        renderAdminWarningsTab(mainZone);
        return;
    }
    if (currentAdminTab === 'exams') {
        renderAdminExamsTab(mainZone);
        return;
    }
    if (currentAdminTab === 'grades') {
        renderAdminGradebookTab(mainZone);
        return;
    }
    if (currentAdminTab === 'classes') {
        renderAdminClassesTab(mainZone);
        return;
    }
    if (currentAdminTab === 'teachers') {
        renderAdminTeachersTab(mainZone);
        return;
    }
    if (currentAdminTab === 'finance') {
        renderAdminFinanceTab(mainZone);
        return;
    }
    if (currentAdminTab === 'database') {
        renderAdminDatabaseTab(mainZone);
        return;
    }

    // Default: Executive Dashboard (Trang chủ)
    mainZone.innerHTML = `
        <!-- Top Banner -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-800 via-red-700 to-amber-700 text-white p-7 shadow-xl shadow-red-950/20">
            <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-amber-300 mb-2">
                        <span>Học kỳ 1 &bull; Năm học 2025 - 2026 &bull; HUST SIS v3.0</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Bảng Điều Khiển Quản Trị Đào Tạo HUST
                    </h1>
                    <p class="text-slate-200 text-sm mt-1 max-w-xl">
                        Xin chào ${currentUser.fullName} (${currentUser.department || 'Phòng Đào tạo'}). Dữ liệu toàn khóa K68 đã được tổng hợp.
                    </p>
                </div>
                
                <div class="flex items-center gap-3">
                    <button onclick="exportToCSV()" class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-md flex items-center gap-2 transition">
                        <span>📥</span> Xuất Excel (CSV)
                    </button>
                    <button onclick="openAddStudentModal()" class="px-4 py-2.5 rounded-xl bg-white text-red-800 hover:bg-red-50 text-xs font-bold shadow-lg flex items-center gap-2 transition transform active:scale-95">
                        <span>➕</span> Thêm sinh viên mới
                    </button>
                </div>
            </div>
        </div>

        <!-- 6 Metrics Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div class="stat-card p-4">
                <span class="text-xs text-slate-400 font-medium">Tổng sĩ số K68</span>
                <div class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">1,315</div>
                <div class="text-[11px] text-emerald-600 font-bold mt-1">&uarr; 14.2% YoY</div>
            </div>
            <div class="stat-card p-4">
                <span class="text-xs text-slate-400 font-medium">Học bổng KKHT</span>
                <div class="text-2xl font-extrabold text-red-700 mt-1">${students.filter(s => s.scholarship !== 'Không').length} SV</div>
                <div class="text-[11px] text-emerald-600 font-bold mt-1">Ngân sách: 148M</div>
            </div>
            <div class="stat-card p-4">
                <span class="text-xs text-slate-400 font-medium">Cảnh báo học vụ</span>
                <div class="text-2xl font-extrabold text-amber-600 mt-1">${students.filter(s => s.academicWarning.includes('Cảnh báo')).length} SV</div>
                <div class="text-[11px] text-red-600 font-bold mt-1">CPA &lt; 2.0</div>
            </div>
            <div class="stat-card p-4">
                <span class="text-xs text-slate-400 font-medium">Tỷ lệ đỗ môn</span>
                <div class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">91.8%</div>
                <div class="text-[11px] text-emerald-600 font-bold mt-1">&uarr; 2.1% so với kỳ trước</div>
            </div>
            <div class="stat-card p-4">
                <span class="text-xs text-slate-400 font-medium">Lớp chuyên ngành</span>
                <div class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">5 lớp</div>
                <div class="text-[11px] text-slate-400 font-medium mt-1">Trường CNTT&TT</div>
            </div>
            <div class="stat-card p-4">
                <span class="text-xs text-slate-400 font-medium">Thu học phí HK1</span>
                <div class="text-2xl font-extrabold text-emerald-600 mt-1">94.2%</div>
                <div class="text-[11px] text-slate-400 font-medium mt-1">Đã đối soát NH</div>
            </div>
        </div>

        <!-- 2 Main Interactive Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-7 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="font-bold text-base text-slate-800 dark:text-white">Phổ điểm các học phần cốt lõi Bách Khoa</h3>
                        <p class="text-xs text-slate-400">So sánh điểm trung bình và tỷ lệ đạt</p>
                    </div>
                    <select id="semester-select" onchange="updateSemesterChart(this.value)" class="text-xs font-semibold bg-slate-100 dark:bg-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200">
                        <option value="hk1_2025">HK1 - 2025-2026</option>
                        <option value="hk2_2024">HK2 - 2024-2025</option>
                        <option value="hk1_2024">HK1 - 2024-2025</option>
                    </select>
                </div>
                <div class="h-64 w-full"><canvas id="semesterBarChart"></canvas></div>
            </div>

            <div class="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                <div>
                    <h3 class="font-bold text-base text-slate-800 dark:text-white">Cơ cấu chuyên ngành K68</h3>
                    <p class="text-xs text-slate-400">Phân bố sinh viên trường CNTT&TT</p>
                </div>
                <div class="my-4 flex items-center justify-center gap-6">
                    <div class="w-36 h-36 relative flex-shrink-0">
                        <canvas id="classDonutChart"></canvas>
                        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span class="text-lg font-extrabold text-slate-800 dark:text-white">1,315</span>
                            <span class="text-[9px] text-slate-400 uppercase font-semibold">SV</span>
                        </div>
                    </div>
                    <div class="space-y-1.5 text-xs" id="class-legend-container"></div>
                </div>
                <div class="pt-3 border-t border-slate-100 dark:border-slate-700 text-center text-[11px] text-slate-400">
                    Cập nhật thời gian thực từ máy chủ đào tạo HUST
                </div>
            </div>
        </div>

        <!-- Student Summary Table -->
        <div class="data-table-container">
            <div class="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200">
                <div>
                    <h3 class="font-bold text-base text-slate-800 dark:text-white">Danh sách hồ sơ sinh viên K68</h3>
                    <p class="text-xs text-slate-400">Xem nhanh và quản lý học vụ</p>
                </div>
                <button onclick="switchAdminTab('students')" class="text-xs font-bold text-red-700 hover:underline">
                    Xem toàn bộ hồ sơ chi tiết &rarr;
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Mã SV</th>
                            <th>Họ và tên</th>
                            <th>Lớp</th>
                            <th>GPA</th>
                            <th>ĐRL</th>
                            <th>Học bổng</th>
                            <th>Trạng thái</th>
                            <th class="text-right pr-6">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="student-table-body"></tbody>
                </table>
            </div>
        </div>
    `;

    initCharts();
    renderClassLegend();
    renderStudentTable();
}

// 1. Detailed Students Full Management Tab
function renderAdminStudentsTab(mainZone) {
    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Quản Lý Toàn Bộ Hồ Sơ Sinh Viên K68</h2>
                    <p class="text-xs text-slate-400">Tổng hợp 1,315 sinh viên Đại học Bách Khoa Hà Nội</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="exportToCSV()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700">
                        Xuất Excel
                    </button>
                    <button onclick="openAddStudentModal()" class="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-xs font-bold text-white shadow-md">
                        + Thêm sinh viên mới
                    </button>
                </div>
            </div>

            <!-- Advanced Filter Bar -->
            <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
                <input type="text" id="table-search" oninput="applyFilters()" placeholder="Tìm theo tên, mã SV 2023..." 
                       class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl w-60">
                <select id="filter-class" onchange="applyFilters()" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="">Tất cả các ngành</option>
                    <option value="KHMT 01 - K68">Khoa học Máy tính (IT1)</option>
                    <option value="KTPM 02 - K68">Kỹ thuật Phần mềm (IT2)</option>
                    <option value="HTTT 01 - K68">Hệ thống Thông tin (IT-E6)</option>
                    <option value="AI 01 - K68">Trí tuệ Nhân tạo & DS (IT-E10)</option>
                    <option value="DTVT 01 - K68">Điện tử Viễn thông (ET1)</option>
                </select>
                <select id="filter-status" onchange="applyFilters()" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="">Tất cả trạng thái</option>
                    <option value="Đang học">Đang học</option>
                    <option value="Tạm nghỉ">Tạm nghỉ</option>
                    <option value="Bảo lưu">Bảo lưu</option>
                </select>
                <button onclick="showToast('Đã gửi email thông báo học vụ tới toàn bộ sinh viên được chọn!', 'success')" class="ml-auto px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100">
                    📧 Gửi email hàng loạt
                </button>
            </div>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Mã SV</th>
                            <th>Họ và tên</th>
                            <th>Lớp</th>
                            <th>GPA</th>
                            <th>ĐRL</th>
                            <th>Học bổng</th>
                            <th>Trạng thái</th>
                            <th class="text-right pr-6">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="student-table-body"></tbody>
                </table>
            </div>

            <div class="p-4 px-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                <div id="table-pagination-info"></div>
                <div class="flex gap-1" id="pagination-buttons"></div>
            </div>
        </div>
    `;
    renderStudentTable();
}

// 2. Scholarship Council Tab
function renderAdminScholarshipsTab(mainZone) {
    const eligible = students.filter(s => s.gpa >= 8.0 && s.drl >= 80);
    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Hội Đồng Xét Duyệt Học Bổng Bách Khoa</h2>
                    <p class="text-xs text-slate-400">Kỳ 1 Năm học 2025 - 2026 &bull; Tiêu chuẩn: GPA &ge; 8.0 (3.2/4.0) và ĐRL &ge; 80</p>
                </div>
                <button onclick="showToast('Đã phê duyệt và ban hành Quyết định khen thưởng học bổng HK1!', 'success')" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md">
                    ✓ Phê duyệt toàn bộ danh sách
                </button>
            </div>

            <!-- Scholarship Funds Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200">
                    <span class="text-xs font-bold text-red-700">Học bổng Loại A (Xuất sắc)</span>
                    <div class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">${students.filter(s => s.gpa >= 9.0).length} sinh viên</div>
                    <p class="text-xs text-slate-400 mt-1">100% học phí &bull; Trị giá: 18,500,000 đ / suất</p>
                </div>
                <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200">
                    <span class="text-xs font-bold text-amber-600">Học bổng Loại B (Khuyến khích)</span>
                    <div class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">${students.filter(s => s.gpa >= 8.0 && s.gpa < 9.0).length} sinh viên</div>
                    <p class="text-xs text-slate-400 mt-1">50% học phí &bull; Trị giá: 9,250,000 đ / suất</p>
                </div>
                <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200">
                    <span class="text-xs font-bold text-blue-600">Học bổng Doanh nghiệp Viettel / Samsung</span>
                    <div class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">2 sinh viên</div>
                    <p class="text-xs text-slate-400 mt-1">Tài trợ toàn phần + Cơ hội việc làm</p>
                </div>
            </div>

            <!-- Table of candidates -->
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Mã SV</th>
                            <th>Họ và tên</th>
                            <th>Lớp</th>
                            <th>GPA</th>
                            <th>ĐRL</th>
                            <th>Loại học bổng đề xuất</th>
                            <th>Trạng thái hội đồng</th>
                            <th class="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${eligible.map(s => `
                            <tr>
                                <td class="font-bold text-red-700">${s.studentId}</td>
                                <td class="font-bold text-slate-800 dark:text-white">${s.fullName}</td>
                                <td>${s.class}</td>
                                <td class="font-bold text-emerald-600">${s.gpa.toFixed(2)}</td>
                                <td class="font-bold text-blue-600">${s.drl} / 100</td>
                                <td><span class="badge ${s.gpa >= 9.0 ? 'badge-danger' : 'badge-warning'} font-bold">${s.scholarship}</span></td>
                                <td><span class="badge badge-success font-bold">${s.scholarshipStatus || 'Đủ điều kiện'}</span></td>
                                <td class="text-right">
                                    <button onclick="showToast('Đã xuất Quyết định cấp học bổng cho ${s.fullName}', 'success')" class="px-3 py-1 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 text-xs">
                                        Cấp chứng nhận
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 3. Academic Warnings Tab
function renderAdminWarningsTab(mainZone) {
    const warned = students.filter(s => s.gpa < 7.0 || s.academicWarning.includes('Cảnh báo'));
    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Giám Sát Cảnh Báo Học Vụ & Xử Lý Nợ Môn</h2>
                    <p class="text-xs text-slate-400">Theo dõi sinh viên có nguy cơ bị cảnh cáo học vụ mức 1, 2 hoặc buộc thôi học</p>
                </div>
                <button onclick="showToast('Đã gửi thông báo cảnh báo học vụ về phụ huynh & sinh viên!', 'info')" class="px-4 py-2 rounded-xl bg-red-700 text-white text-xs font-bold shadow-md">
                    Gửi giấy báo học vụ
                </button>
            </div>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Mã SV</th>
                            <th>Họ và tên</th>
                            <th>Lớp</th>
                            <th>Điểm CPA</th>
                            <th>Tín chỉ tích lũy</th>
                            <th>Mức cảnh báo</th>
                            <th>Số điện thoại / Phụ huynh</th>
                            <th class="text-right">Biện pháp xử lý</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${warned.map(s => `
                            <tr>
                                <td class="font-bold text-red-700">${s.studentId}</td>
                                <td class="font-bold text-slate-800 dark:text-white">${s.fullName}</td>
                                <td>${s.class}</td>
                                <td class="font-bold text-red-600">${s.gpa4.toFixed(2)} / 4.0</td>
                                <td class="text-slate-600 font-semibold">${s.credits} TC</td>
                                <td><span class="badge badge-danger font-bold">${s.academicWarning}</span></td>
                                <td class="text-xs text-slate-500">${s.phone} &bull; ${s.email}</td>
                                <td class="text-right">
                                    <button onclick="showToast('Đã lên lịch hẹn gặp Cố vấn học tập cho sinh viên ${s.fullName}', 'info')" class="px-3 py-1 bg-amber-50 text-amber-800 font-bold rounded-lg text-xs hover:bg-amber-100">
                                        Hẹn gặp Cố vấn
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 4. Exams & Scheduling Tab
function renderAdminExamsTab(mainZone) {
    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Lập Lịch Thi & Phân Công Phòng Thi Học Kỳ 1</h2>
                    <p class="text-xs text-slate-400">Quản lý kỳ thi kết thúc học phần Bách Khoa K68</p>
                </div>
                <button onclick="showToast('Đã xuất danh sách phòng thi & số báo danh (PDF)!', 'success')" class="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md">
                    🖨️ In thẻ dự thi & SBD
                </button>
            </div>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Mã môn</th>
                            <th>Tên học phần</th>
                            <th>Ngày thi</th>
                            <th>Ca thi</th>
                            <th>Phòng thi</th>
                            <th>Hình thức thi</th>
                            <th>Giám thị coi thi</th>
                            <th class="text-right">Sĩ số dự thi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${EXAM_SCHEDULE.map(ex => `
                            <tr>
                                <td class="font-bold text-red-700">${ex.code}</td>
                                <td class="font-bold text-slate-800 dark:text-white">${ex.name}</td>
                                <td class="font-semibold text-slate-700">${ex.date}</td>
                                <td>${ex.time}</td>
                                <td><span class="px-2 py-0.5 rounded bg-red-50 text-red-700 font-bold text-xs">${ex.room}</span></td>
                                <td>${ex.type}</td>
                                <td class="text-xs text-slate-500">TS. Nguyễn Văn Hùng & ThS. Lê Thu Trang</td>
                                <td class="text-right font-bold text-emerald-600">60 SV</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 5. Gradebook Tab - Quản Lý Điểm Số & Khảo Thí Toàn Trường (CRUD Điểm)
let selectedAdminGradeSubject = 'Giải tích 1';
let selectedAdminGradeClass = '';

function renderAdminGradebookTab(mainZone) {
    const subjects = ['Giải tích 1', 'Đại số tuyến tính', 'Cấu trúc dữ liệu & Thuật toán', 'Lập trình Hướng đối tượng', 'Kiến trúc Máy tính', 'Tiếng Anh chuyên ngành'];
    
    // Filter students
    let displayList = students;
    if (selectedAdminGradeClass) {
        displayList = displayList.filter(s => s.class === selectedAdminGradeClass || s.class?.includes(selectedAdminGradeClass));
    }

    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Sổ Điểm Khảo Thí & Nhập Điểm Học Phần (CRUD Điểm Số)</h2>
                    <p class="text-xs text-slate-400">Đại học Bách Khoa Hà Nội &bull; Học kỳ 1 Năm học 2025 - 2026</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="exportGradebookCSV()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition">
                        <span>📥</span> Xuất Bảng Điểm (CSV)
                    </button>
                    <button onclick="showToast('Đã khóa sổ điểm và công bố chính thức lên Cổng SIS!', 'success')" class="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-md">
                        Công bố điểm SIS
                    </button>
                </div>
            </div>

            <!-- Filters -->
            <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
                <span class="font-bold text-slate-700 dark:text-slate-200">Chọn môn học:</span>
                <select onchange="changeAdminGradeSubject(this.value)" class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-red-700">
                    ${subjects.map(sub => `<option value="${sub}" ${sub === selectedAdminGradeSubject ? 'selected' : ''}>${sub}</option>`).join('')}
                </select>

                <span class="font-bold text-slate-700 dark:text-slate-200 ml-2">Lọc theo lớp:</span>
                <select onchange="changeAdminGradeClass(this.value)" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="">Tất cả các lớp (${classes.length} lớp)</option>
                    ${classes.map(c => `<option value="${c.code}" ${c.code === selectedAdminGradeClass ? 'selected' : ''}>${c.code} - ${c.name}</option>`).join('')}
                </select>
            </div>

            <!-- Data Table -->
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Mã SV</th>
                            <th>Họ và tên</th>
                            <th>Lớp</th>
                            <th>Chuyên cần (10%)</th>
                            <th>Giữa kỳ (30%)</th>
                            <th>Cuối kỳ (60%)</th>
                            <th>Tổng kết (Hệ 10)</th>
                            <th>Điểm chữ</th>
                            <th>Hệ 4</th>
                            <th>Kết quả</th>
                            <th class="text-right pr-6">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${displayList.map((s, idx) => {
                            const sub = s.subjects?.[selectedAdminGradeSubject] || { cc: 9.0, gk: 8.0, ck: 8.0, total: 8.1, letter: 'B+' };
                            const isPass = sub.total >= 4.0;
                            const gpa4 = sub.letter?.startsWith('A') ? 4.0 : (sub.letter?.startsWith('B') ? 3.0 : (sub.letter?.startsWith('C') ? 2.0 : (sub.letter?.startsWith('D') ? 1.0 : 0.0)));
                            return `
                                <tr>
                                    <td>${idx + 1}</td>
                                    <td class="font-bold text-red-700">${s.studentId}</td>
                                    <td class="font-bold text-slate-800 dark:text-white">${s.fullName}</td>
                                    <td class="text-xs text-slate-500">${s.class}</td>
                                    <td class="font-semibold text-slate-700 text-center">${sub.cc !== undefined ? sub.cc : 9.0}</td>
                                    <td class="font-semibold text-slate-700 text-center">${sub.gk !== undefined ? sub.gk : 8.0}</td>
                                    <td class="font-semibold text-slate-700 text-center">${sub.ck !== undefined ? sub.ck : 8.0}</td>
                                    <td class="font-extrabold text-red-700 text-center text-sm">${sub.total ? sub.total.toFixed(1) : '8.1'}</td>
                                    <td class="text-center"><span class="px-2 py-0.5 rounded font-extrabold text-xs ${sub.letter?.startsWith('A') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}">${sub.letter || 'B+'}</span></td>
                                    <td class="text-center font-bold text-slate-700">${gpa4.toFixed(1)}</td>
                                    <td><span class="badge ${isPass ? 'badge-success' : 'badge-danger'} font-bold">${isPass ? 'Đạt' : 'Học lại'}</span></td>
                                    <td class="text-right pr-6">
                                        <button onclick="openGradeModal('${s.studentId}', '${selectedAdminGradeSubject}')" 
                                                class="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-lg text-xs transition">
                                            ✏️ Sửa điểm
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function changeAdminGradeSubject(sub) {
    selectedAdminGradeSubject = sub;
    renderAdminDashboardView();
}

function changeAdminGradeClass(cls) {
    selectedAdminGradeClass = cls;
    renderAdminDashboardView();
}

function exportGradebookCSV() {
    let csv = `STT,Mã SV,Họ và tên,Lớp,Môn học,Chuyên cần,Giữa kỳ,Cuối kỳ,Tổng kết,Điểm chữ\n`;
    students.forEach((s, idx) => {
        const sub = s.subjects?.[selectedAdminGradeSubject] || { cc: 9, gk: 8, ck: 8, total: 8, letter: 'B' };
        csv += `${idx + 1},${s.studentId},"${s.fullName}","${s.class}","${selectedAdminGradeSubject}",${sub.cc || 9},${sub.gk || 8},${sub.ck || 8},${sub.total || 8},${sub.letter || 'B'}\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `BangDiem_${selectedAdminGradeSubject.replace(/\s+/g, '_')}.csv`;
    link.click();
    showToast(`Đã xuất bảng điểm môn ${selectedAdminGradeSubject}!`, 'success');
}

// 6. Classes Tab - Quản Lý Lớp Học Toàn Trường (CRUD Lớp)
function renderAdminClassesTab(mainZone) {
    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Quản Lý Danh Sách Lớp Chuyên Ngành K68 (CRUD)</h2>
                    <p class="text-xs text-slate-400">Trường Công nghệ Thông tin & Truyền thông - HUST &bull; Tổng: ${classes.length} lớp</p>
                </div>
                <button onclick="openAddClassModal()" class="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-md flex items-center gap-2 transition transform active:scale-95">
                    <span>➕</span> Thêm Lớp Mới
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${classes.map(cls => `
                    <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                                <span class="text-xs font-extrabold text-red-700 px-2.5 py-1 rounded-xl bg-red-50 border border-red-200">
                                    ${cls.code}
                                </span>
                                <div class="flex items-center gap-1.5">
                                    <button onclick="openEditClassModal('${cls.code}')" title="Chỉnh sửa lớp" class="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 text-xs">
                                        ✏️
                                    </button>
                                    <button onclick="deleteClass('${cls.code}')" title="Xóa lớp" class="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 text-xs">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <h3 class="font-extrabold text-base text-slate-800 dark:text-white">${cls.name}</h3>
                            <p class="text-xs text-slate-400 mt-0.5">${cls.faculty}</p>
                            
                            <div class="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                                <div class="flex justify-between"><span class="text-slate-400">Cố vấn chủ nhiệm:</span><span class="font-bold text-red-700">${cls.advisor}</span></div>
                                <div class="flex justify-between"><span class="text-slate-400">Lớp trưởng:</span><span class="font-semibold text-slate-700 dark:text-slate-200">${cls.president || 'Chưa bầu'}</span></div>
                                <div class="flex justify-between"><span class="text-slate-400">Phòng sinh hoạt:</span><span class="font-semibold text-slate-700 dark:text-slate-200">${cls.room || 'P.402 - B1'}</span></div>
                                <div class="flex justify-between"><span class="text-slate-400">Sĩ số:</span><span class="font-extrabold text-emerald-600">${cls.totalStudents || 50} sinh viên</span></div>
                            </div>
                        </div>

                        <div class="mt-5 pt-3 border-t border-slate-100">
                            <button onclick="viewClassStudents('${cls.code}')" class="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-1.5">
                                <span>👥</span> Xem danh sách sinh viên lớp &rarr;
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function viewClassStudents(code) {
    filterClass = code;
    switchAdminTab('students');
    setTimeout(() => {
        const sel = document.getElementById('filter-class');
        if (sel) sel.value = code;
        applyFilters();
    }, 150);
}

// 7. Teachers Tab - Quản Lý Giảng Viên & Phân Công Chủ Nhiệm (CRUD Giảng Viên)
function renderAdminTeachersTab(mainZone) {
    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Danh Sách Giảng Viên & Phân Công Chủ Nhiệm (CRUD)</h2>
                    <p class="text-xs text-slate-400">Quản lý thầy cô giảng dạy & cố vấn học tập các lớp K68 &bull; Tổng: ${teachers.length} giảng viên</p>
                </div>
                <button onclick="openAddTeacherModal()" class="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-md flex items-center gap-2 transition transform active:scale-95">
                    <span>➕</span> Thêm Giảng Viên Mới
                </button>
            </div>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Mã GV</th>
                            <th>Họ và tên</th>
                            <th>Khoa / Viện</th>
                            <th>Email & Số ĐT</th>
                            <th>Lớp Chủ Nhiệm Phụ Trách</th>
                            <th>Môn Phụ Trách Giảng Dạy</th>
                            <th class="text-right pr-6">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${teachers.map(t => `
                            <tr>
                                <td class="font-bold text-red-700">${t.id}</td>
                                <td>
                                    <div class="flex items-center gap-3">
                                        <img src="${t.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}" class="w-8 h-8 rounded-full object-cover">
                                        <div>
                                            <div class="font-bold text-slate-800 dark:text-white text-xs">${t.fullName}</div>
                                            <div class="text-[10px] text-slate-400">Giảng viên cơ hữu</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="text-xs font-medium text-slate-600">${t.department || 'Trường CNTT & TT'}</td>
                                <td class="text-xs text-slate-500">${t.email}<br><span class="text-slate-400">${t.phone || '0912 345 678'}</span></td>
                                <td>
                                    ${t.homeroomClass 
                                        ? `<span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1">
                                            <span>👨‍🏫</span> ${t.homeroomClass}
                                           </span>`
                                        : `<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-xs font-semibold">Chưa phân công</span>`
                                    }
                                </td>
                                <td class="text-xs font-semibold text-slate-700 max-w-xs">${t.teachingCourses || 'Các môn chuyên ngành'}</td>
                                <td class="text-right pr-6">
                                    <div class="flex items-center justify-end gap-1.5">
                                        <button onclick="openEditTeacherModal('${t.id}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition">
                                            ✏️ Sửa
                                        </button>
                                        <button onclick="deleteTeacher('${t.id}')" class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition">
                                            🗑️ Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 8. Database MySQL / phpMyAdmin Tab (Đề 2)
function renderAdminDatabaseTab(mainZone) {
    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-gradient-to-r from-slate-900 to-red-950 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-2">
                        <span>🐬 Đề 2: Cơ Sở Dữ Liệu MySQL / phpMyAdmin</span>
                    </div>
                    <h2 class="text-2xl font-extrabold text-white">Quản Lý & Xuất Cơ Sở Dữ Liệu MySQL</h2>
                    <p class="text-xs text-slate-300 mt-1 max-w-xl">Hệ thống CSDL chuẩn hóa phục vụ quản lý sinh viên, lớp chuyên ngành, giảng viên, điểm số và thời khóa biểu.</p>
                </div>
                <button onclick="downloadDatabaseSQL()" class="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 transition transform active:scale-95">
                    <span class="text-base">📥</span> Tải File quan_ly_sinh_vien.sql
                </button>
            </div>

            <!-- Database Tables Preview -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 shadow-sm">
                    <div class="font-bold text-red-700 text-xs uppercase mb-1">Bảng 1: khoa_vien</div>
                    <p class="text-[11px] text-slate-400">Mã khoa, Tên khoa, Văn phòng, SĐT, Email</p>
                    <div class="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">4 bản ghi</div>
                </div>
                <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 shadow-sm">
                    <div class="font-bold text-red-700 text-xs uppercase mb-1">Bảng 2: giang_vien</div>
                    <p class="text-[11px] text-slate-400">Mã GV, Họ tên, Học vị, Email, Môn dạy</p>
                    <div class="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">${teachers.length} bản ghi</div>
                </div>
                <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 shadow-sm">
                    <div class="font-bold text-red-700 text-xs uppercase mb-1">Bảng 3: lop_hoc</div>
                    <p class="text-[11px] text-slate-400">Mã lớp, Tên lớp, Cố vấn CN, Sĩ số</p>
                    <div class="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">${classes.length} bản ghi</div>
                </div>
                <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 shadow-sm">
                    <div class="font-bold text-red-700 text-xs uppercase mb-1">Bảng 4: sinh_vien</div>
                    <p class="text-[11px] text-slate-400">Mã SV, Họ tên, Lớp, GPA, ĐRL, Trạng thái</p>
                    <div class="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">${students.length} bản ghi</div>
                </div>
                <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 shadow-sm">
                    <div class="font-bold text-red-700 text-xs uppercase mb-1">Bảng 5: mon_hoc</div>
                    <p class="text-[11px] text-slate-400">Mã môn, Tên môn, Số tín chỉ, Hệ số CC/GK/CK</p>
                    <div class="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">10 bản ghi</div>
                </div>
                <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 shadow-sm">
                    <div class="font-bold text-red-700 text-xs uppercase mb-1">Bảng 6: diem_so</div>
                    <p class="text-[11px] text-slate-400">Điểm CC (10%), GK (30%), CK (60%), Tổng kết</p>
                    <div class="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">Bảng điểm đầy đủ</div>
                </div>
                <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 shadow-sm">
                    <div class="font-bold text-red-700 text-xs uppercase mb-1">Bảng 7: thoi_khoa_bieu</div>
                    <p class="text-[11px] text-slate-400">Tiết học, Thứ, Khung giờ, Phòng, Giảng viên</p>
                    <div class="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">6 ca học</div>
                </div>
                <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 shadow-sm">
                    <div class="font-bold text-red-700 text-xs uppercase mb-1">Bảng 8: tai_khoan</div>
                    <p class="text-[11px] text-slate-400">Phân quyền 3 vai trò: Admin, Giảng viên, SV</p>
                    <div class="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">3 tài khoản mẫu</div>
                </div>
            </div>

            <!-- Import Instructions -->
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm">
                <h3 class="font-bold text-base text-slate-800 dark:text-white mb-3">📖 Hướng Dẫn Sử Dụng Với phpMyAdmin / MySQL</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
                    <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200">
                        <strong class="text-red-700 block mb-1">Bước 1: Khởi động MySQL</strong>
                        Mở <strong>XAMPP Control Panel</strong> hoặc WampServer, bấm <strong>Start</strong> dịch vụ Apache và MySQL.
                    </div>
                    <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200">
                        <strong class="text-red-700 block mb-1">Bước 2: Mở phpMyAdmin</strong>
                        Truy cập đường dẫn <code>http://localhost/phpmyadmin</code> trên trình duyệt web.
                    </div>
                    <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200">
                        <strong class="text-red-700 block mb-1">Bước 3: Nhập File SQL</strong>
                        Chọn tab <strong>Import</strong> &bull; Chọn file <code>quan_ly_sinh_vien.sql</code> &bull; Bấm <strong>Import</strong>. CSDL sẽ được tạo và nạp dữ liệu tức thì!
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 7. Finance & Tuition Tab
function renderAdminFinanceTab(mainZone) {
    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Quản Lý Thu Học Phí & Đối Soát Ngân Hàng</h2>
                    <p class="text-xs text-slate-400">Học kỳ 1 Năm học 2025 - 2026 &bull; Cổng thanh toán VietQR Napas247</p>
                </div>
                <button onclick="showToast('Đã gửi thông báo nhắc học phí đến các tài khoản còn nợ!', 'info')" class="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-md">
                    Gửi thông báo nhắc học phí
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 text-center">
                    <span class="text-xs text-slate-400">Tổng thu dự kiến HK1</span>
                    <div class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">24,327,500,000 đ</div>
                </div>
                <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 text-center">
                    <span class="text-xs text-slate-400">Đã thu thực tế</span>
                    <div class="text-2xl font-extrabold text-emerald-600 mt-1">22,916,505,000 đ (94.2%)</div>
                </div>
                <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 text-center">
                    <span class="text-xs text-slate-400">Còn nợ học phí</span>
                    <div class="text-2xl font-extrabold text-red-600 mt-1">1,410,995,000 đ</div>
                </div>
            </div>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Mã SV</th>
                            <th>Họ và tên</th>
                            <th>Lớp</th>
                            <th>Học phí HK1</th>
                            <th>Đã thanh toán</th>
                            <th>Tình trạng</th>
                            <th class="text-right">Biên lai</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => `
                            <tr>
                                <td class="font-bold text-red-700">${s.studentId}</td>
                                <td class="font-bold text-slate-800 dark:text-white">${s.fullName}</td>
                                <td>${s.class}</td>
                                <td>${s.tuition?.total ? s.tuition.total.toLocaleString('vi-VN') + ' đ' : '18,500,000 đ'}</td>
                                <td class="font-bold text-emerald-600">${s.tuition?.paid ? s.tuition.paid.toLocaleString('vi-VN') + ' đ' : '18,500,000 đ'}</td>
                                <td><span class="badge ${s.tuition?.status === 'Đã đóng' ? 'badge-success' : 'badge-danger'} font-bold">${s.tuition?.status || 'Đã đóng'}</span></td>
                                <td class="text-right">
                                    <button onclick="showToast('Đã xuất biên lai thu tiền điện tử cho sinh viên ${s.fullName}', 'success')" class="px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200">
                                        Xuất biên lai
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// =========================================================================
// STUDENT PORTAL MODULES (7 RICH TABS)
// =========================================================================

// =========================================================================
// TEACHER & HOMEROOM PORTAL MODULES (GIẢNG VIÊN & CỐ VẤN CHỦ NHIỆM)
// =========================================================================

function switchTeacherTab(tab) {
    currentTeacherTab = tab;
    soundFX.click();

    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-emerald-700', 'text-white', 'shadow-md');
        el.classList.add('text-slate-300', 'hover:bg-white/10');
    });

    const activeNav = document.getElementById(`tnav-${tab}`);
    if (activeNav) {
        activeNav.classList.remove('text-slate-300', 'hover:bg-white/10');
        activeNav.classList.add('bg-emerald-700', 'text-white', 'shadow-md');
    }

    renderTeacherPortalView();
}

function getTeacherHomeroomStudents() {
    if (!currentUser) return [];
    const hmCode = currentUser.homeroomClass || 'IT1-01-K68';
    return students.filter(s => {
        if (!s.class) return false;
        return s.class === hmCode || 
               s.class.includes(hmCode) || 
               (s.classId && s.classId === hmCode) ||
               s.class.includes('KHMT 01');
    });
}

function renderTeacherPortalView() {
    const mainZone = document.getElementById('main-content-zone');
    if (!mainZone) return;

    if (currentTeacherTab === 'grades') {
        renderTeacherGradesTab(mainZone);
        return;
    }
    if (currentTeacherTab === 'teaching') {
        renderTeacherScheduleTab(mainZone);
        return;
    }
    if (currentTeacherTab === 'notices') {
        renderTeacherNoticesTab(mainZone);
        return;
    }

    // Default: Homeroom tab
    renderTeacherHomeroomTab(mainZone);
}

let selectedTeacherGradeSubject = 'Giải tích 1';

function renderTeacherHomeroomTab(mainZone) {
    const homeroomStudents = getTeacherHomeroomStudents();
    const homeroomCode = currentUser.homeroomClass || 'IT1-01-K68';
    const homeroomName = currentUser.homeroomClassName || 'Khoa học Máy tính 01 - K68';
    const currentClassObj = classes.find(c => c.code === homeroomCode) || { room: 'P.402 - Nhà B1', totalStudents: 340 };

    const avgGpa = homeroomStudents.length > 0
        ? (homeroomStudents.reduce((acc, s) => acc + (s.gpa || 0), 0) / homeroomStudents.length).toFixed(2)
        : '8.34';
    const avgDrl = homeroomStudents.length > 0
        ? Math.round(homeroomStudents.reduce((acc, s) => acc + (s.drl || 0), 0) / homeroomStudents.length)
        : 88;

    mainZone.innerHTML = `
        <div class="space-y-6">
            <!-- Homeroom Header Banner -->
            <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white p-7 shadow-xl shadow-emerald-950/20">
                <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-emerald-300 mb-2">
                            <span>👨‍🏫 Cố Vấn Học Tập / Giáo Viên Chủ Nhiệm</span>
                        </div>
                        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Lớp Chủ Nhiệm: ${homeroomName} (${homeroomCode})
                        </h1>
                        <p class="text-emerald-100 text-xs mt-1.5 max-w-xl">
                            Cố vấn: <strong>${currentUser.fullName}</strong> &bull; Phòng sinh hoạt: <strong>${currentClassObj.room || 'P.402 - Nhà B1'}</strong>.
                        </p>
                    </div>

                    <div class="flex items-center gap-3">
                        <button onclick="switchTeacherTab('grades')" class="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold shadow-lg flex items-center gap-2 transition transform active:scale-95">
                            <span>📊</span> Nhập Điểm Lớp
                        </button>
                        <button onclick="showToast('Đã gửi thông báo nhắc nhở tới toàn bộ sinh viên lớp chủ nhiệm!', 'success')" class="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 border border-white/25 text-white text-xs font-bold backdrop-blur-md transition">
                            <span>📢</span> Gửi Thông Báo Lớp
                        </button>
                    </div>
                </div>
            </div>

            <!-- Permission Security Notice -->
            <div class="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                <span class="text-lg">🔒</span>
                <div>
                    <strong class="font-bold">Phân Quyền Giảng Viên Chủ Nhiệm Nghiêm Ngặt:</strong>
                    <p class="mt-0.5 opacity-90">Hệ thống phân quyền đảm bảo bạn chỉ xem, quản lý và nhập điểm cho các sinh viên thuộc lớp bạn đang phụ trách (${homeroomCode}). Hồ sơ của các lớp khác được bảo mật tuyệt đối.</p>
                </div>
            </div>

            <!-- 4 Metrics for Homeroom -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="stat-card p-4">
                    <span class="text-xs text-slate-400 font-medium">Sĩ số lớp quản lý</span>
                    <div class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">${homeroomStudents.length} SV</div>
                    <div class="text-[11px] text-emerald-600 font-bold mt-1">Đang hoạt động đầy đủ</div>
                </div>
                <div class="stat-card p-4">
                    <span class="text-xs text-slate-400 font-medium">GPA trung bình lớp</span>
                    <div class="text-2xl font-extrabold text-emerald-700 mt-1">${avgGpa} / 10</div>
                    <div class="text-[11px] text-emerald-600 font-bold mt-1">Xếp loại: Giỏi</div>
                </div>
                <div class="stat-card p-4">
                    <span class="text-xs text-slate-400 font-medium">Điểm rèn luyện TB</span>
                    <div class="text-2xl font-extrabold text-amber-600 mt-1">${avgDrl} / 100</div>
                    <div class="text-[11px] text-slate-500 font-medium mt-1">Hạnh kiểm Tốt</div>
                </div>
                <div class="stat-card p-4">
                    <span class="text-xs text-slate-400 font-medium">Đạt học bổng KKHT</span>
                    <div class="text-2xl font-extrabold text-red-700 mt-1">${homeroomStudents.filter(s => s.scholarship && s.scholarship !== 'Không').length} SV</div>
                    <div class="text-[11px] text-emerald-600 font-bold mt-1">Kỳ 1 năm học 2025-2026</div>
                </div>
            </div>

            <!-- Homeroom Students List Table -->
            <div class="data-table-container">
                <div class="p-5 flex justify-between items-center border-b border-slate-200">
                    <div>
                        <h3 class="font-bold text-base text-slate-800 dark:text-white">Danh Sách Sinh Viên Lớp Chủ Nhiệm (${homeroomCode})</h3>
                        <p class="text-xs text-slate-400">Chỉ hiển thị sinh viên thuộc lớp bạn phụ trách cố vấn</p>
                    </div>
                    <span class="text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-200">
                        ${homeroomStudents.length} Sinh viên
                    </span>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Mã SV</th>
                            <th>Họ và tên</th>
                            <th>Giới tính</th>
                            <th>GPA</th>
                            <th>ĐRL</th>
                            <th>Học bổng</th>
                            <th>Cảnh báo học vụ</th>
                            <th class="text-right pr-6">Thao tác Cố vấn</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${homeroomStudents.map((s, idx) => `
                            <tr>
                                <td>${idx + 1}</td>
                                <td class="font-bold text-red-700">${s.studentId}</td>
                                <td>
                                    <div class="flex items-center gap-3">
                                        <img src="${s.avatar}" class="w-8 h-8 rounded-full object-cover">
                                        <div class="font-bold text-slate-800 dark:text-white text-xs">${s.fullName}</div>
                                    </div>
                                </td>
                                <td>${s.gender}</td>
                                <td class="font-extrabold text-red-700">${s.gpa.toFixed(2)}</td>
                                <td><span class="font-bold text-emerald-700">${s.drl}</span> / 100</td>
                                <td><span class="badge ${s.scholarship !== 'Không' ? 'badge-success' : 'badge-neutral'} font-semibold">${s.scholarship || 'Không'}</span></td>
                                <td><span class="badge ${s.academicWarning?.includes('Cảnh báo') ? 'badge-danger' : 'badge-success'}">${s.academicWarning || 'Bình thường'}</span></td>
                                <td class="text-right pr-6">
                                    <div class="flex items-center justify-end gap-1.5">
                                        <button onclick="viewStudentDetailsModal('${s.studentId}')" title="Xem hồ sơ" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition">
                                            👁️ Hồ sơ
                                        </button>
                                        <button onclick="updateStudentDrl('${s.studentId}')" title="Đánh giá ĐRL" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition">
                                            ⭐ ĐRL
                                        </button>
                                        <button onclick="openGradeModal('${s.studentId}', 'Giải tích 1')" title="Nhập điểm" class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition">
                                            📊 Điểm
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderTeacherGradesTab(mainZone) {
    const homeroomStudents = getTeacherHomeroomStudents();
    const homeroomCode = currentUser.homeroomClass || 'IT1-01-K68';
    const subjects = ['Giải tích 1', 'Đại số tuyến tính', 'Cấu trúc dữ liệu & Thuật toán', 'Lập trình Hướng đối tượng', 'Kiến trúc Máy tính', 'Tiếng Anh chuyên ngành'];

    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Nhập & Sửa Điểm Sinh Viên Lớp Chủ Nhiệm (${homeroomCode})</h2>
                    <p class="text-xs text-slate-400">Thầy/Cô nhập điểm thành phần và hệ thống sẽ tự động tính điểm tổng kết & điểm chữ</p>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs font-bold text-slate-600 dark:text-slate-300">Chọn môn học:</span>
                    <select onchange="changeTeacherGradeSubject(this.value)" class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700 text-xs">
                        ${subjects.map(sub => `<option value="${sub}" ${sub === selectedTeacherGradeSubject ? 'selected' : ''}>${sub}</option>`).join('')}
                    </select>
                </div>
            </div>

            <!-- Grade Table for homeroom class -->
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Mã SV</th>
                            <th>Họ và tên</th>
                            <th>Chuyên cần (10%)</th>
                            <th>Giữa kỳ (30%)</th>
                            <th>Cuối kỳ (60%)</th>
                            <th>Tổng kết (Hệ 10)</th>
                            <th>Điểm chữ</th>
                            <th>Hệ 4</th>
                            <th>Kết quả</th>
                            <th class="text-right pr-6">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${homeroomStudents.map((s, idx) => {
                            const sub = s.subjects?.[selectedTeacherGradeSubject] || { cc: 9.0, gk: 8.0, ck: 8.0, total: 8.1, letter: 'B+' };
                            const isPass = sub.total >= 4.0;
                            const gpa4 = sub.letter?.startsWith('A') ? 4.0 : (sub.letter?.startsWith('B') ? 3.0 : (sub.letter?.startsWith('C') ? 2.0 : (sub.letter?.startsWith('D') ? 1.0 : 0.0)));
                            return `
                                <tr>
                                    <td>${idx + 1}</td>
                                    <td class="font-bold text-red-700">${s.studentId}</td>
                                    <td class="font-bold text-slate-800 dark:text-white">${s.fullName}</td>
                                    <td class="font-semibold text-slate-700 text-center">${sub.cc !== undefined ? sub.cc : 9.0}</td>
                                    <td class="font-semibold text-slate-700 text-center">${sub.gk !== undefined ? sub.gk : 8.0}</td>
                                    <td class="font-semibold text-slate-700 text-center">${sub.ck !== undefined ? sub.ck : 8.0}</td>
                                    <td class="font-extrabold text-emerald-700 text-center text-sm">${sub.total ? sub.total.toFixed(1) : '8.1'}</td>
                                    <td class="text-center"><span class="px-2.5 py-0.5 rounded font-extrabold text-xs ${sub.letter?.startsWith('A') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}">${sub.letter || 'B+'}</span></td>
                                    <td class="text-center font-bold text-slate-700">${gpa4.toFixed(1)}</td>
                                    <td><span class="badge ${isPass ? 'badge-success' : 'badge-danger'} font-bold">${isPass ? 'Đạt' : 'Học lại'}</span></td>
                                    <td class="text-right pr-6">
                                        <button onclick="openGradeModal('${s.studentId}', '${selectedTeacherGradeSubject}')" 
                                                class="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs transition">
                                            ✏️ Nhập / Sửa điểm
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function changeTeacherGradeSubject(sub) {
    selectedTeacherGradeSubject = sub;
    renderTeacherPortalView();
}

function renderTeacherScheduleTab(mainZone) {
    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Lịch Giảng Dạy & Sinh Hoạt Của Thầy/Cô</h2>
                    <p class="text-xs text-slate-400">Giảng viên: ${currentUser.fullName} &bull; Học kỳ 1 Năm học 2025 - 2026</p>
                </div>
                <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md">
                    🖨️ In Lịch Dạy
                </button>
            </div>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Thứ / Hôm nào</th>
                            <th>Tiết / Khung giờ</th>
                            <th>Mã môn</th>
                            <th>Học phần giảng dạy</th>
                            <th>Lớp học phần</th>
                            <th>Phòng học</th>
                            <th>Sĩ số</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${TEACHER_SCHEDULE.map(item => `
                            <tr>
                                <td><span class="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs">${item.day}</span></td>
                                <td><strong>${item.period}</strong><br><span class="text-[11px] text-slate-400">${item.time}</span></td>
                                <td class="font-bold text-red-700">${item.code}</td>
                                <td class="font-bold text-slate-800 dark:text-white">${item.course}</td>
                                <td><span class="font-semibold text-slate-700">${item.className || item.class}</span></td>
                                <td><span class="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 font-extrabold text-xs">Phòng ${item.room}</span></td>
                                <td class="font-bold text-emerald-600">${item.studentsCount} sinh viên</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderTeacherNoticesTab(mainZone) {
    const homeroomCode = currentUser.homeroomClass || 'IT1-01-K68';
    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Bảng Tin & Thông Báo Lớp Chủ Nhiệm (${homeroomCode})</h2>
                    <p class="text-xs text-slate-400">Đăng thông báo lịch họp lớp, sinh hoạt định kỳ, nhắc nộp học phí và học vụ</p>
                </div>
                <button onclick="showToast('Đã phát hành thông báo mới đến toàn thể sinh viên trong lớp!', 'success')" class="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-md">
                    + Đăng Thông Báo Mới
                </button>
            </div>

            <div class="space-y-4">
                <div class="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 shadow-sm">
                    <div class="flex justify-between items-center mb-2">
                        <span class="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-bold text-xs">Thông báo khẩn</span>
                        <span class="text-xs text-slate-400">Hôm nay, 08:30</span>
                    </div>
                    <h4 class="font-bold text-sm text-slate-800 dark:text-white">Nhắc nhở hoàn thành nộp học phí HK1 và kiểm tra lịch thi</h4>
                    <p class="text-xs text-slate-500 mt-1">Cố vấn học tập nhắc nhở các bạn sinh viên kiểm tra lại tình trạng nộp học phí trước ngày 30/10 để đảm bảo đủ điều kiện dự thi kết thúc học phần.</p>
                </div>
                <div class="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 shadow-sm">
                    <div class="flex justify-between items-center mb-2">
                        <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs">Sinh hoạt lớp</span>
                        <span class="text-xs text-slate-400">22/10/2026</span>
                    </div>
                    <h4 class="font-bold text-sm text-slate-800 dark:text-white">Lịch họp định kỳ lớp chủ nhiệm tháng 10</h4>
                    <p class="text-xs text-slate-500 mt-1">Địa điểm: Phòng P.402 Nhà B1 &bull; Thời gian: Thứ Bảy, 08h00 &bull; Nội dung: Đánh giá điểm rèn luyện và xét học bổng khuyến khích học tập.</p>
                </div>
            </div>
        </div>
    `;
}

function updateStudentDrl(studentId) {
    const student = students.find(s => s.studentId === studentId);
    if (!student) return;
    const newDrl = prompt(`Nhập Điểm Rèn Luyện (ĐRL) mới cho sinh viên ${student.fullName} (0 - 100):`, student.drl);
    if (newDrl !== null && !isNaN(newDrl)) {
        student.drl = Math.max(0, Math.min(100, parseInt(newDrl)));
        saveStudents();
        soundFX.success();
        showToast(`Đã cập nhật ĐRL của ${student.fullName} thành: ${student.drl}`, 'success');
        renderTeacherPortalView();
    }
}

function viewStudentDetailsModal(studentId) {
    const s = students.find(item => item.studentId === studentId);
    if (!s) return;
    document.getElementById('view-fullname').textContent = s.fullName;
    document.getElementById('view-studentid').textContent = s.studentId;
    document.getElementById('view-avatar').src = s.avatar;
    document.getElementById('view-gender').textContent = s.gender;
    document.getElementById('view-dob').textContent = s.dob;
    document.getElementById('view-class').textContent = s.class;
    document.getElementById('view-major').textContent = s.major;
    document.getElementById('view-status').textContent = s.status;
    document.getElementById('view-email').textContent = s.email;
    document.getElementById('view-phone').textContent = s.phone;
    document.getElementById('view-address').textContent = s.address;
    document.getElementById('view-gpa').textContent = s.gpa.toFixed(2);
    document.getElementById('view-gpa4').textContent = s.gpa4.toFixed(2);
    document.getElementById('view-drl').textContent = s.drl;
    document.getElementById('view-scholarship').textContent = s.scholarship;
    openModal('modal-view-student');
}

// =========================================================================
// STUDENT PORTAL MODULES
// =========================================================================

function switchStudentTab(tab) {
    currentStudentTab = tab;
    soundFX.click();

    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-red-700', 'text-white', 'shadow-md');
        el.classList.add('text-slate-300', 'hover:bg-white/10');
    });

    const activeNav = document.getElementById(`snav-${tab}`);
    if (activeNav) {
        activeNav.classList.remove('text-slate-300', 'hover:bg-white/10');
        activeNav.classList.add('bg-red-700', 'text-white', 'shadow-md');
    }

    renderStudentPortalView();
}

function renderStudentPortalView() {
    const mainZone = document.getElementById('main-content-zone');
    if (!mainZone) return;

    if (currentStudentTab === 'timetable') {
        renderStudentTimetableView(mainZone);
        return;
    }
    if (currentStudentTab === 'courses') {
        renderStudentCourseRegView(mainZone);
        return;
    }
    if (currentStudentTab === 'grades') {
        renderStudentGradesView(mainZone);
        return;
    }
    if (currentStudentTab === 'exams') {
        renderStudentExamsView(mainZone);
        return;
    }
    if (currentStudentTab === 'tuition') {
        renderStudentTuitionView(mainZone);
        return;
    }
    if (currentStudentTab === 'services') {
        renderStudentServicesView(mainZone);
        return;
    }

    // Default: Student Hub / Overview (Hologram ID Card & Progress)
    const currentSV = students.find(s => s.studentId === currentUser.studentId) || students[0];
    const completedCredits = currentSV.credits || 58;
    const totalCredits = 156;
    const progressPercent = Math.round((completedCredits / totalCredits) * 100);

    mainZone.innerHTML = `
        <div class="space-y-7 animate-fade-in">
            <!-- Student Header -->
            <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-900 via-red-800 to-amber-800 text-white p-7 shadow-xl shadow-red-950/20">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div class="flex items-center gap-5">
                        <img src="${currentSV.avatar}" class="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/30 shadow-xl">
                        <div>
                            <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-1 border border-amber-400/30">
                                <span>Sinh viên Khóa K68 Bách Khoa</span>
                            </div>
                            <h1 class="text-2xl font-extrabold text-white">${currentSV.fullName}</h1>
                            <div class="text-xs text-slate-200 mt-1">MSSV: <strong class="text-amber-300">${currentSV.studentId}</strong> &bull; Lớp: <strong>${currentSV.class}</strong></div>
                            <div class="text-xs text-slate-300 mt-0.5">Trường Công nghệ Thông tin & Truyền thông - HUST</div>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <button onclick="switchStudentTab('courses')" class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold shadow-lg transition transform active:scale-95">
                            Đăng ký tín chỉ online &rarr;
                        </button>
                        <button onclick="openModal('modal-qr-payment')" class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition">
                            Học phí & VietQR
                        </button>
                    </div>
                </div>
            </div>

            <!-- E-ID Card & Degree Progress -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <!-- E-ID Hologram Card -->
                <div class="lg:col-span-5">
                    <div class="student-id-card">
                        <div class="flex items-center justify-between pb-3 border-b border-white/20 mb-4">
                            <div class="flex items-center gap-2">
                                <svg class="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                <div>
                                    <div class="text-xs font-bold tracking-wider">ĐẠI HỌC BÁCH KHOA HÀ NỘI</div>
                                    <div class="text-[9px] text-amber-200">THẺ SINH VIÊN ĐIỆN TỬ (HUST E-ID)</div>
                                </div>
                            </div>
                            <span class="text-[10px] font-extrabold bg-red-700/80 px-2 py-0.5 rounded-full border border-red-400/30">K68</span>
                        </div>

                        <div class="flex gap-4 items-center">
                            <img src="${currentSV.avatar}" class="w-16 h-20 rounded-xl object-cover ring-2 ring-amber-400 shadow-md">
                            <div class="space-y-1 text-xs">
                                <div class="font-extrabold text-sm text-white">${currentSV.fullName}</div>
                                <div class="text-amber-300 font-bold">MSSV: ${currentSV.studentId}</div>
                                <div class="text-slate-300 text-[11px]">Ngành: Khoa học Máy tính</div>
                                <div class="text-slate-300 text-[11px]">Khóa học: 2023 - 2028</div>
                            </div>
                        </div>

                        <div class="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-300">
                            <span>Trạng thái: <strong class="text-emerald-400">Đang học chính quy</strong></span>
                            <span class="text-amber-300 font-bold">HUST SIS VERIFIED</span>
                        </div>
                    </div>
                </div>

                <!-- Academic Progress -->
                <div class="lg:col-span-7 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 class="font-extrabold text-base text-slate-800 dark:text-white">Tiến độ tích lũy chương trình đào tạo</h3>
                        <p class="text-xs text-slate-400">Chương trình Cử nhân Khoa học Máy tính (IT1)</p>
                        
                        <div class="mt-5">
                            <div class="flex justify-between text-xs font-bold mb-2">
                                <span class="text-slate-700 dark:text-slate-300">Tín chỉ đã hoàn thành: <strong class="text-red-700 dark:text-red-400">${completedCredits} / ${totalCredits} tín chỉ</strong></span>
                                <span class="text-amber-600 font-extrabold">${progressPercent}%</span>
                            </div>
                            <div class="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5">
                                <div class="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-1000" style="width: ${progressPercent}%"></div>
                            </div>
                        </div>

                        <div class="grid grid-cols-3 gap-3 mt-6">
                            <div class="p-3 bg-slate-50 rounded-2xl text-center">
                                <span class="text-[11px] text-slate-400 block font-medium">Điểm GPA (Hệ 10)</span>
                                <span class="text-xl font-extrabold text-red-700">${currentSV.gpa.toFixed(2)}</span>
                            </div>
                            <div class="p-3 bg-slate-50 rounded-2xl text-center">
                                <span class="text-[11px] text-slate-400 block font-medium">Điểm CPA (Hệ 4)</span>
                                <span class="text-xl font-extrabold text-amber-600">${currentSV.gpa4.toFixed(2)}</span>
                            </div>
                            <div class="p-3 bg-slate-50 rounded-2xl text-center">
                                <span class="text-[11px] text-slate-400 block font-medium">Điểm rèn luyện</span>
                                <span class="text-xl font-extrabold text-emerald-600">${currentSV.drl} / 100</span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span class="text-slate-500">Xếp loại học lực: <strong class="text-red-700 font-bold">Giỏi</strong></span>
                        <span class="badge badge-success">Đủ điều kiện nhận học bổng</span>
                    </div>
                </div>
            </div>

            <!-- Urgent Countdown & Highlights -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border border-amber-200 flex items-center justify-between">
                    <div>
                        <span class="text-xs font-bold text-amber-800">Đợt đăng ký tín chỉ kỳ 2 sắp mở:</span>
                        <div class="text-lg font-extrabold text-slate-800 mt-0.5">Đóng cổng sau: 5 ngày 14 giờ</div>
                    </div>
                    <button onclick="switchStudentTab('courses')" class="px-4 py-2 rounded-xl bg-amber-500 text-slate-900 text-xs font-bold shadow-sm">
                        Vào đăng ký
                    </button>
                </div>
                <div class="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-200 flex items-center justify-between">
                    <div>
                        <span class="text-xs font-bold text-blue-800">Lịch thi gần nhất: Kỹ thuật lập trình</span>
                        <div class="text-lg font-extrabold text-slate-800 mt-0.5">15/12/2026 &bull; Phòng D9-201</div>
                    </div>
                    <button onclick="switchStudentTab('exams')" class="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm">
                        Xem lịch thi
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 1. Student Timetable Grid (Chi Tiết: Tiết Nào - Hôm Nào - Phòng Nào - Thầy Cô Nào Dạy)
let selectedStudentTimetableFilter = 'all';

function renderStudentTimetableView(mainZone) {
    const days = [
        { key: 'all', label: 'Tất Cả Tuần' },
        { key: 'Thứ Hai', label: 'Thứ Hai' },
        { key: 'Thứ Ba', label: 'Thứ Ba' },
        { key: 'Thứ Tư', label: 'Thứ Tư' },
        { key: 'Thứ Năm', label: 'Thứ Năm' },
        { key: 'Thứ Sáu', label: 'Thứ Sáu' },
        { key: 'Thứ Bảy', label: 'Thứ Bảy' }
    ];

    let filtered = STUDENT_TIMETABLE;
    if (selectedStudentTimetableFilter !== 'all') {
        filtered = STUDENT_TIMETABLE.filter(t => t.day === selectedStudentTimetableFilter);
    }

    mainZone.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold mb-1.5 border border-red-200">
                        <span>📅 Lịch Học Học Kỳ 1 &bull; Năm Học 2025 - 2026</span>
                    </div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Thời Khóa Biểu Học Tập Sinh Viên Bách Khoa</h2>
                    <p class="text-xs text-slate-400 mt-0.5">Tra cứu chi tiết từng buổi học: Tiết nào, Thứ mấy (Hôm nào), Phòng nào, Thầy cô nào dạy</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition">
                        <span>🖨️</span> In Thời Khóa Biểu
                    </button>
                </div>
            </div>

            <!-- Day Selector Filter Bar -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1">
                ${days.map(d => `
                    <button onclick="changeStudentTimetableFilter('${d.key}')" 
                            class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedStudentTimetableFilter === d.key ? 'bg-red-700 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 hover:bg-slate-50'}">
                        ${d.label}
                    </button>
                `).join('')}
            </div>

            <!-- Main Timetable Data Table with 4 Core Highlighted Columns -->
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="w-32">📅 Hôm Nào</th>
                            <th class="w-48">⏰ Tiết Nào & Giờ Học</th>
                            <th class="w-40">🏛️ Phòng Nào</th>
                            <th>👨‍🏫 Thầy Cô Nào Dạy</th>
                            <th>📚 Học Phần & Mã HP</th>
                            <th class="text-right pr-6">Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(t => `
                            <tr class="hover:bg-red-50/40 transition">
                                <td>
                                    <span class="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 font-extrabold text-xs border border-red-200 inline-block shadow-sm">
                                        ${t.day}
                                    </span>
                                </td>
                                <td>
                                    <div class="font-extrabold text-red-700 text-xs">${t.period || 'Tiết 1-3'}</div>
                                    <div class="text-[11px] text-slate-500 font-semibold mt-0.5">${t.time}</div>
                                </td>
                                <td>
                                    <span class="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 font-extrabold text-xs border border-amber-200 inline-block shadow-sm">
                                        📍 Phòng ${t.room}
                                    </span>
                                </td>
                                <td>
                                    <div class="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-2">
                                        <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs shadow-inner">👨‍🏫</div>
                                        <div>
                                            <div class="font-bold text-slate-800 dark:text-white">${t.teacher}</div>
                                            <div class="text-[10px] text-slate-400">Giảng viên bộ môn</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="font-bold text-slate-800 dark:text-white text-xs">${t.course}</div>
                                    <div class="text-[11px] text-red-600 font-semibold mt-0.5">${t.code} &bull; ${t.credits || 3} Tín chỉ</div>
                                </td>
                                <td class="text-right pr-6">
                                    <span class="badge badge-success font-bold text-xs">Lên lớp trực tiếp</span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Card Grid View for Visual Experience -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                ${filtered.map(t => `
                    <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
                        <div class="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
                            <span class="text-xs font-extrabold text-red-700 bg-red-50 px-3 py-1 rounded-xl border border-red-200">
                                📅 ${t.day}
                            </span>
                            <span class="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">📍 Phòng ${t.room}</span>
                        </div>
                        <h3 class="font-extrabold text-sm text-slate-800 dark:text-white">${t.course}</h3>
                        <div class="text-xs text-red-600 font-semibold mt-0.5">${t.code} &bull; ${t.credits || 3} Tín chỉ</div>
                        <div class="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                            <div class="flex justify-between">
                                <span class="text-slate-400 font-medium">⏰ Tiết học:</span>
                                <strong class="text-red-700">${t.period || 'Tiết 1-3'} (${t.time})</strong>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-400 font-medium">👨‍🏫 Giảng viên:</span>
                                <strong class="text-slate-800 dark:text-white">${t.teacher}</strong>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function changeStudentTimetableFilter(filterKey) {
    selectedStudentTimetableFilter = filterKey;
    const mainZone = document.getElementById('main-content-zone');
    if (mainZone) renderStudentTimetableView(mainZone);
}

// 2. Student Course Registration with Conflict Detection
function renderStudentCourseRegView(mainZone) {
    const selectedList = availableCourses.filter(c => c.selected);
    const selectedCount = selectedList.length;
    const totalCredits = selectedList.reduce((acc, c) => acc + c.credits, 0);
    const totalTuition = selectedList.reduce((acc, c) => acc + c.tuition, 0);

    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Cổng Đăng Ký Học Phần Trực Tuyến HUST</h2>
                    <p class="text-xs text-slate-400">Đợt 2: Học kỳ 1 Năm học 2025 - 2026 &bull; Hạn đăng ký: 30/10/2026</p>
                </div>
                <div class="flex items-center gap-3">
                    <div class="px-4 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-extrabold border border-red-200">
                        Đã chọn: ${selectedCount} môn (${totalCredits} tín chỉ)
                    </div>
                    <button onclick="confirmRegistration()" class="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-md">
                        Xác nhận lưu đăng ký
                    </button>
                </div>
            </div>

            <!-- Table of courses -->
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Mã môn</th>
                            <th>Tên học phần</th>
                            <th>Tín chỉ</th>
                            <th>Thời gian & Phòng học</th>
                            <th>Giảng viên</th>
                            <th>Chỗ còn lại</th>
                            <th>Học phí</th>
                            <th class="text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${availableCourses.map(c => `
                            <tr>
                                <td class="font-bold text-red-700">${c.id}</td>
                                <td>
                                    <div class="font-bold text-slate-800 dark:text-white text-xs">${c.name}</div>
                                    <span class="text-[10px] text-slate-400">${c.category}</span>
                                </td>
                                <td class="font-bold text-slate-700">${c.credits} TC</td>
                                <td class="text-xs text-slate-600">${c.schedule} &bull; <strong class="text-slate-800">${c.classRoom}</strong></td>
                                <td class="text-xs text-slate-600">${c.lecturer}</td>
                                <td><span class="text-xs font-bold ${c.seatsAvailable > 5 ? 'text-emerald-600' : 'text-amber-600'}">${c.seatsAvailable} / ${c.maxSeats}</span></td>
                                <td class="text-xs font-bold text-slate-700">${c.tuition.toLocaleString('vi-VN')} đ</td>
                                <td class="text-right">
                                    ${c.selected ? `
                                        <button onclick="toggleCourseSelect('${c.id}')" class="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold hover:bg-red-100 hover:text-red-700 transition">
                                            ✓ Đã chọn (Hủy)
                                        </button>
                                    ` : `
                                        <button onclick="toggleCourseSelect('${c.id}')" class="px-3 py-1 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm">
                                            + Đăng ký ngay
                                        </button>
                                    `}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex justify-between items-center text-xs">
                <span class="text-amber-800 font-semibold">Tổng học phí tạm tính theo ${totalCredits} tín chỉ đã chọn:</span>
                <span class="text-base font-extrabold text-red-700">${totalTuition.toLocaleString('vi-VN')} VNĐ</span>
            </div>
        </div>
    `;
}

function toggleCourseSelect(courseId) {
    const course = availableCourses.find(c => c.id === courseId);
    if (!course) return;

    if (!course.selected) {
        // Conflict detection: Check if any already-selected course shares same schedule
        const conflict = availableCourses.find(c => c.selected && c.schedule === course.schedule);
        if (conflict) {
            soundFX.delete();
            showToast(`Trùng lịch học với môn: ${conflict.name} (${conflict.schedule})! Vui lòng chọn ca học khác.`, 'error');
            return;
        }
        course.selected = true;
        course.seatsAvailable = Math.max(0, course.seatsAvailable - 1);
        soundFX.success();
        showToast(`Đã thêm môn: ${course.name} vào giỏ tín chỉ!`, 'success');
    } else {
        course.selected = false;
        course.seatsAvailable += 1;
        soundFX.delete();
        showToast(`Đã hủy học phần: ${course.name}`, 'info');
    }

    saveCourses();
    renderStudentCourseRegView(document.getElementById('main-content-zone'));
}

function confirmRegistration() {
    soundFX.success();
    showToast('Thời khóa biểu & Phiếu đăng ký tín chỉ của bạn đã được cập nhật!', 'success');
}

// 3. Student Grades Tab
function renderStudentGradesView(mainZone) {
    const currentSV = students.find(s => s.studentId === currentUser.studentId) || students[0];
    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Bảng Điểm Học Tập Chi Tiết</h2>
                    <p class="text-xs text-slate-400">Sinh viên: ${currentSV.fullName} &bull; MSSV: ${currentSV.studentId}</p>
                </div>
                <div class="text-right">
                    <span class="text-xs text-slate-400">Điểm trung bình tích lũy:</span>
                    <div class="text-2xl font-extrabold text-red-700">${currentSV.gpa.toFixed(2)} / 10 &bull; CPA: ${currentSV.gpa4.toFixed(2)} / 4.0</div>
                </div>
            </div>

            <!-- Grades Breakdown -->
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Tên học phần</th>
                            <th>Tín chỉ</th>
                            <th>Chuyên cần (10%)</th>
                            <th>Giữa kỳ (30%)</th>
                            <th>Cuối kỳ (60%)</th>
                            <th>Tổng kết (Hệ 10)</th>
                            <th>Điểm chữ</th>
                            <th>Kết quả</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(currentSV.subjects || {}).map(([subject, data]) => {
                            const sub = typeof data === 'object' ? data : { cc: 9, gk: 8, ck: Number(data), total: Number(data), credits: 3, letter: 'A' };
                            return `
                                <tr>
                                    <td class="font-bold text-slate-800 dark:text-white text-xs">${subject}</td>
                                    <td class="text-slate-500">${sub.credits || 3} TC</td>
                                    <td class="font-semibold text-slate-700">${sub.cc || 9.0}</td>
                                    <td class="font-semibold text-slate-700">${sub.gk || 8.5}</td>
                                    <td class="font-semibold text-slate-700">${sub.ck || 8.5}</td>
                                    <td class="font-bold text-red-700 text-sm">${sub.total ? sub.total.toFixed(1) : '8.5'}</td>
                                    <td><span class="px-2 py-0.5 rounded font-extrabold text-xs ${sub.letter?.startsWith('A') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}">${sub.letter || 'A'}</span></td>
                                    <td><span class="badge badge-success">Đạt</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 4. Student Exams Schedule Tab
function renderStudentExamsView(mainZone) {
    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Lịch Thi Kết Thúc Học Phần Kỳ 1</h2>
                    <p class="text-xs text-slate-400">Số báo danh và phòng thi chính thức của bạn</p>
                </div>
                <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md">
                    🖨️ In lịch thi
                </button>
            </div>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Mã môn</th>
                            <th>Tên học phần</th>
                            <th>Ngày thi</th>
                            <th>Giờ thi</th>
                            <th>Phòng thi</th>
                            <th>Số báo danh</th>
                            <th>Hình thức</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${EXAM_SCHEDULE.map(ex => `
                            <tr>
                                <td class="font-bold text-red-700">${ex.code}</td>
                                <td class="font-bold text-slate-800 dark:text-white text-xs">${ex.name}</td>
                                <td class="font-semibold text-slate-700">${ex.date}</td>
                                <td>${ex.time}</td>
                                <td><span class="px-2 py-0.5 rounded bg-red-50 text-red-700 font-bold text-xs">${ex.room}</span></td>
                                <td class="font-bold text-blue-600">${ex.sbd}</td>
                                <td class="text-xs text-slate-500">${ex.type}</td>
                                <td><span class="badge badge-success font-bold">${ex.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 5. Student Tuition View
function renderStudentTuitionView(mainZone) {
    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Tra Cứu Học Phí & Cổng Thanh Toán VietQR</h2>
                    <p class="text-xs text-slate-400">Tự động kết nối Napas247 &bull; Không mất phí giao dịch</p>
                </div>
                <button onclick="openModal('modal-qr-payment')" class="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-lg flex items-center gap-2">
                    <span>📱</span> Quét mã VietQR nộp học phí
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div class="p-5 bg-white rounded-3xl border border-slate-200 text-center">
                    <span class="text-xs text-slate-400">Tổng học phí HK1 (18 TC)</span>
                    <div class="text-2xl font-extrabold text-slate-800 mt-1">18,500,000 đ</div>
                </div>
                <div class="p-5 bg-white rounded-3xl border border-slate-200 text-center">
                    <span class="text-xs text-slate-400">Đã thanh toán</span>
                    <div class="text-2xl font-extrabold text-emerald-600 mt-1">18,500,000 đ</div>
                </div>
                <div class="p-5 bg-white rounded-3xl border border-slate-200 text-center">
                    <span class="text-xs text-slate-400">Dư nợ còn lại</span>
                    <div class="text-2xl font-extrabold text-slate-400 mt-1">0 đ</div>
                </div>
            </div>

            <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center text-xs">
                <span class="text-emerald-800 font-semibold">Tình trạng tài chính: <strong>Học phí học kỳ 1 của bạn đã hoàn tất 100%!</strong></span>
                <button onclick="showToast('Đang tải biên lai nộp tiền điện tử PDF...', 'success')" class="px-3 py-1 bg-white text-emerald-700 font-bold rounded-lg border border-emerald-300">
                    Tải biên lai PDF
                </button>
            </div>
        </div>
    `;
}

// 6. Student One-Stop Services (Dịch vụ Một Cửa)
function renderStudentServicesView(mainZone) {
    mainZone.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">Dịch Vụ Một Cửa Sinh Viên HUST</h2>
                    <p class="text-xs text-slate-400">Đăng ký cấp giấy tờ, bảng điểm, hoãn thi trực tuyến không cần xếp hàng</p>
                </div>
                <button onclick="openModal('modal-service-request')" class="px-4 py-2 rounded-xl bg-red-700 text-white text-xs font-bold shadow-md">
                    + Tạo yêu cầu cấp giấy tờ
                </button>
            </div>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Mã yêu cầu</th>
                            <th>Nội dung giấy tờ</th>
                            <th>Ngày gửi</th>
                            <th>Trạng thái xử lý</th>
                            <th>Nơi nhận / Hẹn trả</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentRequests.map(r => `
                            <tr>
                                <td class="font-bold text-red-700">${r.id}</td>
                                <td class="font-semibold text-slate-800 dark:text-white text-xs">${r.title}</td>
                                <td class="text-slate-500">${r.date}</td>
                                <td><span class="badge ${r.status === 'Đã ký duyệt' ? 'badge-success' : 'badge-warning'} font-bold">${r.status}</span></td>
                                <td class="text-xs text-slate-600 font-medium">${r.pickup}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function submitStudentRequest() {
    const type = document.getElementById('req-service-type').value;
    const newReq = {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        title: type,
        date: new Date().toLocaleDateString('vi-VN'),
        status: 'Đang xử lý',
        pickup: 'Dự kiến: 3 ngày làm việc tại Bàn 1 Tòa nhà C1'
    };
    studentRequests.unshift(newReq);
    closeModal('modal-service-request');
    soundFX.success();
    showToast('Đã gửi yêu cầu cấp giấy tờ trực tuyến thành công!', 'success');
    renderStudentServicesView(document.getElementById('main-content-zone'));
}

function confirmSimulatedPayment() {
    closeModal('modal-qr-payment');
    soundFX.success();
    showToast('Thanh toán học phí thành công qua VietQR! Biên lai điện tử đã cập nhật.', 'success');
}

// =========================================================================
// Student Data Table & CRUD (Admin mode)
// =========================================================================

function getFilteredStudents() {
    return students.filter(student => {
        const matchesSearch = 
            student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.class.toLowerCase().includes(searchQuery.toLowerCase());
            
        const matchesClass = filterClass ? student.class === filterClass : true;
        const matchesStatus = filterStatus ? student.status === filterStatus : true;

        return matchesSearch && matchesClass && matchesStatus;
    }).sort((a, b) => sortDirection === 'desc' ? b.gpa - a.gpa : a.gpa - b.gpa);
}

function renderStudentTable() {
    const tbody = document.getElementById('student-table-body');
    if (!tbody) return;

    const filtered = getFilteredStudents();
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    if (paginatedItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-10 text-slate-400 text-xs">Không tìm thấy sinh viên nào.</td></tr>`;
        return;
    }

    tbody.innerHTML = paginatedItems.map((sv, index) => {
        const rowIndex = startIndex + index + 1;
        const statusBadge = sv.status === 'Đang học'
            ? `<span class="badge badge-success">${sv.status}</span>`
            : `<span class="badge badge-warning">${sv.status}</span>`;

        return `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="text-center text-slate-400 text-xs">${rowIndex}</td>
                <td class="font-bold text-red-700 dark:text-red-400 text-xs">${sv.studentId}</td>
                <td>
                    <div class="flex items-center gap-2.5">
                        <img src="${sv.avatar}" class="w-8 h-8 rounded-full object-cover">
                        <div>
                            <div class="font-bold text-slate-800 dark:text-white text-xs">${sv.fullName}</div>
                            <div class="text-[10px] text-slate-400">${sv.email}</div>
                        </div>
                    </div>
                </td>
                <td><span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">${sv.class}</span></td>
                <td><span class="font-bold text-red-700 text-sm">${sv.gpa.toFixed(2)}</span></td>
                <td><span class="font-bold text-blue-600 text-xs">${sv.drl} / 100</span></td>
                <td><span class="text-xs ${sv.scholarship !== 'Không' ? 'font-bold text-emerald-600' : 'text-slate-400'}">${sv.scholarship}</span></td>
                <td>${statusBadge}</td>
                <td class="text-right pr-6">
                    <div class="inline-flex gap-1.5">
                        <button onclick="viewStudentDetails(${sv.id})" class="action-btn action-btn-view" title="Xem chi tiết">👁️</button>
                        <button onclick="openEditStudentModal(${sv.id})" class="action-btn action-btn-edit" title="Chỉnh sửa">✏️</button>
                        <button onclick="promptDeleteStudent(${sv.id})" class="action-btn action-btn-delete" title="Xóa">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    const infoEl = document.getElementById('table-pagination-info');
    if (infoEl) {
        const from = totalItems > 0 ? startIndex + 1 : 0;
        const to = Math.min(startIndex + pageSize, totalItems);
        infoEl.innerHTML = `Hiển thị <strong>${from} - ${to}</strong> trong tổng số <strong>${totalItems}</strong> sinh viên K68`;
    }

    renderPaginationButtons(totalPages);
}

function renderPaginationButtons(totalPages) {
    const container = document.getElementById('pagination-buttons');
    if (!container) return;

    let html = `
        <button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="px-2 py-1 rounded border text-xs text-slate-600 disabled:opacity-40">&larr;</button>
    `;
    for (let i = 1; i <= totalPages; i++) {
        const active = i === currentPage ? 'bg-red-700 text-white font-bold' : 'text-slate-600 hover:bg-slate-100';
        html += `<button onclick="goToPage(${i})" class="w-7 h-7 rounded text-xs font-semibold ${active}">${i}</button>`;
    }
    html += `
        <button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="px-2 py-1 rounded border text-xs text-slate-600 disabled:opacity-40">&rarr;</button>
    `;
    container.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderStudentTable();
    soundFX.click();
}

function applyFilters() {
    searchQuery = document.getElementById('table-search')?.value.trim() || '';
    filterClass = document.getElementById('filter-class')?.value || '';
    filterStatus = document.getElementById('filter-status')?.value || '';
    currentPage = 1;
    renderStudentTable();
}

function handleGlobalSearch(val) {
    searchQuery = val.trim();
    const tableSearch = document.getElementById('table-search');
    if (tableSearch) tableSearch.value = searchQuery;
    currentPage = 1;
    if (currentUser?.role === 'Quản trị viên') renderStudentTable();
}

function updateStatCounts() {
    const badge = document.getElementById('badge-total-students');
    if (badge) badge.textContent = students.length;
}

// =========================================================================
// Modals & Handlers
// =========================================================================

function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('active'), 10);
    soundFX.click();
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => modal.classList.add('hidden'), 200);
}

function openAddStudentModal() {
    const nextCode = `2023${String(students.length + 1).padStart(4, '0')}`;
    document.getElementById('add-id').value = nextCode;
    document.getElementById('add-fullname').value = '';
    openModal('modal-add-student');
}

function handleAddStudentSubmit(e) {
    e.preventDefault();
    const studentId = document.getElementById('add-id').value.trim();
    const fullName = document.getElementById('add-fullname').value.trim();
    const studentClass = document.getElementById('add-class').value;
    const gender = document.getElementById('add-gender').value;
    const gpa = parseFloat(document.getElementById('add-gpa').value) || 8.0;
    const drl = parseInt(document.getElementById('add-drl').value) || 85;

    const newSV = {
        id: Date.now(),
        studentId,
        fullName,
        class: studentClass,
        gender,
        gpa,
        gpa4: Number((gpa * 0.4).toFixed(2)),
        drl,
        academicWarning: 'Bình thường',
        scholarship: gpa >= 9.0 ? 'Học bổng Loại A' : (gpa >= 8.0 ? 'Học bổng Loại B' : 'Không'),
        status: 'Đang học',
        email: `${fullName.toLowerCase().replace(/\s+/g, '')}${studentId}@sis.hust.edu.vn`,
        phone: '0988 123 456',
        avatar: gender === 'Nữ' 
            ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
            : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
        subjects: {
            'Giải tích 1': { total: gpa, credits: 4, letter: 'A' },
            'Đại số tuyến tính': { total: gpa, credits: 3, letter: 'A' },
            'Cấu trúc dữ liệu & Thuật toán': { total: gpa, credits: 3, letter: 'A' },
            'Lập trình Hướng đối tượng': { total: gpa, credits: 3, letter: 'A' },
            'Kiến trúc Máy tính': { total: gpa, credits: 3, letter: 'A' }
        }
    };

    students.unshift(newSV);
    saveStudents();
    closeModal('modal-add-student');
    renderStudentTable();
    soundFX.success();
    showToast(`Đã thêm thành công sinh viên Bách Khoa: ${fullName} (${studentId})`, 'success');
}

function viewStudentDetails(id) {
    const sv = students.find(s => s.id === id);
    if (!sv) return;

    const body = document.getElementById('view-student-body');
    body.innerHTML = `
        <div class="flex items-center gap-4 p-4 rounded-2xl bg-red-50 border border-red-200">
            <img src="${sv.avatar}" class="w-16 h-16 rounded-2xl object-cover ring-2 ring-red-600 shadow-md">
            <div>
                <h4 class="font-extrabold text-base text-slate-800 dark:text-white">${sv.fullName}</h4>
                <div class="text-xs text-red-700 font-semibold mt-0.5">MSSV: ${sv.studentId} &bull; ${sv.class}</div>
                <div class="mt-2 flex items-center gap-2">
                    <span class="badge badge-success">${sv.status}</span>
                    <span class="text-xs font-bold text-slate-600">GPA: <span class="text-red-700 font-extrabold">${sv.gpa.toFixed(2)}</span></span>
                    <span class="text-xs font-bold text-blue-600">ĐRL: ${sv.drl}</span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-3 bg-slate-50 rounded-xl">
                <span class="text-slate-400 block mb-0.5 font-medium">Email SIS</span>
                <span class="font-semibold text-slate-700">${sv.email}</span>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl">
                <span class="text-slate-400 block mb-0.5 font-medium">Số điện thoại</span>
                <span class="font-semibold text-slate-700">${sv.phone}</span>
            </div>
        </div>

        <div>
            <h5 class="text-xs font-bold text-slate-700 mb-2">Điểm học phần cốt lõi:</h5>
            <div class="space-y-1.5">
                ${Object.entries(sv.subjects || {}).map(([subject, data]) => {
                    const score = typeof data === 'object' ? data.total : Number(data);
                    return `
                        <div class="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50">
                            <span class="font-medium text-slate-700">${subject}</span>
                            <span class="font-bold text-red-700">${score.toFixed(1)} / 10</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    openModal('modal-view-student');
}

function openEditStudentModal(id) {
    const sv = students.find(s => s.id === id);
    if (!sv) return;

    document.getElementById('edit-id').value = sv.id;
    document.getElementById('edit-studentId').value = sv.studentId;
    document.getElementById('edit-fullname').value = sv.fullName;
    document.getElementById('edit-class').value = sv.class;
    document.getElementById('edit-status').value = sv.status;
    document.getElementById('edit-gpa').value = sv.gpa;
    document.getElementById('edit-drl').value = sv.drl;

    openModal('modal-edit-student');
}

function handleEditStudentSubmit(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-id').value);
    const sv = students.find(s => s.id === id);
    if (!sv) return;

    sv.fullName = document.getElementById('edit-fullname').value.trim();
    sv.class = document.getElementById('edit-class').value.trim();
    sv.status = document.getElementById('edit-status').value;
    sv.gpa = parseFloat(document.getElementById('edit-gpa').value) || sv.gpa;
    sv.drl = parseInt(document.getElementById('edit-drl').value) || sv.drl;

    saveStudents();
    closeModal('modal-edit-student');
    renderStudentTable();
    soundFX.success();
    showToast(`Đã cập nhật sinh viên ${sv.fullName}`, 'success');
}

function promptDeleteStudent(id) {
    const sv = students.find(s => s.id === id);
    if (!sv) return;
    deleteTargetId = id;
    document.getElementById('delete-student-name').textContent = sv.fullName;
    openModal('modal-delete-student');
}

function confirmDeleteStudent() {
    if (!deleteTargetId) return;
    students = students.filter(s => s.id !== deleteTargetId);
    saveStudents();
    closeModal('modal-delete-student');
    renderStudentTable();
    soundFX.delete();
    showToast('Đã xóa hồ sơ sinh viên!', 'error');
    deleteTargetId = null;
}

// =========================================================================
// Charts & Helpers
// =========================================================================

function initCharts() {
    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

    const barCtx = document.getElementById('semesterBarChart');
    if (barCtx) {
        const cur = SEMESTER_PERFORMANCE[currentSemester];
        semesterChartInstance = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: cur.labels,
                datasets: [
                    {
                        label: 'Điểm trung bình (GPA/10)',
                        data: cur.gpaScores,
                        backgroundColor: '#b91c1c',
                        borderRadius: 6,
                        barPercentage: 0.6,
                        categoryPercentage: 0.6
                    },
                    {
                        label: 'Tỷ lệ đạt (%)',
                        data: cur.passRates.map(v => v / 10),
                        backgroundColor: '#f59e0b',
                        borderRadius: 6,
                        barPercentage: 0.6,
                        categoryPercentage: 0.6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textColor, font: { size: 11, family: 'Plus Jakarta Sans', weight: 'bold' } }
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: textColor } },
                    y: { max: 10, grid: { color: gridColor }, ticks: { color: textColor } }
                }
            }
        });
    }

    const donutCtx = document.getElementById('classDonutChart');
    if (donutCtx) {
        classChartInstance = new Chart(donutCtx, {
            type: 'doughnut',
            data: {
                labels: CLASS_DISTRIBUTION.map(d => d.label),
                datasets: [{
                    data: CLASS_DISTRIBUTION.map(d => d.count),
                    backgroundColor: CLASS_DISTRIBUTION.map(d => d.color),
                    borderWidth: 3,
                    borderColor: isDark ? '#131d33' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: { legend: { display: false } }
            }
        });
    }
}

function updateSemesterChart(val) {
    currentSemester = val;
    const cur = SEMESTER_PERFORMANCE[val];
    if (semesterChartInstance && cur) {
        semesterChartInstance.data.labels = cur.labels;
        semesterChartInstance.data.datasets[0].data = cur.gpaScores;
        semesterChartInstance.data.datasets[1].data = cur.passRates.map(v => v / 10);
        semesterChartInstance.update();
        soundFX.click();
    }
}

function renderClassLegend() {
    const el = document.getElementById('class-legend-container');
    if (!el) return;
    el.innerHTML = CLASS_DISTRIBUTION.map(item => `
        <div class="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none">
            <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${item.color}"></span>
                <span class="font-semibold text-slate-700">${item.label}</span>
            </div>
            <span class="text-slate-500 font-medium">${item.count} (${item.percentage})</span>
        </div>
    `).join('');
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('hust_theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
    if (semesterChartInstance) semesterChartInstance.destroy();
    if (classChartInstance) classChartInstance.destroy();
    if (currentUser?.role === 'Quản trị viên') initCharts();
    soundFX.click();
}

function loadTheme() {
    const savedTheme = localStorage.getItem('hust_theme');
    const isDark = savedTheme === 'dark';
    if (isDark) document.body.classList.add('dark-theme');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    if (isDark) {
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />`;
    } else {
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`;
    }
}

function initClock() {
    const clockEl = document.getElementById('live-clock');
    if (!clockEl) return;
    const updateTime = () => {
        const now = new Date();
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const dayName = days[now.getDay()];
        const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        clockEl.textContent = `${dayName}, ${dateStr} - ${timeStr}`;
    };
    updateTime();
    setInterval(updateTime, 1000);
}

function toggleNotifications() {
    document.getElementById('notif-dropdown')?.classList.toggle('hidden');
    soundFX.click();
}

function markAllNotificationsRead() {
    document.getElementById('notif-badge')?.classList.add('hidden');
    showToast('Đã đánh dấu đã đọc thông báo', 'info');
}

function toggleUserMenu(force) {
    const menu = document.getElementById('user-menu-dropdown');
    if (!menu) return;
    if (typeof force === 'boolean') {
        if (force) menu.classList.remove('hidden');
        else menu.classList.add('hidden');
    } else {
        menu.classList.toggle('hidden');
    }
}

function toggleMobileSidebar() {
    document.getElementById('sidebar')?.classList.toggle('hidden');
}

function exportToCSV() {
    soundFX.click();
    const headers = ["STT", "Mã SV", "Họ và tên", "Lớp", "Điểm GPA", "Điểm ĐRL", "Học bổng", "Trạng thái"];
    const rows = students.map((s, idx) => [
        idx + 1,
        `"${s.studentId}"`,
        `"${s.fullName}"`,
        `"${s.class}"`,
        s.gpa.toFixed(2),
        s.drl,
        `"${s.scholarship}"`,
        `"${s.status}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `danh_sach_sinh_vien_hust_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất file Excel CSV Bách Khoa thành công!', 'success');
}

function openForgotPasswordModal(e) {
    if (e) e.preventDefault();
    openModal('modal-forgot-password');
}

function handleForgotSubmit() {
    const val = document.getElementById('forgot-input')?.value.trim();
    if (!val) {
        showToast('Vui lòng nhập mã sinh viên hoặc email!', 'error');
        return;
    }
    closeModal('modal-forgot-password');
    soundFX.success();
    showToast(`Đã gửi mã xác nhận khôi phục đến: ${val}`, 'success');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<div class="flex-1 text-xs font-semibold text-slate-800">${message}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            document.getElementById('global-search')?.focus();
        }
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
            toggleUserMenu(false);
            document.getElementById('notif-dropdown')?.classList.add('hidden');
        }
    });

    document.addEventListener('click', (e) => {
        const notifDropdown = document.getElementById('notif-dropdown');
        const notifBtn = notifDropdown?.previousElementSibling;
        if (notifDropdown && !notifDropdown.contains(e.target) && !notifBtn?.contains(e.target)) {
            notifDropdown.classList.add('hidden');
        }

        const userMenu = document.getElementById('user-menu-dropdown');
        const userBtn = userMenu?.previousElementSibling;
        if (userMenu && !userMenu.contains(e.target) && !userBtn?.contains(e.target)) {
            userMenu.classList.add('hidden');
        }
    });
}

// =========================================================================
// MODALS & CRUD HANDLERS FOR CLASSES, TEACHERS, GRADES & MYSQL
// =========================================================================

function calculateLiveTotalGrade() {
    const cc = parseFloat(document.getElementById('grade-cc').value) || 0;
    const gk = parseFloat(document.getElementById('grade-gk').value) || 0;
    const ck = parseFloat(document.getElementById('grade-ck').value) || 0;

    const total = parseFloat((0.1 * cc + 0.3 * gk + 0.6 * ck).toFixed(2));
    let letter = 'F';
    let gpa4 = 0.0;

    if (total >= 9.0) { letter = 'A+'; gpa4 = 4.0; }
    else if (total >= 8.5) { letter = 'A'; gpa4 = 4.0; }
    else if (total >= 8.0) { letter = 'B+'; gpa4 = 3.5; }
    else if (total >= 7.0) { letter = 'B'; gpa4 = 3.0; }
    else if (total >= 6.5) { letter = 'C+'; gpa4 = 2.5; }
    else if (total >= 5.5) { letter = 'C'; gpa4 = 2.0; }
    else if (total >= 5.0) { letter = 'D+'; gpa4 = 1.5; }
    else if (total >= 4.0) { letter = 'D'; gpa4 = 1.0; }
    else { letter = 'F'; gpa4 = 0.0; }

    const liveTotalEl = document.getElementById('grade-live-total');
    const liveLetterEl = document.getElementById('grade-live-letter');
    const liveGpa4El = document.getElementById('grade-live-gpa4');

    if (liveTotalEl) liveTotalEl.textContent = total.toFixed(1);
    if (liveLetterEl) liveLetterEl.textContent = letter;
    if (liveGpa4El) liveGpa4El.textContent = gpa4.toFixed(1);

    return { total, letter, gpa4 };
}

function openGradeModal(studentId, subjectName) {
    const student = students.find(s => s.studentId === studentId);
    if (!student) return;

    document.getElementById('grade-student-id').value = studentId;
    document.getElementById('grade-subject-name').value = subjectName;
    document.getElementById('grade-modal-subtitle').innerHTML = `Sinh viên: <strong>${student.fullName}</strong> (${student.studentId}) &bull; Học phần: <strong class="text-red-700">${subjectName}</strong>`;

    const subData = student.subjects?.[subjectName] || { cc: 9.0, gk: 8.0, ck: 8.0, total: 8.1, letter: 'B+' };
    document.getElementById('grade-cc').value = subData.cc !== undefined ? subData.cc : 9.0;
    document.getElementById('grade-gk').value = subData.gk !== undefined ? subData.gk : 8.0;
    document.getElementById('grade-ck').value = subData.ck !== undefined ? subData.ck : 8.0;

    calculateLiveTotalGrade();
    openModal('modal-grade');
}

function handleSaveGrade(e) {
    e.preventDefault();
    const studentId = document.getElementById('grade-student-id').value;
    const subjectName = document.getElementById('grade-subject-name').value;
    const cc = parseFloat(document.getElementById('grade-cc').value);
    const gk = parseFloat(document.getElementById('grade-gk').value);
    const ck = parseFloat(document.getElementById('grade-ck').value);

    const { total, letter, gpa4 } = calculateLiveTotalGrade();

    const student = students.find(s => s.studentId === studentId);
    if (student) {
        if (!student.subjects) student.subjects = {};
        const oldCredits = student.subjects[subjectName]?.credits || 3;
        student.subjects[subjectName] = {
            cc: cc,
            gk: gk,
            ck: ck,
            total: total,
            letter: letter,
            credits: oldCredits
        };

        // Recalculate student GPA
        const subjectList = Object.values(student.subjects);
        if (subjectList.length > 0) {
            const sumTotal = subjectList.reduce((acc, item) => acc + (item.total || 8.0), 0);
            student.gpa = parseFloat((sumTotal / subjectList.length).toFixed(2));
            student.gpa4 = parseFloat((student.gpa / 2.5).toFixed(2));
            if (student.gpa4 > 4.0) student.gpa4 = 4.0;
        }

        saveStudents();
        soundFX.success();
        showToast(`Đã lưu điểm môn ${subjectName} cho sinh viên ${student.fullName}!`, 'success');
        closeModal('modal-grade');

        // Re-render active view
        if (currentUser.role === 'Quản trị viên') {
            renderAdminDashboardView();
        } else if (currentUser.role === 'Giảng viên') {
            renderTeacherPortalView();
        } else {
            renderStudentPortalView();
        }
    }
}

function openAddClassModal() {
    document.getElementById('modal-class-title').textContent = 'Thêm Lớp Chuyên Ngành Mới';
    document.getElementById('class-edit-id').value = '';
    document.getElementById('class-code').value = '';
    document.getElementById('class-code').removeAttribute('readonly');
    document.getElementById('class-name').value = '';
    document.getElementById('class-students').value = '50';
    document.getElementById('class-room').value = 'P.402 - Nhà B1';
    document.getElementById('class-president').value = '';

    const advSelect = document.getElementById('class-advisor-select');
    if (advSelect) {
        advSelect.innerHTML = teachers.map(t => `<option value="${t.fullName}">${t.fullName} (${t.id} - ${t.department})</option>`).join('');
    }

    openModal('modal-class');
}

function openEditClassModal(code) {
    const cls = classes.find(c => c.code === code);
    if (!cls) return;

    document.getElementById('modal-class-title').textContent = `Chỉnh Sửa Lớp: ${cls.code}`;
    document.getElementById('class-edit-id').value = cls.code;
    document.getElementById('class-code').value = cls.code;
    document.getElementById('class-code').setAttribute('readonly', 'true');
    document.getElementById('class-name').value = cls.name;
    document.getElementById('class-students').value = cls.totalStudents || 50;
    document.getElementById('class-faculty').value = cls.faculty;
    document.getElementById('class-room').value = cls.room || '';
    document.getElementById('class-president').value = cls.president || '';

    const advSelect = document.getElementById('class-advisor-select');
    if (advSelect) {
        advSelect.innerHTML = teachers.map(t => `<option value="${t.fullName}" ${t.fullName === cls.advisor ? 'selected' : ''}>${t.fullName} (${t.id})</option>`).join('');
    }

    openModal('modal-class');
}

function handleSaveClass(e) {
    e.preventDefault();
    const editCode = document.getElementById('class-edit-id').value;
    const code = document.getElementById('class-code').value.trim();
    const name = document.getElementById('class-name').value.trim();
    const faculty = document.getElementById('class-faculty').value;
    const advisor = document.getElementById('class-advisor-select').value;
    const studentsCount = parseInt(document.getElementById('class-students').value) || 50;
    const room = document.getElementById('class-room').value.trim();
    const president = document.getElementById('class-president').value.trim();

    if (editCode) {
        const cls = classes.find(c => c.code === editCode);
        if (cls) {
            cls.name = name;
            cls.faculty = faculty;
            cls.advisor = advisor;
            cls.totalStudents = studentsCount;
            cls.room = room;
            cls.president = president;
        }
    } else {
        if (classes.some(c => c.code.toLowerCase() === code.toLowerCase())) {
            showToast('Mã lớp này đã tồn tại trong hệ thống!', 'warning');
            return;
        }
        classes.push({
            id: code.replace(/[^a-zA-Z0-9]/g, '-'),
            code: code,
            name: name,
            faculty: faculty,
            advisor: advisor,
            totalStudents: studentsCount,
            room: room,
            president: president || 'Đang cập nhật'
        });
    }

    saveClasses();
    soundFX.success();
    showToast(`Đã lưu thông tin lớp ${code} thành công!`, 'success');
    closeModal('modal-class');
    renderAdminDashboardView();
}

function deleteClass(code) {
    if (confirm(`Bạn có chắc chắn muốn xóa lớp ${code} khỏi danh sách?`)) {
        classes = classes.filter(c => c.code !== code);
        saveClasses();
        soundFX.delete();
        showToast(`Đã xóa lớp ${code}!`, 'info');
        renderAdminDashboardView();
    }
}

function openAddTeacherModal() {
    document.getElementById('modal-teacher-title').textContent = 'Thêm Giảng Viên / Cố Vấn Mới';
    document.getElementById('teacher-edit-id').value = '';
    document.getElementById('teacher-id').value = 'GV' + String(teachers.length + 1).padStart(3, '0');
    document.getElementById('teacher-id').removeAttribute('readonly');
    document.getElementById('teacher-name').value = '';
    document.getElementById('teacher-email').value = '';
    document.getElementById('teacher-phone').value = '';
    document.getElementById('teacher-courses').value = '';

    const hrSelect = document.getElementById('teacher-homeroom-select');
    if (hrSelect) {
        hrSelect.innerHTML = `<option value="">Chưa phân công chủ nhiệm (Chỉ dạy bộ môn)</option>` +
            classes.map(c => `<option value="${c.code}">${c.code} - ${c.name}</option>`).join('');
    }

    openModal('modal-teacher');
}

function openEditTeacherModal(id) {
    const t = teachers.find(item => item.id === id);
    if (!t) return;

    document.getElementById('modal-teacher-title').textContent = `Chỉnh Sửa Giảng Viên: ${t.fullName}`;
    document.getElementById('teacher-edit-id').value = t.id;
    document.getElementById('teacher-id').value = t.id;
    document.getElementById('teacher-id').setAttribute('readonly', 'true');
    document.getElementById('teacher-name').value = t.fullName;
    document.getElementById('teacher-email').value = t.email;
    document.getElementById('teacher-phone').value = t.phone || '';
    document.getElementById('teacher-department').value = t.department || 'Trường CNTT & TT';
    document.getElementById('teacher-courses').value = t.teachingCourses || '';

    const hrSelect = document.getElementById('teacher-homeroom-select');
    if (hrSelect) {
        hrSelect.innerHTML = `<option value="">Chưa phân công chủ nhiệm (Chỉ dạy bộ môn)</option>` +
            classes.map(c => `<option value="${c.code}" ${c.code === t.homeroomClass ? 'selected' : ''}>${c.code} - ${c.name}</option>`).join('');
    }

    openModal('modal-teacher');
}

function handleSaveTeacher(e) {
    e.preventDefault();
    const editId = document.getElementById('teacher-edit-id').value;
    const id = document.getElementById('teacher-id').value.trim();
    const degree = document.getElementById('teacher-degree').value;
    const name = document.getElementById('teacher-name').value.trim();
    const fullName = name.startsWith('TS.') || name.startsWith('PGS.') || name.startsWith('GS.') || name.startsWith('ThS.') ? name : `${degree} ${name}`;
    const email = document.getElementById('teacher-email').value.trim();
    const phone = document.getElementById('teacher-phone').value.trim();
    const department = document.getElementById('teacher-department').value.trim();
    const homeroomClass = document.getElementById('teacher-homeroom-select').value;
    const teachingCourses = document.getElementById('teacher-courses').value.trim();

    const targetClass = classes.find(c => c.code === homeroomClass);
    const homeroomClassName = targetClass ? targetClass.name : '';

    if (editId) {
        const t = teachers.find(item => item.id === editId);
        if (t) {
            t.fullName = fullName;
            t.email = email;
            t.phone = phone;
            t.department = department;
            t.homeroomClass = homeroomClass;
            t.homeroomClassName = homeroomClassName;
            t.teachingCourses = teachingCourses;
        }
    } else {
        teachers.push({
            id: id,
            fullName: fullName,
            email: email,
            phone: phone,
            department: department,
            homeroomClass: homeroomClass,
            homeroomClassName: homeroomClassName,
            teachingCourses: teachingCourses || 'Các môn chuyên ngành',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
        });
    }

    // Update class advisor if homeroom assigned
    if (homeroomClass) {
        const cls = classes.find(c => c.code === homeroomClass);
        if (cls) {
            cls.advisor = fullName;
            saveClasses();
        }
    }

    saveTeachers();
    soundFX.success();
    showToast(`Đã lưu giảng viên ${fullName}!`, 'success');
    closeModal('modal-teacher');
    renderAdminDashboardView();
}

function deleteTeacher(id) {
    if (confirm(`Bạn có chắc chắn muốn xóa giảng viên có mã ${id}?`)) {
        teachers = teachers.filter(t => t.id !== id);
        saveTeachers();
        soundFX.delete();
        showToast(`Đã xóa giảng viên ${id}!`, 'info');
        renderAdminDashboardView();
    }
}

function downloadDatabaseSQL() {
    fetch('quan_ly_sinh_vien.sql')
        .then(response => {
            if (!response.ok) throw new Error('File not found');
            return response.text();
        })
        .then(sqlText => {
            const blob = new Blob([sqlText], { type: 'text/sql;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'quan_ly_sinh_vien.sql';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            soundFX.success();
            showToast('Đã tải thành công file CSDL quan_ly_sinh_vien.sql!', 'success');
        })
        .catch(err => {
            const link = document.createElement('a');
            link.href = 'quan_ly_sinh_vien.sql';
            link.download = 'quan_ly_sinh_vien.sql';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            soundFX.success();
            showToast('Đang tải file quan_ly_sinh_vien.sql về máy...', 'success');
        });
}
