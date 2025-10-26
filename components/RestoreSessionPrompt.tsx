import React from 'react';

interface RestoreSessionPromptProps {
  onConfirm: () => void;
  onDismiss: () => void;
}

const RestoreSessionPrompt: React.FC<RestoreSessionPromptProps> = ({ onConfirm, onDismiss }) => {
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 m-4 rounded-md shadow-md" role="alert">
      <div className="flex">
        <div className="py-1">
          <svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8h2v2H9v-2z"/></svg>
        </div>
        <div>
          <p className="font-bold">Proyek Lama Ditemukan</p>
          <p className="text-sm">Kami menemukan proyek yang belum disimpan dari sesi sebelumnya. Apakah Anda ingin memulihkannya?</p>
          <div className="mt-2">
            <button onClick={onConfirm} className="bg-yellow-500 text-white font-bold py-1 px-3 rounded text-sm mr-2 hover:bg-yellow-600">
              Ya, Pulihkan
            </button>
            <button onClick={onDismiss} className="text-yellow-600 font-semibold py-1 px-3 rounded text-sm hover:underline">
              Tidak, Abaikan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestoreSessionPrompt;
