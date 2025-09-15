// Authentication JavaScript
let currentRole = 'admin';
let isLoading = false;

// DOM Elements
const roleButtons = document.querySelectorAll('.role-btn');
const loginForm = document.getElementById('loginForm');
const employeeIdGroup = document.getElementById('employeeIdGroup');
const loadingOverlay = document.getElementById('loadingOverlay');
const alertContainer = document.getElementById('alertContainer');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkExistingSession();
});

function setupEventListeners() {
    // Role selection
    roleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            roleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRole = btn.dataset.role;
            
            // Show/hide employee ID field for users
            if (currentRole === 'user') {
                employeeIdGroup.style.display = 'block';
                document.getElementById('employeeId').required = true;
            } else {
                employeeIdGroup.style.display = 'none';
                document.getElementById('employeeId').required = false;
            }
        });
    });

    // Login form submission
    loginForm.addEventListener('submit', handleLogin);

    // Demo credential buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.demo-item')) {
            const demoItem = e.target.closest('.demo-item');
            const text = demoItem.textContent;
            
            if (text.includes('admin')) {
                document.getElementById('username').value = 'admin';
                document.getElementById('password').value = 'admin123';
                // Switch to admin role
                roleButtons.forEach(b => b.classList.remove('active'));
                document.querySelector('[data-role="admin"]').classList.add('active');
                currentRole = 'admin';
                employeeIdGroup.style.display = 'none';
            } else if (text.includes('user')) {
                document.getElementById('username').value = 'user';
                document.getElementById('password').value = 'user123';
                document.getElementById('employeeId').value = 'EMP001';
                // Switch to user role
                roleButtons.forEach(b => b.classList.remove('active'));
                document.querySelector('[data-role="user"]').classList.add('active');
                currentRole = 'user';
                employeeIdGroup.style.display = 'block';
            }
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    const formData = new FormData(loginForm);
    const credentials = {
        username: formData.get('username'),
        password: formData.get('password'),
        employeeId: formData.get('employeeId'),
        role: currentRole,
        rememberMe: formData.get('rememberMe') === 'on'
    };

    // Validate inputs
    if (!credentials.username || !credentials.password) {
        showAlert('error', 'Missing Credentials', 'Please enter both username and password');
        return;
    }

    if (currentRole === 'user' && !credentials.employeeId) {
        showAlert('error', 'Missing Employee ID', 'Please enter your employee ID');
        return;
    }

    try {
        isLoading = true;
        showLoading(true);

        // Simulate API call
        const result = await authenticateUser(credentials);
        
        if (result.success) {
            // Store session
            storeSession(result.user, credentials.rememberMe);
            
            showAlert('success', 'Login Successful', `Welcome ${result.user.name}!`);
            
            // Redirect based on role
            setTimeout(() => {
                if (result.user.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'user-dashboard.html';
                }
            }, 1500);
        } else {
            showAlert('error', 'Authentication Failed', result.message);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showAlert('error', 'Login Error', 'An error occurred during authentication');
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

async function authenticateUser(credentials) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Demo authentication logic
    const validCredentials = {
        admin: { username: 'admin', password: 'admin123' },
        user: { username: 'user', password: 'user123', employeeId: 'EMP001' }
    };
    
    const valid = validCredentials[credentials.role];
    
    if (valid && 
        valid.username === credentials.username && 
        valid.password === credentials.password &&
        (credentials.role === 'admin' || valid.employeeId === credentials.employeeId)) {
        
        return {
            success: true,
            user: {
                id: credentials.role === 'admin' ? 'admin_001' : 'user_001',
                name: credentials.role === 'admin' ? 'Administrator' : 'John Doe',
                role: credentials.role,
                employeeId: credentials.employeeId,
                permissions: credentials.role === 'admin' ? ['all'] : ['attendance'],
                lastLogin: new Date().toISOString()
            }
        };
    } else {
        return {
            success: false,
            message: 'Invalid credentials. Please check your username, password, and employee ID.'
        };
    }
}

function storeSession(user, remember) {
    const sessionData = {
        user: user,
        loginTime: new Date().toISOString(),
        expiresAt: remember ? 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 days
            new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
    };
    
    if (remember) {
        localStorage.setItem('secureAttendSession', JSON.stringify(sessionData));
    } else {
        sessionStorage.setItem('secureAttendSession', JSON.stringify(sessionData));
    }
}

function checkExistingSession() {
    const session = localStorage.getItem('secureAttendSession') || 
                   sessionStorage.getItem('secureAttendSession');
    
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            const now = new Date();
            const expires = new Date(sessionData.expiresAt);
            
            if (now < expires) {
                // Valid session exists, redirect to appropriate dashboard
                if (sessionData.user.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'user-dashboard.html';
                }
            } else {
                // Session expired, clear it
                localStorage.removeItem('secureAttendSession');
                sessionStorage.removeItem('secureAttendSession');
            }
        } catch (error) {
            console.error('Session parsing error:', error);
        }
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

async function startBiometricLogin() {
    try {
        showAlert('info', 'Biometric Authentication', 'Starting biometric verification...');
        
        // Simulate biometric authentication
        showLoading(true);
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Simulate successful biometric login
        const biometricUser = {
            id: 'bio_user_001',
            name: 'Jane Smith',
            role: 'user',
            employeeId: 'EMP002',
            permissions: ['attendance'],
            lastLogin: new Date().toISOString()
        };
        
        storeSession(biometricUser, false);
        showAlert('success', 'Biometric Login Successful', 'Welcome Jane Smith!');
        
        setTimeout(() => {
            window.location.href = 'user-dashboard.html';
        }, 1500);
        
    } catch (error) {
        showAlert('error', 'Biometric Error', 'Biometric authentication failed');
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    if (show) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

function showAlert(type, title, message) {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-times-circle' : 
                type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    alert.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="alert-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
}

// Utility function to get current session
function getCurrentSession() {
    const session = localStorage.getItem('secureAttendSession') || 
                   sessionStorage.getItem('secureAttendSession');
    
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            const now = new Date();
            const expires = new Date(sessionData.expiresAt);
            
            if (now < expires) {
                return sessionData;
            }
        } catch (error) {
            console.error('Session parsing error:', error);
        }
    }
    
    return null;
}

// Logout function
function logout() {
    localStorage.removeItem('secureAttendSession');
    sessionStorage.removeItem('secureAttendSession');
    window.location.href = 'login.html';
}
