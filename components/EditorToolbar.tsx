import React, { useRef } from 'react';
import { InvitationElement, TextElement } from '../types';

interface EditorToolbarProps {
  selectedElement: InvitationElement | null;
  updateElement: (id: string, updates: Partial<InvitationElement>) => void;
  updateElementsOnCurrentPage: (updater: (elements: InvitationElement[]) => InvitationElement[]) => void;
  onBack: () => void;
  onPreview: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ selectedElement, updateElement, updateElementsOnCurrentPage, onBack, onPreview }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedElement) {
      updateElement(selectedElement.id, { fontFamily: e.target.value as TextElement['fontFamily'] });
    }
  };

  const handleAddText = () => {
    const newTextElement: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 50,
      width: 300,
      height: 50,
      rotation: 0,
      text: 'Teks Baru',
      fontFamily: 'Poppins',
      fontSize: 20,
      color: '#1e293b',
      textAlign: 'center',
    };
    updateElementsOnCurrentPage(prev => [...prev, newTextElement]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImageElement = {
          id: `image-${Date.now()}`,
          type: 'image' as const,
          x: 50,
          y: 100,
          width: 200,
          height: 150,
          rotation: 0,
          src: event.target?.result as string,
        };
        updateElementsOnCurrentPage(prev => [...prev, newImageElement]);
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value to allow uploading the same file again
    if(e.target) e.target.value = '';
  };

  const selectedTextElement = selectedElement?.type === 'text' ? selectedElement : null;

  return (
    <div className="flex-shrink-0 flex justify-between items-center bg-white shadow-md px-4 py-2 z-10 text-sm">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-blue-500 hover:underline">
          ← Mulai Baru
        </button>
        <button onClick={handleAddText} className="font-semibold hover:text-accent">Tambah Teks</button>
        <button onClick={() => imageInputRef.current?.click()} className="font-semibold hover:text-accent">Tambah Gambar</button>
        <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      </div>
      
      {selectedTextElement && (
        <div className="flex items-center gap-2">
            <label htmlFor="font-select" className="text-secondary-text">Font:</label>
            <select
                id="font-select"
                value={selectedTextElement.fontFamily}
                onChange={handleFontChange}
                className="border border-gray-300 rounded px-2 py-1"
            >
                <option value="Poppins">Poppins</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Great Vibes">Great Vibes</option>
            </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button onClick={onPreview} className="bg-gray-500 text-white px-3 py-1 rounded shadow hover:bg-gray-600 font-semibold">
          Preview
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;