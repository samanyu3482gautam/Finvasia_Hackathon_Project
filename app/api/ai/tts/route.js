import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { text, lang } = await request.json();
    if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });

    // Select voice: "nova" handles Hindi well, "alloy" for English
    const voice = lang === "hi" ? "nova" : "alloy";
    const clean = text
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .replace(/\n+/g, ". ")
      .trim()
      .slice(0, 4096); // OpenAI TTS limit

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: clean,
      speed: 0.95,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
