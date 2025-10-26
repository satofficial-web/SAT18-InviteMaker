import React from 'react';
import { InvitationElement, TextElement, InvitationProject, ImageElement } from '../types';
import { saveImageAsAsset } from '../utils/assets';

interface EditorToolbarProps {
  selectedElement: InvitationElement | null;
  updateElement: (elementId: string, updates: Partial<InvitationElement>) => void;
  setProject: React.Dispatch<React.SetStateAction<InvitationProject | null>>;
  projectId?: number;
  currentPageId: string;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ selectedElement, updateElement, setProject, projectId, currentPageId }) => {
  const textElement = selectedElement?.type === 'text' ? selectedElement as TextElement : null;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (textElement) {
      updateElement(textElement.id, { text: e.target.value });
    }
  };
  
  const handleGenericChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (!selectedElement) return;
      const { name, value } = e.target;
      updateElement(selectedElement.id, { [name]: name === 'fontSize' || name === 'rotation' || name === 'x' || name === 'y' || name === 'width' || name === 'height' ? Number(value) : value });
  };
  
  const handleAddElement = (type: 'text' | 'image') => {
      if (type === 'text') {
        const newTextElement: TextElement = {
            id: `el-${Date.now()}`,
            type: 'text',
            x: 50, y: 50, width: 200, height: 50, rotation: 0,
            text: 'Teks Baru',
            fontFamily: 'Poppins',
            fontSize: 16,
            color: '#000000',
            textAlign: 'left'
        };
        setProject(prev => {
            if (!prev) return null;
            const newPages = prev.pages.map(p => p.id === currentPageId ? {...p, elements: [...p.elements, newTextElement]} : p);
            return {...prev, pages: newPages};
        });
      }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && projectId) {
          const file = e.target.files[0];
          try {
            const assetId = await saveImageAsAsset(projectId, file);
            const newImageElement: ImageElement = {
                id: `el-${Date.now()}`,
                type: 'image',
                x: 50, y: 50, width: 150, height: 100, rotation: 0,
                srcAssetId: assetId
            };
            setProject(prev => {
                if (!prev) return null;
                const newPages = prev.pages.map(p => p.id === currentPageId ? {...p, elements: [...p.elements, newImageElement]} : p);
                return {...prev, pages: newPages};
            });
          } catch(err) {
              console.error("Failed to save image asset:", err);
              alert("Gagal mengunggah gambar. Pastikan formatnya benar dan coba lagi.");
          }
      }
  };
  
  const handleDeleteElement = () => {
      if (!selectedElement) return;
      if (confirm("Hapus elemen ini?")) {
          setProject(prev => {
              if (!prev) return null;
              const newPages = prev.pages.map(p => 
                  p.id === currentPageId 
                      ? {...p, elements: p.elements.filter(el => el.id !== selectedElement.id)} 
                      : p
              );
              return {...prev, pages: newPages};
          });
      }
  };
  
  const fontFamilies = ['Poppins', 'Playfair Display', 'Great Vibes', 'Arial', 'Verdana'];

  return (
    <aside className="w-64 bg-white border-l p-4 overflow-y-auto flex-shrink-0">
      <h3 className="text-lg font-semibold mb-4 text-main-text">Editor</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2 text-secondary-text">Tambah Elemen Baru</h4>
        <div className="flex gap-2">
            <button onClick={() => handleAddElement('text')} className="w-full bg-gray-100 hover:bg-gray-200 text-sm p-2 rounded">Tambah Teks</button>
            <label className="w-full bg-gray-100 hover:bg-gray-200 text-sm p-2 rounded cursor-pointer text-center">
                Tambah Gambar
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={!projectId} />
            </label>
        </div>
        {!projectId && <p className="text-xs text-red-500 mt-1">Simpan proyek terlebih dahulu untuk menambah gambar.</p>}
      </div>
      <hr className="my-4"/>
      
      {!selectedElement && <p className="text-sm text-secondary-text">Pilih sebuah elemen untuk diedit.</p>}
      
      {selectedElement && (
        <div>
          <h4 className="font-semibold text-sm mb-2 text-secondary-text">Properti Elemen</h4>

          {/* Common properties */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><label>X</label><input type="number" name="x" value={Math.round(selectedElement.x)} onChange={handleGenericChange} className="w-full mt-1 p-1 border rounded" /></div>
            <div><label>Y</label><input type="number" name="y" value={Math.round(selectedElement.y)} onChange={handleGenericChange} className="w-full mt-1 p-1 border rounded" /></div>
            <div><label>Lebar</label><input type="number" name="width" value={Math.round(selectedElement.width)} onChange={handleGenericChange} className="w-full mt-1 p-1 border rounded" /></div>
            <div><label>Tinggi</label><input type="number" name="height" value={Math.round(selectedElement.height)} onChange={handleGenericChange} className="w-full mt-1 p-1 border rounded" /></div>
            <div><label>Rotasi</label><input type="number" name="rotation" value={selectedElement.rotation} onChange={handleGenericChange} className="w-full mt-1 p-1 border rounded" /></div>
          </div>
          <hr className="my-3"/>
          
          {/* Text-specific properties */}
          {textElement && (
            <div className="space-y-2 text-sm">
              <div>
                <label>Teks</label>
                <textarea value={textElement.text} onChange={handleTextChange} className="w-full mt-1 p-1 border rounded" rows={4} />
              </div>
              <div>
                <label>Font</label>
                <select name="fontFamily" value={textElement.fontFamily} onChange={handleGenericChange} className="w-full mt-1 p-1 border rounded">
                  {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label>Ukuran</label><input type="number" name="fontSize" value={textElement.fontSize} onChange={handleGenericChange} className="w-full mt-1 p-1 border rounded" /></div>
                <div><label>Warna</label><input type="color" name="color" value={textElement.color} onChange={handleGenericChange} className="w-full mt-1 p-1 border rounded h-8" /></div>
              </div>
               <div>
                <label>Perataan</label>
                <select name="textAlign" value={textElement.textAlign} onChange={handleGenericChange} className="w-full mt-1 p-1 border rounded">
                  <option value="left">Kiri</option>
                  <option value="center">Tengah</option>
                  <option value="right">Kanan</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Image-specific properties could go here if any */}

          <button onClick={handleDeleteElement} className="w-full mt-4 bg-red-500 text-white text-sm p-2 rounded hover:bg-red-600">
            Hapus Elemen
          </button>
        </div>
      )}
    </aside>
  );
};

export default EditorToolbar;
