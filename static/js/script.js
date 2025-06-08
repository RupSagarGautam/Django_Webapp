
// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Active navigation highlight
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// Contact Form Submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const submitBtn = this.querySelector('.submit-button');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    // Simulate form submission (replace with actual form submission logic)
    setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        this.reset();
        setTimeout(() => {
            submitBtn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
        }, 3000);
    }, 2000);
});

// Newsletter Form Submission
document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const button = this.querySelector('button');
    const input = this.querySelector('input');
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    // Simulate form submission
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
        input.value = '';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 3000);
    }, 1500);
});

// Check user login status
function updateAuthNav() {
    const authNav = document.getElementById('authNav');
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        authNav.innerHTML = `
            <div class="user-menu">
                <button class="user-menu-btn">
                    <i class="fas fa-user-circle"></i>
                    <span>${user.username}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="user-dropdown">
                    <a href="/Code/html/profile.html"><i class="fas fa-user"></i> Profile</a>
                    <a href="/Code/html/learning.html"><i class="fas fa-book"></i> My Courses</a>
                    <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
</div>
        `;

        // Add click event for user menu
        const userMenuBtn = document.querySelector('.user-menu-btn');
        const userDropdown = document.querySelector('.user-dropdown');
        
        userMenuBtn.addEventListener('click', () => {
            userDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    } else {
        authNav.innerHTML = `
            <li><a href="/Code/html/auth.html"><i class="fas fa-user"></i> Login</a></li>
        `;
    }
}

// Logout function
async function logout() {
    try {
        await fetch('http://127.0.0.1:8000/api/auth/logout/', {
            method: 'POST',
            credentials: 'include'
        });
        localStorage.removeItem('user');
        window.location.href = '/Code/html/index.html';
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Call updateAuthNav when the page loads
document.addEventListener('DOMContentLoaded', updateAuthNav);

// Add this to your existing JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userMenu = document.querySelector('.user-menu');
    const loginBtn = document.querySelector('.login-btn');
    
    if (userData) {
        userMenu.style.display = 'block';
        loginBtn.style.display = 'none';
    } else {
        userMenu.style.display = 'none';
        loginBtn.style.display = 'block';
    }

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        fetch('http://127.0.0.1:8000/api/auth/logout/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Clear user data from localStorage
                localStorage.removeItem('userData');
                // Hide user menu and show login button
                userMenu.style.display = 'none';
                loginBtn.style.display = 'block';
                // Redirect to auth page
                window.location.href = 'auth.html';
            } else {
                throw new Error('Logout failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Even if the server request fails, clear local data and redirect
            localStorage.removeItem('userData');
            userMenu.style.display = 'none';
            loginBtn.style.display = 'block';
            window.location.href = 'auth.html';
        });
    });
});
