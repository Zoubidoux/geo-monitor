import Link from 'next/link'

// ── Mock dashboard preview ──────────────────────────────────────────────────
function MockDashboard() {
  return (
    <div className="relative w-full max-w-lg animate-float" style={{ perspective: '1200px' }}>
      {/* Glow behind */}
      <div className="absolute inset-0 rounded-2xl bg-teal-500/10 blur-3xl scale-110 -z-10" />

      {/* Browser frame */}
      <div className="rounded-2xl border border-white/10 bg-gray-900/90 shadow-2xl overflow-hidden backdrop-blur-sm">
        {/* Chrome */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.07] bg-white/[0.03]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          <div className="flex-1 mx-4">
            <div className="bg-white/[0.06] rounded px-3 py-0.5 text-[10px] text-gray-500 text-center">geo-monitor.app/dashboard</div>
          </div>
        </div>

        {/* App shell */}
        <div className="flex h-64">

          {/* Sidebar */}
          <div className="w-28 border-r border-white/[0.06] bg-white/[0.02] flex flex-col py-3 px-2 gap-0.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-1.5 mb-3">
              <div className="w-4 h-4 rounded bg-teal-500 flex items-center justify-center text-white font-bold text-[7px]">G</div>
              <span className="text-[9px] font-semibold text-gray-300">GEO Monitor</span>
            </div>
            <p className="text-[7px] text-gray-600 uppercase tracking-widest px-1.5 mb-1">AI Insights</p>
            {['Overview', 'AI Sources', 'Sentiment', 'Competitors'].map((item, i) => (
              <div key={item}
                className={`text-[9px] px-2 py-1 rounded text-left ${i === 0 ? 'bg-teal-900/60 text-teal-300 font-medium' : 'text-gray-500'}`}>
                {item}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
              <span className="text-[10px] font-semibold text-gray-300">Overview</span>
              <div className="flex items-center gap-1.5">
                <div className="animate-pulse-dot w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span className="text-[9px] text-gray-500">Live · Dior Beauty</span>
              </div>
            </div>

            <div className="flex-1 overflow-hidden p-3 space-y-2.5">
              {/* KPI row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'AI Visibility', val: '73', trend: '+12%', color: '#10b981' },
                  { label: 'AI Favorability', val: '84', trend: '+8%', color: '#0d9488' },
                  { label: 'Share of Voice', val: '28%', trend: '+5%', color: '#34d399' },
                ].map(k => (
                  <div key={k.label} className="bg-white/[0.04] border border-white/[0.07] rounded-lg p-2">
                    <div className="text-[7px] text-gray-500 mb-1">{k.label}</div>
                    <div className="text-[14px] font-bold" style={{ color: k.color }}>{k.val}</div>
                    <div className="text-[7px] text-emerald-500 mt-0.5">{k.trend}</div>
                  </div>
                ))}
              </div>

              {/* Sources mini table */}
              <div className="bg-white/[0.04] border border-white/[0.07] rounded-lg p-2">
                <div className="text-[8px] font-semibold text-gray-400 mb-1.5">Top AI Sources</div>
                {[
                  { domain: 'dior.com', type: 'Brand', freq: 42, rank: '#1' },
                  { domain: 'vogue.com', type: 'News', freq: 28, rank: '#2' },
                  { domain: 'elle.com', type: 'News', freq: 19, rank: '#3' },
                ].map((row) => (
                  <div key={row.domain} className="flex items-center gap-2 py-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500/60 flex-shrink-0" />
                    <span className="text-[8px] text-gray-400 flex-1 truncate">{row.domain}</span>
                    <span className="text-[7px] text-purple-400 bg-purple-400/10 px-1 rounded">{row.type}</span>
                    <span className="text-[7px] text-gray-500 w-4 text-right">{row.freq}</span>
                    <span className="text-[7px] text-teal-400 w-5 text-right">{row.rank}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -top-3 -right-4 bg-teal-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg animate-fade-in" style={{ animationDelay: '1s' }}>
        ↑ +12% this week
      </div>
    </div>
  )
}

// ── Features data ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    title: 'AI Mention Tracking',
    desc: 'Know exactly when and how AI models mention your brand — across ChatGPT, Gemini, Claude, and Perplexity.',
    badge: 'Core',
    badgeColor: 'bg-teal-900/60 text-teal-400 border-teal-800/50',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    title: 'Source Intelligence',
    desc: 'Discover which sites AI cites about your brand. Identify content gaps and track your source authority.',
    badge: 'New',
    badgeColor: 'bg-purple-900/60 text-purple-400 border-purple-800/50',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Daily Automated Runs',
    desc: 'Your custom prompts run automatically every day. No manual effort — just signals and trend alerts in your inbox.',
    badge: 'Core',
    badgeColor: 'bg-teal-900/60 text-teal-400 border-teal-800/50',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Share of Voice',
    desc: "Compare your brand's AI presence vs competitors. See who owns the narrative in your category.",
    badge: 'Core',
    badgeColor: 'bg-teal-900/60 text-teal-400 border-teal-800/50',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Sentiment Analysis',
    desc: 'Understand the tone AI uses about your brand — positive, neutral, or negative — and track how it shifts.',
    badge: 'Core',
    badgeColor: 'bg-teal-900/60 text-teal-400 border-teal-800/50',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    title: 'Risk Monitoring',
    desc: 'Get alerted when AI surfaces risk signals: legal mentions, recalls, negative associations, brand attacks.',
    badge: 'Safety',
    badgeColor: 'bg-red-900/60 text-red-400 border-red-800/50',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Create your brand project',
    desc: "Add your brand name, domain, and competitors. We'll use this to craft targeted monitoring prompts.",
  },
  {
    n: '02',
    title: 'Your prompts run daily',
    desc: 'We query ChatGPT, Claude, Gemini, and Perplexity with your prompts — every morning, automatically.',
  },
  {
    n: '03',
    title: 'Track trends and act',
    desc: "View visibility scores, source intelligence, sentiment trends, and share of voice — all in one dashboard.",
  },
]

const MODELS = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Mistral', 'Llama']

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-gray-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center text-white font-bold text-xs">G</div>
            <span className="text-white font-semibold text-sm tracking-tight">GEO Monitor</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login"
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              Sign in
            </Link>
            <Link href="/auth/signup"
              className="bg-teal-500 hover:bg-teal-400 text-gray-950 font-semibold px-4 py-1.5 rounded-md text-sm transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 flex flex-col lg:flex-row items-center gap-14">

        {/* Left */}
        <div className="flex-1 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-teal-950/80 border border-teal-800/60 rounded-full px-3.5 py-1 text-xs text-teal-400 mb-7 uppercase tracking-wider font-medium animate-fade-in">
            <span className="animate-pulse-dot w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />
            AI Brand Monitoring
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight mb-5">
            <span className="text-white">How AI talks</span>
            <br />
            <span className="gradient-heading">about your brand</span>
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed mb-9 max-w-md">
            Monitor mentions, citations, and sentiment across ChatGPT, Claude, Gemini and more. Daily signals. Zero manual work.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/auth/signup"
              className="bg-teal-500 hover:bg-teal-400 text-gray-950 font-bold px-7 py-3 rounded-md text-sm transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30">
              Start for free →
            </Link>
            <Link href="/auth/login"
              className="bg-white/[0.05] hover:bg-white/[0.09] text-gray-300 font-medium px-7 py-3 rounded-md text-sm border border-white/10 transition-colors">
              Sign in
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex items-center gap-2 flex-wrap">
            {['No credit card', 'Daily runs', 'All major AI models'].map((t, i) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-gray-500">
                <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {t}
                {i < 2 && <span className="text-gray-700 mx-1">·</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Right: mock dashboard */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <MockDashboard />
        </div>
      </section>

      {/* ── Model logos bar ── */}
      <section className="border-y border-white/[0.06] py-6">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs text-gray-600 uppercase tracking-widest font-medium mb-5">Monitor across all major AI models</p>
          <div className="flex items-center justify-center flex-wrap gap-6 sm:gap-10">
            {MODELS.map(m => (
              <span key={m} className="text-sm font-semibold text-gray-600 hover:text-gray-400 transition-colors tracking-tight">
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Everything you need to own<br />
            <span className="gradient-heading">your AI presence</span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            GEO (Generative Engine Optimization) Monitor gives you the data layer to understand and improve how AI models perceive and represent your brand.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="card-hover bg-white/[0.03] border border-white/[0.07] rounded-xl p-6 group"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/15 transition-colors">
                  {f.icon}
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${f.badgeColor}`}>
                  {f.badge}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-white/[0.06] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">How it works</h2>
            <p className="text-gray-400">Set up once. Get insights forever.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-gradient-to-r from-white/10 to-transparent" />
                )}
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-7 hover:border-teal-800/50 transition-colors">
                  <div className="text-4xl font-bold text-teal-500/20 mb-4 font-mono">{step.n}</div>
                  <h3 className="text-sm font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-white/[0.06] py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: '6+', label: 'AI models monitored' },
              { val: '90', label: 'Days of trend history' },
              { val: 'Daily', label: 'Automated runs' },
              { val: '100%', label: 'Automated — no manual work' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-bold gradient-heading mb-1">{s.val}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 py-28 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-950/80 border border-teal-800/60 rounded-full px-3.5 py-1 text-xs text-teal-400 mb-7 uppercase tracking-wider font-medium">
          Get started in 2 minutes
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight">
          Start monitoring your<br />
          <span className="gradient-heading">AI brand presence</span>
        </h2>
        <p className="text-gray-400 mb-10 max-w-md mx-auto">
          Join brands already tracking their visibility in the AI era. No credit card required.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/auth/signup"
            className="bg-teal-500 hover:bg-teal-400 text-gray-950 font-bold px-8 py-3.5 rounded-md text-sm transition-all shadow-lg shadow-teal-500/25">
            Create free account →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-teal-500 flex items-center justify-center text-white font-bold text-[10px]">G</div>
            <span className="text-gray-600 text-sm font-medium">GEO Monitor</span>
          </div>
          <p className="text-gray-700 text-xs">© 2025 GEO Monitor. Track your AI brand presence.</p>
        </div>
      </footer>
    </div>
  )
}
