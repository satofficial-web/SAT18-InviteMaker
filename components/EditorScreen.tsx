import React, { useState, useRef, useCallback, useEffect } from 'react';
import Modal from './Modal';
import { InvitationElement, InvitationProject, TextElement } from '../types';
import EditorToolbar from './EditorToolbar';
import PageTabs from './PageTabs';

interface EditorScreenProps {
  project: InvitationProject;
  setProject: React.Dispatch<React.SetStateAction<InvitationProject | null>>;
  onBack: () => void;
  onPreview: () => void;
}

const EditorScreen: React.FC<EditorScreenProps> = ({ project, setProject, onBack, onPreview }) => {
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string>(project.pages[0]?.id || '');

  useEffect(() => {
    // Ensure currentPageId is valid if project pages change
    if (!project.pages.find(p => p.id === currentPageId)) {
      setCurrentPageId(project.pages[0]?.id || '');
    }
  }, [project, currentPageId]);

  const dragInfo = useRef<{
    isDragging: boolean;
    elementId: string | null;
    offsetX: number;
    offsetY: number;
  }>({ isDragging: false, elementId: null, offsetX: 0, offsetY: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  
  const currentPageIndex = project.pages.findIndex(p => p.id === currentPageId);
  const currentPage = project.pages[currentPageIndex];
  
  if (!currentPage) {
    // This can happen briefly if a page is deleted. App.tsx useEffect will correct it.
    return <div>Memuat Halaman...</div>;
  }
  
  const updateElementsOnCurrentPage = (updater: (elements: InvitationElement[]) => InvitationElement[]) => {
    setProject(prevProject => {
      if (!prevProject) return null;
      const newPages = [...prevProject.pages];
      const pageToUpdate = { ...newPages[currentPageIndex] };
      pageToUpdate.elements = updater(pageToUpdate.elements);
      newPages[currentPageIndex] = pageToUpdate;
      return { ...prevProject, pages: newPages };
    });
  };

  const updateElement = (id: string, updates: Partial<InvitationElement>) => {
    updateElementsOnCurrentPage(prevElements => 
      // FIX: Cast the result of the spread operation to InvitationElement.
      // TypeScript cannot correctly infer the type of a spread on a discriminated union,
      // so we assert the type to resolve the error.
      prevElements.map(el => (el.id === id ? ({ ...el, ...updates } as InvitationElement) : el))
    );
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    setSelectedElementId(id);
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    dragInfo.current = {
      isDragging: true,
      elementId: id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    element.style.cursor = 'grabbing';
    e.stopPropagation();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragInfo.current.isDragging || !dragInfo.current.elementId || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragInfo.current.offsetX;
    const newY = e.clientY - canvasRect.top - dragInfo.current.offsetY;
    
    updateElement(dragInfo.current.elementId, { x: newX, y: newY });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (dragInfo.current.isDragging) {
      document.body.style.cursor = 'default';
      dragInfo.current = { isDragging: false, elementId: null, offsetX: 0, offsetY: 0 };
    }
  }, []);
  
  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  const selectedElement = currentPage.elements.find(el => el.id === selectedElementId) || null;

  const templateBgColors = [
    'bg-gradient-to-br from-rose-100 to-teal-100',
    'bg-gradient-to-br from-blue-100 to-indigo-200',
    'bg-gradient-to-br from-amber-100 to-yellow-200',
    'bg-gradient-to-br from-green-100 to-lime-200'
  ];
  const selectedBg = templateBgColors[currentPage.templateId - 1] || 'bg-gray-200';

  return (
    <>
      <div className="flex flex-col h-full bg-gray-200">
        <EditorToolbar 
          selectedElement={selectedElement} 
          updateElement={updateElement}
          updateElementsOnCurrentPage={updateElementsOnCurrentPage}
          onBack={() => setConfirmModalOpen(true)}
          onPreview={onPreview}
        />
        
        <PageTabs 
          project={project}
          setProject={setProject}
          currentPageId={currentPageId}
          setCurrentPageId={setCurrentPageId}
        />
        
        <div 
          id="editorCanvasWrapper" 
          className="flex-1 flex justify-center items-center p-4 overflow-auto"
          onClick={() => setSelectedElementId(null)}
        >
          <div
            ref={canvasRef}
            className="relative w-[400px] h-[600px] border shadow-lg overflow-hidden flex-shrink-0 bg-white"
          >
            <div className={`absolute inset-0 w-full h-full object-cover ${selectedBg}`} />
            {currentPage.elements.map(el => (
              <div
                key={el.id}
                onMouseDown={(e) => handleMouseDown(e, el.id)}
                onClick={(e) => e.stopPropagation()}
                className={`absolute ${selectedElementId === el.id ? 'ring-2 ring-accent ring-offset-2' : ''} transition-shadow duration-200 cursor-grab`}
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  transform: `rotate(${el.rotation}deg)`,
                }}
              >
                {el.type === 'text' && (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateElement(el.id, { text: e.currentTarget.innerText })}
                    style={{
                      fontFamily: el.fontFamily,
                      fontSize: `${el.fontSize}px`,
                      color: el.color,
                      textAlign: el.textAlign,
                      width: '100%',
                      height: '100%',
                      outline: 'none',
                    }}
                    className="p-1 whitespace-pre-wrap"
                  >
                    {el.text}
                  </div>
                )}
                 {el.type === 'image' && (
                   <img src={el.src} alt="invitation element" className="w-full h-full object-cover pointer-events-none" />
                 )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal 
        isOpen={isConfirmModalOpen} 
        onClose={() => setConfirmModalOpen(false)}
        title="Konfirmasi Keluar"
      >
        <p className="text-secondary-text mb-4">Apakah Anda yakin? Proyek Anda telah disimpan. Anda dapat melanjutkannya lagi nanti.</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setConfirmModalOpen(false)} 
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-main-text text-sm font-semibold">
              Batal
          </button>
          <button 
            onClick={() => {
              onBack();
              setConfirmModalOpen(false);
            }}
            className="px-4 py-2 rounded bg-accent hover:bg-accent/90 text-white text-sm font-semibold">
              Ya, Keluar & Mulai Baru
          </button>
        </div>
      </Modal>
    </>
  );
};

export default EditorScreen;