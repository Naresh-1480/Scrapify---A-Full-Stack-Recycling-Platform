document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const loader = document.querySelector('.loader');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        loader.classList.remove('hidden'); // Show loader

        const formData = {
            firstName: signupForm.firstName.value,
            lastName: signupForm.lastName.value,
            email: signupForm.email.value,
            password: signupForm.password.value,
            userType: signupForm.userType.value
        };

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Signup successful! Redirecting to login...');
                window.location.href = 'login.html';
            } else {
                showError(data.message || 'Signup failed. Try again.');
            }
        } catch (error) {
            showError('Something went wrong. Please try again.');
        } finally {
            loader.classList.add('hidden'); // Hide loader
        }
    });

    function validateForm() {
        let isValid = true;
        clearErrors();

        if (!signupForm.firstName.value.trim()) {
            showError('First name is required', 'firstName');
            isValid = false;
        }
        if (!signupForm.lastName.value.trim()) {
            showError('Last name is required', 'lastName');
            isValid = false;
        }
        if (!signupForm.email.value.includes('@')) {
            showError('Invalid email address', 'email');
            isValid = false;
        }
        if (signupForm.password.value.length < 8) {
            showError('Password must be at least 8 characters long', 'password');
            isValid = false;
        }
        if (signupForm.password.value !== signupForm.confirmPassword.value) {
            showError('Passwords do not match', 'confirmPassword');
            isValid = false;
        }
        return isValid;
    }

    function showError(message, field = null) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        if (field) {
            document.getElementById(field).parentNode.appendChild(errorDiv);
        } else {
            signupForm.insertBefore(errorDiv, signupForm.firstChild);
        }
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(e => e.remove());
    }
});
