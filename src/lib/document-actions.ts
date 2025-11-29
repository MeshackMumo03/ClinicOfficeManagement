
'use server';

import { addDoc, collection, doc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { db } from '@/firebase/config-client'; // Use the client-side config
import { revalidatePath } from 'next/cache';

// Define the shape of the document record in Firestore
export interface PatientDocument {
  id: string;
  patientId: string;
  fileName: string;
  description: string;
  storagePath: string;
  downloadURL: string;
  uploadedBy: string;
  uploadDateTime: any; // Can be Date for client, Timestamp for server
  fileType: string;
  tags: string[];
}

interface TagSaveResult {
  success: boolean;
  message: string;
}

/**
 * Saves AI-generated tags to a document record in Firestore.
 */
export async function saveDocumentTagsAction(patientId: string, documentId: string, tags: string[]): Promise<TagSaveResult> {
    if (!patientId || !documentId) {
        return { success: false, message: "Missing patient or document ID." };
    }
    
    try {
        const docRef = doc(db, 'users', patientId, 'documents', documentId);
        await updateDoc(docRef, {
            tags: tags
        });
        revalidatePath(`/dashboard/patients`);
        return { success: true, message: "Tags saved successfully."};
    } catch (error: any) {
        console.error("Error saving document tags:", error);
        return { success: false, message: error.message || "Failed to save tags."};
    }
}


interface DeleteResult {
    success: boolean;
    message: string;
}

/**
 * Securely deletes a document from Storage and its metadata from Firestore.
 */
export async function deleteDocumentAction(patientId: string, documentId: string, storagePath: string): Promise<DeleteResult> {
    if (!patientId || !documentId || !storagePath) {
        return { success: false, message: "Missing required parameters for deletion."};
    }

    try {
        const storage = getStorage();
        // 1. Delete file from Firebase Storage
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);

        // 2. Delete document record from Firestore
        const docRef = doc(db, 'users', patientId, 'documents', documentId);
        await deleteDoc(docRef);

        revalidatePath(`/dashboard/patients`);
        return { success: true, message: "Document deleted successfully." };
    } catch (error: any) {
        console.error("Error deleting document:", error);
        // If file is already gone from storage, try to delete firestore doc anyway
        if (error.code === 'storage/object-not-found') { // Object not found
            try {
                const docRef = doc(db, 'users', patientId, 'documents', documentId);
                await deleteDoc(docRef);
                revalidatePath(`/dashboard/patients`);
                return { success: true, message: "Orphaned document record was cleaned up." };
            } catch (dbError: any) {
                 return { success: false, message: dbError.message || "Failed to delete document record."};
            }
        }
        return { success: false, message: error.message || "Failed to delete document." };
    }
}
