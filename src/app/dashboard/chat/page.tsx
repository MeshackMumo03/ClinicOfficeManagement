"use client"
// Import necessary components from ShadCN, Lucide-React and firebase.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SendHorizonal } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Loader } from "@/components/layout/loader";


/**
 * A utility function to get the initials from a name.
 * @param name The full name of the person.
 * @returns The initials of the person.
 */
function getInitials(name: string) {
    if (!name) return "";
    return name.split(' ').map(n => n[0]).join('');
}

/**
 * ChatPage component to facilitate communication with patients.
 * It includes a list of patients and a chat window.
 */
export default function ChatPage() {
  const firestore = useFirestore();
  const patientsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, "patients") : null),
    [firestore]
  );
  const { data: patients, isLoading } = useCollection(patientsQuery);

  if (isLoading) {
    return <Loader />;
  }

  const hasPatients = patients && patients.length > 0;
  const firstPatient: any = hasPatients ? patients[0] : null;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header section with page title and description. */}
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with your patients securely.
        </p>
      </div>

      {/* Main chat interface with patient list and chat window. */}
      <div className="mt-8 border rounded-lg flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full">
        <div className="border-r flex flex-col h-full">
            {/* Search bar for patients. */}
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search patients..." className="pl-8" />
                </div>
            </div>
            {/* List of patients. */}
            <div className="flex-1 overflow-y-auto">
                <nav className="grid gap-1 p-2">
                    {hasPatients && patients.slice(0, 5).map((patient: any, index: number) => (
                        <Button key={patient.id} variant={index === 0 ? "secondary" : "ghost"} className="w-full justify-start gap-3 h-12">
                             <Avatar className="h-8 w-8">
                                <AvatarImage data-ai-hint="person face" src={`https://picsum.photos/seed/${patient.firstName.replace(/\s/g, '')}/100/100`} />
                                <AvatarFallback>{getInitials(patient.firstName)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start">
                                <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                                <span className="text-xs text-muted-foreground">Click to view message...</span>
                            </div>
                        </Button>
                    ))}
                    {!hasPatients && (
                        <p className="p-4 text-sm text-muted-foreground">No patients found.</p>
                    )}
                </nav>
            </div>
        </div>
        {/* Chat window section. */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full bg-muted/20">
          {firstPatient ? (
            <>
              {/* Header of the chat window with patient's avatar and name. */}
              <div className="p-4 border-b flex items-center gap-4">
                  <Avatar>
                      <AvatarImage data-ai-hint="person face" src={`https://picsum.photos/seed/${firstPatient.firstName.replace(/\s/g, '')}/100/100`} />
                      <AvatarFallback>{getInitials(firstPatient.firstName)}</AvatarFallback>
                  </Avatar>
                  <h2 className="font-semibold text-lg">{firstPatient.firstName} {firstPatient.lastName}</h2>
              </div>
              {/* Message display area. */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                  {/* Example of an outgoing message. */}
                  <div className="flex items-start gap-3 justify-end">
                      <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                          <p>Hello Dr. Smith, I have a question about my prescription.</p>
                          <p className="text-xs text-right mt-1 opacity-70">3:45 PM</p>
                      </div>
                      <Avatar>
                          <AvatarImage data-ai-hint="person face" src={`https://picsum.photos/seed/${firstPatient.firstName.replace(/\s/g, '')}/100/100`} />
                          <AvatarFallback>{getInitials(firstPatient.firstName)}</AvatarFallback>
                      </Avatar>
                  </div>
                  {/* Example of an incoming message. */}
                  <div className="flex items-start gap-3">
                      <Avatar>
                          <AvatarImage data-ai-hint="professional person" src="https://picsum.photos/seed/doc1/100/100" />
                          <AvatarFallback>DS</AvatarFallback>
                      </Avatar>
                      <div className="bg-card p-3 rounded-lg max-w-xs">
                          <p>Hi {firstPatient.firstName}, of course. What is your question?</p>
                          <p className="text-xs text-right mt-1 text-muted-foreground">3:46 PM</p>
                      </div>
                  </div>
              </div>
              {/* Input area for typing a new message. */}
              <div className="p-4 border-t bg-card">
                  <div className="relative">
                      <Input placeholder="Type your message..." className="pr-12" />
                      <Button variant="ghost" size="icon" className="absolute top-1/2 right-1.5 -translate-y-1/2 h-8 w-8 text-muted-foreground">
                          <SendHorizonal className="h-5 w-5" />
                      </Button>
                  </div>
              </div>
            </>
          ) : (
            // Display a message if no conversation is selected.
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Select a conversation to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
