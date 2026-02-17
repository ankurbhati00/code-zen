import React, { useEffect, useRef, useState } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import FileExplorer from "./FileExplorer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { motion } from "framer-motion";
import useWebcontainers from "@/hooks/useWebcontainers";
import { FileData } from "@/types";
import Preview from "./Preview";
import CodeEditor from "./CodeEditor";

const RightPanel: React.FC = () => {
  const { state } = useWorkspace();
  const { files, activeFileId } = state;
  const { webcontainer } = useWebcontainers();
  const [url, setUrl] = useState("");
  const footerRef = useRef<HTMLDivElement>(null);
  const findFile = (fileList: any[], targetId: string): any => {
    for (const file of fileList) {
      if (file.id === targetId) {
        return file;
      }
      if (file.type === "folder" && file.children) {
        const found = findFile(file.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const activeFile = activeFileId ? findFile(files, activeFileId) : null;

  useEffect(() => {
    async function init() {
      const createMountStructure = (files: FileData[]): Record<string, any> => {
        const mountStructure: Record<string, any> = {};

        const processFile = (file: FileData, isRootFolder: boolean) => {
          if (file.type === "folder") {
            // For folders, create a directory entry
            mountStructure[file.name] = {
              directory: file.children
                ? Object.fromEntries(
                    file.children.map((child) => [
                      child.name,
                      processFile(child, false),
                    ])
                  )
                : {},
            };
          } else if (file.type === "file") {
            if (isRootFolder) {
              mountStructure[file.name] = {
                file: {
                  contents: file.content || "",
                },
              };
            } else {
              // For files, create a file entry with contents
              return {
                file: {
                  contents: file.content || "",
                },
              };
            }
          }

          return mountStructure[file.name];
        };

        // Process each top-level file/folder
        files.forEach((file) => processFile(file, true));

        return mountStructure;
      };

      const mountStructure = createMountStructure(files);
      await webcontainer?.mount(mountStructure);
      await main();
    }
    init();

    // Mount the structure if WebContainer is available
  }, [files, webcontainer]);

  const cleanLogText = (text: string) => {
    // Remove ANSI escape codes
    let cleaned = text.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");
    // Remove special characters
    cleaned = cleaned.replace(/[\\|/\-]/g, "");
    // Remove extra whitespace
    cleaned = cleaned.trim();
    return cleaned;
  };

  async function main() {
    if (!webcontainer) return;
    console.log("____MAIN_____");

    // Clear previous logs
    if (footerRef.current) {
      footerRef.current.innerHTML = "";
    }
    const installProcess = await webcontainer.spawn("npm", ["install"]);
    // installProcess.output.pipeTo(
    //   new WritableStream({
    //     write(data) {
    //       // console.log(btoa(data));
    //       // appendLog(btoa(data));
    //     },
    //   })
    // );

    const devProcess = await webcontainer.spawn("npm", ["run", "dev"]);

    // devProcess.output.pipeTo(
    //   new WritableStream({
    //     write(data) {
    //       // appendLog(btoa(data));
    //     },
    //   })
    // );

    // Wait for `server-ready` event
    webcontainer.on("server-ready", (port, url) => {
      console.log(url);
      console.log(port);
      setUrl(url);
    });
  }

  return (
    <motion.div
      className="h-full flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Tabs defaultValue="editor" className="w-full h-full ">
        <TabsList className=" flex justify-start bg-muted/50 rounded-none">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="h-[calc(100%-2.5rem)] p-0 mt-0">
          <div className="h-full flex">
            <div className="w-64 border-r border-border h-full overflow-y-auto">
              <FileExplorer files={files} />
            </div>
            <div className="flex-1 h-full">
              {activeFile && activeFile.type === "file" ? (
                <CodeEditor file={activeFile} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a file to edit
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="h-full w-full p-0 mt-0">
          <Preview url={url} footerRef={footerRef} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default RightPanel;
