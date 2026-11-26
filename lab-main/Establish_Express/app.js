
const express = require('express');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Route 1: Home Page (GET)
app.get('/', (req, res) => {
    res.send('<h1>Welcome to Express Application</h1>');
});

// Route 2: About Page (GET)
app.get('/about', (req, res) => {
    res.send('<h1>About Us</h1><p>This is Express Application.</p>');
});

// Route 3: Contact Page (GET)
app.get('/contact', (req, res) => {
    res.send('<h1>Contact Us</h1><p>Email: abc@gmail.com</p>');
});

// Route 4: Login Form (GET)
app.get('/login', (req, res) => {
    res.send(`
        <h1>Login Form</h1>
        <form action="/login" method="POST">
            <input type="text" name="username" placeholder="Enter Username" required>
            <br><br>
            <input type="password" name="password" placeholder="Enter Password" required>
            <br><br>
            <button type="submit">Login</button>
        </form>
    `);
});

// Route 5: Login Submit (POST)
const handleLogin = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    res.send(`
        <h1>Login Successful</h1>
        <p>Welcome ${username}</p>
    `);
};

app.post(['/login', '/api/auth/login'], handleLogin);

// Start Server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
