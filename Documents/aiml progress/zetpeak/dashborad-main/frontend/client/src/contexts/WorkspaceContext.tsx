import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Workspace {
  id: string;
  name: string;
  initials: string;
  color: string;
  email: string;
  description: string;
  status: 'Active' | 'Inactive';
  bookingLink: string;
  prefix: string;
  maxDigits: number;
}

interface WorkspaceContextType {
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (workspace: Workspace | null) => void;
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [selectedWorkspace, setSelectedWorkspaceState] = useState<Workspace | null>(null);
  const [workspaces, setWorkspacesState] = useState<Workspace[]>([]);

  useEffect(() => {
    // Load workspaces from localStorage
    const workspacesData = localStorage.getItem('workspaces');
    if (workspacesData) {
      const parsed = JSON.parse(workspacesData);
      setWorkspacesState(parsed);
      
      // Load selected workspace
      const selectedId = localStorage.getItem('selectedWorkspaceId');
      if (selectedId) {
        const selected = parsed.find((w: Workspace) => w.id === selectedId);
        if (selected) {
          setSelectedWorkspaceState(selected);
        }
      }
    }
  }, []);

  const setSelectedWorkspace = (workspace: Workspace | null) => {
    setSelectedWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem('selectedWorkspaceId', workspace.id);
    } else {
      localStorage.removeItem('selectedWorkspaceId');
    }
  };

  const setWorkspaces = (newWorkspaces: Workspace[]) => {
    setWorkspacesState(newWorkspaces);
    localStorage.setItem('workspaces', JSON.stringify(newWorkspaces));
    
    // Update selected workspace if it was modified
    if (selectedWorkspace) {
      const updated = newWorkspaces.find(w => w.id === selectedWorkspace.id);
      if (updated) {
        setSelectedWorkspaceState(updated);
      } else {
        setSelectedWorkspaceState(null);
        localStorage.removeItem('selectedWorkspaceId');
      }
    }
  };

  return (
    <WorkspaceContext.Provider value={{ selectedWorkspace, setSelectedWorkspace, workspaces, setWorkspaces }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
