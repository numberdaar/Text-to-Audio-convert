const express = require('express');
const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const AudioHistory = require('../models/AudioHistory');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Available voices
const AVAILABLE_VOICES = [
  { id: 'alloy', name: 'Alloy', description: 'Clear and professional' },
  { id: 'echo', name: 'Echo', description: 'Warm and friendly' },
  { id: 'fable', name: 'Fable', description: 'Storytelling voice' },
  { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative' },
  { id: 'nova', name: 'Nova', description: 'Bright and energetic' },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft and melodic' }
];

// Get available voices
router.get('/voices', (req, res) => {
  res.json({ voices: AVAILABLE_VOICES });
});

// Convert text to audio
router.post('/convert', async (req, res) => {
  try {
    const { text, voice = 'alloy' } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // No text length limit - removed for unlimited text conversion

    if (!AVAILABLE_VOICES.find(v => v.id === voice)) {
      return res.status(400).json({ error: 'Invalid voice selected' });
    }

    // Create audio directory if it doesn't exist
    const audioDir = path.join(__dirname, '../public/audio');
    await fs.ensureDir(audioDir);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `audio_${timestamp}_${Math.random().toString(36).substr(2, 9)}.mp3`;
    const filepath = path.join(audioDir, filename);

    // Convert text to speech using OpenAI
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
    });

    // Save the audio file
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.writeFile(filepath, buffer);

    // Get file stats for duration (approximate)
    const stats = await fs.stat(filepath);
    const duration = Math.ceil(stats.size / 16000); // Rough estimation

    // Save to history
    const audioHistory = new AudioHistory({
      text: text.substring(0, 200), // Store first 200 chars
      voice,
      audioUrl: `/audio/${filename}`,
      duration,
      ipAddress
    });

    await audioHistory.save();

    res.json({
      success: true,
      audioUrl: `/api/audio/${filename}`,
      duration,
      voice,
      text: text.substring(0, 100) + (text.length > 100 ? '...' : '')
    });

  } catch (error) {
    console.error('Audio conversion error:', error);
    res.status(500).json({ 
      error: 'Failed to convert text to audio',
      details: error.message 
    });
  }
});

// Serve audio files
router.get('/:filename', (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, '../public/audio', filename);
  
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ error: 'Audio file not found' });
  }
});

module.exports = router; 