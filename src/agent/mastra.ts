/**
 * Mastra Agent Configuration
 * Configures the AI agent with OpenAI, business instructions, and custom tools
 */

import { Agent, Mastra } from '@mastra/core';
import { openai } from '@ai-sdk/openai';
import { loadSystemInstructions } from './promptLoader.js';

/**
 * System instructions for the Histoire Sans Faim agent
 * Loaded from prompt-merged.md which combines:
 * - Premium conversational style from prompt.md
 * - WhatsApp-specific features (buttons, templates, multilingual)
 * - Restaurant-specific information from config/restaurant.profile.json
 */
const SYSTEM_INSTRUCTIONS = loadSystemInstructions();


/**
 * Create and configure the Mastra framework instance
 */
export function createMastraInstance(): Mastra {
  // Verify OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required in .env file');
  }

  // Create OpenAI model instance with API key set in environment
  const model = openai('gpt-4o-mini');

  // Create Mastra instance with agent
  const mastra = new Mastra({
    agents: {
      histoireSansFaimAgent: new Agent({
        name: 'histoireSansFaimAgent',
        instructions: SYSTEM_INSTRUCTIONS,
        model,
        // tools,
      }) as any,
    },
  });

  return mastra;
}

/**
 * Get the Histoire Sans Faim agent instance
 */
export function getHistoireSansFaimAgent(mastra: Mastra): any {
  return mastra.getAgent('histoireSansFaimAgent');
}

/**
 * @deprecated Use getHistoireSansFaimAgent instead
 * Kept for backward compatibility
 */
export function getIncaAgent(mastra: Mastra): any {
  return getHistoireSansFaimAgent(mastra);
}

export interface ProcessedMessageResult {
  text: string;
  detectedLanguage: string;
  menusToSend?: Array<{
    type: string;
    name: string;
    url: string;
  }>;
  showMenuButtons?: boolean; // Flag to show interactive menu buttons instead of URLs
  askForReservation?: boolean; // Flag to proactively ask if user wants to make a reservation
}

/**
 * Detect the language of a user message using Mastra
 * IMPORTANT: Ignores ISO format dates and times (YYYY-MM-DD, HH:MM) to avoid false English detection
 *
 * @param mastra - Mastra instance
 * @param message - User's message
 * @returns ISO 639-1 language code (e.g., 'en', 'fr', 'es')
 */
export async function detectLanguageWithMastra(
  mastra: Mastra,
  message: string
): Promise<string> {
  try {
    // Remove ISO format dates (YYYY-MM-DD) and times (HH:MM) before language detection
    // These formats are international standards and should not influence language detection
    let cleanedMessage = message
      // Remove ISO dates: 2024-10-21, 2025-12-31, etc.
      .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '')
      // Remove times: 19:00, 20:30, etc.
      .replace(/\b\d{1,2}:\d{2}\b/g, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // If after cleaning we have almost nothing left, return the previously detected language
    if (cleanedMessage.length < 3) {
      return 'en';
    }

    const agent = getHistoireSansFaimAgent(mastra);

    const prompt = `Detect the language of this message and respond with ONLY the ISO 639-1 language code (2 letters: en, fr, es, de, it, pt, zh, ja, ar, etc.). Do not include any other text, explanation, or punctuation.

IMPORTANT: Ignore any dates (YYYY-MM-DD) or times (HH:MM) as these are international formats. Focus on the actual words and sentences.

Message: "${cleanedMessage}"

Language code:`;

    const result = await agent.generate(prompt);
    const languageCode = (result.text || 'en').trim().toLowerCase().substring(0, 2);

    return languageCode;
  } catch (error: any) {
    console.error('❌ Error detecting language:', error);
    return 'en'; // Default to English on error
  }
}

/**
 * Translate a message to English for intent detection
 *
 * @param mastra - Mastra instance
 * @param message - User's message in any language
 * @param sourceLanguage - Source language code
 * @returns Translated message in English
 */
export async function translateToEnglish(
  mastra: Mastra,
  message: string,
  sourceLanguage: string
): Promise<string> {
  // If already in English, return as-is
  if (sourceLanguage === 'en') {
    return message;
  }

  try {
    const agent = getHistoireSansFaimAgent(mastra);

    const prompt = `Translate this message from ${sourceLanguage} to English. Respond with ONLY the translation, no explanations or additional text.

Message: "${message}"

Translation:`;

    const result = await agent.generate(prompt);
    const translation = (result.text || message).trim();

    return translation;
  } catch (error: any) {
    console.error('❌ Error translating message:', error);
    return message; // Return original on error
  }
}

/**
 * Process a user message through the Mastra agent
 *
 * @param mastra - Mastra instance
 * @param userMessage - User's message
 * @param userId - User's phone number
 * @param conversationHistory - Optional conversation history for context
 * @param isNewUser - Whether this is a new user
 * @returns Processed message result with response and metadata
 */
