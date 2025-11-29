
"use client";

import { useState, useRef } from "react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Loader } from "../layout/loader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Upload, File, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentManagerProps {
    patientId: string;
}

export function DocumentManager({ patientId }: DocumentManagerProps) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const documentsQuery = useMemoFirebase(() => {
        if (!firestore || !patientId) return null;
        // This path is correct according to the new firestore.rules
        return collection(firestore, 'users', patientId, 'documents');
    }, [firestore, patientId]);

    const { data: documents, isLoading } = useCollection(documentsQuery);

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user || !patientId) return;

        setIsUploading(true);
        const storage = getStorage();
        // The storage path must match the pattern in storage.rules
        const storagePath = `documents/${patientId}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);

        try {
            // 1. Upload file to Firebase Storage
            const uploadResult = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadResult.ref);

            const documentData = {
                patientId: patientId, // Denormalized for potential queries
                uploadDateTime: new Date().toISOString(),
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                storagePath: storagePath,
                downloadURL: downloadURL,
                uploadedBy: user.uid,
            };
            
            // 2. Create metadata document in Firestore at the correct, secured path
            const docCollectionRef = collection(firestore, 'users', patientId, 'documents');
            await addDocumentNonBlocking(docCollectionRef, documentData);

            toast({
                title: "Upload Successful",
                description: `${file.name} has been uploaded.`,
            });
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

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>Upload and manage patient-related documents.</CardDescription>
                </div>
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
                    accept="image/*,application/pdf"
                />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                         <Loader />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead className="hidden sm:table-cell">Type</TableHead>
                                <TableHead className="hidden md:table-cell">Size</TableHead>
                                <TableHead className="hidden md:table-cell">Upload Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents && documents.length > 0 ? (
                                documents.map((doc: any) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <File className="h-4 w-4 text-muted-foreground" />
                                            {doc.fileName}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{doc.fileType}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {(doc.fileSize / 1024).toFixed(2)} KB
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {new Date(doc.uploadDateTime).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={doc.downloadURL} target="_blank" rel="noopener noreferrer">
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
                )}
            </CardContent>
        </Card>
    );
}

