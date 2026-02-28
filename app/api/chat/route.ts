import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { MOCK_SPACES } from '@/lib/mock/spaces'
import { formatPrice } from '@/lib/utils/formatters'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LISTINGS_CONTEXT = MOCK_SPACES.map((s) => {
  return `ID:${s.id} | TITLE:"${s.title}" | ${s.space_type} | ${s.city} | ${formatPrice(s.price_cents)}/mo`
}).join('\n')

const SYSTEM_PROMPT = `You are the SpotLight AI Advisor — a sharp advertising consultant helping brands find the perfect ad space.

Available listings (use exact TITLE values):
${LISTINGS_CONTEXT}

YOUR RESPONSE MUST USE THIS EXACT FORMAT — no exceptions:

[1-2 sentences of context. No filler. No markdown.]

PICKS:
[exact title from listings above]
[exact title from listings above]

[One follow-up question]

CRITICAL RULES:
- The word PICKS: must be on its own line
- Each pick must be on its own line, exactly matching a TITLE from the listings
- Never add dashes, numbers, bullets, or extra text to the pick lines
- Never describe listings in the text — the UI shows cards for that
- No asterisks, no markdown, no bold formatting anywhere`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    const stream = client.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
