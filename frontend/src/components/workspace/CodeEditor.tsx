import React, { useState, useEffect } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { FileData } from "../../types";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { debounce } from "lodash";
import { useTheme } from "../theme-provider";

interface EditorProps {
  file: FileData;
}

const CodeEditor: React.FC<EditorProps> = ({ file }) => {
  const { updateFileContent } = useWorkspace();
  const [content, setContent] = useState(file.content || "");
  const { theme } = useTheme();

  useEffect(() => {
    setContent(file.content || "");
  }, [file]);

  const handleContentChange = (value: string | undefined) => {
    setContent(value || "");
    updateFileContent(file.id, value || "");
  };

  // const handleBlur = () => {
  //   updateFileContent(file.id, content);
  // };

  const getLanguage = () => {
    if (file.name.endsWith(".html")) return "html";
    if (file.name.endsWith(".css")) return "css";
    if (file.name.endsWith(".js")) return "javascript";
    if (file.name.endsWith(".ts")) return "typescript";
    if (file.name.endsWith(".tsx")) return "typescript";
    if (file.name.endsWith(".json")) return "json";

    return "Text";
  };

  const handleBeforeMount = (monaco: any) => {
    // Disable all TypeScript and JavaScript validations
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });

    // Disable type checking by setting an empty compiler options object
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      noLib: true,
      allowNonTsExtensions: true,
    });

    // // Optional: Disable worker-based validation completely
    // monaco.languages.typescript.javascriptDefaults.setEagerModelSync(false);
    // monaco.languages.typescript.typescriptDefaults.setEagerModelSync(false);
  };

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Editor
        className="h-full w-full bg-background"
        value={content}
        language={getLanguage()}
        theme={theme == "dark" ? "vs-dark" : "light"}
        onChange={debounce(handleContentChange, 1000)}
        options={{
          cursorBlinking: "expand",
          minimap: { enabled: false },
        }}
        beforeMount={handleBeforeMount}
      />
      {/* <textarea
        value={content}
        onChange={handleContentChange}
        onBlur={handleBlur}
        className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-background text-foreground"
        spellCheck={false}
      /> */}
    </motion.div>
  );
};

export default CodeEditor;
