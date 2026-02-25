export interface Citation { url: string; domain: string }

export function extractCitations(text: string): Citation[] {
  const urlRegex = /https?:\/\/([a-zA-Z0-9.-]+)[^\s<>"{}|\\^`\[\]]*/g
  const seen = new Set<string>()
  const citations: Citation[] = []
  let match
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0].replace(/[.,;:!?)]+$/, '')
    if (!seen.has(url)) { seen.add(url); citations.push({ url, domain: match[1] }) }
  }
  return citations
}

export function computeCitationScore(citations: Citation[], brandDomain: string): number {
  return citations.some(c => c.domain.includes(brandDomain.replace(/^www\./, ''))) ? 1 : 0
}
