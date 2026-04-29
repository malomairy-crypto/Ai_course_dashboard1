import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

function buildSystemPrompt() {
  const today = new Date().toISOString().split('T')[0]
  return `You are a business analyst for Noor Trading Co., a Saudi retail company.
Today's date is ${today}. Answer using ONLY the Supabase data provided with the user's question.

Tables you will receive (as JSON):
 • sales     — id, date, customer_name, product, category, amount_sar, status, payment_method
 • customers — customer_id, name, city, loyalty_tier, total_spent_sar
 • products  — product_id, name, category, price_sar, cost_sar, stock_quantity
 • expenses  — id, date, category, description, amount_sar
 • inventory — product_id, product_name, category, in_stock, reorder_level
 • feedback  — id, date, customer_name, product, rating, comment

All amounts in SAR. If the data for a requested period is missing, say so clearly and
offer the nearest available period instead. Keep answers 2-4 sentences unless asked for
a longer report. If a question is out of scope (not about business data), say so briefly.`
}

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
        { role: 'system', content: buildSystemPrompt() },
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
