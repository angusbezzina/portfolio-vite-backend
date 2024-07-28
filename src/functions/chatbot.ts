import type { APIGatewayProxyHandler } from "aws-lambda";
import { ChatOpenAI } from "@langchain/openai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";

const llm = new ChatOpenAI({
  model: "gpt-3.5-turbo-0125",
  temperature: 0,
});

// Outline: Tool Definitions
const searchTool = new DynamicStructuredTool({
  name: "search_tool",
  description: "Tool that searches the web for information",
  schema: z.object({
    query: z.string().describe("The query to search for"),
  }),
  func: async ({ query }) => {
    // Function logic goes here...

    // NOTE: always return a string
    return "";
  },
});

// TODO:
const SYSTEM_PROMPT = PromptTemplate.fromTemplate(``);
const USER_PROMPT = PromptTemplate.fromTemplate(``);

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  const tools = [searchTool];

  const systemPrompt = await SYSTEM_PROMPT.format({});
  const userPrompt = await USER_PROMPT.format({});

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    // ["placeholder", "{chat_history}"], // NOTE: Reimplement if you want to use chat history in the future
    ["human", userPrompt],
    ["placeholder", "{agent_scratchpad}"],
  ]);
  const agent = await createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });

  // NOTE: You can opt to return the chat output
  // OR: you can opt to format a separate response that you update from tool actions
  // In this case, opting to return chat output because this is a chatbot.
  const output = await agentExecutor.invoke({ input: prompt });

  // TODO: Handle chat output...

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello, Chatbot!" }),
  };
};
