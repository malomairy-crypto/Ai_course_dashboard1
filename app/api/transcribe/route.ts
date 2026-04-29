import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const entry = formData.get('file');

    if (!entry || typeof entry === 'string') {
      return NextResponse.json({ error: 'audio file is required' }, { status: 400 });
    }

    const transcription = await client.audio.transcriptions.create({
      file: entry as File,
      model: 'gpt-4o-mini-transcribe',
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
