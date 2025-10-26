import React, { useState, useEffect, useRef } from 'react';
import { db } from '../db';
import { InvitationProject } from '../types';
import { exportProject, importProject } from '../utils/exportImport';

interface ProjectManagerScreenProps {
  onOpenProject: (id: number) => void;
  onCreateNew: () => void;
}

const ProjectManagerScreen: React.FC<ProjectManagerScreenProps> = ({ onOpenProject, onCreateNew }) => {
  const [projects, setProjects] = useState<InvitationProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    const savedProjects = await db.projects.orderBy('lastModified').reverse().toArray();
    setProjects(savedProjects);
    setIsLoading(false);
  };
  
  const handleDeleteProject = async (projectId?: number) => {
    if (!projectId) return;
    if (confirm("Apakah Anda yakin ingin menghapus proyek ini? Seluruh data dan gambar terkait akan dihapus permanen.")) {
        try {
            await db.transaction('rw', db.projects, db.assets, async () => {
                await db.assets.where({ projectId }).delete();
                await db.projects.delete(projectId);
            });
            await loadProjects();
        } catch(err) {
            console.error("Gagal menghapus proyek:", err);
            alert("Gagal menghapus proyek.");
        }
    }
  };
  
  const handleRenameProject = async (project: InvitationProject) => {
    const newName = prompt("Masukkan nama proyek baru:", project.name);
    if (newName && newName.trim() !== "" && project.id) {
        try {
            await db.projects.update(project.id, { name: newName.trim(), lastModified: Date.now() });
            await loadProjects();
        } catch(err) {
            console.error("Gagal mengganti nama proyek:", err);
            alert("Gagal mengganti nama proyek.");
        }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      await importProject(file);
      alert('Proyek berhasil diimpor!');
      await loadProjects();
    } catch (error) {
      console.error('Gagal mengimpor:', error);
      alert(`Gagal mengimpor proyek: ${error instanceof Error ? error.message : 'Kesalahan tidak diketahui'}`);
      setIsLoading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportProject = async (projectId?: number) => {
    if (!projectId) return;
    await exportProject(projectId);
  };

  return (
    <section className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-playfair font-bold text-main-text">Proyek Saya</h1>
        <div className="flex gap-4">
            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                className="hidden"
                accept=".sat18.json,.json"
            />
            <button
                onClick={handleImportClick}
                className="bg-white border border-gray-300 text-main-text font-bold py-2 px-4 rounded shadow-md hover:bg-gray-100 transition-transform transform hover:scale-105"
            >
                Impor Proyek
            </button>
            <button 
                onClick={onCreateNew}
                className="bg-accent text-white font-bold py-2 px-4 rounded shadow-md hover:bg-accent/90 transition-transform transform hover:scale-105"
            >
              + Proyek Baru
            </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10"><p className="text-secondary-text animate-pulse">Memuat proyek...</p></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-main-text">Selamat Datang!</h2>
            <p className="text-secondary-text mt-2">Anda belum memiliki proyek. Klik "Buat Proyek Baru" atau "Impor Proyek" untuk memulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-white rounded-lg shadow-md hover:shadow-xl border transition-all duration-300 flex flex-col p-4">
              <div className="flex-1 mb-4">
                <h3 className="font-bold text-lg text-main-text truncate" title={project.name}>{project.name}</h3>
                <p className="text-xs text-secondary-text mt-1">
                  Diubah: {new Date(project.lastModified).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="border-t pt-3 flex justify-end items-center gap-4 text-sm">
                 <button 
                    onClick={() => onOpenProject(project.id!)}
                    className="font-semibold text-accent hover:underline"
                 >
                    Buka
                 </button>
                 <button 
                    onClick={() => handleExportProject(project.id)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                 >
                    Ekspor
                 </button>
                 <button 
                    onClick={() => handleRenameProject(project)}
                    className="text-secondary-text hover:text-main-text hover:underline"
                >
                    Ganti Nama
                </button>
                <button 
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-500 hover:text-red-700 hover:underline"
                >
                    Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProjectManagerScreen;
