'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` }
    })
    setMessage(error ? error.message : 'Check your email to confirm your account.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm">G</div>
          <span className="font-semibold text-slate-900">GEO Monitor</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Create account</h1>
        <p className="text-slate-500 text-sm mb-6">Start monitoring your brand in AI</p>
        <form onSubmit={handleSignup} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors"/>
          <input type="password" placeholder="Password (min 8 chars)" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors"/>
          {message && <p className={`text-sm rounded-lg p-3 ${message.includes('Check') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>{message}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account? <Link href="/auth/login" className="text-purple-600 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
