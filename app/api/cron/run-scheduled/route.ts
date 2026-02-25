import { createServiceClient } from '@/lib/supabase/server'
import { getLLMClient } from '@/lib/llm/factory'
import { detectMentions, computeShareOfVoice } from '@/lib/parsing/mentions'
import { extractCitations, computeCitationScore } from '@/lib/parsing/citations'
import { analyzeSentiment } from '@/lib/parsing/sentiment'
import { NextResponse } from 'next/server'

// This route is called by Vercel Cron (see vercel.json)
// It processes all projects with scheduled prompts
export async function GET(request: Request) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = createServiceClient()

  // Get all active prompts with their projects
  const { data: prompts } = await sb
    .from('prompts')
    .select('*, projects(*)')
    .eq('is_active', true)

  if (!prompts?.length) {
    return NextResponse.json({ message: 'No active prompts', ran: 0 })
  }

  let ran = 0
  let errors = 0

  for (const prompt of prompts) {
    const project = (prompt as any).projects
    if (!project) continue

    const providers = ['openai'] // Default to OpenAI for cron runs

    for (const provider of providers) {
      const { data: run } = await sb
        .from('runs')
        .insert({ project_id: project.id, prompt_id: prompt.id, provider, status: 'running' })
        .select('id')
        .single()

      if (!run) continue

      try {
        const client = getLLMClient(provider)
        const output = await client.run({ prompt_text: prompt.prompt_text, model: 'gpt-4o' })

        await sb.from('run_outputs_raw').insert({
          run_id: run.id,
          raw_text: output.answer_text,
        })

        const mentions = detectMentions(output.answer_text, project.brand_name, project.competitors || [])
        const citations = extractCitations(output.answer_text)
        const sentiment = analyzeSentiment(output.answer_text)
        const sov = computeShareOfVoice(mentions.brand_count, mentions.competitors)
        const citScore = computeCitationScore(citations, project.domain)

        await sb.from('run_scores').insert({
          run_id: run.id,
          mention_score: mentions.brand_mentioned ? 1 : 0,
          citation_score: citScore,
          sentiment_score: sentiment.score,
          sentiment_label: sentiment.label,
          share_of_voice: sov,
          risk_flags: sentiment.risk_flags,
        })

        await sb.from('runs').update({ status: 'done' }).eq('id', run.id)
        ran++
      } catch (err: any) {
        await sb.from('runs').update({ status: 'error', error_message: err.message }).eq('id', run.id)
        errors++
      }
    }
  }

  return NextResponse.json({ message: 'Cron complete', ran, errors })
}
