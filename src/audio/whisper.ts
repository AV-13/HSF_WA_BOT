/**
 * Whisper Speech-to-Text Module
 * Handles audio message transcription using OpenAI Whisper API
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize OpenAI client for Whisper
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for Whisper transcription');
  }
  return new OpenAI({ apiKey });
}

/**
 * Download audio file from WhatsApp Media URL
 *
 * @param mediaUrl - WhatsApp media URL
 * @param accessToken - WhatsApp access token
 * @returns Path to downloaded file
 */
export async function downloadAudioFile(
  mediaUrl: string,
  accessToken: string
): Promise<string> {
  try {
    console.log(`🎵 Downloading audio from: ${mediaUrl}`);

    const response = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.statusText}`);
    }

    // Get the audio buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save to temp file with timestamp
    const filename = `audio_${Date.now()}.ogg`;
    const filepath = path.join(tempDir, filename);
    fs.writeFileSync(filepath, buffer);

    console.log(`✅ Audio downloaded to: ${filepath}`);
    return filepath;
  } catch (error: any) {
    console.error('❌ Error downloading audio file:', error);
    throw new Error(`Failed to download audio: ${error.message}`);
  }
}

/**
 * Transcribe audio file using Whisper API
 *
 * @param audioFilePath - Path to audio file
 * @param language - Optional language hint (ISO 639-1 code)
 * @returns Transcribed text
 */
export async function transcribeAudio(
  audioFilePath: string,
  language?: string
): Promise<string> {
  const openai = getOpenAIClient();

  try {
    console.log(`🎤 Transcribing audio file: ${audioFilePath}`);

    // Read the audio file
    const audioFile = fs.createReadStream(audioFilePath);

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: language, // Optional language hint for better accuracy
      response_format: 'text'
    });

    console.log(`✅ Transcription complete: "${transcription}"`);

    // Clean up the temp file
    try {
      fs.unlinkSync(audioFilePath);
      console.log(`🗑️ Cleaned up temp file: ${audioFilePath}`);
    } catch (cleanupError) {
      console.warn('⚠️ Failed to clean up temp file:', cleanupError);
    }

    return transcription.toString().trim();
  } catch (error: any) {
    console.error('❌ Error transcribing audio:', error);

    // Clean up on error too
    try {
      if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

/**
 * Get media URL from WhatsApp Media ID
 *
 * @param mediaId - WhatsApp media ID
 * @param accessToken - WhatsApp access token
 * @returns Media URL
 */
export async function getMediaUrl(
  mediaId: string,
  accessToken: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${mediaId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get media URL: ${response.statusText}`);
    }

    const data = await response.json() as { url: string };
    return data.url;
  } catch (error: any) {
    console.error('❌ Error getting media URL:', error);
    throw new Error(`Failed to get media URL: ${error.message}`);
  }
}

/**
 * Process audio message: download, transcribe, and clean up
 *
 * @param mediaId - WhatsApp media ID
 * @param accessToken - WhatsApp access token
 * @param languageHint - Optional language hint for better transcription
 * @returns Transcribed text
 */
export async function processAudioMessage(
  mediaId: string,
  accessToken: string,
  languageHint?: string
): Promise<string> {
  try {
    console.log(`🎧 Processing audio message: ${mediaId}`);

    // Step 1: Get media URL from media ID
    const mediaUrl = await getMediaUrl(mediaId, accessToken);

    // Step 2: Download audio file
    const audioFilePath = await downloadAudioFile(mediaUrl, accessToken);

    // Step 3: Transcribe audio using Whisper
    const transcription = await transcribeAudio(audioFilePath, languageHint);

    console.log(`✅ Audio processing complete: "${transcription}"`);
    return transcription;
  } catch (error: any) {
    console.error('❌ Error processing audio message:', error);
    throw new Error(`Failed to process audio message: ${error.message}`);
  }
}
