"use server";

import {
  consultationDiagnosisSupport,
  type ConsultationDiagnosisSupportInput,
} from "@/ai/flows/consultation-diagnosis-support";

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
