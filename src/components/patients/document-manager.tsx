
"use client";

import { useState, useRef } from "react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Loader } from "../layout/loader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Upload, File, Download, Loader2, Sparkles, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { documentTagging } from "@/ai/flows/document-tagging-flow";
import { Badge } from "../ui/badge";

interface DocumentManagerProps {
    patientId: string;
    canManage: boolean;
}

export function DocumentManager({ patientId, canManage }: DocumentManagerProps) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const [isUploading, setIsUploading] = useState(false);
    const [isTagging, setIsTagging] = useState<string | null>(null); // Store the ID of the document being tagged
    const fileInputRef = useRef<HTMLInputElement>(null);

    const documentsQuery = useMemoFirebase(() => {
        if (!firestore || !patientId) return null;
        return collection(firestore, 'users', patientId, 'documents');
    }, [firestore, patientId]);

    const { data: documents, isLoading } = useCollection(documentsQuery);

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user || !patientId) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({
                variant: "destructive",
                title: "File Too Large",
                description: "The maximum file size is 5MB.",
            });
            return;
        }

        setIsUploading(true);
        const storage = getStorage();
        const storagePath = `documents/${patientId}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);

        try {
            const uploadResult = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadResult.ref);

            const documentData = {
                patientId: patientId,
                uploadDateTime: new Date().toISOString(),
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                storagePath: storagePath,
                downloadURL: downloadURL,
                uploadedBy: user.uid,
                tags: [], // Initialize with empty tags
            };
            
            const docCollectionRef = collection(firestore, 'users', patientId, 'documents');
            const newDocRef = await addDocumentNonBlocking(docCollectionRef, documentData);

            toast({
                title: "Upload Successful",
                description: `${file.name} has been uploaded.`,
            });

            // Trigger AI tagging
            if (newDocRef) {
                handleAiTagging(newDocRef.id, downloadURL);
            }

        } catch (error) {
            console.error("Error uploading file:", error);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "Could not upload the file. Please check permissions and try again.",
            });
        } finally {
            setIsUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleAiTagging = async (docId: string, docUrl: string) => {
        setIsTagging(docId);
        try {
            const result = await documentTagging({ documentUrl: docUrl });
            if (result.tags && firestore) {
                const docRef = doc(firestore, 'users', patientId, 'documents', docId);
                await updateDoc(docRef, { tags: result.tags });
                toast({
                    title: "AI Tagging Complete",
                    description: "Relevant tags have been automatically added to the document.",
                });
            }
        } catch (error) {
            console.error("AI Tagging Error:", error);
            // Don't show a toast for this, as it's a background enhancement
        } finally {
            setIsTagging(null);
        }
    }


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>Upload and manage patient-related documents.</CardDescription>
                </div>
                {canManage && (
                    <>
                        <Button onClick={handleFileSelect} disabled={isUploading}>
                            {isUploading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 h-4 w-4" />
                            )}
                            Upload Document
                        </Button>
                        <Input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileUpload}
                            accept="image/*,application/pdf,.doc,.docx"
                        />
                    </>
                )}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                         <Loader />
                    </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>File Name</TableHead>
                                    <TableHead>Tags</TableHead>
                                    <TableHead className="hidden md:table-cell">Upload Date</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents && documents.length > 0 ? (
                                    documents.map((docData: any) => (
                                        <TableRow key={docData.id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <File className="h-4 w-4 text-muted-foreground" />
                                                {docData.fileName}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {isTagging === docData.id ? (
                                                        <Badge variant="outline" className="animate-pulse">
                                                            <Sparkles className="mr-1 h-3 w-3" />
                                                            AI Tagging...
                                                        </Badge>
                                                    ) : (
                                                        docData.tags?.map((tag: string) => (
                                                            <Badge key={tag} variant="secondary">{tag}</Badge>
                                                        ))
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {new Date(docData.uploadDateTime).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={docData.downloadURL} target="_blank" rel="noopener noreferrer">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No documents found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
