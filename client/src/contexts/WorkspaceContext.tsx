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
    // Load company info for default workspace
    const companyData = localStorage.getItem('zervos_company');
    const company = companyData ? JSON.parse(companyData) : null;
    
    // Load workspaces from localStorage
    const workspacesData = localStorage.getItem('workspaces');
    let parsed: Workspace[] = [];
    
    if (workspacesData) {
      parsed = JSON.parse(workspacesData);
    }
    
    // If no workspaces exist, create a default one
    if (parsed.length === 0) {
      const defaultWorkspace: Workspace = {
        id: Date.now().toString(),
        name: company?.name || 'My Workspace',
        initials: (company?.name || 'MW').substring(0, 2).toUpperCase(),
        color: 'bg-purple-500',
        email: company?.email || '',
        description: company?.industry || 'Default workspace',
        status: 'Active',
        bookingLink: `${window.location.origin}/book/default`,
        prefix: 'BK',
        maxDigits: 4
      };
      
      parsed = [defaultWorkspace];
      localStorage.setItem('workspaces', JSON.stringify(parsed));
    }
    
    setWorkspacesState(parsed);
    
    // Load selected workspace or auto-select the first one
    const selectedId = localStorage.getItem('selectedWorkspaceId');
    let selected = null;
    
    if (selectedId) {
      selected = parsed.find((w: Workspace) => w.id === selectedId) || null;
    }
    
    // If no workspace selected, auto-select the first one
    if (!selected && parsed.length > 0) {
      selected = parsed[0];
      localStorage.setItem('selectedWorkspaceId', selected.id);
    }
    
    if (selected) {
      setSelectedWorkspaceState(selected);
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
