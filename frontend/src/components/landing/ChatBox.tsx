import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import {
  generateFilesFromSteps,
  generateStepsFromPrompt,
} from "@/lib/prompt-processor";
import { motion } from "framer-motion";
import React, { Dispatch, SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { Message, useMessages } from "@/stores/useMessages";
import { cn } from "@/lib/utils";

interface Props {
  footer?: React.ReactNode;
  label?: React.ReactNode;
  className?: string;
  setLoading: Dispatch<SetStateAction<boolean>>;
}
const ChatBox: React.FC<Props> = (props: Props) => {
  const [promptValue, setPromptValue] = useState("");
  const { setFiles, setSteps, state } = useWorkspace();
  const navigate = useNavigate();
  const { messages, setMessages } = useMessages();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (promptValue.trim()) {
      try {
        props?.setLoading(true);
        const response = await api.post("/template", {
          prompt: promptValue.trim(),
        });

        const { prompts, uiPrompts } = response.data;
        setSteps(generateStepsFromPrompt(uiPrompts[0]));

        const structuredData = generateFilesFromSteps(
          state.files,
          generateStepsFromPrompt(uiPrompts[0])
        );

        setFiles(structuredData?.files ?? []);
        setSteps(structuredData?.steps ?? []);
        const oldMessages = [...prompts, promptValue].map((content) => ({
          role: "user",
          content,
        }));
        const stepsResponse = await api.post("/chat", {
          messages: oldMessages,
        });
        props?.setLoading(false);
        setPromptValue("");

        setMessages([
          ...oldMessages,
          { role: "assistant", content: stepsResponse.data },
        ] as Message[]);

        const updatedSteps = [
          ...(structuredData?.steps ?? []),
          ...generateStepsFromPrompt(stepsResponse.data),
        ];
        setSteps(updatedSteps);

        const updatedFiles = [
          ...(generateFilesFromSteps(structuredData?.files ?? [], updatedSteps)
            ?.files ?? []),
        ];
        setFiles(updatedFiles);

        navigate("/workspace");
      } catch (error) {
        console.error("Error generating template:", error);
      }
    }
  };

  const handleChat = async (e: React.FormEvent, messages: Message[]) => {
    e.preventDefault();
    props?.setLoading(true);
    const newMessages = [...messages, { role: "user", content: promptValue }];
    const stepsResponse = await api.post("/chat", {
      messages: newMessages,
    });
    props?.setLoading(false);
    setPromptValue("");

    setMessages([
      ...newMessages,
      { role: "assistant", content: stepsResponse.data },
    ] as Message[]);

    const updatedSteps = [
      ...(state?.steps ?? []),
      ...generateStepsFromPrompt(stepsResponse.data),
    ];
    setSteps(updatedSteps);

    const updatedFiles = [
      ...(generateFilesFromSteps(state?.files ?? [], updatedSteps)?.files ??
        []),
    ];
    setFiles(updatedFiles);
  };

  return (
    <motion.form
      onSubmit={(e: React.FormEvent) =>
        messages.length > 0 ? handleChat(e, messages) : handleSubmit(e)
      }
      className={cn(" rounded-lg  ", props.className)}
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="space-y-2">
        {props.label}
        <Textarea
          id="prompt"
          placeholder="Enter text..."
          className="w-full min-h-[220px] p-4"
          value={promptValue}
          onChange={(e) => setPromptValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              messages.length > 0 ? handleChat(e, messages) : handleSubmit(e);
            }
          }}
          required
        />
      </div>
      <div className="w-full mt-4">{props.footer}</div>
    </motion.form>
  );
};

export default ChatBox;
