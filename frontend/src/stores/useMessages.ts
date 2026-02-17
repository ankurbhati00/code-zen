import { create } from "zustand";

export type MessageRole = "assistant" | "user";

export interface Message {
  role: MessageRole;
  content: string;
}

interface MessageStore {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
}

export const useMessages = create<MessageStore>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
}));
