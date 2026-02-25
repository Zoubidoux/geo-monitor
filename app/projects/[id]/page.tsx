import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  if (!project) redirect('/dashboard')

  const { data: prompts } = await supabase.from('prompts').select('*').eq('project_id', id).order('created_at', { ascending: false })
  const { data: recentRuns } = await supabase
    .from('runs')
    .select('*, run_scores(*), prompts(prompt_text)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  const avgMention = recentRuns?.length
    ? Math.round((recentRuns.filter(r => r.run_scores?.mention_score > 0).length / recentRuns.length) * 100)
    : 0
  const avgCitation = recentRuns?.length
    ? Math.round((recentRuns.filter(r => r.run_scores?.citation_score > 0).length / recentRuns.length) * 100)
    : 0

  const kpis = [
    { label: 'Mention Rate', value: `${avgMention}%`, sub: 'brand mentioned in AI answers' },
    { label: 'Citation Rate', value: `${avgCitation}%`, sub: 'site cited as a source' },
    { label: 'Total Runs', value: recentRuns?.length ?? 0, sub: 'last 20 runs' },
    { label: 'Active Prompts', value: prompts?.filter(p => p.is_active).length ?? 0, sub: 'prompts monitored' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center text-white font-bold text-xs">G</div>
              <span className="font-semibold text-gray-900">GEO Monitor</span>
            </div>
            <span className="text-gray-300 mx-1">/</span>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors">Dashboard</Link>
            <span className="text-gray-300 mx-1">/</span>
            <span className="text-gray-900 font-medium">{project.brand_name}</span>
          </div>
          <span className="text-gray-400 text-sm hidden sm:block">{project.domain}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-5">

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-xs font-medium text-gray-500 mb-2">{k.label}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{k.value}</div>
              <div className="text-xs text-gray-400 leading-snug">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Prompts */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Monitoring prompts</h2>
              <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                {prompts?.length ?? 0} total
              </span>
            </div>
            {!prompts?.length ? (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm">No prompts yet.</p>
                <p className="text-gray-400 text-xs mt-1">Add prompts to start monitoring.</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {prompts.map(p => (
                  <div key={p.id} className="flex items-start gap-3 px-3 py-2.5 bg-gray-50 rounded-lg">
                    <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${p.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-700 leading-relaxed">{p.prompt_text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Runs */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent runs</h2>
            {!recentRuns?.length ? (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm">No runs yet.</p>
                <p className="text-gray-400 text-xs mt-1">Add prompts and run them.</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {recentRuns.map((r: any) => (
                  <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      r.status === 'done'    ? 'bg-emerald-500' :
                      r.status === 'error'   ? 'bg-red-400' :
                      r.status === 'running' ? 'bg-amber-400' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 truncate">{(r.prompts as any)?.prompt_text || '—'}</p>
                      {r.run_scores && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-xs font-medium ${r.run_scores.mention_score > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {r.run_scores.mention_score > 0 ? '✓ Mentioned' : '✗ Not mentioned'}
                          </span>
                          <span className="text-gray-300">·</span>
                          <span className={`text-xs ${
                            r.run_scores.sentiment_label === 'positive' ? 'text-emerald-600' :
                            r.run_scores.sentiment_label === 'negative' ? 'text-red-500' : 'text-gray-400'
                          }`}>
                            {r.run_scores.sentiment_label}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
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
