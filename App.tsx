import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import TemplateSelectionScreen from './components/TemplateSelectionScreen';
import EditorScreen from './components/EditorScreen';
import PreviewScreen from './components/PreviewScreen';
import ProjectManagerScreen from './components/ProjectManagerScreen';
import { db } from './db';
import { migrateFromLocalStorage } from './utils/migration';
import RestoreSessionPrompt from './components/RestoreSessionPrompt';
import { cleanupOrphanedAssets } from './utils/cleanup';

type Screen = 'loading' | 'project_manager' | 'template_selection' | 'editor' | 'preview';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('loading');
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [migratedProjectId, setMigratedProjectId] = useState<number | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      const projectId = await migrateFromLocalStorage();
      if (projectId) {
        setMigratedProjectId(projectId);
        setScreen('project_manager');
      } else {
        const projectCount = await db.projects.count();
        if (projectCount > 0) {
            setScreen('project_manager');
        } else {
            setScreen('template_selection');
        }
      }
      cleanupOrphanedAssets();
    };
    
    initializeApp();
  }, []);

  const handleProjectCreated = (id: number) => {
    setCurrentProjectId(id);
    setScreen('editor');
  };

  const handleOpenProject = (id: number) => {
    setCurrentProjectId(id);
    setScreen('editor');
  };
  
  const handleCreateNew = () => {
    setCurrentProjectId(null);
    setScreen('template_selection');
  }

  const handleReturnToProjectManager = async () => {
    setCurrentProjectId(null);
    const projectCount = await db.projects.count();
    setScreen(projectCount > 0 ? 'project_manager' : 'template_selection');
  };

  const handleGoToPreview = () => {
    setScreen('preview');
  };

  const handleBackToEditor = () => {
    setScreen('editor');
  };

  const handleConfirmMigration = () => {
      if (migratedProjectId) {
          handleOpenProject(migratedProjectId);
      }
      setMigratedProjectId(null);
  };
  
  const handleDismissMigration = () => {
      setMigratedProjectId(null);
  };

  const renderScreen = () => {
    if (screen === 'loading') {
        return <div className="flex justify-center items-center h-full"><p className="text-secondary-text animate-pulse">Memuat aplikasi...</p></div>;
    }

    switch (screen) {
      case 'project_manager':
        return <ProjectManagerScreen onOpenProject={handleOpenProject} onCreateNew={handleCreateNew} />;
      case 'template_selection':
        return <TemplateSelectionScreen onProjectCreated={handleProjectCreated} onBack={handleReturnToProjectManager} />;
      case 'editor':
        if (currentProjectId) {
          return <EditorScreen projectId={currentProjectId} onGoToPreview={handleGoToPreview} onExit={handleReturnToProjectManager} />;
        }
        break; // Fall through to error
      case 'preview':
        if (currentProjectId) {
          return <PreviewScreen projectId={currentProjectId} onBackToEditor={handleBackToEditor} />;
        }
        break; // Fall through to error
      default:
        // Fallback for invalid states
        return <div className="text-center p-8">Error: Status tidak valid. Silakan kembali ke <button onClick={handleReturnToProjectManager} className="text-blue-500 underline">daftar proyek</button>.</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-soft-bg font-poppins">
      <Header />
      <main className="flex-1 overflow-auto">
        {migratedProjectId && screen === 'project_manager' && (
            <RestoreSessionPrompt 
                onConfirm={handleConfirmMigration}
                onDismiss={handleDismissMigration}
            />
        )}
        {renderScreen()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
