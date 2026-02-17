import { config } from "dotenv";
config();
import express from "express";
import cors from "cors";
const app = express();

import Anthropic from "@anthropic-ai/sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts.js";
import { TextBlock } from "@anthropic-ai/sdk/resources/index.mjs";
import { basePrompt as reactBasePrompt } from "./defaults/react.js";
import { basePrompt as nodeBasePrompt } from "./defaults/node.js";

const anthropic = new Anthropic({
  // defaults to process.env["ANTHROPIC_API_KEY"]
  apiKey: process.env.CLAUDE_API_KEY,
});
app.use(cors());

app.use(express.json());

app.post("/template", async (req: any, res: any) => {
  const prompt = req.body.prompt;

  const response = await anthropic.messages.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "claude-3-7-sonnet-latest",
    max_tokens: 200,
    system:
      "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
  });

  const answer = (response.content[0] as TextBlock).text;
  if (answer == "react") {
    res.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactBasePrompt],
    });
    return;
  }

  if (answer === "node") {
    res.json({
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nodeBasePrompt],
    });
    return;
  }

  return res
    .status(401)
    .json({ message: "You are not authorised to access this content" });
});

app.post("/chat", async (req: any, res: any) => {
  const { messages } = req.body;
  console.log(messages, "__MESSAGES");
  try {
    const response = await anthropic.messages.create({
      messages,
      model: "claude-3-7-sonnet-latest",
      max_tokens: 8000,
      system: getSystemPrompt(),
    });

    res.json((response.content[0] as TextBlock).text);
  } catch (error) {
    console.log(error, "__ERROR");
    res.status(500).json({ message: "Internal server error" });
  }
});

// async function main() {
//   anthropic.messages
//     .stream({
//       messages: [{ role: "user", content: "Create a todo app" }],
//       model: "claude-3-7-sonnet-20250219",
//       max_tokens: 1024,
//       system: getSystemPrompt(),
//     })
//     .on("text", (text) => {
//       console.log(text);
//     });
// }
// const msg = main();
// console.log(msg);

app.listen(3000, () => {
  console.log("Server is up...");
});
