export interface MentionResult {
  brand_mentioned: boolean; brand_count: number; competitors: Record<string, number>
}

export function detectMentions(text: string, brandName: string, competitors: string[]): MentionResult {
  const countOccurrences = (term: string) =>
    (text.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length

  const brand_count = countOccurrences(brandName)
  const competitorCounts: Record<string, number> = {}
  for (const comp of competitors) competitorCounts[comp] = countOccurrences(comp)

  return { brand_mentioned: brand_count > 0, brand_count, competitors: competitorCounts }
}

export function computeShareOfVoice(brandCount: number, competitorCounts: Record<string, number>): number {
  const total = brandCount + Object.values(competitorCounts).reduce((a, b) => a + b, 0)
  return total === 0 ? 0 : Math.round((brandCount / total) * 100) / 100
}
