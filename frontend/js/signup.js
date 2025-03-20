// Form Handling
const signupForm = document.getElementById('signupForm');
const loader = document.querySelector('.loader');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    // Show loader
    loader.classList.remove('hidden');
    
    // Get form data
    const formData = {
        firstName: signupForm.firstName.value,
        lastName: signupForm.lastName.value,
        email: signupForm.email.value,
        password: signupForm.password.value,
        userType: signupForm.userType.value,
        terms: signupForm.terms.checked
    };

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Here you would normally make an API call to your backend
        console.log('Signup attempt:', formData);
        
        // Redirect to dashboard on success
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        showError('Signup failed. Please try again.');
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

// Password Strength Meter
const strengthMeter = document.querySelector('.meter-bar');
const strengthText = document.querySelector('.strength-text');

passwordInput.addEventListener('input', updatePasswordStrength);

function updatePasswordStrength() {
    const password = passwordInput.value;
    const strength = calculatePasswordStrength(password);
    
    // Update meter
    strengthMeter.style.width = `${strength}%`;
    
    // Update color
    if (strength < 33) {
        strengthMeter.style.background = var(--error-color);
        strengthText.textContent = 'Weak password';
    } else if (strength < 66) {
        strengthMeter.style.background = '#f1c40f';
        strengthText.textContent = 'Medium strength';
    } else {
        strengthMeter.style.background = var(--success-color);
        strengthText.textContent = 'Strong password';
    }
}

function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Contains number
    if (/\d/.test(password)) strength += 25;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 25;
    
    return strength;
}

// Form Validation
function validateForm() {
    let isValid = true;
    clearErrors();

    // Name validation
    if (!signupForm.firstName.value.trim()) {
        showError('First name is required', 'firstName');
        isValid = false;
    }

    if (!signupForm.lastName.value.trim()) {
        showError('Last name is required', 'lastName');
        isValid = false;
    }

    // Email validation
    const email = signupForm.email.value;
    if (!email || !email.includes('@')) {
        showError('Please enter a valid email address', 'email');
        isValid = false;
    }

    // Password validation
    const password = signupForm.password.value;
    if (!password || password.length < 8) {
        showError('Password must be at least 8 characters long', 'password');
        isValid = false;
    }

    // Confirm password validation
    if (password !== signupForm.confirmPassword.value) {
        showError('Passwords do not match', 'confirmPassword');
        isValid = false;
    }

    // Terms checkbox validation
    if (!signupForm.terms.checked) {
        showError('You must agree to the Terms of Service', 'terms');
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
        signupForm.insertBefore(errorDiv, signupForm.firstChild);
    }
}

function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    const inputs = document.querySelectorAll('.error');
    errors.forEach(error => error.remove());
    inputs.forEach(input => input.classList.remove('error'));
}

// Social Signup Handlers
document.querySelector('.google').addEventListener('click', () => {
    // Implement Google OAuth signup
    console.log('Google signup clicked');
});

document.querySelector('.github').addEventListener('click', () => {
    // Implement GitHub OAuth signup
    console.log('GitHub signup clicked');
});

// Add animations
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.signup-header, .form-group, .btn-signup, .social-signup');
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