import React, { useState, useEffect, useCallback } from 'react';
import { AppView, InvitationProject, InvitationPage, InvitationElement } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import EditorScreen from './components/EditorScreen';
import TemplateSelectionScreen from './components/TemplateSelectionScreen';
import PreviewScreen from './components/PreviewScreen';
import { getInitialPagesForTemplate } from './utils/templates';
import { db, PROJECT_ID } from './db';

const LEGACY_STORAGE_KEY = 'sat18-invitation-session';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('templateSelection');
  const [project, setProject] = useState<InvitationProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load project from DB or migrate from localStorage on initial load
  useEffect(() => {
    const loadProject = async () => {
      let loadedProject = await db.projects.get(PROJECT_ID);

      if (!loadedProject) {
        const legacyStateJSON = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyStateJSON) {
          console.log("Migrating from localStorage to IndexedDB...");
          const { selectedTemplateId, elements } = JSON.parse(legacyStateJSON);
          const migratedPage: InvitationPage = {
            id: `page-${Date.now()}`,
            name: 'Halaman Utama',
            elements,
            templateId: selectedTemplateId,
          };
          loadedProject = {
            id: PROJECT_ID,
            name: 'My Invitation',
            lastModified: Date.now(),
            pages: [migratedPage],
          };
          await db.projects.put(loadedProject);
          localStorage.removeItem(LEGACY_STORAGE_KEY);
          console.log("Migration complete.");
        }
      }

      setProject(loadedProject);
      if (loadedProject) {
        setCurrentView('editor');
      }
      setIsLoading(false);
    };

    loadProject();
  }, []);
  
  // Auto-save project to IndexedDB whenever it changes (debounced)
  useEffect(() => {
    if (project && !isLoading) {
      const handler = setTimeout(() => {
        console.log("Auto-saving project...");
        db.projects.put({ ...project, lastModified: Date.now() });
      }, 1000); // 1-second debounce
      return () => clearTimeout(handler);
    }
  }, [project, isLoading]);

  const handleSelectTemplate = (id: number) => {
    const newProject: InvitationProject = {
      id: PROJECT_ID,
      name: `Undangan Baru`,
      lastModified: Date.now(),
      pages: getInitialPagesForTemplate(id),
    };
    setProject(newProject);
    setCurrentView('editor');
  };

  const handleBackToHome = async () => {
    await db.projects.delete(PROJECT_ID);
    setProject(null);
    setCurrentView('templateSelection');
  };

  const handleGoToPreview = () => {
    setCurrentView('preview');
  };
  
  const handleBackToEditor = () => {
    setCurrentView('editor');
  };
  
  if (isLoading) {
    return (
       <div className="flex justify-center items-center min-h-screen bg-soft-bg">
        <p className="text-lg text-secondary-text">Memuat proyek...</p>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'editor':
        if (project) {
          return (
            <EditorScreen 
              project={project}
              setProject={setProject}
              onBack={handleBackToHome} 
              onPreview={handleGoToPreview} 
            />
          );
        }
        // Fallback if project is null
        setCurrentView('templateSelection');
        return null;
        
      case 'preview':
        if (project) {
          return (
            <PreviewScreen 
              project={project}
              onBackToEditor={handleBackToEditor} 
            />
          );
        }
        // Fallback if project is null
        setCurrentView('templateSelection');
        return null;

      case 'templateSelection':
      default:
        return (
          <TemplateSelectionScreen onSelectTemplate={handleSelectTemplate} />
        );
    }
  };

  return (
    <div className="bg-soft-bg text-main-text flex flex-col min-h-screen">
      <Header />
      <main id="app" className="flex-1 flex flex-col overflow-auto">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
};

export default App;