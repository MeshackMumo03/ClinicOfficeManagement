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

export async function consultationDiagnosisSupport(
  input: ConsultationDiagnosisSupportInput
): Promise<ConsultationDiagnosisSupportOutput> {
  return consultationDiagnosisSupportFlow(input);
}

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

const consultationDiagnosisSupportFlow = ai.defineFlow(
  {
    name: 'consultationDiagnosisSupportFlow',
    inputSchema: ConsultationDiagnosisSupportInputSchema,
    outputSchema: ConsultationDiagnosisSupportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
