import express from 'express';
import OpenAI from 'openai';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import AudioHistory from '../models/AudioHistory.js';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Set ffmpeg path with error handling
const USE_FFMPEG = true; // Set to false to disable FFmpeg
try {
  if (USE_FFMPEG) {
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    console.log('FFmpeg path set successfully:', ffmpegInstaller.path);
  } else {
    console.log('FFmpeg disabled, using fallback merge method');
  }
} catch (error) {
  console.error('Error setting FFmpeg path:', error);
  console.log('FFmpeg installer path:', ffmpegInstaller.path);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Helper function to merge audio files
async function mergeAudioFiles(audioFiles, outputPath) {
  return new Promise((resolve, reject) => {
    // Check if all input files exist
    for (const file of audioFiles) {
      if (!fs.existsSync(file)) {
        return reject(new Error(`Input file not found: ${file}`));
      }
    }

    console.log(`Starting to merge ${audioFiles.length} audio files...`);
    console.log('Input files:', audioFiles);
    console.log('Output path:', outputPath);

    // If FFmpeg is disabled, use simple merge
    if (!USE_FFMPEG) {
      console.log('FFmpeg disabled, using simple merge');
      simpleAudioMerge(audioFiles, outputPath)
        .then(resolve)
        .catch(reject);
      return;
    }

    try {
      const command = ffmpeg();
      
      // Add all input files
      audioFiles.forEach((file, index) => {
        console.log(`Adding input file ${index + 1}: ${file}`);
        command.input(file);
      });
      
      // Merge files with proper options
      command
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('FFmpeg progress:', progress);
        })
        .on('end', () => {
          console.log('Audio files merged successfully');
          // Verify the output file exists
          if (fs.existsSync(outputPath)) {
            console.log('Output file created:', outputPath);
            resolve(outputPath);
          } else {
            reject(new Error('Output file was not created'));
          }
        })
        .on('error', (err) => {
          console.error('Error merging audio files:', err);
          reject(err);
        })
        .mergeToFile(outputPath, path.dirname(outputPath));
    } catch (error) {
      console.error('FFmpeg initialization error:', error);
      reject(error);
    }
  });
}

// Fallback function if FFmpeg fails
async function simpleAudioMerge(audioFiles, outputPath) {
  console.log('Using fallback audio merge method...');
  
  try {
    // Read all audio files
    const audioBuffers = [];
    for (const file of audioFiles) {
      const buffer = await fs.readFile(file);
      audioBuffers.push(buffer);
    }
    
    // Concatenate buffers (simple approach)
    const mergedBuffer = Buffer.concat(audioBuffers);
    
    // Write merged file
    await fs.writeFile(outputPath, mergedBuffer);
    
    console.log('Simple merge completed:', outputPath);
    return outputPath;
  } catch (error) {
    console.error('Simple merge failed:', error);
    throw error;
  }
}

// Helper function to add Hindi tone characteristics to text
function addHindiTone(text, voiceType) {
  let processedText = text;
  switch(voiceType) {
    case 'politic':
      processedText = `[Speaking in a confident, persuasive Hindi female political tone] ${text}`;
      break;
    case 'romantic':
      processedText = `[Speaking in a soft, romantic Hindi female tone] ${text}`;
      break;
    case 'cute':
      processedText = `[Speaking in a cute, playful Hindi female tone] ${text}`;
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
  // Hindi female voices with different tones
  { id: 'politic', name: 'Politic', description: 'Confident, persuasive Hindi female tone', category: 'hindi' },
  { id: 'romantic', name: 'Romantic', description: 'Soft, romantic Hindi female tone', category: 'hindi' },
  { id: 'cute', name: 'Cute', description: 'Cute, playful Hindi female tone', category: 'hindi' }
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
    let audioFilePaths = []; // Store file paths for merging
    
    // Process each chunk
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      let processedText = chunk;
      
      // Handle Hindi female tones
      if (voice === 'politic' || voice === 'romantic' || voice === 'cute') {
        // Use Nova as base for Hindi voices
        const baseVoice = 'nova';
        processedText = addHindiTone(chunk, voice);
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
        audioFilePaths.push(filepath);
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
        audioFilePaths.push(filepath);
        totalDuration += duration;
      }
    }

    // Merge audio files if there are multiple parts
    let mergedAudioFile = null;
    if (audioFiles.length > 1) {
      try {
        console.log(`Attempting to merge ${audioFiles.length} audio files...`);
        console.log('Audio file paths:', audioFilePaths);
        
        // Verify all files exist before merging
        for (const filePath of audioFilePaths) {
          if (!fs.existsSync(filePath)) {
            throw new Error(`Audio file not found: ${filePath}`);
          }
        }
        
        const timestamp = Date.now();
        const mergedFilename = `audio_${timestamp}_${Math.random().toString(36).substr(2, 9)}_merged.mp3`;
        const mergedFilepath = path.join(audioDir, mergedFilename);
        
        console.log('Merging to:', mergedFilepath);
        
        // Try FFmpeg first, fallback to simple merge if it fails
        try {
          await mergeAudioFiles(audioFilePaths, mergedFilepath);
        } catch (ffmpegError) {
          console.error('FFmpeg merge failed, trying fallback:', ffmpegError);
          await simpleAudioMerge(audioFilePaths, mergedFilepath);
        }
        
        // Verify the merged file was created
        if (fs.existsSync(mergedFilepath)) {
          const mergedStats = await fs.stat(mergedFilepath);
          console.log('Merged file size:', mergedStats.size, 'bytes');
          
          mergedAudioFile = {
            filename: mergedFilename,
            url: `/api/audio/${mergedFilename}`,
            duration: totalDuration,
            text: text.substring(0, 100) + (text.length > 100 ? '...' : '')
          };
          
          console.log('Successfully created merged audio file:', mergedAudioFile);
        } else {
          throw new Error('Merged file was not created');
        }
      } catch (error) {
        console.error('Failed to merge audio files:', error);
        console.error('Error details:', error.message);
        // Continue without merged file if merging fails
        // The individual parts will still be available
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

    // Return response with all audio files and merged file
    res.json({
      success: true,
      audioFiles: audioFiles,
      mergedAudioFile: mergedAudioFile,
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