import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="p-4 bg-white shadow-md flex justify-between items-center z-20">
      <h1 className="font-playfair text-xl font-bold text-accent">
        SAT18 Invitation
      </h1>
      <button className="text-sm text-secondary-text hover:text-main-text transition-colors">
        Bantuan
      </button>
    </header>
  );
};

export default Header;