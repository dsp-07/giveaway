const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = 'participants.json';

// Ensure the JSON file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Route to handle registration
app.post('/register', (req, res) => {
    const { name, email } = req.body;
    const participants = JSON.parse(fs.readFileSync(DATA_FILE));
    
    participants.push({ name, email, date: new Date().toLocaleString() });
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(participants, null, 2));
    res.send('<h1>Success! You are entered.</h1><a href="/">Go Back</a>');
});

// Route to pick a winner
app.get('/pick-winner', (req, res) => {
    const participants = JSON.parse(fs.readFileSync(DATA_FILE));
    if (participants.length === 0) return res.send("No participants yet!");
    
    const winner = participants[Math.floor(Math.random() * participants.length)];
    res.json({ winner });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));