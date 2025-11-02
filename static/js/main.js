// Main JavaScript for Instagram Emoji Reaction Web App

// Update gesture display in real-time
function updateGestureDisplay() {
    fetch('/current_gesture')
        .then(response => response.json())
        .then(data => {
            // Update gesture image and text
            const gestureImage = document.getElementById('gestureImage');
            const gestureName = document.getElementById('gestureName');
            const gestureDescription = document.getElementById('gestureDescription');
            
            // Update image if changed
            const newImageSrc = '/images/' + data.image;
            if (gestureImage.src !== window.location.origin + newImageSrc) {
                gestureImage.src = newImageSrc;
                gestureImage.style.animation = 'none';
                setTimeout(() => {
                    gestureImage.style.animation = 'scaleIn 0.5s ease';
                }, 10);
            }
            
            gestureName.textContent = data.name;
            gestureDescription.textContent = data.description;
        })
        .catch(error => console.error('Error fetching gesture:', error));
}

// Update stats
function updateStats() {
    // Simulate stats update (in real app, fetch from backend)
    const confidence = Math.floor(Math.random() * 20) + 70;
    const progressFill = document.querySelector('.progress-fill');
    const statValue = document.querySelector('.stat-value');
    
    if (progressFill) {
        progressFill.style.width = confidence + '%';
    }
    if (statValue) {
        statValue.textContent = confidence + '%';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Instagram Emoji Reaction - Web App Loaded');
    
    // Update gesture every 500ms
    setInterval(updateGestureDisplay, 500);
    
    // Update stats every 2 seconds
    setInterval(updateStats, 2000);
    
    // Add hover effects to gesture cards
    const gestureCards = document.querySelectorAll('.gesture-card');
    gestureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.05)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click animation to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.animation = 'scaleIn 0.3s ease';
            setTimeout(() => {
                this.style.animation = '';
            }, 300);
        });
    });
    
    // Check if video feed is loading
    const videoFeed = document.querySelector('.video-feed');
    if (videoFeed) {
        videoFeed.addEventListener('load', function() {
            console.log('Video feed loaded successfully');
        });
        videoFeed.addEventListener('error', function() {
            console.error('Error loading video feed');
            this.alt = 'Unable to load video feed. Please check camera permissions.';
        });
    }
});

// Add smooth scroll for any future navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Performance monitoring
let frameCount = 0;
let lastTime = Date.now();

function updateFPS() {
    frameCount++;
    const currentTime = Date.now();
    const elapsed = currentTime - lastTime;
    
    if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        const fpsElement = document.querySelectorAll('.stat-value')[1];
        if (fpsElement) {
            fpsElement.textContent = fps;
        }
        frameCount = 0;
        lastTime = currentTime;
    }
    
    requestAnimationFrame(updateFPS);
}

// Start FPS monitoring
requestAnimationFrame(updateFPS);
