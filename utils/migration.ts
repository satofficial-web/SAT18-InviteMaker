// utils/migration.ts
import { db } from '../db';
import { InvitationProject, InvitationPage, ImageElement } from '../types';

const LEGACY_STORAGE_KEY = 'sat18-invitation-session';
const MIGRATION_FLAG_KEY = 'sat18-migration-v1-complete';

// Helper to convert data URL to Blob
async function dataURLToBlob(dataurl: string): Promise<Blob> {
    const res = await fetch(dataurl);
    return await res.blob();
}

export async function migrateFromLocalStorage(): Promise<number | null> {
    const migrationDone = localStorage.getItem(MIGRATION_FLAG_KEY);
    if (migrationDone) {
        return null; // Migration already performed
    }

    const legacyStateJSON = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyStateJSON) {
        localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
        return null; // Nothing to migrate
    }

    try {
        console.log("Starting migration from localStorage to IndexedDB...");
        const { selectedTemplateId, elements } = JSON.parse(legacyStateJSON);

        // 1. Create a new project structure
        const newProjectData: InvitationProject = {
            uuid: `migrated-${Date.now()}`,
            name: 'Proyek Lama',
            lastModified: Date.now(),
            pages: [{
                id: `page-${Date.now()}`,
                name: 'Halaman Utama',
                elements: [], // Will be populated after assets are created
                templateId: selectedTemplateId,
            }],
        };
        const projectId = await db.projects.add(newProjectData);

        // 2. Process elements: find images, save them as assets, update element refs
        const newElements = [];
        for (const el of elements) {
            if (el.type === 'image' && el.src) {
                const blob = await dataURLToBlob(el.src);
                const assetId = await db.assets.add({ projectId, blob });
                
                // Create new image element with assetId, remove src
                const newImageEl: ImageElement = { ...el, srcAssetId: assetId };
                delete (newImageEl as any).src;
                newElements.push(newImageEl);
            } else {
                newElements.push(el);
            }
        }
        
        // 3. Update the project with the migrated elements
        const projectToUpdate = await db.projects.get(projectId);
        if (projectToUpdate) {
            projectToUpdate.pages[0].elements = newElements;
            await db.projects.put(projectToUpdate);
        }

        // 4. Clean up
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
        console.log("Migration successful. Project ID:", projectId);
        return projectId;

    } catch (error) {
        console.error("Migration failed:", error);
        // If migration fails, don't set the flag so it can be retried.
        // Don't delete legacy data either.
        return null;
    }
}
