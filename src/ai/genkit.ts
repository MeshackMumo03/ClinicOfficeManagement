// import the Genkit and Google AI plugin libraries
import { googleAI } from '@genkit-ai/google-genai';
import { genkit } from 'genkit';

// configure a Genkit instance and export it
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash-latest', // set default model
});
