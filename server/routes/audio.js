import express from 'express';
import OpenAI from 'openai';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import AudioHistory from '../models/AudioHistory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Helper function to add Indian accent characteristics to text
function addIndianAccent(text, voiceType) {
  let processedText = text;
  
  // Add voice-specific characteristics based on regional accents
  switch(voiceType) {
    case 'priya':
      // Sweet Hindi accent - North Indian, warm and friendly
      processedText = `[Speaking in a sweet, warm Hindi accent with gentle intonation] ${text}`;
      break;
    case 'meera':
      // Elegant Bengali accent - East Indian, sophisticated and cultured
      processedText = `[Speaking in an elegant, sophisticated Bengali accent with refined pronunciation] ${text}`;
      break;
    case 'anjali':
      // Warm Tamil accent - South Indian, welcoming and melodic
      processedText = `[Speaking in a warm, welcoming Tamil accent with musical intonation] ${text}`;
      break;
    case 'kavya':
      // Melodic Telugu accent - South Indian, expressive and rhythmic
      processedText = `[Speaking in a melodic, expressive Telugu accent with rhythmic flow] ${text}`;
      break;
    case 'diya':
      // Bright Punjabi accent - North Indian, energetic and cheerful
      processedText = `[Speaking in a bright, cheerful Punjabi accent with energetic tone] ${text}`;
      break;
    case 'zara':
      // Modern Gujarati accent - West Indian, confident and business-like
      processedText = `[Speaking in a modern, confident Gujarati accent with professional tone] ${text}`;
      break;
    case 'neha':
      // Soft Marathi accent - West Indian, gentle and soothing
      processedText = `[Speaking in a soft, gentle Marathi accent with soothing intonation] ${text}`;
      break;
    case 'isha':
      // Gentle Malayalam accent - South Indian, calm and peaceful
      processedText = `[Speaking in a gentle, calm Malayalam accent with peaceful tone] ${text}`;
      break;
    case 'riya':
      // Charming Kannada accent - South Indian, attractive and engaging
      processedText = `[Speaking in a charming, engaging Kannada accent with attractive intonation] ${text}`;
      break;
    case 'aisha':
      // Graceful Kashmiri accent - North Indian, elegant and refined
      processedText = `[Speaking in a graceful, refined Kashmiri accent with elegant pronunciation] ${text}`;
      break;
    case 'maya':
      // Vibrant Assamese accent - East Indian, lively and dynamic
      processedText = `[Speaking in a vibrant, dynamic Assamese accent with lively tone] ${text}`;
      break;
    case 'sana':
      // Elegant Odia accent - East Indian, sophisticated and cultured
      processedText = `[Speaking in an elegant, sophisticated Odia accent with cultured pronunciation] ${text}`;
      break;
    default:
      processedText = text;
  }
  
  return processedText;
}

