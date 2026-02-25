'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProjectPage() {
  const [form, setForm] = useState({ brand_name: '', domain: '', country: 'US', language: 'en', competitors: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    let { data: ws } = await supabase.from('workspaces').select('id').eq('owner_user_id', user.id).single()
    if (!ws) {
      const { data: newWs } = await supabase.from('workspaces').insert({ name: 'My Workspace', owner_user_id: user.id }).select('id').single()
      ws = newWs
      if (ws) await supabase.from('workspace_members').insert({ workspace_id: ws.id, user_id: user.id, role: 'owner' })
    }

    const { data: project, error: projErr } = await supabase.from('projects').insert({
      workspace_id: ws!.id,
      brand_name: form.brand_name, domain: form.domain,
      country: form.country, language: form.language,
      competitors: form.competitors.split(',').map(s => s.trim()).filter(Boolean),
    }).select('id').single()

    if (projErr) { setError(projErr.message); setLoading(false); return }
    router.push(`/projects/${project!.id}`)
  }

  const inputClass = "w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all text-gray-900 placeholder:text-gray-400"

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center text-white font-bold text-xs">G</div>
            <span className="font-semibold text-gray-900">GEO Monitor</span>
          </div>
          <span className="text-gray-300 mx-1">/</span>
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors">Dashboard</Link>
          <span className="text-gray-300 mx-1">/</span>
          <span className="text-gray-900 font-medium">New project</span>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 py-10">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">New project</h1>
        <p className="text-gray-500 text-sm mb-7">Set up AI monitoring for your brand</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Brand name <span className="text-gray-400 font-normal">*</span>
              </label>
              <input type="text" placeholder="Dior Beauty" value={form.brand_name}
                onChange={e => setForm(p => ({ ...p, brand_name: e.target.value }))}
                className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Domain <span className="text-gray-400 font-normal">*</span>
              </label>
              <input type="text" placeholder="dior.com" value={form.domain}
                onChange={e => setForm(p => ({ ...p, domain: e.target.value }))}
                className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Competitors <span className="text-gray-400 font-normal">comma-separated</span>
              </label>
              <input type="text" placeholder="Chanel, YSL, Givenchy" value={form.competitors}
                onChange={e => setForm(p => ({ ...p, competitors: e.target.value }))}
                className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                <input value={form.country}
                  onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                <input value={form.language}
                  onChange={e => setForm(p => ({ ...p, language: e.target.value }))}
                  className={inputClass} />
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-xs bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading || !form.brand_name || !form.domain}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-medium py-2.5 rounded-md text-sm transition-colors mt-2">
              {loading ? 'Creating…' : 'Create project'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
