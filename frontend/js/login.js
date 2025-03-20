// Form Handling
const loginForm = document.getElementById('loginForm');
const loader = document.querySelector('.loader');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loader
    loader.classList.remove('hidden');
    
    // Get form data
    const formData = {
        email: loginForm.email.value,
        password: loginForm.password.value,
        remember: loginForm.remember.checked
    };

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Here you would normally make an API call to your backend
        console.log('Login attempt:', formData);
        
        // Redirect to dashboard on success
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        showError('Login failed. Please check your credentials.');
    } finally {
        loader.classList.add('hidden');
    }
});

// Password Toggle
const togglePassword = document.querySelector('.toggle-password');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
});

// Form Validation
function validateForm() {
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    let isValid = true;

    // Reset previous errors
    clearErrors();

    // Email validation
    if (!email || !email.includes('@')) {
        showError('Please enter a valid email address', 'email');
        isValid = false;
    }

    // Password validation
    if (!password || password.length < 6) {
        showError('Password must be at least 6 characters long', 'password');
        isValid = false;
    }

    return isValid;
}

// Error Handling
function showError(message, field = null) {
    if (field) {
        const input = document.getElementById(field);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
        input.classList.add('error');
    } else {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message global';
        errorDiv.textContent = message;
        loginForm.insertBefore(errorDiv, loginForm.firstChild);
    }
}

function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    const inputs = document.querySelectorAll('.error');
    errors.forEach(error => error.remove());
    inputs.forEach(input => input.classList.remove('error'));
}

// Social Login Handlers
document.querySelector('.google').addEventListener('click', () => {
    // Implement Google OAuth login
    console.log('Google login clicked');
});

document.querySelector('.github').addEventListener('click', () => {
    // Implement GitHub OAuth login
    console.log('GitHub login clicked');
});

// Add some nice animations
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.login-header, .form-group, .btn-login, .social-login');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 * index);
    });
});

// Input focus effects
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.parentNode.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
        input.parentNode.classList.remove('focused');
    });
});

// Remember me functionality
const rememberMe = document.querySelector('input[name="remember"]');
if (localStorage.getItem('remember')) {
    rememberMe.checked = true;
    loginForm.email.value = localStorage.getItem('userEmail') || '';
}

rememberMe.addEventListener('change', () => {
    if (rememberMe.checked) {
        localStorage.setItem('remember', 'true');
        localStorage.setItem('userEmail', loginForm.email.value);
    } else {
        localStorage.removeItem('remember');
        localStorage.removeItem('userEmail');
    }
});