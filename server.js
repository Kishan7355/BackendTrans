const express = require('express');
const bodyParser = require('body-parser');
const { getTranscript } = require('youtube-transcript');
const app = express();

// Middleware to parse JSON
app.use(bodyParser.json());

// Serve static files (e.g., HTML, CSS, JS) from the "public" directory
app.use(express.static('public'));

// Function to extract video ID
function getVideoId(url) {
    const youtubeUrlPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com(?:\/[^\/]+)*\/(?:watch\?v=|(?:v|e(?:mbed)?)\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeUrlPattern);
    return match ? match[1] : null;
}

// API endpoint to get the transcript
app.post('/get_transcript', async (req, res) => {
    const { youtube_url, language_code = 'en' } = req.body;

    const videoId = getVideoId(youtube_url);
    if (!videoId) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        const transcript = await getTranscript(videoId, { lang: language_code });
        const textOutput = transcript.map(entry => entry.text).join('\n');
        res.json({ transcript: textOutput });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
