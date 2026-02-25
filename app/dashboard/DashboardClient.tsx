'use client'
import { useState } from 'react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────
type Project = { id: string; brand_name: string; domain: string; country: string; language: string; competitors?: string[] }
type KPIs = { mentionRate: number; citationRate: number; positiveRate: number; safetyRate: number; avgSOV: number; totalRuns: number }
type TrendPoint = { date: string; label: string; mention: number | null; citation: number | null; sentiment: number | null }

// ─── Gauge SVG ────────────────────────────────────────────────────────────────
function Gauge({ score, maxScore = 100 }: { score: number; maxScore?: number }) {
  const r = 66, cx = 86, cy = 82
  const totalArc = Math.PI * r
  const fill = (Math.min(Math.max(score, 0), maxScore) / maxScore) * totalArc
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : score > 0 ? '#ef4444' : '#e5e7eb'
  const arc = `M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`
  return (
    <svg viewBox={`0 0 ${cx * 2} ${cy + 8}`} className="w-full max-w-[200px] mx-auto block">
      <path d={arc} fill="none" stroke="#f3f4f6" strokeWidth="13" strokeLinecap="round" />
      <path d={arc} fill="none" stroke={color} strokeWidth="13" strokeLinecap="round"
        strokeDasharray={`${fill} ${totalArc}`} />
      <text x={cx} y={cy - 18} textAnchor="middle" fontSize="30" fontWeight="700" fill="#111827">{score}</text>
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize="10" fill="#9ca3af">Avg. Score</text>
    </svg>
  )
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function Tip({ text }: { text: string }) {
  return (
    <div className="relative group inline-flex">
      <button type="button"
        className="w-4 h-4 rounded-full border border-gray-300 text-gray-400 text-[9px] font-bold flex items-center justify-center hover:border-gray-500 hover:text-gray-600 transition-colors leading-none select-none">
        i
      </button>
      <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-56 leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-40 shadow-xl">
        {text}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
      </div>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ title, tip, score, details, locked = false }: {
  title: string; tip: string; score: number | null
  details: { label: string; value: string | number }[]
  locked?: boolean
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <Tip text={tip} />
      </div>
      {locked ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 gap-3">
          <span className="text-5xl font-bold text-gray-100">—</span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full font-medium">Coming soon</span>
        </div>
      ) : score !== null ? (
        <>
          <Gauge score={score} />
          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="grid grid-cols-3 gap-1 text-center">
              {details.map(d => (
                <div key={d.label}>
                  <div className="text-[10px] text-gray-400 mb-0.5 leading-tight">{d.label}</div>
                  <div className="text-sm font-semibold text-gray-800">{d.value}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center py-10">
          <p className="text-sm text-gray-400">No data yet</p>
        </div>
      )}
    </div>
  )
}

// ─── Trend Line Chart ─────────────────────────────────────────────────────────
function TrendChart({ data, metric }: { data: TrendPoint[]; metric: 'mention' | 'citation' | 'sentiment' }) {
  const W = 720, H = 180
  const pad = { t: 12, r: 16, b: 28, l: 32 }
  const cW = W - pad.l - pad.r
  const cH = H - pad.t - pad.b
  const hasData = data.some(d => d[metric] !== null)

  const pts = data.map((d, i) => ({
    x: pad.l + (i / Math.max(data.length - 1, 1)) * cW,
    y: pad.t + cH - ((d[metric] ?? 0) / 100) * cH,
    v: d[metric],
    label: d.label,
  }))

  const validPts = pts.filter(p => p.v !== null)
  const pathD = validPts.length > 1 ? validPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') : ''
  const areaD = pathD ? `${pathD} L${validPts[validPts.length - 1].x.toFixed(1)},${(pad.t + cH).toFixed(1)} L${validPts[0].x.toFixed(1)},${(pad.t + cH).toFixed(1)} Z` : ''

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minHeight: 140 }}>
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d9488" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(v => {
        const y = pad.t + cH - (v / 100) * cH
        return (
          <g key={v}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="#f3f4f6" strokeWidth="1" />
            <text x={pad.l - 5} y={y + 3.5} textAnchor="end" fontSize="9" fill="#d1d5db">{v}</text>
          </g>
        )
      })}

      {/* Area + line */}
      {areaD && <path d={areaD} fill="url(#trendGrad)" />}
      {pathD && <path d={pathD} fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}

      {/* Dots */}
      {validPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#0d9488" stroke="white" strokeWidth="2" />
      ))}

      {/* X labels */}
      {data.map((d, i) => {
        if (i % 3 !== 0 && i !== data.length - 1) return null
        const x = pad.l + (i / Math.max(data.length - 1, 1)) * cW
        return <text key={i} x={x} y={H - 6} textAnchor="middle" fontSize="9.5" fill="#9ca3af">{d.label}</text>
      })}

      {/* Empty state */}
      {!hasData && (
        <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="12" fill="#9ca3af">
          No run data yet — add prompts and trigger a run
        </text>
      )}
    </svg>
  )
}

