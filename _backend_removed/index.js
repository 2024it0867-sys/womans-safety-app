require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// In-Memory Mock Database for Hackathon
const users = [];
const alerts = [];
const latestLocations = {};

// WebSockets for real-time Police Dashboard Live Alerts
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.emit('initial_alerts', alerts);
});

// REST ENDPOINTS

// 1. Auth (Mock Registration)
app.post('/api/auth/register', (req, res) => {
    const { name, phone } = req.body;
    const user = { id: Date.now().toString(), name, phone, emergencyContacts: [] };
    users.push(user);
    res.json({ message: 'User registered successfully', user });
});

// 2. Setup Emergency Contacts
app.post('/api/users/:id/contacts', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.emergencyContacts = req.body.contacts || [];
    res.json({ message: 'Contacts updated', user });
});

// 3. Location Update & Risk Prediction (Simulated AI interaction)
app.post('/api/location', async (req, res) => {
    const { userId, latitude, longitude } = req.body;
    latestLocations[userId] = { latitude, longitude, timestamp: new Date() };

    // In a real system, we'd make a request to the Python AI service here
    // e.g. await axios.post('http://localhost:8000/predict_risk', { latitude, longitude, hour_of_day })

    // For MVPs, we mock the risk score locally if AI isn't reachable
    const riskScore = Math.floor(Math.random() * 100);
    const isHighRisk = riskScore > 75;

    res.json({
        userId,
        safeZone: !isHighRisk,
        riskScore,
        message: isHighRisk ? "High Risk Area. Be careful!" : "Safe Route."
    });
});

// 4. Emergency SOS System
app.post('/api/sos', (req, res) => {
    const { userId, latitude, longitude } = req.body;
    const alert = {
        id: Date.now(),
        userId,
        latitude,
        longitude,
        timestamp: new Date(),
        status: 'active'
    };
    alerts.push(alert);

    // Broadcast immediately to Police & Admin dashboards
    io.emit('new_sos_alert', alert);

    res.json({ message: 'SOS Alert Broadcasted Successfully!', alert });
});

// 5. Get all active alerts
app.get('/api/alerts', (req, res) => {
    res.json(alerts);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Backend Server running on port ${PORT}`));
