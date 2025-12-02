// import the Genkit and Google AI plugin libraries
import { googleAI } from '@genkit-ai/google-genai';
import { genkit } from 'genkit';

// configure a Genkit instance and export it
export const ai = genkit({
  plugins: [
    googleAI({
      // The apiKey is read from the GEMINI_API_KEY environment variable.
      // You can also pass it in explicitly here if needed.
    }),
  ],
  model: 'googleai/gemini-pro-vision', // set default model for vision tasks
});
