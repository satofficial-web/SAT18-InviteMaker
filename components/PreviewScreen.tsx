import React, { useRef, useState } from 'react';
import { InvitationElement, InvitationProject } from '../types';

// TypeScript declarations for global libraries from CDN
declare const html2canvas: any;
declare const jspdf: any;


interface PreviewScreenProps {
  project: InvitationProject;
  onBackToEditor: () => void;
}

const PreviewScreen: React.FC<PreviewScreenProps> = ({ project, onBackToEditor }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const currentPage = project.pages[currentPageIndex];
  if (!currentPage) return <div>Halaman tidak ditemukan.</div>;
  
  const handleDownload = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [400, 600]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 400, 600);
      pdf.save(`undangan-halaman-${currentPageIndex + 1}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
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
        <button onClick={onBackToEditor} className="text-sm text-blue-500 hover:underline" disabled={isDownloading}>
          ← Kembali ke Editor
        </button>
        <div className="font-semibold text-secondary-text">Preview Undangan</div>
        <button onClick={handleDownload} className="bg-accent text-white px-3 py-1 rounded shadow hover:bg-accent/90 text-sm font-semibold w-32" disabled={isDownloading}>
          {isDownloading ? 'Mengunduh...' : `Unduh Hal. ${currentPageIndex + 1}`}
        </button>
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
                    fontFamily: el.fontFamily,
                    fontSize: `${el.fontSize}px`,
                    color: el.color,
                    textAlign: el.textAlign,
                  }}
                  className="p-1 whitespace-pre-wrap"
                >
                  {el.text}
                </div>
              )}
               {el.type === 'image' && (
                 <img src={el.src} alt="invitation element" className="w-full h-full object-cover" />
               )}
            </div>
          ))}
        </div>
        
        {/* Page Navigation */}
        {project.pages.length > 1 && (
          <div className="mt-4 flex items-center gap-4">
            <button 
              onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
              className="px-3 py-1 bg-white rounded shadow disabled:opacity-50"
            >
              &#8592; Sebelumnya
            </button>
            <span className="text-sm text-secondary-text font-medium">
              Halaman {currentPageIndex + 1} dari {project.pages.length}
            </span>
            <button
              onClick={() => setCurrentPageIndex(prev => Math.min(project.pages.length - 1, prev + 1))}
              disabled={currentPageIndex === project.pages.length - 1}
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