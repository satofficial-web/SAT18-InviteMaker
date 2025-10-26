// types/exportSchema.ts
import { InvitationProject } from './types';

/**
 * Defines the structure for a single asset within the export file.
 * The binary blob data is encoded as a base64 string.
 */
export interface ExportAsset {
  originalAssetId: number; // The primary key from the original database
  data: string; // base64 encoded data URL
}

/**
 * Defines the root structure of the `.sat18.json` export file.
 * It includes metadata, the full project object (without its primary key),
 * and all associated assets.
 */
export interface ExportDataV1 {
  fileFormatVersion: '1.0';
  exportedAt: string; // ISO 8601 timestamp
  sourceApp: 'SAT18 InviteMaker';
  project: Omit<InvitationProject, 'id'>; // We use UUID as the core identifier
  assets: ExportAsset[];
}
