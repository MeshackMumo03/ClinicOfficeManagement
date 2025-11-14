
'use server';

/**
 * @fileOverview Provides audio transcription services using GenAI.
 * 
 * - textToSpeech - A function that takes audio data and returns a transcription.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { geminiPro } from '@genkit-ai/google-genai';

const TextToSpeechInputSchema = z.object({
  audioB64: z.string().describe("A Base64-encoded audio chunk."),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  transcript: z.string().describe("The transcribed text from the audio."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;


export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
      model: geminiPro,
      prompt: {
        text: 'Transcribe the following audio recording. The recording is from a doctor during a patient consultation. The transcription should be clean and accurate.',
        media: [{
            url: `data:audio/webm;base64,${input.audioB64}`
        }]
      },
    });

    return { transcript: llmResponse.text };
  }
);
