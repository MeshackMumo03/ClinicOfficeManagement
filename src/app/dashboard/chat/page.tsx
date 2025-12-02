
"use client"
// Import necessary components from ShadCN, Lucide-React and firebase.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SendHorizonal, Paperclip, File, X, Loader2 } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, doc, query, where, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Loader } from "@/components/layout/loader";
import React, { useState, useEffect, useRef } from "react";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";


/**
 * A utility function to get the initials from a name.
 * @param name The full name of the person.
 * @returns The initials of the person.
 */
function getInitials(name: string) {
    if (!name) return "";
    return name.split(' ').map(n => n[0]).join('');
}

interface Contact {
    id: string;
    name: string;
    role: string;
    photoURL?: string;
    conversationId?: string;
    lastMessage?: string;
}

interface FileUploadState {
    progress: number;
    fileName: string;
}

/**
 * ChatPage component to facilitate communication with patients.
 * It includes a list of patients and a chat window.
 */
export default function ChatPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUpload, setFileUpload] = useState<FileUploadState | null>(null);


  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);
  const userRole = userData?.role;

  // --- 1. Fetch all possible contacts (patients for staff, doctors for patients) ---
  const contactsQuery = useMemoFirebase(() => {
    if (!firestore || !userRole) return null;
    if (userRole === 'patient') {
        return collection(firestore, "doctors");
    }
    if (userRole === 'doctor' || userRole === 'receptionist' || userRole === 'admin') {
        return collection(firestore, "patients");
    }
    return null;
  }, [firestore, userRole]);
  const { data: allContactsData, isLoading: contactsLoading } = useCollection(contactsQuery);


  // --- 2. Fetch Conversations for the current user ---
  const conversationsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, "conversations"), where("participants", "array-contains", user.uid)) : null,
    [firestore, user]
  );
  const { data: conversations, isLoading: conversationsLoading } = useCollection(conversationsQuery);
  
  // --- 3. Combine contacts and conversations into a single list ---
  const [mergedContacts, setMergedContacts] = useState<Contact[]>([]);
  
  useEffect(() => {
    if (!allContactsData || !conversations) return;

    const contactMap = new Map<string, Contact>();

    allContactsData.forEach((contactDoc: any) => {
        const contactId = contactDoc.id;
        const name = `${contactDoc.firstName || ''} ${contactDoc.lastName || ''}`.trim() || 'Unnamed User';
        contactMap.set(contactId, {
            id: contactId,
            name: name,
            role: userRole === 'patient' ? 'doctor' : 'patient',
            photoURL: contactDoc.photoURL || `https://picsum.photos/seed/${contactId}/100/100`,
        });
    });

    conversations.forEach((convo: any) => {
        const otherUserId = convo.participants.find((p: string) => p !== user?.uid);
        if (contactMap.has(otherUserId)) {
            const existingContact = contactMap.get(otherUserId)!;
            existingContact.conversationId = convo.id;
            existingContact.lastMessage = convo.lastMessage;
        }
    });

    setMergedContacts(Array.from(contactMap.values()));

  }, [allContactsData, conversations, user?.uid, userRole]);

  // --- 4. Select a conversation ---
  useEffect(() => {
    if (!selectedConversationId && selectedContact) {
      setSelectedConversationId(selectedContact.conversationId || null);
    }
  }, [selectedContact, selectedConversationId]);
  
  // --- 5. Fetch messages for the selected conversation ---
  const messagesQuery = useMemoFirebase(
    () => selectedConversationId ? query(collection(firestore, `conversations/${selectedConversationId}/messages`), orderBy("timestamp", "asc")) : null,
    [firestore, selectedConversationId]
  );
  const { data: messages, isLoading: messagesLoading } = useCollection(messagesQuery);
  
  // --- 6. Handle selecting a contact and creating a conversation if needed ---
  const handleSelectContact = async (contact: Contact) => {
    setSelectedContact(contact);
    if (contact.conversationId) {
      setSelectedConversationId(contact.conversationId);
    } else {
      if (!user || !contact.id) return;
      
      const conversationData = {
          participants: [user.uid, contact.id],
          lastMessage: `Conversation started...`,
          lastMessageTimestamp: serverTimestamp(),
      };
      
      const newConvoRef = await addDoc(collection(firestore, 'conversations'), conversationData);
      setSelectedConversationId(newConvoRef.id);
      
      setMergedContacts(prev => prev.map(c => c.id === contact.id ? {...c, conversationId: newConvoRef.id} : c));
    }
  };

  // --- 7. Handle sending a message ---
  const handleSendMessage = async (customData?: Partial<any>) => {
    if ((!messageText.trim() && !customData) || !user || !selectedConversationId) return;

    const messagesColRef = collection(firestore, `conversations/${selectedConversationId}/messages`);
    const messageData = {
        senderId: user.uid,
        text: messageText,
        timestamp: serverTimestamp(),
        conversationId: selectedConversationId,
        ...customData,
    };
    
    addDocumentNonBlocking(messagesColRef, messageData);
    
    const conversationDocRef = doc(firestore, "conversations", selectedConversationId);
    // updateDoc(conversationDocRef, { lastMessage: messageText || "Attachment sent", lastMessageTimestamp: serverTimestamp() });

    setMessageText("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedConversationId) return;

    const storage = getStorage();
    const filePath = `chat_attachments/${selectedConversationId}/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed',
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setFileUpload({ progress, fileName: file.name });
        },
        (error) => {
            console.error("Upload error:", error);
            setFileUpload(null);
        },
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                const messageData = {
                    fileName: file.name,
                    [file.type.startsWith('image/') ? 'imageUrl' : 'fileUrl']: downloadURL,
                };
                handleSendMessage(messageData);
                setFileUpload(null);
            });
        }
    );
    // Reset file input
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isLoading = isUserLoading || isUserDataLoading || contactsLoading || conversationsLoading;

  if (isLoading) {
    return <Loader />;
  }
  
  const contactName = selectedContact ? selectedContact.name : "Loading...";
  const contactRole = selectedContact ? selectedContact.role : 'User';

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with your {userData?.role === 'patient' ? 'doctors' : 'patients'} securely.
        </p>
      </div>
      <div className="mt-8 border rounded-lg flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full">
        <div className="border-r flex flex-col h-full">
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder={`Search contacts...`} className="pl-8" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <nav className="grid gap-1 p-2">
                    {mergedContacts.map((contact) => (
                        <Button
                            key={contact.id}
                            variant={selectedContact?.id === contact.id ? "secondary" : "ghost"}
                            className="w-full justify-start gap-3 h-14"
                            onClick={() => handleSelectContact(contact)}
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarImage data-ai-hint="person face" src={contact.photoURL} />
                                <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-left">
                                <span className="font-medium">{contact.name}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-40">{contact.lastMessage || 'Click to start conversation...'}</span>
                            </div>
                        </Button>
                    ))}
                    {mergedContacts.length === 0 && (
                        <p className="p-4 text-sm text-muted-foreground">No contacts found.</p>
                    )}
                </nav>
            </div>
        </div>
        <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full bg-muted/20">
          {selectedContact ? (
            <>
              <div className="p-4 border-b flex items-center gap-4">
                  <Avatar>
                      <AvatarImage data-ai-hint="person face" src={selectedContact?.photoURL} />
                      <AvatarFallback>{getInitials(contactName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-lg">{contactName}</h2>
                    <p className="text-sm text-muted-foreground capitalize">{contactRole}</p>
                  </div>
              </div>
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                  {messagesLoading && <Loader />}
                  {messages?.map((msg: any) => {
                    const isSender = msg.senderId === user?.uid;
                    const messageTime = msg.timestamp?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
                    return (
                        <div key={msg.id} className={`flex items-start gap-3 ${isSender ? 'justify-end' : ''}`}>
                            {!isSender && (
                                <Avatar>
                                    <AvatarImage data-ai-hint="professional person" src={selectedContact?.photoURL} />
                                    <AvatarFallback>{getInitials(contactName)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`p-3 rounded-lg max-w-xs md:max-w-md ${isSender ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                                {msg.imageUrl && (
                                    <Image src={msg.imageUrl} alt="Uploaded image" width={300} height={200} className="rounded-md mb-2" />
                                )}
                                {msg.fileUrl && (
                                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-md bg-background/20 hover:bg-background/40 transition-colors mb-2">
                                        <File className="h-5 w-5" />
                                        <span className="font-medium underline">{msg.fileName}</span>
                                    </a>
                                )}
                                {msg.text && <p>{msg.text}</p>}
                                <p className={`text-xs mt-1 ${isSender ? 'text-right opacity-70' : 'text-right text-muted-foreground'}`}>{messageTime}</p>
                            </div>
                             {isSender && (
                                <Avatar>
                                    <AvatarImage data-ai-hint="person face" src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/100/100`} />
                                    <AvatarFallback>{getInitials(userData?.name || '')}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
              </div>
              {fileUpload && (
                <div className="p-4 border-t bg-card space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Uploading: {fileUpload.fileName}</p>
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                    <Progress value={fileUpload.progress} />
                </div>
              )}
              <div className="p-4 border-t bg-card">
                  <form onSubmit={(e) => { e.preventDefault(); handleSendMessage();}} className="relative flex items-center gap-2">
                      <Input 
                        placeholder="Type your message..." 
                        className="pr-12" 
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                      />
                       <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                      <Button type="button" variant="ghost" size="icon" className="text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
                          <Paperclip className="h-5 w-5" />
                      </Button>
                      <Button type="submit" variant="ghost" size="icon" className="text-muted-foreground" disabled={!messageText.trim()}>
                          <SendHorizonal className="h-5 w-5" />
                      </Button>
                  </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Select a contact to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

    