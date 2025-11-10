/**
 * WhatsApp Webhook Handler for Meta Business API
 * Handles incoming messages and webhook verification
 *
 * SIMPLIFIED VERSION - Menus only, no reservation flow
 */

import { Request, Response } from 'express';
import { WhatsAppClient } from './client.js';
import { Mastra } from '@mastra/core';
import { processUserMessage, detectLanguageWithMastra } from '../agent/mastra.js';
import { sessionManager } from '../sessionManager.js';
import { getDatabase } from '../database/supabase.js';
import {
  generateText,
  generateMenuMessage,
  generatePrompt,
  generateErrorMessage,
  generateListLabels
} from '../i18n/dynamicTranslation.js';
import { processAudioMessage } from '../audio/whisper.js';
import { generateLocationResponse, INCA_LONDON_LOCATION, type LocationData } from '../location/maps.js';

/**
 * Set to track processed message IDs (prevents duplicates)
 * Messages are kept for 5 minutes to handle Meta's webhook retries
 */
const processedMessages = new Set<string>();
const MESSAGE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Detect user's language from conversation history
 * Uses the most recent text messages to detect language, ignoring button IDs
 */
async function detectUserLanguage(
  userId: string,
  userMessage: string,
  mastra: Mastra,
  conversationHistory?: string
): Promise<string> {
  try {
    // Don't detect language from button IDs (they're in English by design)
    const isButtonClick = userMessage.startsWith('menu_') || userMessage.startsWith('action_');

    if (isButtonClick) {
      // Try to extract language from conversation history
      if (conversationHistory) {
        const historyLines = conversationHistory.split('\n');
        for (let i = historyLines.length - 1; i >= 0; i--) {
          const line = historyLines[i];
          if (line.startsWith('User: ')) {
            const lastUserMessage = line.substring(6).trim();
            if (!lastUserMessage.startsWith('menu_') &&
                !lastUserMessage.startsWith('action_') &&
                lastUserMessage.length > 5) {
              console.log(`🌍 Detecting language from history: "${lastUserMessage}"`);
              const detectedLanguage = await detectLanguageWithMastra(mastra, lastUserMessage);
              return detectedLanguage;
            }
          }
        }
      }
      console.log('🌍 Button click detected, no valid history - defaulting to English');
      return 'en';
    }

    const detectedLanguage = await detectLanguageWithMastra(mastra, userMessage);
    return detectedLanguage;
  } catch (error: any) {
    console.error('❌ Error detecting language:', error);
    return 'en';
  }
}

/**
 * WhatsApp webhook message structure from Meta
 */
interface WhatsAppWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  text?: {
    body: string;
  };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
  audio?: {
    id: string;
    mime_type: string;
  };
  voice?: {
    id: string;
    mime_type: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  type: string;
}

interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: {
          name: string;
        };
        wa_id: string;
      }>;
      messages?: WhatsAppWebhookMessage[];
      statuses?: Array<any>;
    };
    field: string;
  }>;
}

interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppWebhookEntry[];
}

/**
 * Verify webhook endpoint (GET request from Meta)
 */
export function verifyWebhook(req: Request, res: Response): void {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Webhook verification failed');
    res.status(403).send('Forbidden');
  }
}

/**
 * Handle incoming webhook events (POST request from Meta)
 */
export async function handleWebhook(
  req: Request,
  res: Response,
  whatsappClient: WhatsAppClient,
  mastra: Mastra
): Promise<void> {
  try {
    const body = req.body as WhatsAppWebhookPayload;

    if (body.object !== 'whatsapp_business_account') {
      console.warn('⚠️ Received non-WhatsApp webhook, object type:', body.object);
      res.sendStatus(404);
      return;
    }

    res.sendStatus(200);

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const value = change.value;

        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            await processIncomingMessage(message, whatsappClient, mastra);
          }
        }

        // Silently ignore status updates (sent, delivered, read)
        if (value.statuses && value.statuses.length > 0) {
          // No logging for status updates
        }
      }
    }
  } catch (error: any) {
    console.error('❌ Error handling webhook:', error);
  }
}

/**
 * Get base URL for menus
 * Detects Heroku, ngrok, or localhost
 */
