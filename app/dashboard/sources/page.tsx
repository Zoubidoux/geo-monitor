import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SourcesClient from './SourcesClient'

type CitationRow = {
  url: string
  domain: string
  title: string
  promptCount: number
  frequency: number
  influenceRank: number
  impact: 'High' | 'Medium' | 'Low'
}

type SourceRow = {
  domain: string
  sourceType: string
  citedPages: number
  frequency: number
  influenceRank: number
}

function inferSourceType(domain: string): string {
  if (/youtube|vimeo|tiktok|dailymotion/.test(domain)) return 'Video'
  if (/twitter|x\.com|instagram|facebook|linkedin|pinterest|snapchat/.test(domain)) return 'Social'
  if (/reddit|quora|stackexchange|stackoverflow/.test(domain)) return 'Forum'
  if (/wikipedia|britannica/.test(domain)) return 'Encyclopedia'
  if (/\.gov|\.edu/.test(domain)) return 'Institutional'
  if (/reuters|bbc|cnn|nytimes|lemonde|lefigaro|theguardian|bloomberg|wsj|ft\.com|apnews|afp/.test(domain)) return 'News'
  if (/medium|substack|wordpress|ghost|blogger|tumblr/.test(domain)) return 'Blog'
  return 'Web'
}

export default async function SourcesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true })

  const project = projects?.[0] || null

  const rawCitations: { url: string; domain: string; promptText: string }[] = []

  if (project) {
    const { data: runs } = await supabase
      .from('runs')
      .select('*, run_scores(*), prompts(prompt_text)')
      .eq('project_id', project.id)
      .eq('status', 'done')
      .order('created_at', { ascending: false })
      .limit(300)

    if (runs) {
      for (const run of runs) {
        const cits = run.run_scores?.citations
        if (Array.isArray(cits)) {
          for (const url of cits) {
            try {
              const domain = new URL(String(url)).hostname.replace(/^www\./, '')
              rawCitations.push({
                url: String(url),
                domain,
                promptText: (run.prompts as any)?.prompt_text || '',
              })
            } catch {
              // invalid URL, skip
            }
          }
        }
      }
    }
  }

  const total = rawCitations.length || 1

  // Aggregate: Citations View
  const citationMap = new Map<string, { url: string; domain: string; prompts: Set<string>; count: number }>()
  for (const c of rawCitations) {
    const ex = citationMap.get(c.url)
    if (ex) {
      ex.count++
      ex.prompts.add(c.promptText)
    } else {
      citationMap.set(c.url, { url: c.url, domain: c.domain, prompts: new Set([c.promptText]), count: 1 })
    }
  }

  const citationRows: CitationRow[] = Array.from(citationMap.values())
    .map(c => ({
      url: c.url,
      domain: c.domain,
      title: c.url.replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
      promptCount: c.prompts.size,
      frequency: c.count,
      influenceRank: Math.min(99, Math.round((c.count / total) * 1000)),
      impact: (c.count >= 5 ? 'High' : c.count >= 2 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
    }))
    .sort((a, b) => b.frequency - a.frequency)

  // Aggregate: Sources View
  const domainMap = new Map<string, { domain: string; urls: Set<string>; count: number }>()
  for (const c of rawCitations) {
    const ex = domainMap.get(c.domain)
    if (ex) {
      ex.count++
      ex.urls.add(c.url)
    } else {
      domainMap.set(c.domain, { domain: c.domain, urls: new Set([c.url]), count: 1 })
    }
  }

  const sourceRows: SourceRow[] = Array.from(domainMap.values())
    .map(d => ({
      domain: d.domain,
      sourceType: inferSourceType(d.domain),
      citedPages: d.urls.size,
      frequency: d.count,
      influenceRank: Math.min(99, Math.round((d.count / total) * 1000)),
    }))
    .sort((a, b) => b.frequency - a.frequency)

  return (
    <SourcesClient
      user={{ email: user.email }}
      projects={projects || []}
      project={project}
      citationRows={citationRows}
      sourceRows={sourceRows}
    />
  )
}
