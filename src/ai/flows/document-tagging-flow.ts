
'use server';

/**
 * @fileOverview A GenAI flow for analyzing and tagging uploaded documents.
 * 
 * - documentTagging - A function that takes a document's data URI and suggests relevant tags.
 * - DocumentTaggingInput - The input type for the documentTagging function.
 * - DocumentTaggingOutput - The return type for the documentTagging function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const DocumentTaggingInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A medical document (e.g., lab result, imaging report), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DocumentTaggingInput = z.infer<typeof DocumentTaggingInputSchema>;

export const DocumentTaggingOutputSchema = z.object({
  tags: z.array(z.string()).describe('A list of 1-3 relevant tags for the document (e.g., "blood test", "x-ray", "MRI report").'),
});
export type DocumentTaggingOutput = z.infer<typeof DocumentTaggingOutputSchema>;

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
  
  Document: {{media url=documentDataUri}}`,
});
  
const documentTaggingFlow = ai.defineFlow(
  {
    name: 'documentTaggingFlow',
    inputSchema: DocumentTaggingInputSchema,
    outputSchema: DocumentTaggingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
