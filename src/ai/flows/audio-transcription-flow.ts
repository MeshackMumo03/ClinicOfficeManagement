
'use server';

/**
 * @fileOverview Provides audio transcription services using GenAI.
 * 
 * - audioTranscription - A function that takes audio data and returns a transcription.
 * - AudioTranscriptionInput - The input type for the audioTranscription function.
 * - AudioTranscriptionOutput - The return type for the audioTranscription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';


const AudioTranscriptionInputSchema = z.object({
  audioB64: z.string().describe("A Base64-encoded audio chunk."),
});
export type AudioTranscriptionInput = z.infer<typeof AudioTranscriptionInputSchema>;

const AudioTranscriptionOutputSchema = z.object({
  transcript: z.string().describe("The transcribed text from the audio."),
});
export type AudioTranscriptionOutput = z.infer<typeof AudioTranscriptionOutputSchema>;


export async function audioTranscription(input: AudioTranscriptionInput): Promise<AudioTranscriptionOutput> {
  return audioTranscriptionFlow(input);
}

const audioTranscriptionFlow = ai.defineFlow(
  {
    name: 'audioTranscriptionFlow',
    inputSchema: AudioTranscriptionInputSchema,
    outputSchema: AudioTranscriptionOutputSchema,
  },
  async (input) => {
    // CRITICAL FIX: Explicitly use a model that supports audio transcription.
    // The previous models were not found; switching to the reliable 'gemini-1.5-pro-latest'.
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-pro-latest',
      prompt: [
        {
          media: {
            url: `data:audio/webm;base64,${input.audioB64}`,
            contentType: 'audio/webm'
          },
        },
        {
          text: "Transcribe the following audio:"
        }
      ],
    });

    return { transcript: llmResponse.text };
  }
);
