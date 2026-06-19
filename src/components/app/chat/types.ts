export interface ChatToolResult {
  id: string;
  tool: string;
  output: unknown;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  toolResults?: ChatToolResult[];
  streaming?: boolean;
}
