
'use server';

/**
 * @fileOverview A GenAI flow for analyzing and tagging uploaded documents.
 * 
 * - documentTagging - A function that takes a document's public URL and suggests relevant tags.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DocumentTaggingInputSchema = z.object({
  documentUrl: z.string().url().describe('The public URL of the document to analyze.'),
});

const DocumentTaggingOutputSchema = z.object({
  tags: z.array(z.string()),
});

type DocumentTaggingInput = z.infer<typeof DocumentTaggingInputSchema>;
type DocumentTaggingOutput = z.infer<typeof DocumentTaggingOutputSchema>;

export async function documentTagging(
  input: DocumentTaggingInput
): Promise<DocumentTaggingOutput> {
  return documentTaggingFlow(input);
}

const prompt = ai.definePrompt({
    name: 'documentTaggingPrompt',
    input: { schema: DocumentTaggingInputSchema },
    output: { schema: DocumentTaggingOutputSchema },
    prompt: `Analyze the following medical document and provide a list of 1-3 concise, relevant tags. Examples: "blood test", "x-ray", "MRI report", "pathology result", "patient summary".
  
  Document: {{media url=documentUrl}}`,
});
  
const documentTaggingFlow = ai.defineFlow(
  {
    name: 'documentTaggingFlow',
    inputSchema: DocumentTaggingInputSchema,
    outputSchema: DocumentTaggingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input, { model: 'googleai/gemini-pro-vision' });
    return output!;
  }
);
