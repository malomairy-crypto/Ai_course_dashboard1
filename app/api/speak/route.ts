import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const response = await client.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text,
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(buffer.length),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}