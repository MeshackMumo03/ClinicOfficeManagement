
"use client";

import { useState } from "react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { Loader } from "../layout/loader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Upload, File, Download, Sparkles, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { documentTagging } from "@/ai/flows/document-tagging-flow";
import { Badge } from "../ui/badge";
import { DocumentUploadDialog } from "./document-upload-dialog";
import { AiTaggingTool } from "./ai-tagging-tool";
import type { PatientDocument } from "@/lib/document-actions";
import { deleteDocumentAction } from "@/lib/document-actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";

interface DocumentManagerProps {
    patientId: string;
    canManage: boolean;
}

// State to track which document is being prepared for AI tagging
interface TaggingState {
    document: PatientDocument;
    dataUri: string;
}

export function DocumentManager({ patientId, canManage }: DocumentManagerProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [taggingState, setTaggingState] = useState<TaggingState | null>(null);

    const documentsQuery = useMemoFirebase(() => {
        if (!firestore || !patientId) return null;
        // The path MUST match the security rules: /users/{userId}/documents/{documentId}
        return query(collection(firestore, 'users', patientId, 'documents'), orderBy('uploadDateTime', 'desc'));
    }, [firestore, patientId]);

    const { data: documents, isLoading } = useCollection<PatientDocument>(documentsQuery);

    const handleDocumentUploaded = (document: PatientDocument, dataUri: string) => {
        setIsUploadDialogOpen(false);
        setTaggingState({ document, dataUri });
    };

    const handleTagsApplied = () => {
        setTaggingState(null); // Close the tagging tool
        toast({ title: 'Success', description: 'Document processing is complete.' });
    };

    const handleDeleteDocument = async (docToDelete: PatientDocument) => {
        if (!patientId || !docToDelete.id || !docToDelete.storagePath) {
            toast({ variant: 'destructive', title: 'Error', description: 'Invalid document data for deletion.' });
            return;
        }

        const result = await deleteDocumentAction(patientId, docToDelete.id, docToDelete.storagePath);

        if (result.success) {
            toast({ title: 'Document Deleted', description: result.message });
        } else {
            toast({ variant: 'destructive', title: 'Deletion Failed', description: result.message });
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "Invalid Date";
        // Firestore timestamps have a toDate() method.
        if (typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toLocaleDateString();
        }
        // Fallback for string or number representations.
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }
        return date.toLocaleDateString();
    };


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>Upload and manage patient-related documents.</CardDescription>
                </div>
                {canManage && (
                    <Button onClick={() => setIsUploadDialogOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Document
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {taggingState && (
                    <AiTaggingTool
                        documentId={taggingState.document.id}
                        documentName={taggingState.document.fileName}
                        documentDataUri={taggingState.dataUri}
                        patientId={patientId}
                        onTagsApplied={handleTagsApplied}
                        onSkip={handleTagsApplied}
                    />
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                         <Loader />
                    </div>
                ) : (
                    <div className="border rounded-lg mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>File Name</TableHead>
                                    <TableHead>Tags</TableHead>
                                    <TableHead className="hidden md:table-cell">Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents && documents.length > 0 ? (
                                    documents.map((docData) => (
                                        <TableRow key={docData.id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <File className="h-4 w-4 text-muted-foreground" />
                                                {docData.fileName}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {(docData.tags || []).length > 0 ? (
                                                        docData.tags.map((tag: string) => (
                                                            <Badge key={tag} variant="secondary">{tag}</Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">No tags</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {formatDate(docData.uploadDateTime)}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={docData.downloadURL} target="_blank" rel="noopener noreferrer">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        View
                                                    </a>
                                                </Button>
                                                {canManage && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete the document "{docData.fileName}". This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteDocument(docData)} className="bg-destructive hover:bg-destructive/90">
                                                                    Confirm Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No documents found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

             {isUploadDialogOpen && (
                <DocumentUploadDialog
                    patientId={patientId}
                    onClose={() => setIsUploadDialogOpen(false)}
                    onDocumentUploaded={handleDocumentUploaded}
                />
            )}
        </Card>
    );
}
