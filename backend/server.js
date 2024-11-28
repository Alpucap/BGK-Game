require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const app = express();
const port = 5000;

app.use(cors());

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

client.connect();

app.use(express.json());

//Endpoint hasil permainannya nanti
app.post('/api/saveResult', async (req, res) => {
    const {playerChoice, computerChoice, result} = req.body;
    try {
        const query = 'INSERT INTO game_history (player_choice, computer_choice, result) VALUES ($1, $2, $3) RETURNING *';
        const values = [playerChoice, computerChoice, result];
        const resultFromDb = await client.query(query, values);
        res.status(200).json(resultFromDb.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//Endpoint mendapat history 
app.get('/api/history', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM game_history ORDER BY timestamp DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching history');
    }
});

//Endpoint untuk reset
app.post('/api/reset', async (req, res) => {
    try {
        const query = 'DELETE FROM game_history';
        await client.query(query);
        res.send('Database reset successful');
    } catch (err) {
        console.error('Error resetting database:', err);
        res.status(500).send('Error resetting database');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});