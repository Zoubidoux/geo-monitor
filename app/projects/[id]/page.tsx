import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: project } = await supabase.from('projects').select('*').eq('id', params.id).single()
  if (!project) redirect('/dashboard')

  const { data: prompts } = await supabase.from('prompts').select('*').eq('project_id', params.id).order('created_at', { ascending: false })
  const { data: recentRuns } = await supabase
    .from('runs')
    .select('*, run_scores(*), prompts(prompt_text)')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const avgMention = recentRuns?.length
    ? Math.round((recentRuns.filter(r => r.run_scores?.mention_score > 0).length / recentRuns.length) * 100)
    : 0
  const avgCitation = recentRuns?.length
    ? Math.round((recentRuns.filter(r => r.run_scores?.citation_score > 0).length / recentRuns.length) * 100)
    : 0
  const sentiments = recentRuns?.reduce((acc: any, r: any) => {
    const s = r.run_scores?.sentiment_label || 'neutral'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {}) || {}

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 text-sm transition-colors">← Dashboard</Link>
            <span className="text-slate-200">|</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                {project.brand_name[0]}
              </div>
              <span className="font-semibold text-slate-900">{project.brand_name}</span>
              <span className="text-slate-400 text-sm">{project.domain}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Mention Rate', value: `${avgMention}%`, color: 'text-purple-700', bg: 'bg-purple-50' },
            { label: 'Citation Rate', value: `${avgCitation}%`, color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Total Runs', value: recentRuns?.length || 0, color: 'text-slate-700', bg: 'bg-slate-50' },
            { label: 'Active Prompts', value: prompts?.filter(p => p.is_active).length || 0, color: 'text-green-700', bg: 'bg-green-50' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{k.label}</div>
              <div className={`text-3xl font-bold ${k.color}`}>{k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prompts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Prompts</h2>
              <span className="text-xs text-slate-400">{prompts?.length || 0} total</span>
            </div>
            {!prompts?.length ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No prompts yet. Add prompts to start monitoring.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {prompts.map(p => (
                  <div key={p.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${p.is_active ? 'bg-green-400' : 'bg-slate-300'}`}/>
                    <span className="text-sm text-slate-700 leading-relaxed">{p.prompt_text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Runs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Recent Runs</h2>
            {!recentRuns?.length ? (
              <div className="text-center py-8 text-slate-400 text-sm">No runs yet. Add prompts and run them.</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentRuns.map((r: any) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      r.status === 'done' ? 'bg-green-400' :
                      r.status === 'error' ? 'bg-red-400' :
                      r.status === 'running' ? 'bg-yellow-400' : 'bg-slate-300'
                    }`}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 truncate">{(r.prompts as any)?.prompt_text || '—'}</p>
                      {r.run_scores && (
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs font-medium ${r.run_scores.mention_score > 0 ? 'text-purple-600' : 'text-slate-400'}`}>
                            {r.run_scores.mention_score > 0 ? '✓ Mentioned' : '✗ Not mentioned'}
                          </span>
                          <span className={`text-xs ${r.run_scores.sentiment_label === 'positive' ? 'text-green-600' : r.run_scores.sentiment_label === 'negative' ? 'text-red-500' : 'text-slate-400'}`}>
                            {r.run_scores.sentiment_label}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
