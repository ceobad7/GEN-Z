function showRegister() {
    document.body.innerHTML = `
        <div class="welcome">
            <h1>GEN-Z</h1>
            <h2>Create Account</h2>

            <input type="text" placeholder="Full Name">
            <input type="text" placeholder="Username">
            <input type="email" placeholder="Email">
            <input type="password" placeholder="Password">

            <button onclick="alert('Registration system coming soon!')">
                Register
            </button>

            <button class="login" onclick="location.reload()">
                Back
            </button>
        </div>
    `;
}

function showLogin() {
    document.body.innerHTML = `
        <div class="welcome">
            <h1>GEN-Z</h1>
            <h2>Login</h2>

            <input type="text" placeholder="Username or Email">
            <input type="password" placeholder="Password">

            <button onclick="alert('Login system coming soon!')">
                Login
            </button>

            <button class="login" onclick="location.reload()">
                Back
            </button>
        </div>
    `;
}
