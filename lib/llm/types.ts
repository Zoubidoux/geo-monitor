export interface LLMInput {
  prompt_text: string
  system_prompt?: string
  model: string
  temperature?: number
  locale?: { country: string; language: string }
}

export interface LLMOutput {
  answer_text: string
  citations: string[]
  provider_meta: {
    provider: string
    model: string
    tokens_input?: number
    tokens_output?: number
    finish_reason?: string
    latency_ms?: number
  }
}

export interface LLMClient {
  run(input: LLMInput): Promise<LLMOutput>
}
