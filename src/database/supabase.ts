/**
 * Supabase Database Module
 * Manages conversations and message history for the WhatsApp bot
 *
 * Tables:
 * - conversations: Tracks user conversations with status and timestamps
 * - messages: Stores individual messages with direction, content, and delivery status
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Conversation status enum
 */
export type ConversationStatus = 'open' | 'closed';

/**
 * Message direction enum
 */
export type MessageDirection = 'in' | 'out';

/**
 * Message sender enum
 */
export type MessageSender = 'user' | 'bot';

/**
 * Database row types matching the schema
 */
export interface Conversation {
  id: string;
  user_phone: string;
  status: ConversationStatus;
  started_at: string;
  last_message_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  wa_message_id: string | null;
  direction: MessageDirection;
  sender: MessageSender;
  message_type: string;
  text_content: string | null;
  created_at: string;
  delivered_at: string | null;
  read_at: string | null;
}

/**
 * Input types for creating new records
 */
export interface NewConversation {
  user_phone: string;
  status?: ConversationStatus;
}

export interface NewMessage {
  conversation_id: string;
  wa_message_id?: string | null;
  direction: MessageDirection;
  sender: MessageSender;
  message_type?: string;
  text_content?: string | null;
}

/**
 * Supabase Database Client
 * Provides methods for managing conversations and messages
 */
export class SupabaseDatabase {
  private client: SupabaseClient;

  /**
   * Initialize Supabase client with credentials from environment
   * @throws {Error} If required environment variables are missing
   */
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
      );
    }

    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch (error) {
      throw new Error(
        `Invalid SUPABASE_URL format: ${supabaseUrl}. Must be a valid URL like https://xxxxx.supabase.co`
      );
    }

    this.client = createClient(supabaseUrl, supabaseKey);
    // Silent init - no log
  }

  /**
   * Get or create a conversation for a user
   * Returns the active (open) conversation if it exists, otherwise creates a new one
   *
   * @param userPhone - User's phone number (WhatsApp ID)
   * @returns The conversation record
   */
  async getOrCreateConversation(userPhone: string): Promise<Conversation> {
    try {
      // Try to find an open conversation for this user
      const { data: existingConversation, error: findError } = await this.client
        .from('conversations')
        .select('*')
        .eq('user_phone', userPhone)
        .eq('status', 'open')
        .order('last_message_at', { ascending: false })
        .limit(1)
        .single();

      if (existingConversation && !findError) {
        return existingConversation;
      }

      // Create a new conversation if none exists
      const { data: newConversation, error: createError } = await this.client
        .from('conversations')
        .insert({
          user_phone: userPhone,
          status: 'open',
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return newConversation;
    } catch (error: any) {
      console.error('❌ Error getting/creating conversation:', {
        message: error.message,
        details: error.stack || error.toString(),
        hint: error.hint || '',
        code: error.code || ''
      });
      throw new Error(`Failed to get or create conversation: ${error.message}`);
    }
  }

  /**
   * Check if a user is new (no previous conversations)
   *
   * @param userPhone - User's phone number
   * @returns True if the user has no previous conversations
   */
  async isNewUser(userPhone: string): Promise<boolean> {
    try {
      const { count, error } = await this.client
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .eq('user_phone', userPhone);

      if (error) {
        throw error;
      }

      const isNew = count === 0;
      return isNew;
    } catch (error: any) {
      console.error('❌ Error checking if user is new:', error);
      // Default to false to avoid treating returning users as new
      return false;
    }
  }

  /**
   * Get conversation history for a user
   * Returns recent messages from the current conversation
   *
   * @param conversationId - The conversation ID
   * @param limit - Maximum number of messages to retrieve (default: 20)
   * @returns Array of messages ordered by creation time (oldest first)
   */
  async getConversationHistory(
    conversationId: string,
    limit: number = 20
  ): Promise<Message[]> {
    try {
      const { data, error } = await this.client
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      // Reverse to get oldest first (chronological order)
      const messages = (data || []).reverse();
      return messages;
    } catch (error: any) {
      console.error('❌ Error getting conversation history:', error);
      throw new Error(`Failed to get conversation history: ${error.message}`);
    }
  }

  /**
   * Save a new message to the database
   * Also updates the conversation's last_message_at timestamp
   *
   * @param message - The message to save
   * @returns The created message record
   */
  async saveMessage(message: NewMessage): Promise<Message> {
    try {
      const { data, error } = await this.client
        .from('messages')
        .insert({
          conversation_id: message.conversation_id,
          wa_message_id: message.wa_message_id || null,
          direction: message.direction,
          sender: message.sender,
          message_type: message.message_type || 'text',
          text_content: message.text_content || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update conversation last_message_at
      await this.updateConversationTimestamp(message.conversation_id);

      return data;
    } catch (error: any) {
      console.error('❌ Error saving message:', error);
      throw new Error(`Failed to save message: ${error.message}`);
    }
  }

  /**
   * Update the last_message_at timestamp for a conversation
   *
   * @param conversationId - The conversation ID
   */
  private async updateConversationTimestamp(conversationId: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('⚠️ Error updating conversation timestamp:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Close a conversation
   *
   * @param conversationId - The conversation ID
   */
  async closeConversation(conversationId: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('conversations')
        .update({ status: 'closed' })
        .eq('id', conversationId);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('❌ Error closing conversation:', error);
      throw new Error(`Failed to close conversation: ${error.message}`);
    }
  }

  /**
   * Mark a message as delivered
   *
   * @param messageId - The message ID
   */
  async markAsDelivered(messageId: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('messages')
        .update({ delivered_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) {
        throw error;
      }
      // Silent - no log
    } catch (error: any) {
      // Non-critical error, don't throw
    }
  }

  /**
   * Mark a message as read
   *
   * @param messageId - The message ID
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) {
        throw error;
      }
      // Silent - no log
    } catch (error: any) {
      // Non-critical error, don't throw
    }
  }

  /**
   * Format conversation history for Mastra context
   * Converts database messages into a readable format for the AI agent
   *
   * @param messages - Array of messages from the database
   * @returns Formatted string for AI context
   */
  formatHistoryForMastra(messages: Message[]): string {
    if (messages.length === 0) {
      return 'No previous conversation history.';
    }

    const formattedMessages = messages.map(msg => {
      const sender = msg.sender === 'user' ? 'User' : 'Bot';
      const content = msg.text_content || '[non-text message]';
      return `${sender}: ${content}`;
    });

    return `Recent conversation history:\n${formattedMessages.join('\n')}`;
  }
}

/**
 * Create and export a singleton instance of the database
 */
let databaseInstance: SupabaseDatabase | null = null;

/**
 * Get the Supabase database instance (singleton)
 *
 * @returns The database instance
 */
export function getDatabase(): SupabaseDatabase {
  if (!databaseInstance) {
    databaseInstance = new SupabaseDatabase();
  }
  return databaseInstance;
}
