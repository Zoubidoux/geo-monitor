const POSITIVE = ['excellent','great','best','recommended','trusted','reliable','popular','leading','award','top']
const NEGATIVE = ['scam','fraud','lawsuit','unsafe','unreliable','problematic','dangerous','recall','complaint']
const RISK_PATTERNS = ['scam','fraud','lawsuit','unsafe','recall','complaint','false','misleading','dangerous']

export function analyzeSentiment(text: string): { label: string; score: number; risk_flags: string[] } {
  const lower = text.toLowerCase()
  let score = 0
  for (const w of POSITIVE) if (lower.includes(w)) score += 0.1
  for (const w of NEGATIVE) if (lower.includes(w)) score -= 0.15
  score = Math.max(-1, Math.min(1, score))
  const label = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral'
  const risk_flags = RISK_PATTERNS.filter(p => lower.includes(p))
  return { label, score: Math.round(score * 100) / 100, risk_flags }
}
