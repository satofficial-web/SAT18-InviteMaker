import Dexie, { Table } from 'dexie';
import { InvitationProject } from './types';

// Augment the Dexie interface
export class SAT18InvitationDB extends Dexie {
  projects!: Table<InvitationProject>; 

  constructor() {
    super('SAT18InvitationDB');
    // FIX: Cast `this` to Dexie to make the `version` method available to TypeScript.
    // This resolves a type inference issue where the method was not found on the subclass.
    (this as Dexie).version(1).stores({
      projects: 'id', // Primary key
    });
  }
}

export const db = new SAT18InvitationDB();

export const PROJECT_ID = 'current_project';