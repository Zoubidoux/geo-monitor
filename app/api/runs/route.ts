import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { getLLMClient } from '@/lib/llm/factory'
import { detectMentions, computeShareOfVoice } from '@/lib/parsing/mentions'
import { extractCitations, computeCitationScore } from '@/lib/parsing/citations'
import { analyzeSentiment } from '@/lib/parsing/sentiment'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { project_id, prompt_ids, providers = ['openai'] } = body

  if (!project_id || !prompt_ids?.length) {
    return NextResponse.json({ error: 'project_id and prompt_ids are required' }, { status: 400 })
  }

  const sb = createServiceClient()

  // Load project + prompts
  const { data: project } = await sb.from('projects').select('*').eq('id', project_id).single()
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const { data: prompts } = await sb.from('prompts').select('*').in('id', prompt_ids)
  if (!prompts?.length) return NextResponse.json({ error: 'No prompts found' }, { status: 404 })

  // Create a run batch
  const { data: batch } = await sb
    .from('run_batches')
    .insert({ project_id, status: 'running', prompt_count: prompts.length * providers.length })
    .select('id')
    .single()

  const runResults = []

  for (const prompt of prompts) {
    for (const provider of providers) {
      // Insert run record
      const { data: run } = await sb
        .from('runs')
        .insert({ project_id, prompt_id: prompt.id, provider, status: 'running', run_batch_id: batch!.id })
        .select('id')
        .single()

      try {
        const client = getLLMClient(provider)
        const output = await client.query(prompt.prompt_text)

        // Save raw output
        await sb.from('run_outputs_raw').insert({
          run_id: run!.id,
          provider,
          raw_text: output.text,
          model_used: output.model,
          latency_ms: output.latency_ms,
          tokens_used: output.tokens_used,
        })

        // Parse scores
        const mentions = detectMentions(output.text, project.brand_name, project.competitors || [])
        const citations = extractCitations(output.text, project.domain)
        const sentiment = analyzeSentiment(output.text, project.brand_name)
        const sov = computeShareOfVoice(mentions, project.brand_name, project.competitors || [])
        const citScore = computeCitationScore(citations, project.domain)

        await sb.from('run_scores').insert({
          run_id: run!.id,
          mention_score: mentions.brand_mentioned ? 1 : 0,
          citation_score: citScore,
          sentiment_score: sentiment.score,
          sentiment_label: sentiment.label,
          share_of_voice: sov,
          risk_flags: sentiment.riskFlags,
        })

        await sb.from('runs').update({ status: 'done' }).eq('id', run!.id)
        runResults.push({ run_id: run!.id, status: 'done' })
      } catch (err: any) {
        await sb.from('runs').update({ status: 'error', error_message: err.message }).eq('id', run!.id)
        runResults.push({ run_id: run!.id, status: 'error', error: err.message })
      }
    }
  }

  // Update batch
  const doneCount = runResults.filter(r => r.status === 'done').length
  await sb.from('run_batches').update({
    status: doneCount === runResults.length ? 'done' : 'partial',
    completed_at: new Date().toISOString(),
  }).eq('id', batch!.id)

  return NextResponse.json({ batch_id: batch!.id, results: runResults })
}

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const project_id = searchParams.get('project_id')
  const limit = parseInt(searchParams.get('limit') || '50')

  if (!project_id) return NextResponse.json({ error: 'project_id required' }, { status: 400 })

  const sb = createServiceClient()
  const { data, error } = await sb
    .from('runs')
    .select('*, run_scores(*), prompts(prompt_text)')
    .eq('project_id', project_id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
