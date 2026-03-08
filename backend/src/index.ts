import { config } from "dotenv";
config();
import express from "express";
import cors from "cors";
import path from 'node:path'
const app = express();

import Groq from "groq-sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts.js";
import { basePrompt as reactBasePrompt } from "./defaults/react.js";
import { basePrompt as nodeBasePrompt } from "./defaults/node.js";
const defaultModelName = 'meta-llama/llama-4-scout-17b-16e-instruct'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
app.use(cors());

app.use(express.json());


app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});


// Serve static files from the frontend build folder
app.use(express.static(path.join(__dirname, '..', '..', 'frontend/dist')));

// Express 5 catch-all route (matches "/" and all nested paths)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'frontend/dist', 'index.html'));
});


const getCompletionText = (content: unknown) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
      .join("")
      .trim();
  }
  return "";
};

app.post("/template", async (req: any, res: any) => {
  const prompt = req.body.prompt;

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: process.env.MODEL || defaultModelName,
    max_tokens: 200,
  });

  const answer = getCompletionText(response.choices[0]?.message?.content);
  console.log(answer, "answer", response.choices[0]?.message);
  if ((answer).toLowerCase() == "react") {
    res.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactBasePrompt],
    });
    return;
  }

  if ((answer).toLowerCase() === "node") {
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
  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: "system", content: getSystemPrompt() }, ...messages],
      model: process.env.MODEL || defaultModelName,
      max_tokens: 4000,
    });

    res.json(getCompletionText(response.choices[0]?.message?.content));
  } catch (error) {
    console.log(error, "__ERROR");
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Server is up...");
});
