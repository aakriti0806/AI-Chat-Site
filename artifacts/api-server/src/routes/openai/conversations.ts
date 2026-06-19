import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import {
  CreateOpenaiConversationBody,
  RenameOpenaiConversationBody,
  GetOpenaiConversationParams,
  DeleteOpenaiConversationParams,
  RenameOpenaiConversationParams,
  ListOpenaiMessagesParams,
  SendOpenaiMessageParams,
  SendOpenaiMessageBody,
} from "@workspace/api-zod";
import { GoogleGenAI } from "@google/genai";
import { requireAuth, getAuth } from "@clerk/express";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const router = Router();

router.use(requireAuth());

router.get("/conversations", async (req, res) => {
  const userId = getAuth(req).userId!;
  const convs = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.createdAt));
  res.json(convs);
});

router.post("/conversations", async (req, res) => {
  const userId = getAuth(req).userId!;
  const parsed = CreateOpenaiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [conv] = await db
    .insert(conversations)
    .values({ title: parsed.data.title, userId })
    .returning();
  res.status(201).json(conv);
});

router.get("/conversations/:id", async (req, res) => {
  const userId = getAuth(req).userId!;
  const params = GetOpenaiConversationParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, params.data.id), eq(conversations.userId, userId)));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, params.data.id))
    .orderBy(messages.createdAt);
  res.json({ ...conv, messages: msgs });
});

router.delete("/conversations/:id", async (req, res) => {
  const userId = getAuth(req).userId!;
  const params = DeleteOpenaiConversationParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, params.data.id), eq(conversations.userId, userId)));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  await db.delete(conversations).where(eq(conversations.id, params.data.id));
  res.status(204).end();
});

router.patch("/conversations/:id", async (req, res) => {
  const userId = getAuth(req).userId!;
  const params = RenameOpenaiConversationParams.safeParse({ id: Number(req.params.id) });
  const body = RenameOpenaiConversationBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, params.data.id), eq(conversations.userId, userId)));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const [updated] = await db
    .update(conversations)
    .set({ title: body.data.title })
    .where(eq(conversations.id, params.data.id))
    .returning();
  res.json(updated);
});

router.get("/conversations/:id/messages", async (req, res) => {
  const userId = getAuth(req).userId!;
  const params = ListOpenaiMessagesParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, params.data.id), eq(conversations.userId, userId)));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, params.data.id))
    .orderBy(messages.createdAt);
  res.json(msgs);
});

router.post("/conversations/:id/messages", async (req, res) => {
  const userId = getAuth(req).userId!;
  const params = SendOpenaiMessageParams.safeParse({ id: Number(req.params.id) });
  const body = SendOpenaiMessageBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const convId = params.data.id;
  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, convId), eq(conversations.userId, userId)));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  await db.insert(messages).values({
    conversationId: convId,
    role: "user",
    content: body.data.content,
  });

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, convId))
    .orderBy(messages.createdAt);

  // Build Gemini content array from history (exclude the last user message — passed separately)
  const geminiHistory = history.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: geminiHistory,
    });

    const stream = await chat.sendMessageStream({ message: body.data.content });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    await db.insert(messages).values({
      conversationId: convId,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI error occurred";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

export default router;
