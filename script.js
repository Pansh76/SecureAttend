// Global variables
let video = null;
let canvas = null;
let stream = null;
let isProcessing = false;

// DOM elements
const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const captureBtn = document.getElementById('captureBtn');
const statusText = document.getElementById('statusText');
const processingCard = document.getElementById('processingCard');
const resultCard = document.getElementById('resultCard');
const attendanceList = document.getElementById('attendanceList');
const emptyState = document.getElementById('emptyState');
const logCount = document.getElementById('logCount');

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupNavigation();
    setupCamera();
    setupEventListeners();
    loadAttendanceData();
});

function initializeApp() {
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add loading animation to page
    document.body.classList.add('loaded');
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Get target section
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Update active nav on scroll
    window.addEventListener('scroll', updateActiveNav);
}

function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

async function setupCamera() {
    try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: false
        });

        if (videoElement) {
            videoElement.srcObject = stream;
            videoElement.play();
            
            videoElement.addEventListener('loadedmetadata', () => {
                updateStatus('Camera Ready', 'success');
            });
        }

    } catch (error) {
        console.error('Camera access error:', error);
        updateStatus('Camera Access Denied', 'error');
        
        // Show fallback message
        if (videoElement) {
            videoElement.style.display = 'none';
            const cameraFrame = videoElement.parentElement;
            const fallbackMsg = document.createElement('div');
            fallbackMsg.className = 'camera-fallback';
            fallbackMsg.innerHTML = `
                <i class="fas fa-camera-slash"></i>
                <h3>Camera Not Available</h3>
                <p>Please allow camera access to use this feature</p>
            `;
            cameraFrame.appendChild(fallbackMsg);
        }
    }
}

function setupEventListeners() {
    // Capture button
    if (captureBtn) {
        captureBtn.addEventListener('click', captureImage);
    }

    // Hero buttons
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.textContent.includes('Mark Attendance')) {
                scrollToSection('attendance');
            } else if (btn.textContent.includes('View Dashboard')) {
                scrollToSection('dashboard');
            }
        });
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .stat-card, .attendance-item').forEach(el => {
        observer.observe(el);
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function updateStatus(message, type = 'info') {
    if (statusText) {
        statusText.textContent = message;
        
        const statusIndicator = statusText.parentElement;
        statusIndicator.className = `status-indicator ${type}`;
    }
}

async function captureImage() {
    if (isProcessing || !videoElement || !stream) {
        return;
    }

    try {
        isProcessing = true;
        captureBtn.disabled = true;
        captureBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Show processing card
        showProcessingCard();

        // Create canvas and capture frame
        if (!canvasElement) {
            canvas = document.createElement('canvas');
            canvas.id = 'canvas';
            canvas.style.display = 'none';
            document.body.appendChild(canvas);
        } else {
            canvas = canvasElement;
        }

        const context = canvas.getContext('2d');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        context.drawImage(videoElement, 0, 0);

        // Convert to blob
        canvas.toBlob(async (blob) => {
            try {
                // Simulate processing time
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Simulate API call
                const result = await processAttendanceImage(blob);
                
                // Show result
                showResultCard(result);
                
                // Update attendance list
                if (result.success) {
                    addAttendanceRecord(result);
                }
                
            } catch (error) {
                console.error('Processing error:', error);
                showResultCard({
                    success: false,
                    message: 'Processing failed. Please try again.',
                    error: error.message
                });
            } finally {
                isProcessing = false;
                captureBtn.disabled = false;
                captureBtn.innerHTML = '<i class="fas fa-camera"></i> Capture';
            }
        }, 'image/jpeg', 0.8);

    } catch (error) {
        console.error('Capture error:', error);
        isProcessing = false;
        captureBtn.disabled = false;
        captureBtn.innerHTML = '<i class="fas fa-camera"></i> Capture';
        
        showResultCard({
            success: false,
            message: 'Capture failed. Please try again.',
            error: error.message
        });
    }
}

async function processAttendanceImage(imageBlob) {
    // Simulate API call to backend
    // In a real implementation, this would send the image to your backend
    
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate random success/failure for demo
            const success = Math.random() > 0.2; // 80% success rate
            
            if (success) {
                resolve({
                    success: true,
                    message: 'Attendance marked successfully!',
                    user_name: 'John Doe',
                    confidence: 0.95 + Math.random() * 0.05,
                    timestamp: new Date().toISOString(),
                    status: 'present'
                });
            } else {
                resolve({
                    success: false,
                    message: 'Face not recognized. Please ensure good lighting and face the camera directly.',
                    confidence: 0.3 + Math.random() * 0.4
                });
            }
        }, 1500 + Math.random() * 1000);
    });
}