// ─── Sidebar nav config ───────────────────────────────────────────────────────
const NAV = [
  {
    title: 'AI Insights',
    items: [
      { label: 'Overview', href: '/dashboard' },
      { label: 'Mentions', href: '/dashboard' },
      { label: 'Citations', href: '/dashboard' },
      { label: 'Sentiment', href: '/dashboard' },
      { label: 'Competitors', href: '/dashboard' },
    ],
  },
  {
    title: 'Manage',
    items: [
      { label: 'New project', href: '/projects/new' },
    ],
  },
]

// ─── Main component ───────────────────────────────────────────────────────────
export default function DashboardClient({ user, projects, project, kpis, trendData, promptCount, activePromptCount }: {
  user: { email?: string | null }
  projects: Project[]
  project: Project | null
  kpis: KPIs
  trendData: TrendPoint[]
  promptCount: number
  activePromptCount: number
}) {
  const [activeTab, setActiveTab] = useState<'mention' | 'citation' | 'sentiment'>('mention')
  const [activeNav, setActiveNav] = useState('Overview')

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">

      {/* ── Sidebar ── */}
      <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">

        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center text-white font-bold text-xs">G</div>
            <span className="font-semibold text-gray-900 text-sm">GEO Monitor</span>
          </div>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {NAV.map(section => (
            <div key={section.title}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1.5">{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <button key={item.label}
                    onClick={() => setActiveNav(item.label)}
                    className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors ${activeNav === item.label && section.title === 'AI Insights'
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: project + signout */}
        <div className="border-t border-gray-100 p-3 space-y-1 flex-shrink-0">
          {project ? (
            <Link href={`/projects/${project.id}`}
              className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-gray-50 transition-colors group">
              <div className="w-7 h-7 rounded-md bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs flex-shrink-0">
                {project.brand_name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate group-hover:text-teal-700 transition-colors">{project.brand_name}</p>
                <p className="text-[10px] text-gray-400 truncate">{project.domain}</p>
              </div>
            </Link>
          ) : (
            <Link href="/projects/new"
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-500 hover:bg-gray-50 transition-colors">
              + Add project
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button className="w-full text-left text-[11px] text-gray-400 hover:text-gray-700 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
              Sign out · {user.email?.split('@')[0]}
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-7 py-3.5 flex items-center justify-between flex-shrink-0">
          <h1 className="text-sm font-semibold text-gray-900">Overview</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 bg-gray-50">
              <span className="text-[11px] text-gray-500 font-medium">AI Channel</span>
              <span className="text-[11px] text-gray-800">All Channels ▾</span>
            </div>
            <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
              <button className="px-2.5 py-1.5 text-gray-400 hover:text-gray-600 text-xs transition-colors">‹</button>
              <span className="text-[11px] text-gray-700 font-medium px-1">Last 14 days</span>
              <button className="px-2.5 py-1.5 text-gray-400 hover:text-gray-600 text-xs transition-colors">›</button>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">

          {!project ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-80 gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-center">
                <h2 className="font-semibold text-gray-900 mb-1">No projects yet</h2>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">Create your first project to start monitoring your brand visibility across AI assistants.</p>
              </div>
              <Link href="/projects/new"
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-md text-sm transition-colors">
                Create first project
              </Link>
            </div>
          ) : (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <KPICard
                  title="AI Visibility"
                  tip="How often your brand is mentioned in AI responses. 100 = mentioned in every response tested."
                  score={kpis.mentionRate}
                  details={[
                    { label: 'Total runs', value: kpis.totalRuns },
                    { label: 'Mentioned', value: `${kpis.mentionRate}%` },
                    { label: 'Prompts', value: activePromptCount },
                  ]}
                />
                <KPICard
                  title="AI Favorability"
                  tip="Quality of sentiment in AI responses about your brand. 100 = all responses are positive."
                  score={kpis.positiveRate}
                  details={[
                    { label: 'Positive', value: `${kpis.positiveRate}%` },
                    { label: 'Neutral', value: `${Math.max(0, 100 - kpis.positiveRate - Math.max(0, 100 - kpis.safetyRate))}%` },
                    { label: 'Negative', value: `${Math.max(0, 100 - kpis.safetyRate)}%` },
                  ]}
                />
                <KPICard
                  title="AI Safety"
                  tip="Percentage of responses free from risk signals: lawsuits, recalls, fraud, dangerous mentions, etc."
                  score={kpis.safetyRate}
                  details={[
                    { label: 'Safe', value: `${kpis.safetyRate}%` },
                    { label: 'At risk', value: `${100 - kpis.safetyRate}%` },
                    { label: 'Runs', value: kpis.totalRuns },
                  ]}
                />
                <KPICard
                  title="AI Accuracy"
                  tip="How accurately AI describes your brand, products, and claims. Coming soon."
                  score={null}
                  details={[]}
                  locked
                />
              </div>

              {/* Trend chart */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sm font-semibold text-gray-900">AI Trends</h2>
                  <Tip text="Evolution of your AI metrics over the selected period. Each point = one day of runs." />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 mb-5">
                  {([
                    { key: 'mention', label: 'AI Visibility' },
                    { key: 'citation', label: 'AI Presence' },
                    { key: 'sentiment', label: 'AI Favorability' },
                  ] as const).map(tab => (
                    <button key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === tab.key
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                        }`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <TrendChart data={trendData} metric={activeTab} />
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-1.5 mb-4">
                    <h3 className="text-sm font-semibold text-gray-800">Monitoring prompts</h3>
                    <Tip text="Prompts are questions sent to AI models to test if your brand is mentioned. Active prompts run daily." />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{activePromptCount}</p>
                  <p className="text-xs text-gray-400 mt-1">{promptCount} total · {promptCount - activePromptCount} inactive</p>
                  <Link href={`/projects/${project.id}`}
                    className="mt-4 inline-flex text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors">
                    Manage prompts →
                  </Link>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-1.5 mb-4">
                    <h3 className="text-sm font-semibold text-gray-800">Share of Voice</h3>
                    <Tip text="Your brand's share of all AI mentions across your brand + competitors. Higher = AI talks about you more than competitors." />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{kpis.avgSOV}%</p>
                  <p className="text-xs text-gray-400 mt-1">avg across all mentions</p>
                  <p className="text-xs text-gray-400 mt-3">
                    {project.competitors?.length
                      ? `vs ${project.competitors.slice(0, 2).join(', ')}${project.competitors.length > 2 ? ` +${project.competitors.length - 2}` : ''}`
                      : 'No competitors tracked'}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-1.5 mb-4">
                    <h3 className="text-sm font-semibold text-gray-800">Citation Rate</h3>
                    <Tip text="Percentage of runs where your domain (e.g. dior.com) appears as a cited source in the AI response." />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{kpis.citationRate}%</p>
                  <p className="text-xs text-gray-400 mt-1">of responses cite your site</p>
                  <p className="text-xs text-gray-400 mt-3">{project.domain}</p>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
