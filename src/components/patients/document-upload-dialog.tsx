
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import { uploadDocumentAction } from '@/lib/document-actions';
import { useUser } from '@/firebase';
import type { PatientDocument } from '@/lib/document-actions';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'image/jpeg', 
    'image/png',
    'image/webp',
];

const uploadFormSchema = z.object({
  document: z
    .custom<FileList>((val) => val instanceof FileList && val.length > 0, 'A file is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
    .refine(
      (files) => ALLOWED_FILE_TYPES.includes(files?.[0]?.type),
      "Only PDF, Word, and image files (JPG, PNG) are allowed."
    ),
  description: z.string().optional(),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

interface DocumentUploadDialogProps {
  patientId: string;
  onClose: () => void;
  onDocumentUploaded: (document: PatientDocument, dataUri: string) => void;
}

export function DocumentUploadDialog({ patientId, onClose, onDocumentUploaded }: DocumentUploadDialogProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      document: undefined,
      description: '',
    },
  });
  
  const fileRef = form.register("document");

  const onSubmit = async (values: UploadFormValues) => {
    setIsLoading(true);
    if (!values.document || values.document.length === 0 || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'File or user information is missing.' });
        setIsLoading(false);
        return;
    }
    const file = values.document[0];
    const formData = new FormData();
    formData.append('document', file);
    if (values.description) {
        formData.append('description', values.description);
    }

    try {
      // Call the secure server action
      const result = await uploadDocumentAction(patientId, user.uid, formData);

      if (result.success && result.document) {
         toast({
          title: 'Document Uploaded',
          description: `${file.name} is now ready for AI processing.`,
        });
        
        // Read file as a data URI to pass to the AI tagging tool
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUri = reader.result as string;
          onDocumentUploaded(result.document!, dataUri);
        };
        reader.readAsDataURL(file);

      } else {
         toast({ variant: 'destructive', title: 'Upload Failed', description: result.message });
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: error.message || 'Could not upload the file.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Select a document to upload for this patient. Max 10MB.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="document"
              render={() => (
                <FormItem>
                  <FormLabel>Document File</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      {...fileRef}
                      className="pt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'Blood test results from Jan 2024'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !form.formState.isDirty || !form.formState.isValid}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-4 w-4" />
                )}
                Upload & Process
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
