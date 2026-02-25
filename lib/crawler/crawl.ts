export async function crawlDomain(domain: string, maxPages = 20): Promise<string[]> {
  const baseUrl = domain.startsWith('http') ? domain : `https://${domain}`
  const visited = new Set<string>()
  const texts: string[] = []

  async function fetchPage(url: string): Promise<string> {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'GEOMonitor-Bot/1.0 (+https://geo-monitor.vercel.app)' },
        signal: AbortSignal.timeout(8000),
      })
      return await res.text()
    } catch { return '' }
  }

  const sitemap = await fetchPage(`${baseUrl}/sitemap.xml`)
  const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map(m => m[1]).filter(u => u.startsWith(baseUrl)).slice(0, maxPages)

  const urlsToVisit = sitemapUrls.length > 0 ? sitemapUrls : [baseUrl]

  for (const url of urlsToVisit) {
    if (visited.size >= maxPages || visited.has(url)) continue
    visited.add(url)
    const html = await fetchPage(url)
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 3000)
    if (text) texts.push(text)
  }
  return texts
}
