import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import { motion } from "framer-motion";

const Workspace: React.FC = () => {
  return (
    <motion.div
      className="h-[calc(100vh-3.5rem)] w-full bg-background flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel
          defaultSize={25}
          minSize={20}
          maxSize={40}
          className="h-full"
        >
          <LeftPanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={75} className="h-full">
          <RightPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </motion.div>
  );
};

export default Workspace;
