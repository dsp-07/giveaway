const express = require('express');
const path = require('path');
const app = express();

// Temporary storage (resets when Vercel puts the app to sleep)
let participants = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

// Serve Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle Registrations
app.post('/register', (req, res) => {
    const { name, email } = req.body;
    
    // Check if email already exists
    const isDuplicate = participants.some(p => p.email.toLowerCase() === email.toLowerCase());

    if (isDuplicate) {
        return res.send(`
            <div style="font-family:sans-serif; text-align:center; padding:50px;">
                <h2 style="color:red;">Already Entered!</h2>
                <p>This email is already in the giveaway.</p>
                <a href="/">Try Again</a>
            </div>
        `);
    }

    participants.push({ name, email, date: new Date().toLocaleString() });
    
    res.send(`
        <div style="font-family:sans-serif; text-align:center; padding:50px;">
            <h2 style="color:green;">Success!</h2>
            <p>You are now registered, ${name}. Good luck!</p>
            <a href="/">Go Back</a>
        </div>
    `);
});

// Admin Dashboard to see names
app.get('/admin-dashboard', (req, res) => {
    let list = participants.map(p => `<li>${p.name} (${p.email})</li>`).join('');
    res.send(`
        <body style="font-family:sans-serif; padding:20px;">
            <h1>Participants List (${participants.length})</h1>
            <ul>${list || 'No one yet.'}</ul>
            <hr>
            <button onclick="window.location.href='/pick-winner'">Pick Random Winner</button>
            <br><br><a href="/">Back to Home</a>
        </body>
    `);
});

// Winner Logic
app.get('/pick-winner', (req, res) => {
    if (participants.length === 0) return res.send("No participants yet.");
    const winner = participants[Math.floor(Math.random() * participants.length)];
    res.send(`<h1>Winner Found: ${winner.name}</h1><p>Email: ${winner.email}</p><a href="/admin-dashboard">Back</a>`);
});

// Export for Vercel
module.exports = app;
