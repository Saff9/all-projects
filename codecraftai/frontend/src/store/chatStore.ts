import Dexie, { Table } from "dexie";
import { ChatThread, Message } from "../types";
import { v4 as uuidv4 } from "uuid";

class ChatDB extends Dexie {
  threads!: Table<ChatThread, string>;
  constructor() {
    super("CodeCraftChatDB");
    this.version(1).stores({ threads: "id, title, createdAt" });
  }
}

export const db = new ChatDB();

export async function createThread(title: string): Promise<ChatThread> {
  const thread: ChatThread = {
    id: uuidv4(),
    title,
    createdAt: Date.now(),
    messages: [],
  };
  await db.threads.add(thread);
  return thread;
}

export async function addMessage(threadId: string, message: Message): Promise<void> {
  const thread = await db.threads.get(threadId);
  if (thread) {
    thread.messages.push(message);
    await db.threads.put(thread);
  }
}

export async function deleteThread(threadId: string): Promise<void> {
  await db.threads.delete(threadId);
}

export async function getAllThreads(): Promise<ChatThread[]> {
  return await db.threads.orderBy("createdAt").reverse().toArray();
}

export async function getThread(threadId: string): Promise<ChatThread | undefined> {
  return await db.threads.get(threadId);
}
