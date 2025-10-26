// types.ts

// Represents a single design element on a page (e.g., text, image)
export interface BaseElement {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  srcAssetId: number; // Foreign key to an Asset in IndexedDB
}

export type InvitationElement = TextElement | ImageElement;

// Represents a single page within an invitation project
export interface InvitationPage {
  id: string;
  name: string;
  elements: InvitationElement[];
  templateId: number;
}

// Represents the entire invitation project
export interface InvitationProject {
  id?: number; // Auto-incremented primary key in IndexedDB
  uuid: string; // A unique identifier for session management/sharing
  name: string;
  pages: InvitationPage[];
  lastModified: number; // Timestamp
}

// Represents a binary asset (like an image) stored in IndexedDB
export interface Asset {
  id?: number; // Auto-incremented primary key
  projectId: number; // Foreign key to the project
  blob: Blob;
}
