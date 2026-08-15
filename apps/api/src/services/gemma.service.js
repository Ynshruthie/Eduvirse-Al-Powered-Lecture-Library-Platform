const axios = require('axios');
const { env } = require('../config/env');
const { logger } = require('../lib/logger');

/**
 * Service to interact with Hugging Face Gemma API
 */
class GemmaService {
  constructor() {
    this.apiUrl = 'https://router.huggingface.co/v1/chat/completions';
    this.model = 'google/gemma-3-4b-it';
  }

  /**
   * Generate structured lecture summary, key points, and quizzes from a transcript
   * @param {string} transcript - The transcribed text from the lecture
   * @returns {Promise<Object>} - Structured JSON object containing summary, key points, definitions, notes, and quizzes
   */
  async processTranscript(transcript) {
    if (!env.hfToken) {
      throw new Error('HF_TOKEN is not defined in the environment variables');
    }

    try {
      logger.info('Starting Gemma processing for transcript');
      
      const systemPrompt = `You are an expert educational assistant.
Generate a concise lecture summary and study materials in strict JSON format.

Requirements:
• Maximum 150 words for the summary
• Use bullet points for key points
• Explain concepts clearly
• Mention formulas if present
• Highlight important definitions
• Keep technical terminology

You must output ONLY valid JSON in the following format, with no markdown code blocks or extra text:
{
  "summary": "String",
  "key_points": ["String", "String"],
  "definitions": ["String", "String"],
  "revision_notes": "String",
  "quiz_questions": [
    {
      "question": "String",
      "options": ["String", "String", "String", "String"],
      "answer": "String"
    }
  ]
}`;

      const userPrompt = `Transcript:
${transcript}`;

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          // Tell the model we want JSON output
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Authorization': `Bearer ${env.hfToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      
      // Attempt to parse the content as JSON
      let structuredData;
      try {
        structuredData = JSON.parse(content);
      } catch (parseError) {
        // Fallback: sometimes LLMs still wrap in markdown despite instructions
        const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
        structuredData = JSON.parse(cleanedContent);
      }

      logger.info('Gemma processing completed successfully');
      return structuredData;
    } catch (error) {
      logger.error('Error in GemmaService processTranscript, falling back to mock data', {
        error: error.message,
        response: error.response?.data
      });
      // Fallback for demo if API limits are hit
      return {
        summary: "This is a fallback summary generated because the AI API was temporarily unavailable. The lecture covers essential fundamental concepts and definitions related to the topic, guiding students through practical applications and theoretical understanding.",
        key_points: [
          "Understanding the core principles",
          "Applying formulas effectively",
          "Practicing problem-solving techniques"
        ],
        definitions: [
          "Principle: A fundamental truth or proposition.",
          "Formula: A mathematical relationship or rule."
        ],
        revision_notes: "Review the main concepts covered in the video, focusing on the step-by-step examples provided.",
        quiz_questions: [
          {
            question: "What is the primary focus of this lecture?",
            options: ["Advanced theories", "Fundamental concepts", "Historical context", "Unrelated trivia"],
            answer: "Fundamental concepts"
          }
        ]
      };
    }
  }

  /**
   * Have a conversation with the AI assistant
   * @param {Array} messages - Array of message objects { sender: 'user'|'ai', text: '...' }
   * @param {string} lectureTitle - Title of the current lecture for context
   */
  async chat(messages, lectureTitle = 'Unknown Lecture', lectureSummary = '') {
    if (!env.hfToken) {
      throw new Error('HF_TOKEN is not defined in the environment variables');
    }

    try {
      logger.info('Starting Gemma chat completion');
      
      let summaryContext = '';
      if (lectureSummary === 'NOT_GENERATED') {
        summaryContext = `\nCRITICAL INSTRUCTION: The lecture video has NOT been transcribed yet. If the user asks you to summarize the lecture, explain the video, or answer questions about the video content, YOU MUST REFUSE TO DO SO. Politely inform them that you need to read the video first, and instruct them to click the "Generate Using Current Video" button in the "AI Summary" tab to transcribe the video. Do not guess what the video is about.`;
      } else if (lectureSummary) {
        summaryContext = `\nHere is the summary of the lecture content for your reference:\n"${lectureSummary}"`;
      }

      const systemPrompt = `You are a highly restricted AI. Your ONLY purpose is to answer questions about: "${lectureTitle}".${summaryContext}

CRITICAL DIRECTIVE:
If the user asks ANY question not directly related to the lecture, you must output EXACTLY the word "OFF_TOPIC" and absolutely nothing else.
Do NOT be polite. Do NOT explain why. Do NOT provide the answer. Just output "OFF_TOPIC".`;

      // Format messages for Gemma chat
      const formattedMessages = [
        { role: 'system', content: systemPrompt }
      ];
      
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        let content = msg.text;

        // If it's the last message from the user, wrap it in a strict directive
        if (i === messages.length - 1 && msg.sender !== 'ai') {
          content = `User input: "${msg.text}"\n\nIf this input is not about the lecture, reply ONLY with: OFF_TOPIC`;
        }

        formattedMessages.push({
          role: msg.sender === 'ai' ? 'assistant' : 'user',
          content: content
        });
      }

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: formattedMessages,
          max_tokens: 500,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${env.hfToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let reply = response.data.choices[0].message.content;
      
      if (reply.includes('OFF_TOPIC')) {
        reply = "I am programmed to only discuss the material in the current video. Please ask a question related to the lecture!";
      }

      logger.info('Gemma chat completed successfully');
      return reply;
      
    } catch (error) {
      logger.error('Error in GemmaService chat, falling back to mock response', {
        error: error.message,
        response: error.response?.data
      });
      // Fallback response for demo
      return "I'm having a little trouble connecting to my AI brain right now, but I'm the Eduvirse AI Assistant! I can help you summarize lectures, quiz you on topics, and answer your questions once I'm back online.";
    }
  }
}

module.exports = new GemmaService();
