
'use server';

/**
 * @fileOverview A GenAI flow for analyzing and tagging uploaded medical documents.
 * 
 * - documentTagging - A function that takes a document's public URL and suggests relevant tags.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const DocumentTaggingInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A medical document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  documentDescription: z.string().describe('The description of the medical document.'),
});


const DocumentTaggingOutputSchema = z.object({
  tags: z.array(z.string()).describe('A list of 1-3 relevant tags for the document (e.g., "blood test", "x-ray", "MRI report").'),
});

export type DocumentTaggingInput = z.infer<typeof DocumentTaggingInputSchema>;
export type DocumentTaggingOutput = z.infer<typeof DocumentTaggingOutputSchema>;

export async function documentTagging(
  input: DocumentTaggingInput
): Promise<DocumentTaggingOutput> {
  return documentTaggingFlow(input);
}

const prompt = ai.definePrompt({
    name: 'documentTaggingPrompt',
    model: googleAI('gemini-1.5-flash-latest'),
    input: { schema: DocumentTaggingInputSchema },
    output: { schema: DocumentTaggingOutputSchema },
    prompt: `You are an expert medical archivist. Analyze the following medical document and provide a list of 1-3 concise, relevant tags. Examples: "blood test", "x-ray", "MRI report", "pathology result", "patient summary".
  
  Description: {{{documentDescription}}}
  Document: {{media url=documentDataUri}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  }
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
