import React, { useRef, useState, useEffect } from 'react';
import { InvitationProject, InvitationPage, ImageElement } from '../types';
import { db } from '../db';

// TypeScript declarations for global libraries from CDN
declare const html2canvas: any;
declare const jspdf: any;

// A component to handle async loading of image blobs from IndexedDB
const AssetImage: React.FC<{ element: ImageElement, onImageLoaded: () => void }> = ({ element, onImageLoaded }) => {
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
  
  return <img src={imageUrl} alt="invitation element" className="w-full h-full object-cover" onLoad={onImageLoaded} />;
};

interface PreviewScreenProps {
  projectId: number;
  onBackToEditor: () => void;
}

const PreviewScreen: React.FC<PreviewScreenProps> = ({ projectId, onBackToEditor }) => {
  const [project, setProject] = useState<InvitationProject | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloadState, setDownloadState] = useState<{ active: boolean, message: string }>({ active: false, message: '' });
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    const loadProject = async () => {
      const proj = await db.projects.get(projectId);
      setProject(proj);
    };
    loadProject();
  }, [projectId]);


  if (!project) {
    return <div className="flex justify-center items-center h-full"><p className="text-secondary-text animate-pulse">Memuat preview...</p></div>;
  }

  const currentPage = project.pages[currentPageIndex];
  if (!currentPage) return <div>Halaman tidak ditemukan.</div>;

  const handleDownloadPage = async (pageIndex: number) => {
    setDownloadState({ active: true, message: `Mempersiapkan Hal. ${pageIndex + 1}...` });
    setCurrentPageIndex(pageIndex);

    // Give React time to render the correct page and its images
    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
        if (!previewRef.current) throw new Error("Preview ref not found");
        const canvas = await html2canvas(previewRef.current, { useCORS: true, scale: 2 });
        const imgData = canvas.toDataURL('image/png');
      
        const pdf = new jspdf.jsPDF({ orientation: 'portrait', unit: 'px', format: [400, 600] });
        pdf.addImage(imgData, 'PNG', 0, 0, 400, 600);
        pdf.save(`undangan-halaman-${pageIndex + 1}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setDownloadState({ active: false, message: '' });
    }
  };
  
  const handleDownloadAllPages = async () => {
    const pdf = new jspdf.jsPDF({ orientation: 'portrait', unit: 'px', format: [400, 600] });
    
    for (let i = 0; i < project.pages.length; i++) {
        setDownloadState({ active: true, message: `Memproses Hal. ${i + 1} dari ${project.pages.length}...` });
        setCurrentPageIndex(i);
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!previewRef.current) continue;
        const canvas = await html2canvas(previewRef.current, { useCORS: true, scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
            pdf.addPage([400, 600], 'portrait');
        }
        pdf.addImage(imgData, 'PNG', 0, 0, 400, 600);
    }
    
    setDownloadState({ active: true, message: 'Menyimpan PDF...' });
    pdf.save('undangan-lengkap.pdf');
    setDownloadState({ active: false, message: '' });
  };


  const templateBgColors = [
    'bg-gradient-to-br from-rose-100 to-teal-100',
    'bg-gradient-to-br from-blue-100 to-indigo-200',
    'bg-gradient-to-br from-amber-100 to-yellow-200',
    'bg-gradient-to-br from-green-100 to-lime-200'
  ];
  
  const selectedBg = templateBgColors[currentPage.templateId - 1] || 'bg-gray-200';

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center bg-white shadow px-4 py-2 z-10">
        <button onClick={onBackToEditor} className="text-sm text-blue-500 hover:underline" disabled={downloadState.active}>
          ← Kembali ke Editor
        </button>
        <div className="font-semibold text-secondary-text">Preview Undangan</div>
        <div className="flex items-center gap-2">
            <button onClick={() => handleDownloadPage(currentPageIndex)} className="bg-accent text-white px-3 py-1 rounded shadow hover:bg-accent/90 text-sm font-semibold w-36" disabled={downloadState.active}>
            {downloadState.active ? downloadState.message : `Unduh Hal. ${currentPageIndex + 1}`}
            </button>
            {project.pages.length > 1 && (
                 <button onClick={handleDownloadAllPages} className="bg-gray-600 text-white px-3 py-1 rounded shadow hover:bg-gray-700 text-sm font-semibold w-36" disabled={downloadState.active}>
                    Unduh Semua
                 </button>
            )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-200 p-4 overflow-auto">
        <div
          ref={previewRef} 
          className="relative w-[400px] h-[600px] border shadow-lg overflow-hidden bg-white flex-shrink-0"
        >
          <div className={`absolute inset-0 w-full h-full object-cover ${selectedBg}`} />
          {currentPage.elements.map(el => (
            <div
              key={el.id}
              className="absolute"
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
                  style={{
                    fontFamily: (el as any).fontFamily,
                    fontSize: `${(el as any).fontSize}px`,
                    color: (el as any).color,
                    textAlign: (el as any).textAlign,
                  }}
                  className="p-1 whitespace-pre-wrap"
                >
                  {(el as any).text}
                </div>
              )}
               {el.type === 'image' && (
                 <AssetImage element={el} onImageLoaded={() => {}} />
               )}
            </div>
          ))}
        </div>
        
        {project.pages.length > 1 && (
          <div className="mt-4 flex items-center gap-4">
            <button 
              onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0 || downloadState.active}
              className="px-3 py-1 bg-white rounded shadow disabled:opacity-50"
            >
              &#8592; Sebelumnya
            </button>
            <span className="text-sm text-secondary-text font-medium">
              Halaman {currentPageIndex + 1} dari {project.pages.length}
            </span>
            <button
              onClick={() => setCurrentPageIndex(prev => Math.min(project.pages.length - 1, prev + 1))}
              disabled={currentPageIndex === project.pages.length - 1 || downloadState.active}
              className="px-3 py-1 bg-white rounded shadow disabled:opacity-50"
            >
              Berikutnya &#8594;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewScreen;
