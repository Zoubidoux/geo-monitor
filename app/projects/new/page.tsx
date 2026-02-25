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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 text-sm transition-colors">← Dashboard</Link>
          <span className="text-slate-200">|</span>
          <span className="font-semibold text-slate-900 text-sm">New Project</span>
        </div>
      </header>
      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">New Project</h1>
        <p className="text-slate-500 text-sm mb-8">Set up AI monitoring for your brand</p>
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: 'Brand Name *', key: 'brand_name', placeholder: 'Dior Beauty', type: 'text' },
              { label: 'Domain *', key: 'domain', placeholder: 'dior.com', type: 'text' },
              { label: 'Competitors (comma-separated)', key: 'competitors', placeholder: 'Chanel, YSL, Givenchy', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-100 transition-all"/>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Country', key: 'country' },
                { label: 'Language', key: 'language' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-all"/>
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{error}</p>}
            <button type="submit" disabled={loading || !form.brand_name || !form.domain}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-all mt-2">
              {loading ? 'Creating…' : 'Create Project →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
