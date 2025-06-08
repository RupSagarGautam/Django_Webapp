// Tab switching functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const forms = document.querySelectorAll('.auth-form');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons and forms
        tabBtns.forEach(b => b.classList.remove('active'));
        forms.forEach(f => f.classList.remove('active'));

        // Add active class to clicked button and corresponding form
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}Form`).classList.add('active');
    });
});

// Form validation functions
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
        isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
        errors: [
            password.length < minLength ? 'Password must be at least 8 characters long' : null,
            !hasUpperCase ? 'Password must contain at least one uppercase letter' : null,
            !hasLowerCase ? 'Password must contain at least one lowercase letter' : null,
            !hasNumbers ? 'Password must contain at least one number' : null,
            !hasSpecialChar ? 'Password must contain at least one special character' : null
        ].filter(Boolean)
    };
}

function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return {
        isValid: usernameRegex.test(username),
        errors: !usernameRegex.test(username) ? ['Username can only contain letters, numbers, and underscores (3-30 characters)'] : []
    };
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
        isValid: emailRegex.test(email),
        errors: !emailRegex.test(email) ? ['Please enter a valid email address'] : []
    };
}

// Signup form submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('signupError');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    // Clear previous errors
    errorDiv.textContent = '';

    // Validate all fields
    const usernameValidation = validateUsername(username);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!usernameValidation.isValid || !emailValidation.isValid || !passwordValidation.isValid) {
        const errors = [
            ...usernameValidation.errors,
            ...emailValidation.errors,
            ...passwordValidation.errors
        ];
        errorDiv.style.color = '#ef4444';
        errorDiv.textContent = errors.join('\n');
        return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        errorDiv.style.color = '#ef4444';
        errorDiv.textContent = 'Passwords do not match';
        return;
    }

    try {
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitBtn.disabled = true;

        // First, get the CSRF token
        const csrfResponse = await fetch('http://127.0.0.1:8000/api/csrf-token/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!csrfResponse.ok) {
            throw new Error('Failed to get CSRF token');
        }

        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrf_token;

        // Now make the signup request with the CSRF token
        const response = await fetch('http://127.0.0.1:8000/api/signup/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
            body: JSON.stringify({
                username: username.trim(),
                email: email.trim(),
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Show success message
            errorDiv.style.color = '#10b981';
            errorDiv.textContent = 'Account created successfully! Redirecting to login...';
            
            // Clear form
            e.target.reset();
            
            // Wait for 2 seconds to show the success message
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Switch to login tab
            document.querySelector('[data-tab="login"]').click();
            
            // Clear any previous error messages
            document.getElementById('loginError').textContent = '';
        } else {
            // Handle specific error cases
            let errorMessage = 'Signup failed. Please try again.';
            if (response.status === 403) {
                errorMessage = 'Access forbidden. Please try again or contact support.';
            } else if (response.status === 400) {
                errorMessage = data.error || 'Invalid input. Please check your details.';
            } else if (data.error) {
                errorMessage = data.error;
            }
            
            errorDiv.style.color = '#ef4444';
            errorDiv.textContent = errorMessage;
            
            // Log the error for debugging
            console.error('Signup error:', {
                status: response.status,
                data: data,
                headers: Object.fromEntries(response.headers.entries())
            });
        }
    } catch (error) {
        errorDiv.style.color = '#ef4444';
        errorDiv.textContent = 'An error occurred. Please try again.';
        console.error('Signup error:', error);
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
});

// Add real-time password matching validation
const signupPassword = document.getElementById('signupPassword');
const confirmPassword = document.getElementById('confirmPassword');
const signupError = document.getElementById('signupError');

function checkPasswordMatch() {
    if (confirmPassword.value && signupPassword.value !== confirmPassword.value) {
        signupError.style.color = '#ef4444';
        signupError.textContent = 'Passwords do not match';
    } else if (confirmPassword.value && signupPassword.value === confirmPassword.value) {
        signupError.textContent = '';
    }
}

signupPassword.addEventListener('input', checkPasswordMatch);
confirmPassword.addEventListener('input', checkPasswordMatch);

// Login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    // Clear previous errors
    errorDiv.textContent = '';

    // Basic validation
    if (!username) {
        errorDiv.style.color = '#ef4444';
        errorDiv.textContent = 'Please enter your username';
        return;
    }

    if (!password) {
        errorDiv.style.color = '#ef4444';
        errorDiv.textContent = 'Please enter your password';
        return;
    }

    // Username format validation
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
        errorDiv.style.color = '#ef4444';
        errorDiv.textContent = usernameValidation.errors[0];
        return;
    }

    try {
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;

        // First, get the CSRF token
        const csrfResponse = await fetch('http://127.0.0.1:8000/api/csrf-token/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!csrfResponse.ok) {
            throw new Error('Failed to get CSRF token');
        }

        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrf_token;

        // Make the login request with the CSRF token
        const response = await fetch('http://127.0.0.1:8000/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Validate the response data
            if (!data.username || !data.email) {
                throw new Error('Invalid response from server');
            }

            // Store user info in localStorage
            localStorage.setItem('userData', JSON.stringify({
                username: data.username,
                email: data.email
            }));
            
            // Show success message
            errorDiv.style.color = '#10b981';
            errorDiv.textContent = 'Login successful! Redirecting...';
            window.location.href = '/Code/html/index.html';
            
            // Wait for 1 second to show the success message
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } else {
            // Handle specific error cases
            let errorMessage = 'Login failed. Please try again.';
            if (response.status === 403) {
                errorMessage = 'Access forbidden. Please try again or contact support.';
            } else if (response.status === 401) {
                errorMessage = 'Invalid username or password.';
            } else if (response.status === 400) {
                errorMessage = data.error || 'Invalid input. Please check your details.';
            } else if (data.error) {
                errorMessage = data.error;
            }
            
            errorDiv.style.color = '#ef4444';
            errorDiv.textContent = errorMessage;
            
            // Log the error for debugging
            console.error('Login error:', {
                status: response.status,
                data: data,
                headers: Object.fromEntries(response.headers.entries())
            });
        }
    } catch (error) {
        errorDiv.style.color = '#ef4444';
        errorDiv.textContent = 'An error occurred. Please try again.';
        console.error('Login error:', error);
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
});

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userMenu = document.querySelector('.user-menu');
    
    if (userData) {
        userMenu.style.display = 'block';
    }

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        fetch('http://127.0.0.1:8000/api/auth/logout/', {
            method: 'POST',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            localStorage.removeItem('userData');
            window.location.href = 'auth.html';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}); 