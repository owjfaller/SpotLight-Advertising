import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { MOCK_SPACES } from '@/lib/mock/spaces'
import { formatPrice } from '@/lib/utils/formatters'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LISTINGS_CONTEXT = MOCK_SPACES.map((s) => {
  return `- [ID: ${s.id}] "${s.title}" — ${s.space_type} in ${s.city} | ${formatPrice(s.price_cents)}/mo | ${s.description?.slice(0, 120)}...`
}).join('\n')

const SYSTEM_PROMPT = `You are the SpotLight AI Advisor — a sharp, friendly advertising consultant helping brands find the perfect ad space.

Available listings:
${LISTINGS_CONTEXT}

RESPONSE RULES (strictly follow):
- Keep total response under 120 words
- Use short paragraphs of 1-2 sentences max — never write a wall of text
- Recommend exactly 2 listings max, each on its own line starting with "→"
- Format each recommendation as: → **[Listing Title]** (City) — one sentence on why it fits
- End with one short actionable tip or question
- No filler phrases like "Great question!" or "I appreciate..."
- Use markdown: **bold** for listing names, bullet points for lists`

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
