
'use server';

import { addDoc, collection, doc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes, deleteObject } from 'firebase/storage';
import { db, storage } from '@/firebase/config-client'; // Use the client-side config
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

interface UploadResult {
  success: boolean;
  message: string;
  document?: PatientDocument;
}

/**
 * Securely uploads a document for a patient.
 * This server action handles file upload to Storage and metadata creation in Firestore.
 */
export async function uploadDocumentAction(
  patientId: string,
  uploaderUid: string,
  formData: FormData
): Promise<UploadResult> {
  const file = formData.get('document') as File | null;
  const description = formData.get('description') as string | null;

  if (!file) {
    return { success: false, message: 'No file provided.' };
  }
  if (!patientId || !uploaderUid) {
    return { success: false, message: 'Patient ID or uploader ID is missing.' };
  }

  try {
    // 1. Upload file to Firebase Storage
    const filePath = `documents/${patientId}/${Date.now()}_${file.name}`;
    const fileStorageRef = storageRef(storage, filePath);
    
    // Convert file to ArrayBuffer to pass to uploadBytes
    const buffer = await file.arrayBuffer();
    const uploadResult = await uploadBytes(fileStorageRef, buffer, {
        contentType: file.type
    });
    
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // 2. Create document metadata record in Firestore
    const documentsColRef = collection(db, 'users', patientId, 'documents');
    const newDocData: Omit<PatientDocument, 'id'> = {
      patientId,
      fileName: file.name,
      description: description || '',
      storagePath: filePath,
      downloadURL,
      uploadedBy: uploaderUid,
      uploadDateTime: serverTimestamp(),
      fileType: file.type,
      tags: [],
    };

    const docRef = await addDoc(documentsColRef, newDocData);

    const createdDocument: PatientDocument = {
      id: docRef.id,
      ...newDocData,
      uploadDateTime: new Date().toISOString(),
    };
    
    revalidatePath(`/dashboard/patients`);

    return { success: true, message: 'Document uploaded successfully.', document: createdDocument };
  } catch (error: any) {
    console.error('Error uploading document:', error);
    switch (error.code) {
        case 'storage/unauthorized':
             return {
                success: false,
                message: 'Permission Denied: Your security rules do not allow file uploads. Please check your Firebase Storage rules.'
            };
        default:
            return { success: false, message: error.message || 'Failed to upload document due to a server error.' };
    }
  }
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
        // 1. Delete file from Firebase Storage
        const fileRef = storageRef(storage, storagePath);
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
