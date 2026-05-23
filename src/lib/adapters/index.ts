import { OpenAIAdapter } from "./openai";
import { AnthropicAdapter } from "./anthropic";
import { GitHubAdapter } from "./github";
import { VercelAdapter } from "./vercel";
import { LangGraphAdapter } from "./langgraph";
import { CustomWebhookAdapter } from "./custom-webhook";

export const PROVIDER_ADAPTERS = {
  openai: OpenAIAdapter,
  anthropic: AnthropicAdapter,
  github: GitHubAdapter,
  vercel: VercelAdapter,
  langgraph: LangGraphAdapter,
  custom_webhook: CustomWebhookAdapter,
} as const;

export {
  OpenAIAdapter,
  AnthropicAdapter,
  GitHubAdapter,
  VercelAdapter,
  LangGraphAdapter,
  CustomWebhookAdapter,
};
