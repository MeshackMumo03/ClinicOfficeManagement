"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SendHorizonal } from "lucide-react";
import { patients } from "@/lib/data";

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('');
}

export default function ChatPage() {
  const hasPatients = patients.length > 0;
  const firstPatient = hasPatients ? patients[0] : null;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with your patients securely.
        </p>
      </div>

      <div className="mt-8 border rounded-lg flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full">
        <div className="border-r flex flex-col h-full">
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search patients..." className="pl-8" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <nav className="grid gap-1 p-2">
                    {patients.slice(0, 5).map((patient, index) => (
                        <Button key={patient.id} variant={index === 0 ? "secondary" : "ghost"} className="w-full justify-start gap-3 h-12">
                             <Avatar className="h-8 w-8">
                                <AvatarImage data-ai-hint="person face" src={`https://picsum.photos/seed/${patient.name.replace(/\s/g, '')}/100/100`} />
                                <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start">
                                <span className="font-medium">{patient.name}</span>
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
        <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full bg-muted/20">
          {firstPatient ? (
            <>
              <div className="p-4 border-b flex items-center gap-4">
                  <Avatar>
                      <AvatarImage data-ai-hint="person face" src={`https://picsum.photos/seed/${firstPatient.name.replace(/\s/g, '')}/100/100`} />
                      <AvatarFallback>{getInitials(firstPatient.name)}</AvatarFallback>
                  </Avatar>
                  <h2 className="font-semibold text-lg">{firstPatient.name}</h2>
              </div>
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                  <div className="flex items-start gap-3 justify-end">
                      <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                          <p>Hello Dr. Smith, I have a question about my prescription.</p>
                          <p className="text-xs text-right mt-1 opacity-70">3:45 PM</p>
                      </div>
                      <Avatar>
                          <AvatarImage data-ai-hint="person face" src={`https://picsum.photos/seed/${firstPatient.name.replace(/\s/g, '')}/100/100`} />
                          <AvatarFallback>{getInitials(firstPatient.name)}</AvatarFallback>
                      </Avatar>
                  </div>
                  <div className="flex items-start gap-3">
                      <Avatar>
                          <AvatarImage data-ai-hint="professional person" src="https://picsum.photos/seed/doc1/100/100" />
                          <AvatarFallback>DS</AvatarFallback>
                      </Avatar>
                      <div className="bg-card p-3 rounded-lg max-w-xs">
                          <p>Hi {firstPatient.name}, of course. What is your question?</p>
                          <p className="text-xs text-right mt-1 text-muted-foreground">3:46 PM</p>
                      </div>
                  </div>
              </div>
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
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Select a conversation to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
