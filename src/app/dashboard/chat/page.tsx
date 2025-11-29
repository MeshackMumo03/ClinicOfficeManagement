
"use client"
// Import necessary components from ShadCN, Lucide-React and firebase.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SendHorizonal } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, doc, query, where, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { Loader } from "@/components/layout/loader";
import React, { useState, useEffect, useRef } from "react";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";


/**
 * A utility function to get the initials from a name.
 * @param name The full name of the person.
 * @returns The initials of the person.
 */
function getInitials(name: string) {
    if (!name) return "";
    return name.split(' ').map(n => n[0]).join('');
}


// A new hook to get user data from a list of users by ID.
function useOtherParticipant(userId: string | null) {
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(
      () => (userId ? doc(firestore, "users", userId) : null),
      [userId, firestore]
    );

    const { data: userData } = useDoc(userDocRef);
    return userData;
}


/**
 * ChatPage component to facilitate communication with patients.
 * It includes a list of patients and a chat window.
 */
export default function ChatPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  // --- 1. Fetch Conversations for the current user ---
  const conversationsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, "conversations"), where("participants", "array-contains", user.uid)) : null,
    [firestore, user]
  );
  const { data: conversations, isLoading: conversationsLoading } = useCollection(conversationsQuery);

  // --- 2. Get the currently selected conversation ---
  const selectedConversation = conversations?.find(c => c.id === selectedConversationId) || (conversations && conversations.length > 0 && !selectedConversationId ? conversations[0] : null);
  
  // --- 3. Set the selected conversation ID from the first conversation ---
  useEffect(() => {
    if (!selectedConversationId && conversations && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // --- 4. Fetch messages for the selected conversation ---
  const messagesQuery = useMemoFirebase(
    () => selectedConversationId ? query(collection(firestore, `conversations/${selectedConversationId}/messages`), orderBy("timestamp", "asc")) : null,
    [firestore, selectedConversationId]
  );
  const { data: messages, isLoading: messagesLoading } = useCollection(messagesQuery);
  
  // --- 5. Get the other participant's info ---
  const otherParticipantId = selectedConversation?.participants.find((p: string) => p !== user?.uid);
  const otherParticipant = useOtherParticipant(otherParticipantId);
  
  // --- 6. Handle sending a message ---
  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || !selectedConversationId) return;

    const messagesColRef = collection(firestore, `conversations/${selectedConversationId}/messages`);
    const messageData = {
        senderId: user.uid,
        text: messageText,
        timestamp: serverTimestamp(),
        conversationId: selectedConversationId,
    };
    
    // Non-blocking write for optimistic UI update
    addDocumentNonBlocking(messagesColRef, messageData);
    
    // Also update the lastMessage on the conversation
    const conversationDocRef = doc(firestore, "conversations", selectedConversationId);
    // You might want a non-blocking update here too
    // For now, let's keep it simple
    // updateDoc(conversationDocRef, { lastMessage: messageText, lastMessageTimestamp: serverTimestamp() });

    setMessageText(""); // Clear input
  };
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const isLoading = isUserLoading || isUserDataLoading || conversationsLoading;

  if (isLoading) {
    return <Loader />;
  }
  
  const contactName = otherParticipant ? otherParticipant.name : "Loading...";
  const contactRole = otherParticipant ? otherParticipant.role : 'User';


  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header section with page title and description. */}
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with your {userData?.role === 'patient' ? 'doctors' : 'patients'} securely.
        </p>
      </div>

      {/* Main chat interface with contact list and chat window. */}
      <div className="mt-8 border rounded-lg flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full">
        <div className="border-r flex flex-col h-full">
            {/* Search bar for contacts. */}
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder={`Search conversations...`} className="pl-8" />
                </div>
            </div>
            {/* List of contacts. */}
            <div className="flex-1 overflow-y-auto">
                <nav className="grid gap-1 p-2">
                    {conversations && conversations.map((convo: any) => {
                        const otherUserId = convo.participants.find((p: string) => p !== user?.uid);
                        return <ConversationListItem key={convo.id} conversation={convo} otherUserId={otherUserId} selectedConversationId={selectedConversationId} onSelect={setSelectedConversationId} />
                    })}
                    {(!conversations || conversations.length === 0) && (
                        <p className="p-4 text-sm text-muted-foreground">No conversations found.</p>
                    )}
                </nav>
            </div>
        </div>
        {/* Chat window section. */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full bg-muted/20">
          {selectedConversation ? (
            <>
              {/* Header of the chat window with contact's avatar and name. */}
              <div className="p-4 border-b flex items-center gap-4">
                  <Avatar>
                      <AvatarImage data-ai-hint="person face" src={`https://picsum.photos/seed/${otherParticipant?.uid}/100/100`} />
                      <AvatarFallback>{getInitials(contactName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-lg">{contactName}</h2>
                    <p className="text-sm text-muted-foreground capitalize">{contactRole}</p>
                  </div>
              </div>
              {/* Message display area. */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                  {messagesLoading && <Loader />}
                  {messages?.map((msg: any) => {
                    const isSender = msg.senderId === user?.uid;
                    const messageTime = msg.timestamp?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
                    return (
                        <div key={msg.id} className={`flex items-start gap-3 ${isSender ? 'justify-end' : ''}`}>
                            {!isSender && (
                                <Avatar>
                                    <AvatarImage data-ai-hint="professional person" src={`https://picsum.photos/seed/${otherParticipantId}/100/100`} />
                                    <AvatarFallback>{getInitials(contactName)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`${isSender ? 'bg-primary text-primary-foreground' : 'bg-card'} p-3 rounded-lg max-w-xs`}>
                                <p>{msg.text}</p>
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
              {/* Input area for typing a new message. */}
              <div className="p-4 border-t bg-card">
                  <form onSubmit={(e) => { e.preventDefault(); handleSendMessage();}} className="relative">
                      <Input 
                        placeholder="Type your message..." 
                        className="pr-12" 
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                      />
                      <Button type="submit" variant="ghost" size="icon" className="absolute top-1/2 right-1.5 -translate-y-1/2 h-8 w-8 text-muted-foreground" disabled={!messageText.trim()}>
                          <SendHorizonal className="h-5 w-5" />
                      </Button>
                  </form>
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

function ConversationListItem({ conversation, otherUserId, selectedConversationId, onSelect }: any) {
    const otherParticipant = useOtherParticipant(otherUserId);
    const contactName = otherParticipant ? otherParticipant.name : "Loading...";

    return (
        <Button variant={selectedConversationId === conversation.id ? "secondary" : "ghost"} className="w-full justify-start gap-3 h-12" onClick={() => onSelect(conversation.id)}>
             <Avatar className="h-8 w-8">
                <AvatarImage data-ai-hint="person face" src={`https://picsum.photos/seed/${otherUserId}/100/100`} />
                <AvatarFallback>{getInitials(contactName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
                <span className="font-medium">{contactName}</span>
                <span className="text-xs text-muted-foreground truncate max-w-40">{conversation.lastMessage || 'Click to view message...'}</span>
            </div>
        </Button>
    )
}
