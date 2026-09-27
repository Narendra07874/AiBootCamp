import React from 'react';

interface HeaderProps {
  activeTab: 'studio' | 'presets' | 'drafts';
  onSelectTab: (tab: 'studio' | 'presets' | 'drafts') => void;
  onOpenGuide: () => void;
  onLoadSample: () => void;
  draftsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenGuide,
  onLoadSample,
  draftsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0a66c2] to-[#004182] flex items-center justify-center text-white shadow-sm shadow-[#0a66c2]/30">
            <span className="material-symbols-outlined text-[22px]">bolt</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 tracking-tight text-lg">EventPulse</span>
              <span className="text-[11px] font-semibold bg-[#e8f4fc] text-[#0a66c2] px-2 py-0.5 rounded-full border border-[#d0e8f9]">
                AI Studio
              </span>
            </div>
            <p className="text-xs text-gray-500 hidden sm:block">
              Turn event takeaways into high-impact LinkedIn posts
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
          <button
            onClick={() => onSelectTab('studio')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'studio'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            <span>Studio</span>
          </button>

          <button
            onClick={() => onSelectTab('presets')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">auto_stories</span>
            <span>Templates</span>
          </button>

          <button
            onClick={() => onSelectTab('drafts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'drafts'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">bookmarks</span>
            <span>Drafts</span>
            {draftsCount > 0 && (
              <span className="bg-[#0a66c2] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {draftsCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLoadSample}
            title="Load sample conference details to test immediately"
            className="hidden md:flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-[#0a66c2] bg-gray-50 hover:bg-[#e8f4fc]/50 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-[#0a66c2]">lightbulb</span>
            <span>Try Sample</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 text-xs font-semibold text-[#0a66c2] bg-[#e8f4fc] hover:bg-[#d5ecfb] border border-[#c1e2f8] px-3.5 py-1.5 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">help_outline</span>
            <span>How to Use</span>
          </button>
        </div>
      </div>
    </header>
  );
};
