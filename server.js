require('dotenv').config();
const express = require('express');
const path = require('path');
const studentsDB = require('./mock_db.json');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let globalWaste = 4342.77;

app.get('/api/leaderboard', (req, res) => {
    res.json({ total: globalWaste });
});

app.post('/api/cancel', (req, res) => {
    const { cost } = req.body;
    globalWaste -= cost;
    res.json({ success: true, newTotal: globalWaste });
});

app.post('/api/roast', (req, res) => {
    const { amount, vice, isSuccess } = req.body;

    console.log(`\n--- NEW REQUEST ---`);

    let selectedResponse = "";
    let studentData = {
        first_name: "You",
        subscriptions: [
            { name: "Custom Expense", monthly_cost: parseFloat(amount), minutes_used_last_month: 0 }
        ]
    };

    if (isSuccess) {
        selectedResponse = `System anomaly detected. You actually canceled your dead weight. You are officially in the top five percent of financially literate students. Let's get that money into T. Rowe Price.`;
    } else if (vice && vice.trim() !== "") {
        const lowerHabit = vice.toLowerCase();
        if (lowerHabit.includes("doordash") || lowerHabit.includes("uber eats") || lowerHabit.includes("food")) {
            selectedResponse = `You are spending ${amount} dollars on ${vice}? You are literally eating your retirement. Let T. Rowe Price cook instead.`;
        } else if (lowerHabit.includes("draftkings") || lowerHabit.includes("betting") || lowerHabit.includes("fanduel") || lowerHabit.includes("parlay")) {
            selectedResponse = `I parlayed your financial data, and your odds of retiring are zero. Draft T. Rowe Price instead.`;
        } else {
            selectedResponse = `If you keep blowing ${amount} dollars a month on ${vice}, your retirement plan is just hoping you find a bag of cash in the woods.`;
        }
    } else {
        // Pick a random student from mock_db.json
        const randomStudent = studentsDB[Math.floor(Math.random() * studentsDB.length)];
        console.log(`Pulled DB Record: ${randomStudent.first_name} (${randomStudent.major})`);
        selectedResponse = randomStudent.ai_roast;
        studentData = randomStudent; // Pass the whole student object including their custom subscriptions
    }

    res.json({ roast: selectedResponse, student: studentData });
});

app.post('/api/tts', async (req, res) => {
    const { text } = req.body;
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

    if (!elevenLabsKey) return res.status(500).json({ error: "No ElevenLabs key" });

    try {
        const voiceId = 'pNInz6obpgDQGcFmaJgB';
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': elevenLabsKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_flash_v2_5",
                voice_settings: { stability: 0.5, similarity_boost: 0.5 }
            })
        });

        if (!response.ok) throw new Error("ElevenLabs API failed");

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': buffer.length });
        res.send(buffer);

    } catch (error) {
        res.status(500).json({ error: "TTS failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));