function getBaseUrl(): string {
  // 1. Check if running on Heroku (Heroku sets this env var automatically)
  if (process.env.DYNO) {
    // Heroku app name is in the format: appname-12345.herokuapp.com
    // We can get it from the Heroku-specific env vars
    const herokuAppName = process.env.HEROKU_APP_NAME;
    if (herokuAppName) {
      return `https://${herokuAppName}.herokuapp.com`;
    }
    // Fallback: Try to get from custom domain if set
    const customDomain = process.env.HEROKU_DOMAIN;
    if (customDomain) {
      return `https://${customDomain}`;
    }
    console.warn('⚠️ Running on Heroku but could not determine app URL. Set HEROKU_APP_NAME env var.');
  }

  // 2. Check for ngrok URL (development with ngrok tunnel)
  const ngrokUrl = process.env.NGROK_URL;
  if (ngrokUrl) {
    return ngrokUrl;
  }

  // 3. Fallback to localhost (won't work for Meta but useful for local testing)
  console.warn('⚠️ NGROK_URL not set and not on Heroku, using localhost (Meta won\'t be able to access files)');
  return 'http://localhost:3000';
}

/**
 * Menu configurations
 */
const MENU_CONFIGS = {
  'menu_moment': {
    type: 'moment',
    name: 'Menu du moment',
    filename: 'menu_du_moment.pdf',
    get url() { return `${getBaseUrl()}/menus/menu_du_moment.pdf`; }
  },
  'menu_brunch': {
    type: 'brunch',
    name: 'Menu Brunch',
    filename: 'menu_brunch.pdf',
    get url() { return `${getBaseUrl()}/menus/menu_brunch.pdf`; }
  }
};

/**
 * Send menu selection list
 */
async function sendMenuButtons(
  userId: string,
  whatsappClient: WhatsAppClient,
  language: string,
  mastra: Mastra
): Promise<void> {
  const bodyText = await generatePrompt(mastra, 'choose_menu_prompt', language);
  const buttonText = await generatePrompt(mastra, 'choose_menu_button', language);

  const menuLabels = await generateListLabels(
    mastra,
    [
      { id: 'menu_moment', englishLabel: 'Menu du moment' },
      { id: 'menu_brunch', englishLabel: 'Brunch' }
    ],
    language
  );

  const menusTitle = await generateText(mastra, 'The word "Menus" (1 word)', language);

  await whatsappClient.sendInteractiveList(
    userId,
    bodyText,
    buttonText,
    [{
      title: menusTitle,
      rows: menuLabels.map(item => ({
        id: item.id,
        title: item.label
      }))
    }]
  );

  console.log(`✅ Sent menu selection list to ${userId} in language: ${language}`);
}

/**
 * Handle menu button clicks
 */
async function handleMenuButtonClick(
  userId: string,
  buttonId: string,
  whatsappClient: WhatsAppClient,
  language: string,
  mastra: Mastra
): Promise<void> {
  try {
    console.log(`📋 Handling menu button click: ${buttonId}`);

    const menuConfig = MENU_CONFIGS[buttonId as keyof typeof MENU_CONFIGS];

    if (!menuConfig) {
      console.error(`Unknown menu button ID: ${buttonId}`);
      return;
    }

    console.log(`📋 Menu config found:`, menuConfig);
    console.log(`📋 Generating menu message in language: ${language}`);

    const menuMessage = await generateMenuMessage(mastra, menuConfig.type, language);

    console.log(`📋 Menu message generated: "${menuMessage}"`);
    console.log(`📋 Sending document to ${userId}`);

    await whatsappClient.sendDocument(
      userId,
      menuConfig.url,
      menuConfig.filename,
      menuMessage
    );

    console.log(`✅ Menu sent successfully`);
  } catch (error: any) {
    console.error(`❌ Error in handleMenuButtonClick:`, error);
    console.error(`   Stack:`, error.stack);
    throw error;
  }
}

/**
 * Process incoming WhatsApp message
 */
