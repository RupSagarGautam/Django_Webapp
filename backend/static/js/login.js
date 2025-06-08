// script.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterButton = document.getElementById('show-register');
    const showLoginButton = document.getElementById('show-login');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    // Toggle Forms
    showRegisterButton.addEventListener('click', () => {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    });

    showLoginButton.addEventListener('click', () => {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    });

    // Toggle Navigation Menu
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Show login form by default
    loginForm.classList.add('active');
});

// DOM Elements
const loginFormElement = document.getElementById('login-form-element');
const registerFormElement = document.getElementById('register-form-element');
const passwordInputs = document.querySelectorAll('input[type="password"]');
const togglePasswordButtons = document.querySelectorAll('.toggle-password');

// Toggle Password Visibility
togglePasswordButtons.forEach(button => {
    button.addEventListener('click', () => {
        const input = button.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        button.querySelector('i').classList.toggle('fa-eye');
        button.querySelector('i').classList.toggle('fa-eye-slash');
    });
});

// Password Strength Meter
const registerPassword = document.getElementById('register-password');
const strengthMeter = document.querySelector('.strength-meter');
const strengthText = document.querySelector('.strength-text');

registerPassword.addEventListener('input', updatePasswordStrength);

function updatePasswordStrength() {
    const password = registerPassword.value;
    const strength = calculatePasswordStrength(password);
    
    strengthMeter.className = 'strength-meter';
    strengthText.textContent = '';
    
    if (password.length > 0) {
        if (strength < 3) {
            strengthMeter.classList.add('weak');
            strengthText.textContent = 'Weak password';
        } else if (strength < 4) {
            strengthMeter.classList.add('medium');
            strengthText.textContent = 'Medium password';
        } else {
            strengthMeter.classList.add('strong');
            strengthText.textContent = 'Strong password';
        }
    }
}

function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character type checks
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
}

// Form Validation
function showError(input, message) {
    const errorElement = document.getElementById(`${input.id}-error`);
    errorElement.textContent = message;
    errorElement.classList.add('visible');
    input.classList.add('error');
}

function clearError(input) {
    const errorElement = document.getElementById(`${input.id}-error`);
    errorElement.textContent = '';
    errorElement.classList.remove('visible');
    input.classList.remove('error');
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    let isValid = true;
    
    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');
    
    // Clear previous errors
    clearError(email);
    clearError(password);
    
    // Validate email
    if (!email.value) {
        showError(email, 'Email is required');
        isValid = false;
    } else if (!validateEmail(email.value)) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate password
    if (!password.value) {
        showError(password, 'Password is required');
        isValid = false;
    }
    
    if (isValid) {
        const submitButton = loginFormElement.querySelector('button[type="submit"]');
        submitButton.classList.add('loading');
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Handle successful login here
            console.log('Login successful');
            
        } catch (error) {
            console.error('Login failed:', error);
            
        } finally {
            submitButton.classList.remove('loading');
        }
    }
});

registerFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    let isValid = true;
    
    const name = document.getElementById('register-name');
    const email = document.getElementById('register-email');
    const password = document.getElementById('register-password');
    
    // Clear previous errors
    clearError(name);
    clearError(email);
    clearError(password);
    
    // Validate name
    if (!name.value) {
        showError(name, 'Name is required');
        isValid = false;
    }
    
    // Validate email
    if (!email.value) {
        showError(email, 'Email is required');
        isValid = false;
    } else if (!validateEmail(email.value)) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate password
    if (!password.value) {
        showError(password, 'Password is required');
        isValid = false;
    } else if (calculatePasswordStrength(password.value) < 3) {
        showError(password, 'Please choose a stronger password');
        isValid = false;
    }
    
    if (isValid) {
        const submitButton = registerFormElement.querySelector('button[type="submit"]');
        submitButton.classList.add('loading');
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Handle successful registration here
            console.log('Registration successful');
            
        } catch (error) {
            console.error('Registration failed:', error);
            
        } finally {
            submitButton.classList.remove('loading');
        }
    }
});
