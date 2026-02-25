import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-8">
          AI Monitoring · Multi-LLM · Real-time signals
        </div>
        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
          Track how AI describes<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">your brand</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto">
          Monitor mentions, citations, sentiment and competitors across ChatGPT, Claude, Gemini and more.
          Get daily insights and action recommendations.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/auth/signup" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3 rounded-xl transition-all">
            Get started free
          </Link>
          <Link href="/auth/login" className="bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-3 rounded-xl border border-white/20 transition-all">
            Sign in
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { label: 'Mention Rate', desc: 'How often your brand appears in AI answers' },
            { label: 'Citation Score', desc: 'Are your pages being cited as sources?' },
            { label: 'Share of Voice', desc: 'Your brand vs competitors in AI' },
          ].map(f => (
            <div key={f.label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-white font-bold text-lg mb-1">{f.label}</div>
              <div className="text-slate-400 text-sm">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
