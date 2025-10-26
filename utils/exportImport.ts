// utils/exportImport.ts
import { db } from '../db';
import { InvitationProject, Asset, ImageElement } from '../types';
import { ExportDataV1, ExportAsset } from '../types/exportSchema';

/**
 * Helper function to convert a Blob to a Base64 data URL string.
 * @param blob The blob to convert.
 * @returns A promise that resolves with the data URL.
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Helper function to convert a Base64 data URL string back to a Blob.
 * @param base64 The data URL to convert.
 * @returns A promise that resolves with the new Blob.
 */
async function base64ToBlob(base64: string): Promise<Blob> {
    const res = await fetch(base64);
    return res.blob();
}

/**
 * Exports a specified project and its assets to a .sat18.json file.
 * @param projectId The ID of the project to export.
 */
export async function exportProject(projectId: number): Promise<void> {
    try {
        const project = await db.projects.get(projectId);
        if (!project) {
            throw new Error('Proyek tidak ditemukan.');
        }

        const assets = await db.assets.where({ projectId }).toArray();
        
        const exportAssets: ExportAsset[] = await Promise.all(assets.map(async (asset) => {
            if (!asset.id) return null;
            const base64Data = await blobToBase64(asset.blob);
            return {
                originalAssetId: asset.id,
                data: base64Data
            };
        })).then(results => results.filter(Boolean) as ExportAsset[]);
        
        // Exclude the auto-incremented primary key from the exported data
        const { id, ...projectDataToExport } = project;

        const exportData: ExportDataV1 = {
            fileFormatVersion: '1.0',
            exportedAt: new Date().toISOString(),
            sourceApp: 'SAT18 InviteMaker',
            project: projectDataToExport,
            assets: exportAssets
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        const safeName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.download = `${safeName}.sat18.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Gagal mengekspor:', error);
        alert(`Gagal mengekspor proyek. Silakan lihat konsol untuk detail.`);
    }
}

/**
 * Imports a project from a .sat18.json file into the database.
 * The project is always imported as a new entity to prevent accidental overwrites.
 * @param file The .sat18.json file to import.
 */
export async function importProject(file: File): Promise<void> {
    const fileContent = await file.text();
    const importedData = JSON.parse(fileContent) as ExportDataV1;

    // Basic validation of the file structure
    if (importedData.fileFormatVersion !== '1.0' || !importedData.project || !importedData.assets) {
        throw new Error('Format file tidak valid atau rusak.');
    }

    await db.transaction('rw', db.projects, db.assets, async () => {
        const projectToImport = importedData.project;
        
        // Assign a new UUID and update modification date
        projectToImport.uuid = crypto.randomUUID();
        projectToImport.lastModified = Date.now();
        projectToImport.name = `${projectToImport.name} (Impor)`;

        const newProjectId = await db.projects.add(projectToImport as InvitationProject);
        
        const assetIdMap = new Map<number, number>();
        for (const asset of importedData.assets) {
            const blob = await base64ToBlob(asset.data);
            const newAssetId = await db.assets.add({ projectId: newProjectId, blob });
            assetIdMap.set(asset.originalAssetId, newAssetId);
        }

        // Retrieve the newly created project to update asset references
        const newProject = await db.projects.get(newProjectId);
        if (!newProject) throw new Error('Gagal mengambil proyek yang baru dibuat untuk pembaruan.');
        
        newProject.pages = newProject.pages.map(page => ({
            ...page,
            elements: page.elements.map(el => {
                if (el.type === 'image') {
                    const oldAssetId = (el as ImageElement).srcAssetId;
                    const newAssetId = assetIdMap.get(oldAssetId);
                    if (newAssetId) {
                        return { ...el, srcAssetId: newAssetId };
                    }
                }
                return el;
            })
        }));
        
        await db.projects.put(newProject);
    });
}
