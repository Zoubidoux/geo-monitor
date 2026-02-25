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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center text-white font-bold text-xs">G</div>
          <span className="font-semibold text-gray-900 text-sm">GEO Monitor</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Create account</h1>
        <p className="text-gray-500 text-sm mb-6">Start monitoring your brand in AI</p>
        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required
            className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all text-gray-900 placeholder:text-gray-400"
          />
          <input
            type="password" placeholder="Password — min. 8 characters" value={password}
            onChange={e => setPassword(e.target.value)} required
            className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all text-gray-900 placeholder:text-gray-400"
          />
          {message && (
            <p className={`text-xs rounded-md px-3 py-2 border ${
              message.includes('Check')
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                : 'bg-red-50 border-red-100 text-red-600'
            }`}>{message}</p>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-medium py-2.5 rounded-md text-sm transition-colors">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-teal-600 hover:text-teal-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
