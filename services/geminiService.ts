import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { Message, Attachment, ModelId } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class GeminiService {
  private chat: Chat | null = null;
  private currentModelId: string | null = null;

  /**
   * Initializes or updates the chat session based on the model.
   * If the model changes, we recreate the chat.
   */
  private getChat(modelId: string, history: Message[] = []): Chat {
    // Transform our internal message history to the API format if we are re-initializing
    const apiHistory = history
      .filter(m => !m.error) // Skip error messages
      .map(m => ({
        role: m.role,
        parts: [
          ... (m.attachments?.map(a => ({
             inlineData: { mimeType: a.mimeType, data: a.data }
          })) || []),
          { text: m.content }
        ]
      }));

    if (!this.chat || this.currentModelId !== modelId) {
      this.currentModelId = modelId;
      this.chat = ai.chats.create({
        model: modelId,
        history: apiHistory.slice(0, -1),
      });
    }
    return this.chat;
  }

  public reset() {
    this.chat = null;
    this.currentModelId = null;
  }

  public async *streamMessage(
    modelId: string,
    prompt: string,
    attachments: Attachment[],
    previousHistory: Message[],
    useSearch: boolean
  ): AsyncGenerator<{ text: string; groundingChunks?: any[]; generatedImages?: Attachment[] }, void, unknown> {
    
    // Config for this specific run
    const config: any = {
      systemInstruction: "You are Neura, a helpful and capable AI assistant. Be concise, accurate, and friendly. Use natural language. Format your responses nicely with Markdown.",
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    // Prepare content
    const parts: any[] = [];
    if (attachments.length > 0) {
      attachments.forEach(att => {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      });
    }
    parts.push({ text: prompt });

    // Handle history mapping for the SDK
    const historyForSdk = previousHistory.map(msg => ({
      role: msg.role,
      parts: [
        ...(msg.attachments?.map(a => ({
          inlineData: { mimeType: a.mimeType, data: a.data }
        })) || []),
        ...(msg.content ? [{ text: msg.content }] : [])
      ]
    }));

    // Create a fresh chat instance to guarantee config application (tools)
    const chatSession = ai.chats.create({
        model: modelId,
        history: historyForSdk,
        config: config
    });
    this.chat = chatSession;

    try {
        const resultStream = await chatSession.sendMessageStream({
            message: { parts }
        });

        for await (const chunk of resultStream) {
            const responseChunk = chunk as GenerateContentResponse;
            const text = responseChunk.text || '';
            const groundingChunks = responseChunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
            
            // Check for generated images
            const generatedImages: Attachment[] = [];
            const responseParts = responseChunk.candidates?.[0]?.content?.parts;
            if (responseParts) {
                for (const part of responseParts) {
                    if (part.inlineData) {
                        generatedImages.push({
                            mimeType: part.inlineData.mimeType,
                            data: part.inlineData.data
                        });
                    }
                }
            }

            yield { text, groundingChunks, generatedImages };
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
  }
}

export const geminiService = new GeminiService();