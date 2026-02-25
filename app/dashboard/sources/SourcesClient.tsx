'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ─── Types ───────────────────────────────────────────────────────────────────
type Project = { id: string; brand_name: string; domain: string; country: string; language: string; competitors?: string[] }

type CitationRow = {
  url: string
  domain: string
  title: string
  promptCount: number
  frequency: number
  influenceRank: number
  impact: 'High' | 'Medium' | 'Low'
}

type SourceRow = {
  domain: string
  sourceType: string
  citedPages: number
  frequency: number
  influenceRank: number
}

// ─── Pill components ─────────────────────────────────────────────────────────
const TYPE_STYLES: Record<string, string> = {
  Blog:          'bg-purple-50 text-purple-700 border-purple-100',
  News:          'bg-blue-50 text-blue-700 border-blue-100',
  Social:        'bg-pink-50 text-pink-700 border-pink-100',
  Video:         'bg-red-50 text-red-700 border-red-100',
  Forum:         'bg-orange-50 text-orange-700 border-orange-100',
  Encyclopedia:  'bg-green-50 text-green-700 border-green-100',
  Institutional: 'bg-teal-50 text-teal-700 border-teal-100',
  Web:           'bg-gray-100 text-gray-600 border-gray-200',
}

const IMPACT_STYLES: Record<string, string> = {
  High:   'bg-emerald-50 text-emerald-700 border-emerald-100',
  Medium: 'bg-amber-50 text-amber-700 border-amber-100',
  Low:    'bg-gray-100 text-gray-500 border-gray-200',
}

function TypePill({ type }: { type: string }) {
  const cls = TYPE_STYLES[type] ?? TYPE_STYLES.Web
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${cls}`}>
      {type}
    </span>
  )
}

function ImpactPill({ impact }: { impact: string }) {
  const cls = IMPACT_STYLES[impact] ?? IMPACT_STYLES.Low
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${cls}`}>
      {impact}
    </span>
  )
}

// ─── Rank badge ───────────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-teal-400 rounded-full" style={{ width: `${Math.min(rank, 99)}%` }} />
      </div>
      <span className="text-xs text-gray-500 tabular-nums w-7 text-right">{rank}</span>
    </div>
  )
}

