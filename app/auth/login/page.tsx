'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm">G</div>
          <span className="font-semibold text-slate-900">GEO Monitor</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h1>
        <p className="text-slate-500 text-sm mb-6">Welcome back</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors"/>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors"/>
          {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          No account? <Link href="/auth/signup" className="text-purple-600 font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
