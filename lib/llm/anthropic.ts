import Anthropic from '@anthropic-ai/sdk'
import { LLMClient, LLMInput, LLMOutput } from './types'

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g
  return [...new Set(text.match(urlRegex) || [])]
}

export class AnthropicClient implements LLMClient {
  private client: Anthropic
  constructor() { this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) }

  async run(input: LLMInput): Promise<LLMOutput> {
    const start = Date.now()
    const response = await this.client.messages.create({
      model: input.model || 'claude-3-5-haiku-20251001',
      max_tokens: 1024, temperature: input.temperature ?? 0.2,
      system: input.system_prompt,
      messages: [{ role: 'user', content: input.prompt_text }],
    })
    const answer_text = response.content.filter(b => b.type === 'text').map(b => (b as any).text).join('')
    return {
      answer_text,
      citations: extractUrls(answer_text),
      provider_meta: {
        provider: 'anthropic', model: input.model,
        tokens_input: response.usage?.input_tokens,
        tokens_output: response.usage?.output_tokens,
        finish_reason: response.stop_reason || undefined,
        latency_ms: Date.now() - start,
      },
    }
  }
}
