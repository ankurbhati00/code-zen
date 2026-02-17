import React, { createContext, useContext, useReducer } from "react";
import { updateFileContent } from "../lib/file-operations";
import { FileData, Step, WorkspaceState } from "../types";

type WorkspaceAction =
  | { type: "SET_PROMPT"; payload: string }
  | { type: "SET_FILES"; payload: FileData[] | [] }
  | { type: "SET_ACTIVE_FILE"; payload: string | null }
  | {
      type: "UPDATE_FILE_CONTENT";
      payload: { fileId: string; content: string };
    }
  | { type: "SET_STEPS"; payload: Step[] | [] };

const initialState: WorkspaceState = {
  prompt: "",
  steps: [],
  files: [],
  activeFileId: null,
};

const workspaceReducer = (
  state: WorkspaceState,
  action: WorkspaceAction
): WorkspaceState => {
  switch (action.type) {
    case "SET_PROMPT":
      return {
        ...state,
        prompt: action.payload,
      };

    case "SET_FILES":
      return {
        ...state,
        files: action.payload,
      };

    case "SET_STEPS":
      return {
        ...state,
        steps: action.payload,
      };

    case "SET_ACTIVE_FILE":
      return {
        ...state,
        activeFileId: action.payload,
      };

    case "UPDATE_FILE_CONTENT":
      return {
        ...state,
        files: updateFileContent(
          state.files,
          action.payload.fileId,
          action.payload.content
        ),
      };

    default:
      return state;
  }
};

interface WorkspaceContextType {
  state: WorkspaceState;
  setPrompt: (prompt: string) => void;
  setFiles: (files: FileData[] | []) => void;
  setActiveFile: (fileId: string | null) => void;
  updateFileContent: (fileId: string, content: string) => void;
  setSteps: (steps: Step[] | []) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  const setPrompt = (prompt: string) => {
    dispatch({ type: "SET_PROMPT", payload: prompt });
  };

  const setFiles = (prompt: FileData[] | []) => {
    dispatch({ type: "SET_FILES", payload: prompt });
  };

  const setActiveFile = (fileId: string | null) => {
    dispatch({ type: "SET_ACTIVE_FILE", payload: fileId });
  };

  const updateFileContent = (fileId: string, content: string) => {
    dispatch({
      type: "UPDATE_FILE_CONTENT",
      payload: { fileId, content },
    });
  };

  const setSteps = (steps: Step[] | []) => {
    dispatch({ type: "SET_STEPS", payload: steps });
  };

  return (
    <WorkspaceContext.Provider
      value={{
        state,
        setPrompt,
        setFiles,
        setActiveFile,
        updateFileContent,
        setSteps,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
