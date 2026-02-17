import { FileData } from '../types';

// Helper to find a file by its ID in the file structure
export const findFileById = (
  files: FileData[],
  fileId: string
): FileData | null => {
  for (const file of files) {
    if (file.id === fileId) {
      return file;
    }
    
    if (file.children) {
      const foundInChildren = findFileById(file.children, fileId);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }
  
  return null;
};

// Helper to update a file's content
export const updateFileContent = (
  files: FileData[],
  fileId: string,
  newContent: string
): FileData[] => {
  return files.map(file => {
    if (file.id === fileId) {
      return { ...file, content: newContent };
    }
    
    if (file.children) {
      return {
        ...file,
        children: updateFileContent(file.children, fileId, newContent)
      };
    }
    
    return file;
  });
};

// Helper to create a new file or folder
export const createNewFile = (
  files: FileData[],
  parentPath: string,
  name: string,
  type: 'file' | 'folder'
): FileData[] => {
  // Implementation would depend on how you want to handle new file creation
  // This is a simplified version
  return files;
};

// Helper to get a flat list of all file paths for search
export const getAllFilePaths = (files: FileData[]): string[] => {
  let paths: string[] = [];
  
  for (const file of files) {
    paths.push(file.path);
    
    if (file.children) {
      paths = [...paths, ...getAllFilePaths(file.children)];
    }
  }
  
  return paths;
};

// Mock function to export project as ZIP
export const exportProjectAsZip = async (files: FileData[]): Promise<void> => {
  // In a real implementation, this would use something like JSZip
  console.log('Exporting project as ZIP...');
  // Implementation would depend on how you want to handle file export
};