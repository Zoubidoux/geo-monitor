import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm">G</div>
            <span className="font-semibold text-slate-900">GEO Monitor</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="hover:text-slate-700 transition-colors">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
            <p className="text-slate-500 text-sm mt-1">{projects?.length || 0} brand{projects?.length !== 1 ? 's' : ''} monitored</p>
          </div>
          <Link href="/projects/new"
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all">
            + New Project
          </Link>
        </div>

        {!projects?.length ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No projects yet</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              Create your first project to start monitoring your brand across ChatGPT, Claude, Gemini and more.
            </p>
            <Link href="/projects/new"
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all">
              Create first project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <Link key={p.id} href={`/projects/${p.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-purple-200 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
                    {p.brand_name[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{p.country} · {p.language}</span>
                </div>
                <h3 className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">{p.brand_name}</h3>
                <p className="text-sm text-slate-400 mt-0.5">{p.domain}</p>
                {Array.isArray(p.competitors) && p.competitors.length > 0 && (
                  <p className="text-xs text-slate-400 mt-3">vs {p.competitors.slice(0, 3).join(', ')}{p.competitors.length > 3 ? ` +${p.competitors.length - 3}` : ''}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
