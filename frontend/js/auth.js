// Handle signup
async function handleSignup(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value
    };

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Store token
            localStorage.setItem('token', data.token);
            
            // Redirect based on role
            switch(formData.role) {
                case 'buyer':
                    window.location.href = '/buyer.html';
                    break;
                case 'seller':
                    window.location.href = '/seller.html';
                    break;
                case 'business':
                    window.location.href = '/business.html';
                    break;
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during signup');
    }
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Store token
            localStorage.setItem('token', data.token);
            
            // Redirect based on role
            switch(data.role) {
                case 'buyer':
                    window.location.href = '/buyer.html';
                    break;
                case 'seller':
                    window.location.href = '/seller.html';
                    break;
                case 'business':
                    window.location.href = '/business.html';
                    break;
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login');
    }
}