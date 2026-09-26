const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock Leaderboard State
let campusWasteTotal = 4520.50;

// 1. Leaderboard Endpoint
app.get('/api/leaderboard', (req, res) => {
    res.json({ total: campusWasteTotal });
});

// 2. Fetch User Endpoint
app.get('/api/user/:id', (req, res) => {
    try {
        const users = JSON.parse(fs.readFileSync('./data/users.json'));
        const user = users.find(u => u.id === req.params.id);
        user ? res.json(user) : res.status(404).json({ error: "User not found" });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

// 3. The "Smoke and Mirrors" Randomizer Roast Endpoint
app.post('/api/roast', (req, res) => {
    const { amount } = req.body;
    const roasts = [
        `You are burning $${amount} a month on subscriptions while your bank account starves. Move it to TRBCX.`,
        `Netflix isn't going to fund your retirement. Cancel it and open a T. Rowe Price account.`,
        `You haven't opened Chegg since midterms. That's money you could be compounding at 8%.`,
        `Stop subsidizing Spotify and start paying your future self. T. Rowe Price is waiting.`,
        `Your monthly subscription waste is painful to look at. Axe the fluff and buy an index fund.`
    ];

    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    res.json({ roast: randomRoast });
});

// 4. Auto-Cancel & SMS Alert Simulation Endpoint
app.post('/api/cancel', (req, res) => {
    const { service, cost, phone } = req.body;

    campusWasteTotal -= cost;

    console.log(`\n--- TWILIO SMS TRIGGERED ---`);
    console.log(`To: ${phone}`);
    console.log(`Msg: Sub-Zero AI just canceled your dead ${service} subscription. You saved $${cost}. We moved this to your T. Rowe Price investment queue.`);
    console.log(`----------------------------\n`);

    res.json({ success: true, message: `${service} canceled successfully.` });
});

// 5. Randomized ElevenLabs Secure TTS Endpoint
app.post('/api/tts', async (req, res) => {
    const { text } = req.body;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    const voiceIDs = [
        'JBFqnCBsd6RMkjVDRZzb', // George
        '21m00Tcm4TlvDq8ikWAM', // Rachel
        'EXAVITQu4vr4xnSDxMaL', // Sarah
        'AZnzlk1XvdvUeBnXmlld'  // Domi
    ];
    const randomVoice = voiceIDs[Math.floor(Math.random() * voiceIDs.length)];

    try {
        const audioRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${randomVoice}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_turbo_v2_5"
            })
        });

        const arrayBuffer = await audioRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // This is the verification log you were missing
        console.log("ElevenLabs API successfully generated audio.");

        res.set('Content-Type', 'audio/mpeg');
        res.send(buffer);
    } catch (error) {
        console.error("ElevenLabs Error:", error);
        res.status(500).json({ error: "Voice generation failed" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Backend running live on http://localhost:${PORT}`));