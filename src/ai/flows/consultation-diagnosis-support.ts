'use server';
/**
 * @fileOverview Provides GenAI-powered decision support for doctors during consultations.
 *
 * - consultationDiagnosisSupport - A function that suggests potential diagnosis considerations for complex cases.
 * - ConsultationDiagnosisSupportInput - The input type for the consultationDiagnosisSupport function.
 * - ConsultationDiagnosisSupportOutput - The return type for the consultationDiagnosisSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Defines the schema for the input of the consultation diagnosis support flow.
const ConsultationDiagnosisSupportInputSchema = z.object({
  patientMedicalHistory: z
    .string()
    .describe('The patient medical history, including previous diagnoses, treatments, and medications.'),
  symptoms: z
    .string()
    .describe('A description of the patient symptoms, including onset, duration, and severity.'),
  examFindings: z.string().describe('Physical examination findings.'),
  labResults: z.string().describe('Recent lab results.'),
});
export type ConsultationDiagnosisSupportInput = z.infer<
  typeof ConsultationDiagnosisSupportInputSchema
>;

// Defines the schema for the output of the consultation diagnosis support flow.
const ConsultationDiagnosisSupportOutputSchema = z.object({
  diagnosisConsiderations: z
    .string()
    .describe(
      'A list of potential diagnosis considerations based on the provided information.'
    ),
});
export type ConsultationDiagnosisSupportOutput = z.infer<
  typeof ConsultationDiagnosisSupportOutputSchema
>;

/**
 * An asynchronous function that takes consultation details as input and returns AI-generated diagnosis considerations.
 * @param input The consultation details.
 * @returns A promise that resolves to the diagnosis considerations.
 */
export async function consultationDiagnosisSupport(
  input: ConsultationDiagnosisSupportInput
): Promise<ConsultationDiagnosisSupportOutput> {
  return consultationDiagnosisSupportFlow(input);
}

// Defines a Genkit prompt for the consultation diagnosis support feature.
const prompt = ai.definePrompt({
  name: 'consultationDiagnosisSupportPrompt',
  input: {schema: ConsultationDiagnosisSupportInputSchema},
  output: {schema: ConsultationDiagnosisSupportOutputSchema},
  prompt: `You are an AI assistant for doctors. Given the patient medical history, symptoms, exam findings, and lab results, suggest potential diagnosis considerations.

Patient Medical History: {{{patientMedicalHistory}}}
Symptoms: {{{symptoms}}}
Exam Findings: {{{examFindings}}}
Lab Results: {{{labResults}}}

Diagnosis Considerations:`,
});

// Defines a Genkit flow that uses the prompt to provide diagnosis support.
const consultationDiagnosisSupportFlow = ai.defineFlow(
  {
    name: 'consultationDiagnosisSupportFlow',
    inputSchema: ConsultationDiagnosisSupportInputSchema,
    outputSchema: ConsultationDiagnosisSupportOutputSchema,
  },
  async input => {
    // Executes the prompt with the given input.
    const {output} = await prompt(input);
    // Returns the output from the prompt.
    return output!;
  }
);
