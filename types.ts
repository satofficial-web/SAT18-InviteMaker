export type AppView = 'templateSelection' | 'editor' | 'preview';

// --- Element Types for Editor Canvas ---

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
  fontFamily: 'Poppins' | 'Playfair Display' | 'Great Vibes';
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string; // Base64 data URL
}

export type InvitationElement = TextElement | ImageElement;

// --- Multi-page Project Structure ---

export interface InvitationPage {
  id: string;
  name: string;
  elements: InvitationElement[];
  templateId: number;
}

export interface InvitationProject {
  id: string; // A constant ID for the current project
  name: string;
  lastModified: number;
  pages: InvitationPage[];
}