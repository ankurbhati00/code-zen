export enum StepType {
  CreateFile,
  CreateFolder,
  EditFile,
  DeleteFile,
  RunScript,
}

export interface Step {
  id: number;
  title: string;
  description: string;
  type: StepType;
  status: "pending" | "in-progress" | "completed";
  code?: string;
  path?: string;
}

export interface FileData {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  content?: string;
  children?: FileData[];
}

export interface WorkspaceState {
  prompt: string;
  steps: Step[];
  files: FileData[];
  activeFileId: string | null;
}