// Helper function to split text into chunks intelligently
function splitTextIntoChunks(text, maxLength) {
  if (text.length <= maxLength) {
    return [text];
  }
  
  const chunks = [];
  let currentChunk = '';
  const sentences = text.split(/(?<=[.!?।])\s+/); // Split by sentence endings
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed the limit
    if ((currentChunk + sentence).length > maxLength) {
      // If current chunk is not empty, save it
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      
      // If the sentence itself is longer than maxLength, split it by words
      if (sentence.length > maxLength) {
        const words = sentence.split(' ');
        let tempChunk = '';
        
        for (const word of words) {
          if ((tempChunk + ' ' + word).length > maxLength) {
            if (tempChunk.trim()) {
              chunks.push(tempChunk.trim());
            }
            tempChunk = word;
          } else {
            tempChunk += (tempChunk ? ' ' : '') + word;
          }
        }
        
        if (tempChunk.trim()) {
          currentChunk = tempChunk.trim();
        } else {
          currentChunk = '';
        }
      } else {
        currentChunk = sentence;
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Available voices
const AVAILABLE_VOICES = [
  { id: 'alloy', name: 'Alloy', description: 'Clear and professional', category: 'standard' },
  { id: 'echo', name: 'Echo', description: 'Warm and friendly', category: 'standard' },
  { id: 'fable', name: 'Fable', description: 'Storytelling voice', category: 'standard' },
  { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative', category: 'standard' },
  { id: 'nova', name: 'Nova', description: 'Bright and energetic', category: 'standard' },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft and melodic', category: 'standard' },
  // Indian female voices with different characteristics
  { id: 'priya', name: 'Priya', description: 'Sweet Hindi accent', category: 'indian' },
  { id: 'meera', name: 'Meera', description: 'Elegant Bengali accent', category: 'indian' },
  { id: 'anjali', name: 'Anjali', description: 'Warm Tamil accent', category: 'indian' },
  { id: 'kavya', name: 'Kavya', description: 'Melodic Telugu accent', category: 'indian' },
  { id: 'diya', name: 'Diya', description: 'Bright Punjabi accent', category: 'indian' },
  { id: 'zara', name: 'Zara', description: 'Modern Gujarati accent', category: 'indian' },
  { id: 'neha', name: 'Neha', description: 'Soft Marathi accent', category: 'indian' },
  { id: 'isha', name: 'Isha', description: 'Gentle Malayalam accent', category: 'indian' },
  { id: 'riya', name: 'Riya', description: 'Charming Kannada accent', category: 'indian' },
  { id: 'aisha', name: 'Aisha', description: 'Graceful Kashmiri accent', category: 'indian' },
  { id: 'maya', name: 'Maya', description: 'Vibrant Assamese accent', category: 'indian' },
  { id: 'sana', name: 'Sana', description: 'Elegant Odia accent', category: 'indian' }
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

    // Split text into chunks if it's too long (OpenAI limit is 4096 characters)
    const MAX_CHAR_LIMIT = 4000; // Leave some buffer
    const textChunks = splitTextIntoChunks(text, MAX_CHAR_LIMIT);
    
    let audioFiles = [];
    let totalDuration = 0;
    
    // Process each chunk
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      let processedText = chunk;
      
      // Handle Indian voices with special processing
      if (voice.startsWith('priya') || voice.startsWith('meera') || voice.startsWith('anjali') || 
          voice.startsWith('kavya') || voice.startsWith('diya') || voice.startsWith('zara') ||
          voice.startsWith('neha') || voice.startsWith('isha') || voice.startsWith('riya') ||
          voice.startsWith('aisha') || voice.startsWith('maya') || voice.startsWith('sana')) {
        // For Indian voices, use a base voice and add Indian accent characteristics
        const baseVoice = 'nova'; // Use Nova as base for Indian voices
        processedText = addIndianAccent(chunk, voice);
        
        const mp3 = await openai.audio.speech.create({
          model: "tts-1",
          voice: baseVoice,
          input: processedText,
        });
        
        // Save the audio file
        const timestamp = Date.now();
        const filename = `audio_${timestamp}_${Math.random().toString(36).substr(2, 9)}_part${i + 1}.mp3`;
        const filepath = path.join(audioDir, filename);
        
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.writeFile(filepath, buffer);
        
        // Get file stats for duration (approximate)
        const stats = await fs.stat(filepath);
        const duration = Math.ceil(stats.size / 16000); // Rough estimation
        
        audioFiles.push({
          filename: filename,
          url: `/api/audio/${filename}`,
          duration: duration,
          text: chunk.substring(0, 100) + (chunk.length > 100 ? '...' : '')
        });
        
        totalDuration += duration;
      } else {
        // Standard voices
        const mp3 = await openai.audio.speech.create({
          model: "tts-1",
          voice: voice,
          input: processedText,
        });
        
        // Save the audio file
        const timestamp = Date.now();
        const filename = `audio_${timestamp}_${Math.random().toString(36).substr(2, 9)}_part${i + 1}.mp3`;
        const filepath = path.join(audioDir, filename);
        
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.writeFile(filepath, buffer);
        
        // Get file stats for duration (approximate)
        const stats = await fs.stat(filepath);
        const duration = Math.ceil(stats.size / 16000); // Rough estimation
        
        audioFiles.push({
          filename: filename,
          url: `/api/audio/${filename}`,
          duration: duration,
          text: chunk.substring(0, 100) + (chunk.length > 100 ? '...' : '')
        });
        
        totalDuration += duration;
      }
    }

    // Save to history for each audio file
    for (const audioFile of audioFiles) {
      const audioHistory = new AudioHistory({
        text: audioFile.text.substring(0, 200), // Store first 200 chars
        voice,
        audioUrl: audioFile.url,
        duration: audioFile.duration,
        ipAddress
      });

      await audioHistory.save();
    }

    // Return response with all audio files
    res.json({
      success: true,
      audioFiles: audioFiles,
      totalDuration: totalDuration,
      totalParts: audioFiles.length,
      voice,
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      originalLength: text.length
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

export default router; 