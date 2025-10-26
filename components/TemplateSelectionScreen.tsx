import React, { useState } from 'react';
import Modal from './Modal';
import { db } from '../db';
import { getInitialPagesForTemplate } from '../utils/templates';
import { InvitationProject } from '../types';

interface TemplateSelectionScreenProps {
  onProjectCreated: (id: number) => void;
  onBack: () => void;
}

const TemplateSelectionScreen: React.FC<TemplateSelectionScreenProps> = ({ onProjectCreated, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  
  const templates = [
    { id: 1, name: 'Elegan Floral' },
    { id: 2, name: 'Modern Minimalis' },
    { id: 3, name: 'Rustic Vintage' },
    { id: 4, name: 'Ceria Tropis' },
  ];
  
  const templateBgColors = [
    'bg-gradient-to-br from-rose-100 to-teal-100',
    'bg-gradient-to-br from-blue-100 to-indigo-200',
    'bg-gradient-to-br from-amber-100 to-yellow-200',
    'bg-gradient-to-br from-green-100 to-lime-200'
  ];

  const handleSelectTemplate = (id: number) => {
    setSelectedTemplateId(id);
    setNewProjectName(`Proyek Baru (${new Date().toLocaleDateString('id-ID')})`);
    setIsModalOpen(true);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !selectedTemplateId) {
      alert("Nama proyek tidak valid.");
      return;
    }

    const initialPages = getInitialPagesForTemplate(selectedTemplateId);
    const newProject: Omit<InvitationProject, 'id'> = {
      uuid: crypto.randomUUID(),
      name: newProjectName.trim(),
      lastModified: Date.now(),
      pages: initialPages,
    };

    try {
      const newId = await db.projects.add(newProject as InvitationProject);
      onProjectCreated(newId);
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Gagal membuat proyek baru.");
    }
  };


  return (
    <>
    <section className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-playfair font-bold text-main-text">Pilih Desain Undangan</h1>
        <button onClick={onBack} className="text-sm text-secondary-text hover:underline">
            Kembali ke Daftar Proyek
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {templates.map((template, index) => (
          <div 
            key={template.id} 
            className="group bg-white rounded-lg shadow-md hover:shadow-xl cursor-pointer overflow-hidden border transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => handleSelectTemplate(template.id)}
            role="button"
            aria-label={`Select ${template.name}`}
            tabIndex={0}
          >
            <div className={`w-full h-40 object-cover ${templateBgColors[index]} flex items-center justify-center`}>
                <span className="font-playfair text-gray-600 opacity-50">Template Preview</span>
            </div>
            <div className="p-3 text-center font-semibold text-main-text group-hover:bg-accent group-hover:text-white transition-colors duration-300">
              {template.name}
            </div>
          </div>
        ))}
      </div>
    </section>

    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Proyek Baru">
        <div className="space-y-4">
            <p className="text-sm text-secondary-text">Berikan nama untuk proyek undangan Anda.</p>
            <input 
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Contoh: Pernikahan Budi & Ani"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-accent focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
            />
            <div className="flex justify-end gap-2">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md text-sm text-secondary-text hover:bg-gray-100">Batal</button>
               <button onClick={handleCreateProject} className="px-4 py-2 rounded-md bg-accent text-white text-sm font-semibold hover:bg-accent/90">Buat & Mulai Edit</button>
            </div>
        </div>
    </Modal>
    </>
  );
};

export default TemplateSelectionScreen;
