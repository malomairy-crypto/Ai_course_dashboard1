import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

const SYSTEM_PROMPT = `You are a business analyst for Noor Trading Co.,
a Saudi retail company. Answer using ONLY the
Supabase data provided below the user's question.

Tables you will receive (as JSON):
 • sales — id, date, customer_id, product_id, amount_sar, status
 • customers — id, name, city, loyalty_tier, total_spent_sar
 • products — id, name, category, price_sar, cost_sar, stock_qty
 • expenses — id, date, category, amount_sar
 • inventory — product_id, qty_on_hand, reorder_at
 • feedback — id, customer_id, rating, comment

All amounts in SAR. If a question is ambiguous,
ask ONE short clarifying question. Keep answers
2-4 sentences unless asked for a longer report.`;

type Turn = { role: 'user' | 'assistant'; content: string };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, data, history } = body;

    if (!question) {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    const userContent = data
      ? `${question}\n\nDATA:\n${typeof data === 'string' ? data : JSON.stringify(data)}`
      : question;

    const priorTurns: Turn[] = Array.isArray(history) ? history : [];

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...priorTurns,
        { role: 'user', content: userContent },
      ],
    });

    const answer = response.choices[0]?.message?.content ?? '';
    return NextResponse.json({ answer });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
