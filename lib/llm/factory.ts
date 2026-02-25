import { LLMClient } from './types'
import { OpenAIClient } from './openai'
import { AnthropicClient } from './anthropic'

export function getLLMClient(provider: string): LLMClient {
  switch (provider) {
    case 'openai': return new OpenAIClient()
    case 'anthropic': return new AnthropicClient()
    default: throw new Error(`Unknown LLM provider: ${provider}`)
  }
}
