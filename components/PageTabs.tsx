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
      elements: [],
      templateId: project.pages[0]?.templateId || 1,
    };

    setProject(prev => {
      if (!prev) return null;
      const updatedProject = { ...prev, pages: [...prev.pages, newPage] };
      setCurrentPageId(newPage.id);
      return updatedProject;
    });
  };

  const handleRenamePage = (pageId: string) => {
    const page = project.pages.find(p => p.id === pageId);
    if (!page) return;
    const newName = prompt("Masukkan nama halaman baru:", page.name);
    if (newName && newName.trim() !== "") {
      setProject(prev => {
        if (!prev) return null;
        const newPages = prev.pages.map(p => p.id === pageId ? { ...p, name: newName.trim() } : p);
        return { ...prev, pages: newPages };
      });
    }
  };

  const handleDeletePage = (pageId: string) => {
    if (project.pages.length <= 1) {
      alert("Tidak dapat menghapus satu-satunya halaman.");
      return;
    }
    if (confirm("Apakah Anda yakin ingin menghapus halaman ini?")) {
      setProject(prev => {
        if (!prev) return null;
        const newPages = prev.pages.filter(p => p.id !== pageId);
        // If the current page was deleted, switch to the first page
        if (currentPageId === pageId) {
          setCurrentPageId(newPages[0].id);
        }
        return { ...prev, pages: newPages };
      });
    }
  };

  return (
    <div className="flex-shrink-0 bg-white border-b px-2 text-sm text-secondary-text">
      <div className="flex items-center gap-1">
        {project.pages.map(page => (
          <div key={page.id} className="group relative">
            <button
              onClick={() => setCurrentPageId(page.id)}
              onDoubleClick={() => handleRenamePage(page.id)}
              className={`pl-3 pr-8 py-2 border-b-2 transition-colors ${
                currentPageId === page.id
                  ? 'border-accent text-accent font-semibold'
                  : 'border-transparent hover:bg-gray-100'
              }`}
            >
              {page.name}
            </button>
            <button 
              onClick={() => handleDeletePage(page.id)}
              className="absolute top-1/2 right-1 -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-lg"
              title="Hapus Halaman"
            >
              &times;
            </button>
          </div>
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
