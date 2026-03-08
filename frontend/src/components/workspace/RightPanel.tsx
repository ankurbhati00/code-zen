import React, { useEffect, useRef, useState } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import FileExplorer from "./FileExplorer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { motion } from "framer-motion";
import useWebcontainers from "@/hooks/useWebcontainers";
import { FileData } from "@/types";
import Preview from "./Preview";
import CodeEditor from "./CodeEditor";
import { WebContainerProcess } from "@webcontainer/api";

const RightPanel: React.FC = () => {
  const { state } = useWorkspace();
  const { files, activeFileId } = state;
  const { webcontainer } = useWebcontainers();
  const [url, setUrl] = useState("");
  const hasStartedDevServer = useRef(false);
  const isRestartingDevServer = useRef(false);
  const serverReadyListenerAttached = useRef(false);
  const devProcessRef = useRef<WebContainerProcess | null>(null);
  const previousPathsSignature = useRef("");
  const previousCriticalSignature = useRef("");
  const restartTimerRef = useRef<number | null>(null);
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

  const createMountStructure = (currentFiles: FileData[]): Record<string, any> => {
    const mountStructure: Record<string, any> = {};

    const processFile = (file: FileData): any => {
      if (file.type === "folder") {
        return {
          directory: file.children
            ? Object.fromEntries(
              file.children.map((child) => [child.name, processFile(child)])
            )
            : {},
        };
      }

      return {
        file: {
          contents: file.content || "",
        },
      };
    };

    currentFiles.forEach((file) => {
      mountStructure[file.name] = processFile(file);
    });

    return mountStructure;
  };

  const collectPaths = (currentFiles: FileData[]): string[] => {
    const paths: string[] = [];

    const walk = (list: FileData[]) => {
      list.forEach((file) => {
        paths.push(`${file.type}:${file.path}`);
        if (file.children?.length) {
          walk(file.children);
        }
      });
    };

    walk(currentFiles);
    return paths.sort();
  };

  const criticalFiles = [
    "package.json",
    "vite.config.ts",
    "vite.config.js",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
  ];

  const collectCriticalSignature = (currentFiles: FileData[]): string => {
    const entries: string[] = [];

    const walk = (list: FileData[]) => {
      list.forEach((file) => {
        if (file.type === "file" && criticalFiles.some((name) => file.path.endsWith(name))) {
          entries.push(`${file.path}:${file.content || ""}`);
        }
        if (file.children?.length) {
          walk(file.children);
        }
      });
    };

    walk(currentFiles);
    return entries.sort().join("|");
  };

  const startDevServer = async () => {
    if (!webcontainer) return;
    devProcessRef.current = await webcontainer.spawn("npm", [
      "run",
      "dev",
      "--",
      "--host",
      "0.0.0.0",
    ]);
  };

  const restartDevServer = async () => {
    if (!webcontainer || isRestartingDevServer.current) return;
    isRestartingDevServer.current = true;

    try {
      if (devProcessRef.current) {
        await devProcessRef.current.kill();
        devProcessRef.current = null;
      }
      await startDevServer();
    } finally {
      isRestartingDevServer.current = false;
    }
  };

  useEffect(() => {
    if (!webcontainer || files.length === 0) return;
    const wc = webcontainer;
    let cancelled = false;

    async function syncAndRun() {
      await wc.mount(createMountStructure(files));
      if (cancelled) return;

      const currentPathsSignature = collectPaths(files).join("|");
      const currentCriticalSignature = collectCriticalSignature(files);
      const structureChanged =
        previousPathsSignature.current !== "" &&
        previousPathsSignature.current !== currentPathsSignature;
      const criticalChanged =
        previousCriticalSignature.current !== "" &&
        previousCriticalSignature.current !== currentCriticalSignature;

      previousPathsSignature.current = currentPathsSignature;
      previousCriticalSignature.current = currentCriticalSignature;

      if (!hasStartedDevServer.current) {
        hasStartedDevServer.current = true;

        if (footerRef.current) {
          footerRef.current.innerHTML = "";
        }

        if (!serverReadyListenerAttached.current) {
          wc.on("server-ready", (_port, serverUrl) => {
            setUrl(serverUrl);
          });
          serverReadyListenerAttached.current = true;
        }

        const installProcess = await wc.spawn("npm", ["install"]);
        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          hasStartedDevServer.current = false;
          return;
        }

        await startDevServer();
        return;
      }

      if (structureChanged || criticalChanged) {
        if (restartTimerRef.current) {
          window.clearTimeout(restartTimerRef.current);
        }
        restartTimerRef.current = window.setTimeout(() => {
          restartDevServer();
        }, 500);
      }
    }

    syncAndRun();

    return () => {
      cancelled = true;
    };
  }, [files, webcontainer]);

  useEffect(() => {
    return () => {
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
      }
    };
  }, []);

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
