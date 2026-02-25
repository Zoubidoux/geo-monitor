export function computeSimilarity(a: string, b: string): number {
  if (!a || !b) return 0
  const wordsA = new Set(a.toLowerCase().split(/\s+/))
  const wordsB = new Set(b.toLowerCase().split(/\s+/))
  const intersection = [...wordsA].filter(w => wordsB.has(w)).length
  const union = new Set([...wordsA, ...wordsB]).size
  return union === 0 ? 1 : Math.round((intersection / union) * 100) / 100
}

export function hasSignificantChange(similarity: number, threshold = 0.7): boolean {
  return similarity < threshold
}
