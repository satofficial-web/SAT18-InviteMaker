import React from 'react';

interface TemplateSelectionScreenProps {
  onSelectTemplate: (id: number) => void;
}

const TemplateSelectionScreen: React.FC<TemplateSelectionScreenProps> = ({ onSelectTemplate }) => {
  // Mock data for templates. In a real app, this would come from a config or API.
  const templates = [
    { id: 1, name: 'Elegan Floral' },
    { id: 2, name: 'Modern Minimalis' },
    { id: 3, name: 'Rustic Vintage' },
    { id: 4, name: 'Ceria Tropis' },
  ];
  
  // Placeholder for template thumbnail images
  const templateBgColors = [
    'bg-gradient-to-br from-rose-100 to-teal-100',
    'bg-gradient-to-br from-blue-100 to-indigo-200',
    'bg-gradient-to-br from-amber-100 to-yellow-200',
    'bg-gradient-to-br from-green-100 to-lime-200'
  ];

  return (
    <section className="p-6">
      <h1 className="text-3xl font-playfair font-bold text-center mb-8 text-main-text">Pilih Desain Undangan Anda</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {templates.map((template, index) => (
          <div 
            key={template.id} 
            className="group bg-white rounded-lg shadow-md hover:shadow-xl cursor-pointer overflow-hidden border transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => onSelectTemplate(template.id)}
            role="button"
            aria-label={`Select ${template.name}`}
            tabIndex={0}
          >
            <div className={`w-full h-40 object-cover ${templateBgColors[index]} flex items-center justify-center`}>
                <span className="font-playfair text-gray-600 opacity-50">Template Preview</span>
            </div>
            <div className="p-3 text-center font-semibold text-main-text group-hover:bg-accent group-hover:text-white transition-colors duration-300">
              {template.name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TemplateSelectionScreen;