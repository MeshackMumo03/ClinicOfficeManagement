
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
import { googleAI } from '@genkit-ai/google-genai';

const AudioTranscriptionInputSchema = z.object({
  audioDataUri: z.string().describe("A Base64-encoded audio chunk with a data URI header (e.g., 'data:audio/webm;base64,...')."),
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
    // Revert to the previously working model configuration.
    const llmResponse = await ai.generate({
      model: googleAI('gemini-pro-vision'),
      prompt: [
        {
          media: {
            url: input.audioDataUri,
          },
        },
        {
          text: "Transcribe the following audio recording from a doctor's consultation:"
        }
      ],
    });

    return { transcript: llmResponse.text };
  }
);
