import React from 'react';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gray-900/95 text-white rounded-xl shadow-2xl animate-in slide-in-from-bottom-3 duration-200 border border-gray-700/60 backdrop-blur-md">
      <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
      <span className="text-xs font-medium text-gray-100">{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 text-gray-400 hover:text-white p-0.5 rounded transition-colors"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    </div>
  );
};
