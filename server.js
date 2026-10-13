const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// 1. Middleware to handle JSON and serve static frontend files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 2. Database Connection & Initialization (This automatically creates supportweek.db)
const dbFile = path.join(__dirname, 'supportweek.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database: supportweek.db');
        // Create a sample table if it doesn't already exist
        db.run(`CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            status TEXT DEFAULT 'Open'
        )`);
    }
});

// 3. API Routes (Backend Logic)
// GET: Fetch all tickets from the database
app.get('/api/tickets', (req, res) => {
    db.all(`SELECT * FROM tickets ORDER BY id DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ tickets: rows });
    });
});

// POST: Add a new ticket to the database
app.post('/api/tickets', (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    db.run(`INSERT INTO tickets (title) VALUES (?)`, [title], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, title, status: 'Open' });
    });
});

// 4. Start Server
app.listen(PORT, () => {
    console.log(`Full-stack application running at http://localhost:${PORT}`);
});