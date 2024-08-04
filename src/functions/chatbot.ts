import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import {
  END,
  START,
  StateGraph,
  StateGraphArgs,
} from "@langchain/langgraph/web";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { APIGatewayProxyHandler } from "aws-lambda";

const GPT_MODEL = "gpt-4o";
const CV_URL = "https://angusbezzina.com/angus-bezzina-cv-2024.pdf";
const LINKEDIN_URL = "https://www.linkedin.com/in/angus-bezzina";

interface AgentState {
  messages: BaseMessage[];
}

export // Define the graph state
const graphState: StateGraphArgs<AgentState>["channels"] = {
  messages: {
    reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
  },
};

// Define tools for the Chatbot
const scrapeLinkedIn = new DynamicStructuredTool({
  name: "scrapeLinkedIn",
  description: "Call to LinkedIn profile to retrieve more information",
  schema: z.object({}),
  func: async () => {
    // TODO: Scrape LinkedIn
    console.log("URL", LINKEDIN_URL);
    return "";
  },
});

const tools = [scrapeLinkedIn];
const toolNode = new ToolNode<AgentState>(tools);

const model = new ChatOpenAI({
  model: GPT_MODEL,
  temperature: 0,
}).bindTools(tools);

function route(state: AgentState) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage.tool_calls?.length) {
    return "tools";
  }

  return END;
}

async function getContext(src: string) {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    const loader = new WebPDFLoader(blob);
    const docs = await loader.load();
    const content = docs.map(({ pageContent }) => pageContent).join(" ");
    const cleanedContent = content.replace(/\s+/g, " ").trim();

    return cleanedContent;
  } catch (error) {
    console.error(error);

    throw new Error("Failed to fetch context");
  }
}

async function callModel(state: AgentState) {
  const messages = state.messages;
  const response = await model.invoke(messages);

  return { messages: [response] };
}

// Define the Graph
const workflow = new StateGraph<AgentState>({ channels: graphState })
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", route)
  .addEdge("tools", "agent");

const app = workflow.compile();

const SYSTEM_PROMPT = PromptTemplate.fromTemplate(`
  You are a virtual assistant representing Angus Bezzina, a senior software engineer and technical consultant.
  Please answer all questions as though you were Angus.

  Please use the following context to handle client questions and concerns.
  <context>
    {context}
  </context>

  If more information about Angus is needed to answer the client's question, scrape his LinkedIn profile.

  In addition, if the client requests pricing information, please note the following:
  * Full time employment contract offers will only be considered if they are in excess of US$120,000.
  * Hourly consulting rate, US$70.
  * Pricing for complete project builds will be considered on a case by case basis, but start at US$1000.

  Finally, please adhere to these rules when answering:
  * ALWAYS respond in a paragraph or less. Ideally respond in a maximum of 2 sentences.
  * ONLY use information from the context above OR that is scraped from LinkedIn.
  * NEVER repeat yourself.
  * Do not use phrases like "Based on the information available" that suggest you are not Angus Bezzina.
  `);

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  const { body } = event;
  const response = JSON.parse(body ?? "");
  const { prompt: userPrompt } = response;
  const headers = {
    "access-control-allow-methods": "OPTIONS,POST",
    "access-control-allow-origin": "*",
    "content-type": "application/json",
  };

  try {
    const context = await getContext(CV_URL);
    const systemPrompt = await SYSTEM_PROMPT.format({ context });

    const prompt = [
      ["system", systemPrompt],
      ["human", userPrompt],
    ];

    const output = await app.invoke({ messages: prompt });

    return {
      statusCode: 200,
      body: JSON.stringify({
        messages: output.messages.slice(1, output.messages.length),
      }),
    };
  } catch (error) {
    console.error(error);

    return {
      headers,
      statusCode: 400,
      body: JSON.stringify({ success: false }),
    };
  }
};
