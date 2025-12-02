'use server';
/**
 * @fileOverview A diagnostic flow to list available generative AI models.
 */

import { ai } from '@/ai/genkit';
import { listModels } from 'genkit/ai';

const listAvailableModels = ai.defineFlow(
  {
    name: 'listAvailableModels',
  },
  async () => {
    const models = await listModels();
    
    console.log('--- Available Generative Models ---');
    models.forEach(model => {
      console.log(`- ${model.name}`);
      console.log(`  - Supports Generate: ${model.supports.generate}`);
    });
    console.log('---------------------------------');

    return { success: true, count: models.length };
  }
);

// To run this flow, use the command: `npm run list-models`
// This will execute the flow and print the list of models to your console.
// You can then use one of the listed model IDs in your other flows.
listAvailableModels();
