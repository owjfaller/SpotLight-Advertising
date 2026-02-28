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

YOUR JOB: Run a short 3-question discovery before recommending spaces. Follow this exact flow:

━━ PHASE 1 — after the user's first message:
Respond with 1 warm sentence acknowledging their brand, then ask ONLY:
"Who is your target customer — and what's the one action you want them to take?"
Do NOT include PICKS yet.

━━ PHASE 2 — after user answers question 1:
Respond with 1 sentence, then ask ONLY:
"What's your monthly budget for this placement?"
Do NOT include PICKS yet.

━━ PHASE 3 — after user answers question 2:
Respond with 1 sentence, then ask ONLY:
"Are you focused on [their city] only, or open to nearby markets too?"
Do NOT include PICKS yet.

━━ PHASE 4 — after user answers question 3 (FINAL RESPONSE):
Write 1-2 sentences summarizing why these spaces fit, then output PICKS.

FORMAT FOR PHASE 4 ONLY:
[1-2 sentence summary. No markdown, no asterisks.]

PICKS:
[exact listing title]
[exact listing title]

RULES FOR ALL PHASES:
- One question per message — never stack multiple questions
- Keep every response under 40 words
- No asterisks, no markdown, no bullet points
- PICKS: only appears in Phase 4
- Each pick title must exactly match a TITLE from the listings above`

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
