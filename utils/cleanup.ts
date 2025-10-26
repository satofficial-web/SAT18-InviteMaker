// utils/cleanup.ts
import { db } from '../db';

/**
 * Finds and removes assets that are not associated with any existing project.
 * This can happen if a project deletion fails midway or other bugs occur.
 */
export async function cleanupOrphanedAssets(): Promise<void> {
  try {
    console.log("Running safeguard cleanup for orphaned assets...");
    // Get all unique project IDs that are supposed to exist.
    const allProjectIds = new Set(await db.projects.toCollection().primaryKeys());

    // Find all assets whose 'projectId' is NOT in the set of valid project IDs.
    const orphanedAssets = await db.assets.filter(asset => !allProjectIds.has(asset.projectId)).toArray();

    if (orphanedAssets.length > 0) {
      const orphanedIds = orphanedAssets.map(asset => asset.id);
      console.log(`Found ${orphanedAssets.length} orphaned assets. Cleaning up...`);
      await db.assets.bulkDelete(orphanedIds as number[]);
      console.log("Cleanup complete.");
    } else {
      console.log("No orphaned assets found. Database is clean.");
    }
  } catch (error) {
    console.error("Error during orphaned asset cleanup:", error);
  }
}
