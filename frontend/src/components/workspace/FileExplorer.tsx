import React, { useState } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { FileData } from "../../types";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  FileIcon,
  FolderIcon,
  FileCode,
} from "lucide-react";
import { motion } from "framer-motion";

interface FileTreeProps {
  files: FileData[];
  level?: number;
}

const FileTree: React.FC<FileTreeProps> = ({ files, level = 0 }) => {
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({});
  const { state, setActiveFile } = useWorkspace();
  const { activeFileId } = state;

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleFileClick = (fileId: string) => {
    setActiveFile(fileId);
  };

  return (
    <ul className="space-y-1">
      {files.map((file) => (
        <li key={file.id}>
          <div
            className={cn(
              "flex items-center py-1 px-2 rounded-md text-sm cursor-pointer",
              file.id === activeFileId
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-foreground",
              level > 0 && "ml-4"
            )}
            style={{ paddingLeft: `${(level > 0 ? 0 : 0) + 4}px` }}
            onClick={() =>
              file.type === "folder"
                ? toggleFolder(file.id)
                : handleFileClick(file.id)
            }
          >
            {file.type === "folder" ? (
              <>
                {expandedFolders[file.id] ? (
                  <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
                )}
                <FolderIcon className="h-4 w-4 mr-2 text-primary" />
              </>
            ) : (
              <>
                <div className="w-4 mr-1"></div>
                {file.name.endsWith(".html") && (
                  <FileCode className="h-4 w-4 mr-2 text-orange-500" />
                )}
                {file.name.endsWith(".css") && (
                  <FileCode className="h-4 w-4 mr-2 text-primary" />
                )}
                {file.name.endsWith(".js") && (
                  <FileCode className="h-4 w-4 mr-2 text-yellow-500" />
                )}
                {!file.name.match(/\.(html|css|js)$/) && (
                  <FileIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                )}
              </>
            )}
            <span className="truncate">{file.name}</span>
          </div>
          {file.type === "folder" &&
            expandedFolders[file.id] &&
            file.children && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FileTree files={file.children} level={level + 1} />
              </motion.div>
            )}
        </li>
      ))}
    </ul>
  );
};

interface FileExplorerProps {
  files: FileData[];
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files }) => {
  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="text-sm font-medium text-foreground">Files</h3>
      </div>
      <FileTree files={files} />
    </div>
  );
};

export default FileExplorer;
