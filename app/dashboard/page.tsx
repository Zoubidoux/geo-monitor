import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true })

  const project = projects?.[0] || null

  let runs: any[] = []
  let prompts: any[] = []

  if (project) {
    const { data: r } = await supabase
      .from('runs')
      .select('*, run_scores(*)')
      .eq('project_id', project.id)
      .eq('status', 'done')
      .order('created_at', { ascending: true })
      .limit(90)
    runs = r || []

    const { data: p } = await supabase
      .from('prompts')
      .select('*')
      .eq('project_id', project.id)
    prompts = p || []
  }

  // Compute KPIs
  const total = runs.length
  const mentionRate = total ? Math.round((runs.filter(r => r.run_scores?.mention_score > 0).length / total) * 100) : 0
  const citationRate = total ? Math.round((runs.filter(r => r.run_scores?.citation_score > 0).length / total) * 100) : 0
  const positiveRate = total ? Math.round((runs.filter(r => r.run_scores?.sentiment_label === 'positive').length / total) * 100) : 0
  const safetyRate = total
    ? Math.round((runs.filter(r => {
        const f = r.run_scores?.risk_flags
        return !f || !Array.isArray(f) || f.length === 0
      }).length / total) * 100)
    : 0
  const avgSOV = total
    ? Math.round((runs.reduce((a: number, r: any) => a + (r.run_scores?.share_of_voice || 0), 0) / total) * 100)
    : 0

  // Trend data: last 14 days
  const DAYS = 14
  const trendData = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (DAYS - 1 - i))
    const dayStr = d.toISOString().split('T')[0]
    const dayRuns = runs.filter((r: any) => r.created_at?.startsWith(dayStr))
    const n = dayRuns.length
    return {
      date: dayStr,
      label: d.toLocaleDateString('en', { month: 'numeric', day: 'numeric' }),
      mention: n ? Math.round((dayRuns.filter((r: any) => r.run_scores?.mention_score > 0).length / n) * 100) : null,
      citation: n ? Math.round((dayRuns.filter((r: any) => r.run_scores?.citation_score > 0).length / n) * 100) : null,
      sentiment: n ? Math.round((dayRuns.filter((r: any) => r.run_scores?.sentiment_label === 'positive').length / n) * 100) : null,
    }
  })

  return (
    <DashboardClient
      user={{ email: user.email }}
      projects={projects || []}
      project={project}
      kpis={{ mentionRate, citationRate, positiveRate, safetyRate, avgSOV, totalRuns: total }}
      trendData={trendData}
      promptCount={prompts.length}
      activePromptCount={prompts.filter((p: any) => p.is_active).length}
    />
  )
}