async function processIncomingMessage(
  message: WhatsAppWebhookMessage,
  whatsappClient: WhatsAppClient,
  mastra: Mastra
): Promise<void> {
  const database = getDatabase();

  try {
    const userId = message.from;
    const messageId = message.id;
    let userMessage = '';
    let isButtonClick = false;

    // Handle interactive button/list responses
    if (message.type === 'interactive' && message.interactive) {
      const buttonReply = message.interactive.button_reply;
      const listReply = message.interactive.list_reply;

      if (buttonReply) {
        userMessage = buttonReply.id;
        isButtonClick = true;
        console.log(`🔘 Button clicked: ${buttonReply.id} (${buttonReply.title})`);
      } else if (listReply) {
        userMessage = listReply.id;
        isButtonClick = true;
        console.log(`📋 List item selected: ${listReply.id} (${listReply.title})`);
      }
    }
    // Handle text messages
    else if (message.type === 'text' && message.text?.body) {
      userMessage = message.text.body.trim();
    }
    // Handle audio messages
    else if ((message.type === 'audio' || message.type === 'voice') && (message.audio?.id || message.voice?.id)) {
      const mediaId = message.audio?.id || message.voice?.id;
      if (!mediaId) {
        console.error('❌ Audio message received but no media ID found');
        return;
      }

      console.log(`🎤 Audio/Voice message received, transcribing...`);

      try {
        const accessToken = process.env.META_WHATSAPP_TOKEN;
        if (!accessToken) {
          throw new Error('META_WHATSAPP_TOKEN not configured');
        }

        // Transcribe audio without language hint - let Whisper auto-detect the language
        // This ensures accurate transcription in the original language (French, English, etc.)
        const transcription = await processAudioMessage(mediaId, accessToken);
        userMessage = transcription;

        console.log(`✅ Transcription: "${transcription}"`);

        // IMPORTANT: Audio message will continue to be processed as a normal text message
        // It will go through the same flow as text messages (detection, agent processing, etc.)
      } catch (error: any) {
        console.error('❌ Error transcribing audio:', error);
        const errorLang = await detectUserLanguage(userId, '', mastra);
        const errorMsg = await generateText(
          mastra,
          'Apologize that you could not process the audio message',
          errorLang
        );
        await whatsappClient.sendTextMessage(userId, errorMsg);
        return;
      }
    }
    // Handle location messages
    else if (message.type === 'location' && message.location) {
      console.log(`📍 Location received: ${message.location.latitude}, ${message.location.longitude}`);

      try {
        const tempConversation = await database.getOrCreateConversation(userId);
        const tempMessages = await database.getConversationHistory(tempConversation.id, 5);
        const tempHistory = database.formatHistoryForMastra(tempMessages);
        const userLanguage = await detectUserLanguage(userId, '', mastra, tempHistory);

        const locationData: LocationData = {
          latitude: message.location.latitude,
          longitude: message.location.longitude,
          name: message.location.name,
          address: message.location.address
        };

        const locationResponse = await generateLocationResponse(mastra, locationData, userLanguage);

        await whatsappClient.sendTextMessage(userId, locationResponse);

        await whatsappClient.sendLocationMessage(
          userId,
          INCA_LONDON_LOCATION.latitude,
          INCA_LONDON_LOCATION.longitude,
          INCA_LONDON_LOCATION.name,
          INCA_LONDON_LOCATION.address
        );

        console.log(`✅ Sent location response and restaurant location to ${userId}`);
        return;
      } catch (error: any) {
        console.error('❌ Error processing location:', error);
        const errorLang = await detectUserLanguage(userId, '', mastra);
        const errorMsg = await generateText(
          mastra,
          'Apologize that you could not process the location',
          errorLang
        );
        await whatsappClient.sendTextMessage(userId, errorMsg);
        return;
      }
    }
    else {
      console.log(`⚠️ Ignoring message of type: ${message.type}`);
      return;
    }

    // Check for duplicates
    if (processedMessages.has(messageId)) {
      console.log(`⏭️ Skipping duplicate message: ${messageId}`);
      return;
    }

    processedMessages.add(messageId);

    setTimeout(() => {
      processedMessages.delete(messageId);
    }, MESSAGE_CACHE_DURATION);

    console.log(`\n💬 User: ${userMessage}`);

    await whatsappClient.markAsRead(messageId);
    await whatsappClient.sendTypingIndicator(userId);

    // Database integration
    const conversation = await database.getOrCreateConversation(userId);
    const isNewUser = await database.isNewUser(userId);

    await database.saveMessage({
      conversation_id: conversation.id,
      wa_message_id: messageId,
      direction: 'in',
      sender: 'user',
      message_type: message.type,
      text_content: userMessage
    });

    const messages = await database.getConversationHistory(conversation.id, 10);
    const conversationHistory = database.formatHistoryForMastra(messages);

    const detectedLanguage = await detectUserLanguage(userId, userMessage, mastra, conversationHistory);

    // Handle "View Menus" button
    if (userMessage === 'action_view_menus') {
      await sendMenuButtons(userId, whatsappClient, detectedLanguage, mastra);
      return;
    }

    // Handle menu requests
    if (userMessage.startsWith('menu_')) {
      await handleMenuButtonClick(userId, userMessage, whatsappClient, detectedLanguage, mastra);
      return;
    }

    // Process through Mastra
    const agentResponse = await processUserMessage(
      mastra,
      userMessage,
      userId,
      conversationHistory,
      isNewUser
    );

    const userLanguage = agentResponse.detectedLanguage || 'en';

    // Handle agent responses
    if (agentResponse.showMenuButtons) {
      await sendMenuButtons(userId, whatsappClient, userLanguage, mastra);
      return;
    }

    if (agentResponse.menusToSend && agentResponse.menusToSend.length > 0) {

      for (const menu of agentResponse.menusToSend) {
        try {
          const menuMessage = await generateMenuMessage(mastra, menu.type, userLanguage);

          await whatsappClient.sendDocument(
            userId,
            menu.url,
            `${menu.name}.pdf`,
            menuMessage
          );
        } catch (error) {
          console.error(`❌ Failed to send ${menu.name} PDF:`, error);
        }
      }
    }

    // Send text response
    if (agentResponse.text && agentResponse.text.trim().length > 0) {
      await whatsappClient.sendTextMessage(userId, agentResponse.text);

      await database.saveMessage({
        conversation_id: conversation.id,
        direction: 'out',
        sender: 'bot',
        message_type: 'text',
        text_content: agentResponse.text
      });

      // Check if response mentions address
      const addressKeywords = ['address', 'adresse', 'parc du loup', 'lausanne', '1018', 'where are you', 'où êtes-vous', 'où se trouve', 'emplacement'];
      const responseText = agentResponse.text.toLowerCase();
      const mentionsAddress = addressKeywords.some(keyword => responseText.includes(keyword.toLowerCase()));

      if (mentionsAddress) {
        await whatsappClient.sendLocationMessage(
          userId,
          INCA_LONDON_LOCATION.latitude,
          INCA_LONDON_LOCATION.longitude,
          INCA_LONDON_LOCATION.name,
          INCA_LONDON_LOCATION.address
        );
      }
    }
  } catch (error: any) {
    console.error('❌ Error processing incoming message:', error);

    try {
      let errorLanguage = 'en';
      try {
        if (message.text?.body) {
          errorLanguage = await detectUserLanguage(message.from, message.text.body, mastra);
        }
      } catch (langError) {
        console.error('Failed to detect language for error message:', langError);
      }

      const errorMessage = await generateErrorMessage(mastra, errorLanguage, 'technical');
      await whatsappClient.sendTextMessage(message.from, errorMessage);
    } catch (sendError) {
      console.error('❌ Failed to send error message to user:', sendError);
      try {
        await whatsappClient.sendTextMessage(
          message.from,
          "I apologize, but I'm experiencing a technical issue. Please try again in a moment, or contact us directly:\n\n📞 +44 (0)20 7734 6066\n📧 reservations@incalondon.com"
        );
      } catch (finalError) {
        console.error('❌ Failed to send fallback error message:', finalError);
      }
    }
  }
}

/**
 * Validate webhook signature
 */
export function validateWebhookSignature(req: Request): boolean {
  const signature = req.headers['x-hub-signature-256'] as string;

  if (!signature) {
    console.warn('⚠️ No signature provided in webhook request');
    return true;
  }

  return true;
}
