import React from 'react';
import { SavedDraft } from '../types';

interface SavedDraftsProps {
  drafts: SavedDraft[];
  onLoadDraft: (draft: SavedDraft) => void;
  onDeleteDraft: (id: string) => void;
  onOpenStudio: () => void;
  onTriggerToast: (msg: string) => void;
}

export const SavedDrafts: React.FC<SavedDraftsProps> = ({
  drafts,
  onLoadDraft,
  onDeleteDraft,
  onOpenStudio,
  onTriggerToast,
}) => {
  const handleCopyText = (content: string) => {
    navigator.clipboard?.writeText(content).catch(() => {});
    onTriggerToast('Draft copied to clipboard!');
  };

  const handleShareLinkedIn = (content: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content).catch(() => {});
    }
    const shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
      content
    )}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    onTriggerToast('Opening LinkedIn with post! (Also copied to clipboard)');
  };

  if (drafts.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0a66c2] mx-auto flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">bookmark_border</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900">No Saved Drafts Yet</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
          Generate an AI post in the Studio and click "Save Draft" to keep your favorites here for later use or cross-posting.
        </p>
        <button
          onClick={onOpenStudio}
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Go to Post Studio</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Your Saved Drafts</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {drafts.length} post{drafts.length === 1 ? '' : 's'} ready to publish or adapt
          </p>
        </div>
        <button
          onClick={onOpenStudio}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Create New Post</span>
        </button>
      </div>

      <div className="space-y-4">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:border-[#0a66c2]/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-2.5 pb-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{draft.eventName}</span>
                  <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {draft.role}
                  </span>
                  <span className="text-[11px] font-semibold text-[#0a66c2] bg-blue-50 px-2 py-0.5 rounded capitalize">
                    {draft.tone.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  <span>{new Date(draft.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed font-sans line-clamp-4">
                {draft.content}
              </p>

              {draft.hashtags && draft.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {draft.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] text-[#0a66c2] bg-blue-50/70 px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] text-gray-400">
                {draft.content.length} characters • ~{Math.ceil(draft.content.split(/\s+/).length / 200)} min read
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopyText(draft.content)}
                  title="Copy text"
                  className="px-2.5 py-1 text-xs font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  <span>Copy</span>
                </button>

                <button
                  onClick={() => handleShareLinkedIn(draft.content)}
                  title="Share to LinkedIn"
                  className="px-2.5 py-1 text-xs font-semibold text-[#0a66c2] hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  <span>LinkedIn</span>
                </button>

                <button
                  onClick={() => {
                    onLoadDraft(draft);
                    onOpenStudio();
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>Edit in Studio</span>
                </button>

                <button
                  onClick={() => onDeleteDraft(draft.id)}
                  title="Delete draft"
                  className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
