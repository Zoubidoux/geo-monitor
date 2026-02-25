import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">

        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-md bg-teal-500 flex items-center justify-center text-white font-bold text-sm">G</div>
          <span className="text-white font-semibold text-sm tracking-tight">GEO Monitor</span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-teal-950/70 border border-teal-800/60 rounded-full px-3 py-1 text-xs text-teal-400 mb-6 uppercase tracking-wider font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block"></span>
          AI Brand Monitoring
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
          Track how AI describes<br />your brand
        </h1>

        <p className="text-lg text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
          Monitor mentions, citations, and sentiment across ChatGPT, Claude, Gemini and more.
          Daily signals, automated.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 justify-center">
          <Link href="/auth/signup"
            className="bg-teal-500 hover:bg-teal-400 text-gray-950 font-semibold px-7 py-2.5 rounded-md text-sm transition-colors">
            Get started free
          </Link>
          <Link href="/auth/login"
            className="bg-white/5 hover:bg-white/10 text-gray-300 font-medium px-7 py-2.5 rounded-md text-sm border border-white/10 transition-colors">
            Sign in
          </Link>
        </div>

        {/* Feature cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Mention Rate', desc: 'How often your brand appears in AI answers' },
            { label: 'Citation Score', desc: 'Are your pages being cited as sources?' },
            { label: 'Share of Voice', desc: 'Your brand vs competitors in AI responses' },
          ].map(f => (
            <div key={f.label} className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-5 text-left">
              <div className="text-teal-400 font-semibold text-sm mb-1.5">{f.label}</div>
              <div className="text-gray-500 text-sm leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
