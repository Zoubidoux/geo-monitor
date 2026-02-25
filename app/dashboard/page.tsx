import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center text-white font-bold text-xs">G</div>
            <span className="font-semibold text-gray-900 text-sm">GEO Monitor</span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <span className="text-gray-400 hidden sm:block">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="text-gray-500 hover:text-gray-800 transition-colors font-medium">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Projects</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {projects?.length || 0} brand{projects?.length !== 1 ? 's' : ''} monitored
            </p>
          </div>
          <Link href="/projects/new"
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-md text-sm transition-colors">
            + New project
          </Link>
        </div>

        {!projects?.length ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="w-11 h-11 bg-gray-100 rounded-lg mx-auto flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-1.5">No projects yet</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
              Create your first project to start monitoring your brand across ChatGPT, Claude, Gemini and more.
            </p>
            <Link href="/projects/new"
              className="inline-flex bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-md text-sm transition-colors">
              Create first project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map(p => (
              <Link key={p.id} href={`/projects/${p.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-md bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                    {p.brand_name[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                    {p.country} · {p.language}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm group-hover:text-teal-700 transition-colors">{p.brand_name}</h3>
                <p className="text-sm text-gray-400 mt-0.5">{p.domain}</p>
                {Array.isArray(p.competitors) && p.competitors.length > 0 && (
                  <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                    vs {p.competitors.slice(0, 3).join(', ')}{p.competitors.length > 3 ? ` +${p.competitors.length - 3}` : ''}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
