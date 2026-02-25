import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = createServiceClient()
  const { data: project } = await sb.from('projects').select('*').eq('id', id).single()
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const systemPrompt = `You are an AI visibility expert. Generate 10 realistic search prompts that a consumer might ask an AI assistant when looking for products/services in the category of the given brand. Each prompt should be a natural question that would surface the brand if it's mentioned by AI.

Return ONLY a JSON array of strings, no other text.`

  const userPrompt = `Brand: ${project.brand_name}
Domain: ${project.domain}
Country: ${project.country || 'US'}
Language: ${project.language || 'en'}
Competitors: ${(project.competitors || []).join(', ') || 'none listed'}

Generate 10 prompts.`

  let suggestions: string[] = []

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    suggestions = JSON.parse(text)
  } catch {
    // Fallback to generic prompts if Claude fails
    suggestions = [
      `What is the best ${project.brand_name} product?`,
      `Is ${project.brand_name} worth buying?`,
      `${project.brand_name} vs competitors: which is better?`,
      `What do people say about ${project.brand_name}?`,
      `Best alternatives to ${project.brand_name}`,
    ]
  }

  // Save suggestions to DB
  const inserts = suggestions.map(text => ({
    project_id: id,
    prompt_text: text,
    source: 'ai_generated',
  }))

  const { data, error } = await sb
    .from('prompt_suggestions')
    .insert(inserts)
    .select('id, prompt_text')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ suggestions: data })
}
