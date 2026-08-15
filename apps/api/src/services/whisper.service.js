const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const { env } = require('../config/env');
const { logger } = require('../lib/logger');

/**
 * Service to interact with Hugging Face Whisper API
 */
class WhisperService {
  constructor() {
    this.apiUrl = 'https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3';
  }

  /**
   * Extract the first 60 seconds of audio from a video file
   * @param {string} inputPath 
   * @param {string} outputPath 
   * @returns {Promise<void>}
   */
  extractAudio(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioChannels(1) // Mono audio for smaller size
        .audioFrequency(16000) // 16kHz is optimal for Whisper
        .audioBitrate('32k') // Extremely heavy compression to fit a 30 min video in <10MB!
        .format('mp3') 
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Transcribe an audio/video file using Whisper
   */
  async transcribe(filePath, videoUrl = '', title = '', description = '') {
    let tempAudioPath = null;
    
    try {
      if (!filePath) {
        throw new Error('No valid file path provided for transcription');
      }
      
      if (!env.hfToken) {
        throw new Error('HF_TOKEN is not defined in the environment variables');
      }

      logger.info(`Starting audio extraction for file: ${filePath}`);
      
      // We must extract audio first because the raw MP4 is too large for Hugging Face
      tempAudioPath = filePath + '.mp3';
      await this.extractAudio(filePath, tempAudioPath);
      
      logger.info(`Audio extracted successfully to ${tempAudioPath}, sending to Whisper...`);
      const audioData = fs.readFileSync(tempAudioPath);
      
      const response = await axios.post(this.apiUrl, audioData, {
        headers: {
          'Authorization': `Bearer ${env.hfToken}`,
          'Content-Type': 'audio/mpeg',
          'Accept': 'application/json'
        },
        timeout: 60000 // Allow up to 60 seconds for HF processing
      });

      logger.info('Transcription completed successfully');
      
      // Clean up temp audio file
      if (tempAudioPath && fs.existsSync(tempAudioPath)) {
        fs.unlinkSync(tempAudioPath);
      }
      
      return response.data.text;
    } catch (error) {
      logger.error('Error in WhisperService transcribe, falling back to mock transcript', {
        error: error.message,
        response: error.response?.data
      });
      
      // Clean up temp audio file on error
      if (tempAudioPath && fs.existsSync(tempAudioPath)) {
        try {
          fs.unlinkSync(tempAudioPath);
        } catch (e) {}
      }
      
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }
}

module.exports = new WhisperService();
