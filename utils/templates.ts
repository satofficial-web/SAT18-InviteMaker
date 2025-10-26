import { InvitationElement, InvitationPage } from '../types';

export function getInitialPagesForTemplate(templateId: number): InvitationPage[] {
  const commonElements: InvitationElement[] = [
    {
      id: 'title',
      type: 'text',
      x: 25,
      y: 100,
      width: 350,
      height: 80,
      rotation: 0,
      text: 'The Wedding Of',
      fontFamily: 'Great Vibes',
      fontSize: 50,
      color: '#1e293b',
      textAlign: 'center',
    },
    {
      id: 'bride-name',
      type: 'text',
      x: 25,
      y: 200,
      width: 350,
      height: 50,
      rotation: 0,
      text: 'Jane Doe',
      fontFamily: 'Playfair Display',
      fontSize: 32,
      color: '#1e293b',
      textAlign: 'center',
    },
    {
      id: 'groom-name',
      type: 'text',
      x: 25,
      y: 280,
      width: 350,
      height: 50,
      rotation: 0,
      text: 'John Smith',
      fontFamily: 'Playfair Display',
      fontSize: 32,
      color: '#1e293b',
      textAlign: 'center',
    },
     {
      id: 'date-info',
      type: 'text',
      x: 50,
      y: 400,
      width: 300,
      height: 100,
      rotation: 0,
      text: 'Sabtu, 18 Desember 2025\nPukul 09:00 WIB\nGrand Ballroom Hotel',
      fontFamily: 'Poppins',
      fontSize: 14,
      color: '#64748b',
      textAlign: 'center',
    },
  ];

  let elements: InvitationElement[];
  // Customize elements based on templateId if needed
  switch (templateId) {
    case 1:
      elements = commonElements.map(el => el.id === 'title' ? {...el, color: '#854d0e'} : el);
      break;
    case 2:
      elements = commonElements.map(el => el.id === 'title' ? {...el, fontFamily: 'Poppins', fontSize: 24, text: 'UNDANGAN PERNIKAHAN'} : el);
      break;
    default:
      elements = commonElements;
  }
  
  return [
    {
      id: `page-${Date.now()}`,
      name: "Halaman Utama",
      elements: elements,
      templateId: templateId
    }
  ];
}