function showProcessingCard() {
    if (processingCard && resultCard) {
        processingCard.classList.remove('hidden');
        resultCard.classList.add('hidden');
    }
}

function showResultCard(result) {
    if (!resultCard || !processingCard) return;

    // Hide processing card
    processingCard.classList.add('hidden');

    // Update result card content
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    const resultTime = document.getElementById('resultTime');
    const resultConfidence = document.getElementById('resultConfidence');

    if (resultIcon) {
        resultIcon.className = result.success ? 'fas fa-check-circle' : 'fas fa-times-circle';
        resultIcon.parentElement.className = `result-icon ${result.success ? 'success' : 'error'}`;
    }

    if (resultTitle) {
        resultTitle.textContent = result.success ? 'Attendance Marked!' : 'Recognition Failed';
    }

    if (resultMessage) {
        resultMessage.textContent = result.message;
    }

    if (resultTime) {
        resultTime.textContent = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    if (resultConfidence && result.confidence) {
        resultConfidence.textContent = Math.round(result.confidence * 100) + '%';
    }

    // Show result card
    resultCard.classList.remove('hidden');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (resultCard) {
            resultCard.classList.add('hidden');
        }
    }, 5000);
}

function addAttendanceRecord(result) {
    if (!attendanceList) return;

    // Hide empty state
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    // Create attendance item
    const attendanceItem = document.createElement('div');
    attendanceItem.className = 'attendance-item';
    attendanceItem.style.animationDelay = '0s';
    
    attendanceItem.innerHTML = `
        <div class="attendance-user">
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
                <h4>${result.user_name || 'John Doe'}</h4>
                <p>${new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })}</p>
                <small>Confidence: ${Math.round((result.confidence || 0.95) * 100)}%</small>
            </div>
        </div>
        <div class="attendance-status">
            <span class="status-badge ${result.status || 'present'}">${result.status || 'present'}</span>
            <i class="fas fa-check-circle" style="color: #00ff88;"></i>
        </div>
    `;

    // Add to top of list
    attendanceList.insertBefore(attendanceItem, attendanceList.firstChild);

    // Update count
    updateAttendanceCount();

    // Add animation
    setTimeout(() => {
        attendanceItem.classList.add('animate-in');
    }, 100);
}

function loadAttendanceData() {
    // Simulate loading existing attendance data
    const sampleData = [
        {
            user_name: 'Alice Johnson',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'present',
            confidence: 0.97
        },
        {
            user_name: 'Bob Smith',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            status: 'present',
            confidence: 0.94
        },
        {
            user_name: 'Carol Davis',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            status: 'late',
            confidence: 0.92
        }
    ];

    // Add sample data to list
    sampleData.forEach((record, index) => {
        setTimeout(() => {
            addSampleAttendanceRecord(record, index);
        }, index * 200);
    });

    updateAttendanceCount();
}

function addSampleAttendanceRecord(record, index) {
    if (!attendanceList) return;

    // Hide empty state
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    const attendanceItem = document.createElement('div');
    attendanceItem.className = 'attendance-item';
    attendanceItem.style.animationDelay = `${index * 0.1}s`;
    
    const time = new Date(record.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    attendanceItem.innerHTML = `
        <div class="attendance-user">
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
                <h4>${record.user_name}</h4>
                <p>${time}</p>
                <small>Confidence: ${Math.round(record.confidence * 100)}%</small>
            </div>
        </div>
        <div class="attendance-status">
            <span class="status-badge ${record.status}">${record.status}</span>
            ${record.status === 'present' ? '<i class="fas fa-check-circle" style="color: #00ff88;"></i>' : 
              record.status === 'late' ? '<i class="fas fa-clock" style="color: #ffc107;"></i>' : 
              '<i class="fas fa-times-circle" style="color: #ff4757;"></i>'}
        </div>
    `;

    attendanceList.appendChild(attendanceItem);

    // Add animation
    setTimeout(() => {
        attendanceItem.classList.add('animate-in');
    }, 100);
}

function updateAttendanceCount() {
    if (logCount && attendanceList) {
        const count = attendanceList.children.length;
        logCount.textContent = count;
    }
}

// Utility functions
function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Cleanup function
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: slideInUp 0.6s ease-out forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .camera-fallback {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #cccccc;
        text-align: center;
        padding: 40px;
    }
    
    .camera-fallback i {
        font-size: 4rem;
        margin-bottom: 20px;
        opacity: 0.5;
    }
    
    .camera-fallback h3 {
        margin-bottom: 10px;
        color: #ffffff;
    }
    
    .status-indicator.success .status-dot {
        background: #00ff88;
    }
    
    .status-indicator.error .status-dot {
        background: #ff4757;
    }
    
    .status-indicator.info .status-dot {
        background: #00ffff;
    }
`;
document.head.appendChild(style);
