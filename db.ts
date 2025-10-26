// Fix: A value import for `Table` is required for Dexie subclassing. The previous `import type`
// prevented TypeScript from recognizing inherited methods like `.version()` and `.transaction()`.
import Dexie, { Table } from 'dexie';
import { InvitationProject, Asset } from './types';

export class SAT18InvitationDB extends Dexie {
  projects!: Table<InvitationProject, number>;
  assets!: Table<Asset, number>;

  constructor() {
    super('SAT18InvitationDB');
    this.version(2).stores({
      projects: '++id, &uuid, name, lastModified',
      assets: '++id, projectId',
    }).upgrade(tx => {
      // This upgrade path handles the schema change from version 1 to 2
      // For users who had the old single-key 'projects' table.
      return tx.table('projects').toCollection().modify(proj => {
        // Add a uuid if it doesn't exist from the old schema
        if (!proj.uuid) {
          proj.uuid = `migrated-${Date.now()}-${Math.random()}`;
        }
      });
    });
  }
}

export const db = new SAT18InvitationDB();