// ─── Favicon ─────────────────────────────────────────────────────────────────
function FaviconCell({ domain }: { domain: string }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?sz=16&domain_url=${domain}`}
        alt=""
        width={14}
        height={14}
        className="rounded-sm flex-shrink-0 opacity-70"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <span className="text-sm text-gray-800 truncate">{domain}</span>
    </div>
  )
}

// ─── Sort icon ───────────────────────────────────────────────────────────────
function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <span className={`ml-1 text-[10px] ${active ? 'text-teal-600' : 'text-gray-300'}`}>
      {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )
}

// ─── Checkbox ────────────────────────────────────────────────────────────────
function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? 'bg-teal-600 border-teal-600' : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    >
      {checked && (
        <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const NAV = [
  {
    title: 'AI Insights',
    items: [
      { label: 'Overview', href: '/dashboard' },
      { label: 'AI Sources', href: '/dashboard/sources' },
      { label: 'Sentiment', href: '/dashboard' },
      { label: 'Competitors', href: '/dashboard' },
    ],
  },
  {
    title: 'Manage',
    items: [{ label: 'New project', href: '/projects/new' }],
  },
]

function Sidebar({ user, project }: { user: { email?: string | null }; project: Project | null }) {
  const pathname = usePathname()
  return (
    <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center text-white font-bold text-xs">G</div>
          <span className="font-semibold text-gray-900 text-sm">GEO Monitor</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV.map(section => (
          <div key={section.title}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1.5">{section.title}</p>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <Link key={item.label} href={item.href}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                    pathname === item.href
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

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
  )
}

// ─── Filter bar ───────────────────────────────────────────────────────────────
const SOURCE_TYPES = ['All Types', 'Blog', 'News', 'Social', 'Video', 'Forum', 'Encyclopedia', 'Institutional', 'Web']
const IMPACT_LEVELS = ['All Impact', 'High', 'Medium', 'Low']

function FilterBar({
  view, setView,
  typeFilter, setTypeFilter,
  impactFilter, setImpactFilter,
  search, setSearch,
  selectedCount, totalCount,
}: {
  view: 'citations' | 'sources'
  setView: (v: 'citations' | 'sources') => void
  typeFilter: string
  setTypeFilter: (v: string) => void
  impactFilter: string
  setImpactFilter: (v: string) => void
  search: string
  setSearch: (v: string) => void
  selectedCount: number
  totalCount: number
}) {
  const selectCls = "border border-gray-200 rounded-md px-2.5 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* View toggle */}
      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
        <button
          onClick={() => setView('citations')}
          className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${view === 'citations' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
          Citations View
        </button>
        <button
          onClick={() => setView('sources')}
          className={`px-3.5 py-1.5 text-xs font-medium transition-colors border-l border-gray-200 ${view === 'sources' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
          Sources View
        </button>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md outline-none focus:border-teal-500 w-40 transition-colors bg-white"
        />
      </div>

      {/* Source type filter */}
      <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={selectCls}>
        {SOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
      </select>

      {/* Impact filter (citations only) */}
      {view === 'citations' && (
        <select value={impactFilter} onChange={e => setImpactFilter(e.target.value)} className={selectCls}>
          {IMPACT_LEVELS.map(t => <option key={t}>{t}</option>)}
        </select>
      )}

      {/* Result count */}
      <span className="text-xs text-gray-400 px-1" aria-live="polite">
        {selectedCount > 0 ? `${selectedCount} selected · ` : ''}{totalCount} result{totalCount !== 1 ? 's' : ''}
      </span>

      {/* Export */}
      <button className="flex items-center gap-1.5 border border-gray-200 rounded-md px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors font-medium">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>
    </div>
  )
}

// ─── Table header cell ────────────────────────────────────────────────────────
function TH({
  label, sortKey, sort, setSort, align = 'left'
}: {
  label: string
  sortKey: string
  sort: { key: string; dir: 'asc' | 'desc' }
  setSort: (s: { key: string; dir: 'asc' | 'desc' }) => void
  align?: 'left' | 'right'
}) {
  const isActive = sort.key === sortKey
  return (
    <th
      className={`px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-800 select-none transition-colors whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={() => setSort({ key: sortKey, dir: isActive && sort.dir === 'desc' ? 'asc' : 'desc' })}
    >
      {label}
      <SortIcon active={isActive} dir={sort.dir} />
    </th>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <tr>
      <td colSpan={7} className="px-4 py-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">No citations yet</p>
          <p className="text-xs text-gray-400 max-w-xs">Run some prompts and citations extracted from AI responses will appear here.</p>
        </div>
      </td>
    </tr>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SourcesClient({
  user, projects, project, citationRows, sourceRows,
}: {
  user: { email?: string | null }
  projects: Project[]
  project: Project | null
  citationRows: CitationRow[]
  sourceRows: SourceRow[]
}) {
  const [view, setView] = useState<'citations' | 'sources'>('citations')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [impactFilter, setImpactFilter] = useState('All Impact')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'frequency', dir: 'desc' })

  // ── Filter + sort citations ────────────────────────────────────────────────
  const filteredCitations = useMemo(() => {
    let rows = citationRows
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(r => r.title.toLowerCase().includes(q) || r.domain.toLowerCase().includes(q))
    }
    if (impactFilter !== 'All Impact') rows = rows.filter(r => r.impact === impactFilter)
    // sort
    return [...rows].sort((a: any, b: any) => {
      const m = sort.dir === 'asc' ? 1 : -1
      return typeof a[sort.key] === 'string'
        ? a[sort.key].localeCompare(b[sort.key]) * m
        : (a[sort.key] - b[sort.key]) * m
    })
  }, [citationRows, search, impactFilter, sort])

  // ── Filter + sort sources ──────────────────────────────────────────────────
  const filteredSources = useMemo(() => {
    let rows = sourceRows
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(r => r.domain.toLowerCase().includes(q))
    }
    if (typeFilter !== 'All Types') rows = rows.filter(r => r.sourceType === typeFilter)
    return [...rows].sort((a: any, b: any) => {
      const m = sort.dir === 'asc' ? 1 : -1
      return typeof a[sort.key] === 'string'
        ? a[sort.key].localeCompare(b[sort.key]) * m
        : (a[sort.key] - b[sort.key]) * m
    })
  }, [sourceRows, search, typeFilter, sort])

  const displayRows = view === 'citations' ? filteredCitations : filteredSources
  const allIds = displayRows.map((r: any) => r.url ?? r.domain)
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id))

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(allIds))
  }

  function toggleRow(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const thProps = { sort, setSort }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <Sidebar user={user} project={project} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-7 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-gray-900">AI Sources</h1>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md font-medium">
              {view === 'citations' ? citationRows.length : sourceRows.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 bg-gray-50">
              <span className="text-[11px] text-gray-500 font-medium">AI Channel</span>
              <span className="text-[11px] text-gray-800">All Channels ▾</span>
            </div>
            <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
              <button className="px-2.5 py-1.5 text-gray-400 hover:text-gray-600 text-xs transition-colors">‹</button>
              <span className="text-[11px] text-gray-700 font-medium px-1">Last 30 days</span>
              <button className="px-2.5 py-1.5 text-gray-400 hover:text-gray-600 text-xs transition-colors">›</button>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">

          {/* Filter bar */}
          <FilterBar
            view={view} setView={setView}
            typeFilter={typeFilter} setTypeFilter={setTypeFilter}
            impactFilter={impactFilter} setImpactFilter={setImpactFilter}
            search={search} setSearch={setSearch}
            selectedCount={selected.size}
            totalCount={displayRows.length}
          />

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-100 bg-gray-50/70">
                  <tr>
                    <th className="px-4 py-2.5 w-10">
                      <Checkbox checked={allSelected} onChange={toggleAll} />
                    </th>

                    {view === 'citations' ? (
                      <>
                        <TH label="Citation URL" sortKey="title" {...thProps} />
                        <TH label="Domain" sortKey="domain" {...thProps} />
                        <TH label="Impact" sortKey="impact" {...thProps} />
                        <TH label="Prompts" sortKey="promptCount" {...thProps} align="right" />
                        <TH label="Frequency" sortKey="frequency" {...thProps} align="right" />
                        <TH label="Influence Rank" sortKey="influenceRank" {...thProps} align="right" />
                      </>
                    ) : (
                      <>
                        <TH label="Source Domain" sortKey="domain" {...thProps} />
                        <TH label="Source Type" sortKey="sourceType" {...thProps} />
                        <TH label="Cited Pages" sortKey="citedPages" {...thProps} align="right" />
                        <TH label="Frequency" sortKey="frequency" {...thProps} align="right" />
                        <TH label="Influence Rank" sortKey="influenceRank" {...thProps} align="right" />
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {displayRows.length === 0 ? (
                    <EmptyState />
                  ) : view === 'citations' ? (
                    filteredCitations.map(row => {
                      const id = row.url
                      const checked = selected.has(id)
                      return (
                        <tr key={id}
                          className={`hover:bg-gray-50/60 transition-colors group ${checked ? 'bg-teal-50/40' : ''}`}>
                          <td className="px-4 py-3">
                            <Checkbox checked={checked} onChange={() => toggleRow(id)} />
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <a href={row.url} target="_blank" rel="noopener noreferrer"
                              className="text-sm text-gray-800 hover:text-teal-600 transition-colors truncate block max-w-[240px]"
                              title={row.url}>
                              {row.title}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <FaviconCell domain={row.domain} />
                          </td>
                          <td className="px-4 py-3">
                            <ImpactPill impact={row.impact} />
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600 tabular-nums">{row.promptCount}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-800 tabular-nums">{row.frequency}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              <RankBadge rank={row.influenceRank} />
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    filteredSources.map(row => {
                      const id = row.domain
                      const checked = selected.has(id)
                      return (
                        <tr key={id}
                          className={`hover:bg-gray-50/60 transition-colors group ${checked ? 'bg-teal-50/40' : ''}`}>
                          <td className="px-4 py-3">
                            <Checkbox checked={checked} onChange={() => toggleRow(id)} />
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <FaviconCell domain={row.domain} />
                          </td>
                          <td className="px-4 py-3">
                            <TypePill type={row.sourceType} />
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600 tabular-nums">{row.citedPages}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-800 tabular-nums">{row.frequency}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              <RankBadge rank={row.influenceRank} />
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            {displayRows.length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  Showing {displayRows.length} of {view === 'citations' ? citationRows.length : sourceRows.length} results
                </span>
                <span className="text-[11px] text-gray-400">
                  {view === 'citations' ? 'Sorted by citation frequency' : 'Sorted by influence rank'}
                </span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
