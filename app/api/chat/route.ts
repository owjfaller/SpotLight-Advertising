import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { MOCK_SPACES } from '@/lib/mock/spaces'
import { formatPrice } from '@/lib/utils/formatters'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LISTINGS_CONTEXT = MOCK_SPACES.map((s) => {
  return `- [ID: ${s.id}] "${s.title}" — ${s.space_type} in ${s.city} | ${formatPrice(s.price_cents)}/mo | ${s.description?.slice(0, 120)}...`
}).join('\n')

const SYSTEM_PROMPT = `You are the SpotLight AI Advisor — a friendly, expert advertising consultant who helps brands find the best unconventional ad spaces for their campaigns.

SpotLight is a marketplace for unique advertising spaces. Here are all available listings:

${LISTINGS_CONTEXT}

Your job:
1. Listen to what the user's brand or campaign is about
2. Recommend 2-3 specific listings from the list above (always mention the title and city)
3. Explain WHY each recommended space fits their brand or goals
4. Provide practical advice on budget, timing, or targeting if relevant
5. Be concise, warm, and direct — no fluff

Always reference specific listing titles when making recommendations. If the user mentions a city, prioritize listings in or near that city.`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    const stream = client.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
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
