const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const DATA_FILE = 'participants.json';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

// Ensure the JSON file exists on startup
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// 1. HOME PAGE
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. REGISTER (With Duplicate Check)
app.post('/register', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.send("Name and Email are required.");

    const participants = JSON.parse(fs.readFileSync(DATA_FILE));
    const isDuplicate = participants.some(p => p.email.toLowerCase() === email.toLowerCase());

    if (isDuplicate) {
        return res.send(`
            <div style="font-family:sans-serif; text-align:center; margin-top:50px;">
                <h2 style="color:#ef4444;">Already Registered!</h2>
                <p>The email <strong>${email}</strong> is already in the list.</p>
                <a href="/">Go Back</a>
            </div>
        `);
    }

    participants.push({ name, email, date: new Date().toLocaleString() });
    fs.writeFileSync(DATA_FILE, JSON.stringify(participants, null, 2));

    res.send(`
        <div style="font-family:sans-serif; text-align:center; margin-top:50px;">
            <h2 style="color:#10b981;">Success!</h2>
            <p>Thanks ${name}, you are entered.</p>
            <a href="/">Go Back</a>
        </div>
    `);
});

// 3. ADMIN VIEW (Check registrations here anytime!)
app.get('/admin-dashboard', (req, res) => {
    const participants = JSON.parse(fs.readFileSync(DATA_FILE));
    
    let rows = participants.map(p => 
        `<tr><td>${p.name}</td><td>${p.email}</td><td>${p.date}</td></tr>`
    ).join('');

    res.send(`
        <html>
        <body style="font-family:sans-serif; padding:20px;">
            <h2>📊 Giveaway Participants (${participants.length})</h2>
            <table border="1" cellpadding="10" style="border-collapse:collapse; width:100%;">
                <tr style="background:#eee;"><th>Name</th><th>Email</th><th>Date Joined</th></tr>
                ${rows || '<tr><td colspan="3">No one has registered yet.</td></tr>'}
            </table>
            <br>
            <button onclick="window.location.href='/pick-winner'">Pick Random Winner</button>
            <a href="/">Go to Home</a>
        </body>
        </html>
    `);
});

// 4. PICK WINNER
app.get('/pick-winner', (req, res) => {
    const participants = JSON.parse(fs.readFileSync(DATA_FILE));
    if (participants.length === 0) return res.send("No participants to pick from.");
    
    const winner = participants[Math.floor(Math.random() * participants.length)];
    res.send(`
        <div style="font-family:sans-serif; text-align:center; padding:50px; border:5px solid gold; border-radius:20px;">
            <h1>🎉 The Winner is...</h1>
            <h2 style="color:#6366f1;">${winner.name}</h2>
            <p>Email: ${winner.email}</p>
            <a href="/admin-dashboard">Back to Dashboard</a>
        </div>
    `);
});

app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
