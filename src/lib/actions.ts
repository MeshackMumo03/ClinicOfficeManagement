"use server";

// This file defines server actions that can be called from client-side components.

import {
  consultationDiagnosisSupport,
  type ConsultationDiagnosisSupportInput,
} from "@/ai/flows/consultation-diagnosis-support";

/**
 * A server action to get a diagnosis suggestion from the AI.
 * It calls the consultationDiagnosisSupport flow and handles potential errors.
 * @param data The input data for the diagnosis suggestion.
 * @returns An object with a success flag and either the data or an error message.
 */
export async function getDiagnosisSuggestion(
  data: ConsultationDiagnosisSupportInput
) {
  try {
    const result = await consultationDiagnosisSupport(data);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting diagnosis suggestion:", error);
    return { success: false, error: "Failed to get suggestion from AI." };
  }
}
