import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { MOCK_SPACES } from '@/lib/mock/spaces'
import { formatPrice } from '@/lib/utils/formatters'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LISTINGS_CONTEXT = MOCK_SPACES.map((s) => {
  return `ID:${s.id} | "${s.title}" | ${s.space_type} | ${s.city} | ${formatPrice(s.price_cents)}/mo`
}).join('\n')

const SYSTEM_PROMPT = `You are the SpotLight AI Advisor — a sharp advertising consultant helping brands find the perfect ad space.

Available listings:
${LISTINGS_CONTEXT}

STRICT RESPONSE FORMAT — follow exactly:
1. Write 1-2 short sentences of context (why these spaces fit the brand). No filler.
2. Then write "PICKS:" on its own line
3. List exactly 2 recommended listing titles, each on its own line, exactly matching the title from the listings above
4. End with one short follow-up question on a new line

Example format:
For a food brand in Chicago, high-frequency mobile reach is your best bet.

PICKS:
Wrapped Delivery Van
Festival Grounds Banner

What's your monthly budget — under $300 or more flexible?

RULES:
- Never describe the listings in text — the cards handle that
- Never use markdown asterisks or symbols
- Keep context to 1-2 sentences max
- Listing titles must match exactly`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    const stream = client.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
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
