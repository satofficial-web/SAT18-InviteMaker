import React from 'react';
import { InvitationPage, InvitationProject } from '../types';

interface PageTabsProps {
  project: InvitationProject;
  setProject: React.Dispatch<React.SetStateAction<InvitationProject | null>>;
  currentPageId: string;
  setCurrentPageId: (id: string) => void;
}

const PageTabs: React.FC<PageTabsProps> = ({ project, setProject, currentPageId, setCurrentPageId }) => {
  const handleAddPage = () => {
    const newPage: InvitationPage = {
      id: `page-${Date.now()}`,
      name: `Halaman ${project.pages.length + 1}`,
      elements: [], // Start with a blank page
      templateId: project.pages[0]?.templateId || 1, // Inherit template style
    };

    setProject(prev => {
      if (!prev) return null;
      const updatedProject = { ...prev, pages: [...prev.pages, newPage] };
      setCurrentPageId(newPage.id); // Switch to the new page
      return updatedProject;
    });
  };

  return (
    <div className="flex-shrink-0 bg-white border-b px-2 text-sm text-secondary-text">
      <div className="flex items-center gap-1">
        {project.pages.map(page => (
          <button
            key={page.id}
            onClick={() => setCurrentPageId(page.id)}
            className={`px-3 py-2 border-b-2 transition-colors ${
              currentPageId === page.id
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent hover:bg-gray-100'
            }`}
          >
            {page.name}
          </button>
        ))}
        <button
          onClick={handleAddPage}
          className="px-3 py-2 hover:bg-gray-100 rounded-md ml-2"
        >
          + Tambah Halaman
        </button>
      </div>
    </div>
  );
};

export default PageTabs;
