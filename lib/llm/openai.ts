import OpenAI from 'openai'
import { LLMClient, LLMInput, LLMOutput } from './types'

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g
  return [...new Set(text.match(urlRegex) || [])]
}

export class OpenAIClient implements LLMClient {
  private client: OpenAI
  constructor() { this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) }

  async run(input: LLMInput): Promise<LLMOutput> {
    const start = Date.now()
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []
    if (input.system_prompt) messages.push({ role: 'system', content: input.system_prompt })
    messages.push({ role: 'user', content: input.prompt_text })

    const response = await this.client.chat.completions.create({
      model: input.model || 'gpt-4o', messages, temperature: input.temperature ?? 0.2,
    })
    const answer_text = response.choices[0]?.message?.content || ''
    return {
      answer_text,
      citations: extractUrls(answer_text),
      provider_meta: {
        provider: 'openai', model: input.model,
        tokens_input: response.usage?.prompt_tokens,
        tokens_output: response.usage?.completion_tokens,
        finish_reason: response.choices[0]?.finish_reason || undefined,
        latency_ms: Date.now() - start,
      },
    }
  }
}
