const path = require('path');
const fs = require('fs/promises');
const multer = require('multer');

const whisperService = require('../services/whisper.service');
const gemmaService = require('../services/gemma.service');
const lectureSummariesRepo = require('../data/lecture-summaries.repository');
const { logger } = require('../lib/logger');
const { ApiError } = require('../utils/api-error');

// Configure multer for temp file uploads
const uploadPath = path.resolve(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique name
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });


const fsSync = require('fs');
const { randomUUID } = require('crypto');

/**
 * Controller for lecture operations
 */
class LectureController {
  
  // Expose the multer middleware
  get uploadMiddleware() {
    return upload.single('lecture');
  }

  /**
   * Handle the lecture upload, transcription, summarization and storage
   */
  async uploadLecture(req, res, next) {
    let uploadedFilePath = null;
    try {
      const lectureId = req.body.lectureId;
      let videoUrl = req.body.videoUrl;
      
      if (!lectureId) {
        throw new ApiError(400, 'lectureId is required in the request body.');
      }

      if (req.file) {
        uploadedFilePath = req.file.path;
      } else if (videoUrl) {
        // Ensure upload directory exists
        if (!fsSync.existsSync(uploadPath)) {
          fsSync.mkdirSync(uploadPath, { recursive: true });
        }
        
        if (videoUrl) {
          // Download the file from videoUrl using native fetch
          logger.info(`Downloading video from URL: ${videoUrl}`);
          const tempFilename = `${Date.now()}-${randomUUID()}.mp4`;
          uploadedFilePath = path.join(uploadPath, tempFilename);
          
          try {
            const response = await fetch(videoUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            });
            if (!response.ok) {
              throw new Error(`Failed to fetch video: ${response.statusText}`);
            }
            
            const fileStream = fsSync.createWriteStream(uploadedFilePath);
            
            if (response.body.pipe) {
               // Node.js fetch with node-fetch polyfill (if applicable)
               response.body.pipe(fileStream);
            } else {
               // Native web ReadableStream
               const { Readable } = require('stream');
               const readableWebToNodeStream = Readable.fromWeb(response.body);
               readableWebToNodeStream.pipe(fileStream);
            }
            
            await new Promise((resolve, reject) => {
              fileStream.on('finish', resolve);
              fileStream.on('error', reject);
            });
          } catch (downloadErr) {
            logger.warn(`Failed to download video, proceeding without file: ${downloadErr.message}`);
            uploadedFilePath = null;
          }
        }
      } else {
        throw new ApiError(400, 'Either a lecture file or a videoUrl must be provided.');
      }

      const title = req.body.title || '';
      const description = req.body.description || '';

      logger.info(`Processing lecture upload for lectureId: ${lectureId}`);

      // 1. Send to Whisper to get Transcript
      const transcript = await whisperService.transcribe(uploadedFilePath, videoUrl, title, description);
      
      logger.info('Transcription successful, calling Gemma...');

      // 2. Send transcript to Gemma to get Summary, Key Points, Quizzes
      const aiStructuredData = await gemmaService.processTranscript(transcript);

      logger.info('Gemma processing successful, saving to database...');

      // 3. Save to database (lecture_summaries)
      const savedRecord = await lectureSummariesRepo.saveLectureSummary(lectureId, aiStructuredData);

      // Clean up uploaded file
      if (uploadedFilePath) {
        try {
          await fs.unlink(uploadedFilePath);
        } catch (err) {
          logger.warn(`Failed to delete temporary uploaded file: ${uploadedFilePath}`, err);
        }
      }

      return res.status(201).json({
        message: 'Lecture uploaded and processed successfully',
        data: savedRecord
      });
    } catch (error) {
      // Clean up on error
      if (uploadedFilePath) {
        try {
          await fs.unlink(uploadedFilePath);
        } catch (err) {}
      }
      return res.status(500).json({ success: false, error: error.message, stack: error.stack });
    }
  }

  /**
   * Fetch a lecture summary directly from the DB
   */
  async getSummary(req, res, next) {
    try {
      const { lectureId } = req.params;
      if (!lectureId) {
        throw new ApiError(400, 'lectureId is required');
      }

      const summary = await lectureSummariesRepo.getLectureSummary(lectureId);
      
      if (!summary) {
        return res.status(404).json({ message: 'Summary not found for this lecture.' });
      }

      return res.json({ data: summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * AI Assistant Chat Endpoint
   */
  async chat(req, res, next) {
    try {
      const { messages, lectureTitle, lectureSummary } = req.body;
      if (!messages || !Array.isArray(messages)) {
        throw new ApiError(400, 'messages array is required');
      }

      const reply = await gemmaService.chat(messages, lectureTitle, lectureSummary);

      return res.status(200).json({
        success: true,
        reply
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LectureController();
