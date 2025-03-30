document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loader = document.querySelector('.loader');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        loader.classList.remove('hidden'); // Show loader

        const formData = {
            email: loginForm.email.value,
            password: loginForm.password.value
        };

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                alert('Login successful! Redirecting to dashboard...');
                window.location.href = 'dashboard.html';
            } else {
                showError(data.message || 'Invalid email or password.');
            }
        } catch (error) {
            showError('Something went wrong. Please try again.');
        } finally {
            loader.classList.add('hidden'); // Hide loader
        }
    });

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        loginForm.insertBefore(errorDiv, loginForm.firstChild);
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(e => e.remove());
    }
});