export async function processUserMessage(
  mastra: Mastra,
  userMessage: string,
  userId: string,
  conversationHistory?: string,
  isNewUser: boolean = false
): Promise<ProcessedMessageResult> {
  try {
    const agent = getHistoireSansFaimAgent(mastra);

    // Step 1: Detect the language of the message
    const detectedLanguage = await detectLanguageWithMastra(mastra, userMessage);

    // Step 2: For intent detection only, check in multiple languages (no translation needed)
    const lowerMessage = userMessage.toLowerCase();

    // Step 3: Detect intent from message (multilingual keywords)

    // Check for general menu request in multiple languages
    const menuKeywords = [
      // English
      'menu', 'food', 'pizza', 'pasta', 'brunch', 'see the menu', 'view menu', 'look at menu',
      // French
      'carte', 'menu', 'nourriture', 'pizza', 'pâtes', 'brunch', 'voir la carte', 'voir le menu',
      // Spanish
      'menú', 'comida', 'pizza', 'pasta', 'brunch', 'ver el menú',
      // Italian
      'menù', 'cibo', 'pizza', 'pasta', 'brunch', 'vedere il menu',
      // German
      'speisekarte', 'essen', 'pizza', 'pasta', 'brunch',
      // Portuguese
      'cardápio', 'comida', 'pizza', 'massa', 'brunch', 'ver o cardápio'
    ];
    const isMenuRequest = menuKeywords.some(keyword => lowerMessage.includes(keyword));

    if (isMenuRequest) {
      return {
        text: '',
        detectedLanguage,
        showMenuButtons: true
      };
    }

    // Step 4: Build context for the agent
    let contextPrompt = userMessage;

    if (conversationHistory) {
      contextPrompt = `${conversationHistory}\n\nUser (current message): ${userMessage}`;
    }

    if (isNewUser) {
      contextPrompt = `[NEW USER - First time interacting]\n\n${contextPrompt}`;
    }

    // Add language instruction
    contextPrompt = `[User is speaking in language code: ${detectedLanguage}. You MUST respond in the same language.]\n\n${contextPrompt}`;

    // Generate response using the agent
    const result = await agent.generate(contextPrompt, {
      resourceId: userId, // Use userId as resourceId for context
    });

    // Extract the text response
    let responseText = result.text || 'Je suis désolé, mais je rencontre un problème technique. Veuillez réessayer ou nous contacter directement:\n\n📞 +41 21 648 22 22\n📧 info@histoiresansfaim.ch';

    // Check if the response contains menu URLs from Histoire Sans Faim website
    const menusToSend: Array<{ type: string; name: string; url: string }> = [];
    const menuUrls = [
      { type: 'moment', name: 'Menu du moment', url: 'https://assets.zyrosite.com/dJobk9RMr4HKGbWG/menu_restaurant_histoire_sans-faim-Awv8KL26x5uLl62W.webp' },
      { type: 'brunch', name: 'Menu Brunch', url: 'https://assets.zyrosite.com/dJobk9RMr4HKGbWG/menu_brunch_restaurant_histoire_sans_faim_lausanne-mP431vB51RUxz21q.webp' },
    ];

    // Check if any menu URLs are mentioned in the response
    for (const menu of menuUrls) {
      if (responseText.includes(menu.url)) {
        menusToSend.push(menu);
      }
    }

    // Si des menus sont détectés dans la réponse de l'agent, afficher les boutons au lieu des URLs
    if(menusToSend.length > 0) {
        return {
          text: '',
          detectedLanguage,
          showMenuButtons: true
        };
    }

    // Supprimer le formatage markdown des réponses
    responseText = removeMarkdownFormatting(responseText);

    return {
      text: responseText,
      detectedLanguage,
    };
  } catch (error: any) {
    console.error('❌ Error processing message with Mastra agent:', error);

    // Return a friendly fallback message
    return {
      text: "Je suis désolé, mais je rencontre un problème technique. Veuillez nous contacter directement:\n\n📞 +41 21 648 22 22\n📧 info@histoiresansfaim.ch",
      detectedLanguage: 'fr'
    };
  }
}

/**
 * Supprime le formatage markdown des messages
 */
function removeMarkdownFormatting(text: string): string {
  // Supprimer les ** pour le gras
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');

  // Supprimer les __ pour le souligné
  text = text.replace(/__(.+?)__/g, '$1');

  // Supprimer les * pour l'italique
  text = text.replace(/\*(.+?)\*/g, '$1');

  // Supprimer les _ pour l'italique
  text = text.replace(/_(.+?)_/g, '$1');

  // Supprimer les ~~pour le barré
  text = text.replace(/~~(.+?)~~/g, '$1');

  return text;
}
/**
 * Fonction principale qui remplace messageHandler.ts
 * Traite directement les messages des utilisateurs via Mastra
 */
export async function handleWhatsAppMessage(
    message: string,
    userId: string,
    isFirstInteraction: boolean = false
): Promise<{
    text: string;
    menusToSend?: Array<{ type: string; name: string; url: string }>;
}> {
    // Instancier ou récupérer l'instance Mastra
    const mastraInstance = createMastraInstance();

    // Toute la logique est maintenant gérée par Mastra via son prompt
    const result = await processUserMessage(mastraInstance, message, userId);

    return result;
}
