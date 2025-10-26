import React, { useState, useEffect } from 'react';
import { InvitationProject, InvitationElement, TextElement, ImageElement } from '../types';
import EditorToolbar from './EditorToolbar';
import PageTabs from './PageTabs';
import { db } from '../db';
import { Rnd } from 'react-rnd';

interface EditorScreenProps {
  projectId: number;
  onGoToPreview: () => void;
  onExit: () => void;
}

// A component to handle async loading of image blobs from IndexedDB for the editor
const AssetImageEditor: React.FC<{ element: ImageElement }> = ({ element }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const loadAsset = async () => {
      if (element.srcAssetId) {
        const asset = await db.assets.get(element.srcAssetId);
        if (asset && isMounted) {
          const url = URL.createObjectURL(asset.blob);
          setImageUrl(url);
        }
      }
    };
    
    loadAsset();

    return () => {
      isMounted = false;
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [element.srcAssetId]);

  if (!imageUrl) return <div className="w-full h-full bg-gray-200 animate-pulse" />;
  
  return <img src={imageUrl} alt="invitation element" className="w-full h-full object-cover pointer-events-none" />;
};

const EditorScreen: React.FC<EditorScreenProps> = ({ projectId, onGoToPreview, onExit }) => {
  const [project, setProject] = useState<InvitationProject | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string>('');

  useEffect(() => {
    const loadProject = async () => {
      const proj = await db.projects.get(projectId);
      if (proj) {
        setProject(proj);
        if (proj.pages.length > 0) {
          setCurrentPageId(proj.pages[0].id);
        }
      }
    };
    loadProject();
  }, [projectId]);
  
  // Auto-save logic
  useEffect(() => {
    const handler = setTimeout(() => {
      if (project) {
        console.log("Auto-saving project...");
        db.projects.put({ ...project, lastModified: Date.now() });
      }
    }, 800); // Debounce save for 800ms

    return () => {
      clearTimeout(handler);
    };
  }, [project]);

  const updateElement = (elementId: string, updates: Partial<InvitationElement>) => {
    setProject(prev => {
      if (!prev) return null;
      const newPages = prev.pages.map(page => {
        if (page.id !== currentPageId) return page;
        const newElements = page.elements.map(el =>
          el.id === elementId ? { ...el, ...updates } : el
        );
        return { ...page, elements: newElements };
      });
      return { ...prev, pages: newPages };
    });
  };

  if (!project) {
    return <div className="flex justify-center items-center h-full"><p className="text-secondary-text animate-pulse">Memuat proyek...</p></div>;
  }

  const selectedElement = project.pages
    .find(p => p.id === currentPageId)?.elements
    .find(el => el.id === selectedElementId) || null;

  const currentPage = project.pages.find(p => p.id === currentPageId);

  if (!currentPage) {
    if(project.pages.length > 0 && currentPageId === '') {
      setCurrentPageId(project.pages[0].id);
    }
    return <div>Memuat Halaman...</div>;
  }
  
  const templateBgColors = [
    'bg-gradient-to-br from-rose-100 to-teal-100',
    'bg-gradient-to-br from-blue-100 to-indigo-200',
    'bg-gradient-to-br from-amber-100 to-yellow-200',
    'bg-gradient-to-br from-green-100 to-lime-200'
  ];
  const selectedBg = templateBgColors[currentPage.templateId - 1] || 'bg-gray-200';


  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        {/* Top bar with project name, exit, preview buttons */}
        <div className="flex-shrink-0 bg-white border-b p-2 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <button onClick={onExit} className="text-sm text-blue-500 hover:underline">← Daftar Proyek</button>
                <h2 className="font-semibold text-main-text">{project.name}</h2>
             </div>
             <button onClick={onGoToPreview} className="bg-accent text-white px-4 py-2 rounded shadow hover:bg-accent/90 text-sm font-semibold">
                Lihat Preview & Unduh
             </button>
        </div>
        
        <PageTabs 
          project={project} 
          setProject={setProject}
          currentPageId={currentPageId}
          setCurrentPageId={setCurrentPageId}
        />

        {/* Main editor area */}
        <div className="flex-1 flex justify-center items-center bg-gray-200 p-4 overflow-auto" onClick={() => setSelectedElementId(null)}>
          <div
            className="relative w-[400px] h-[600px] border shadow-lg overflow-hidden bg-white flex-shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <div className={`absolute inset-0 w-full h-full object-cover ${selectedBg}`} />

            {currentPage.elements.map(el => (
              <Rnd
                key={el.id}
                size={{ width: el.width, height: el.height }}
                position={{ x: el.x, y: el.y }}
                onDragStart={() => setSelectedElementId(el.id)}
                onDragStop={(e, d) => {
                  updateElement(el.id, { x: d.x, y: d.y });
                }}
                onResizeStart={() => setSelectedElementId(el.id)}
                onResizeStop={(e, direction, ref, delta, position) => {
                  updateElement(el.id, {
                    width: parseInt(ref.style.width, 10),
                    height: parseInt(ref.style.height, 10),
                    ...position,
                  });
                }}
                className={selectedElementId === el.id ? 'border-2 border-blue-500 z-10' : 'border border-transparent hover:border-blue-300'}
                style={{ transform: `rotate(${el.rotation}deg)` }}
                onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
              >
                {el.type === 'text' && (
                  <div
                    style={{
                      fontFamily: (el as TextElement).fontFamily,
                      fontSize: `${(el as TextElement).fontSize}px`,
                      color: (el as TextElement).color,
                      textAlign: (el as TextElement).textAlign,
                    }}
                    className="w-full h-full p-1 whitespace-pre-wrap pointer-events-none"
                  >
                    {(el as TextElement).text}
                  </div>
                )}
                {el.type === 'image' && (
                  <AssetImageEditor element={el as ImageElement} />
                )}
              </Rnd>
            ))}
          </div>
        </div>
      </div>
      <EditorToolbar
        selectedElement={selectedElement}
        updateElement={updateElement}
        setProject={setProject}
        projectId={project.id}
        currentPageId={currentPageId}
      />
    </div>
  );
};

export default EditorScreen;
