import React, { useState } from 'react';
import { GeneratedPostResult } from '../types';

interface LinkedInPreviewProps {
  postResult: GeneratedPostResult | null;
  editedContent: string;
  onContentChange: (newContent: string) => void;
  eventName: string;
  role: string;
  onSaveDraft: () => void;
  onOpenHooksModal: () => void;
  onTriggerPolish: (action: 'shorten' | 'punchy' | 'add_cta') => void;
  isPolishing: boolean;
  onTriggerToast: (msg: string) => void;
  imageUrl?: string;
  onToggleImage: (hasImage: boolean) => void;
  hasImage: boolean;
  isGenerating?: boolean;
  onRemoveImage?: () => void;
}

export const LinkedInPreview: React.FC<LinkedInPreviewProps> = ({
  postResult,
  editedContent,
  onContentChange,
  eventName,
  role,
  onSaveDraft,
  onOpenHooksModal,
  onTriggerPolish,
  isPolishing,
  onTriggerToast,
  imageUrl,
  onToggleImage,
  hasImage,
  isGenerating = false,
  onRemoveImage,
}) => {
  const [isEditingDirectly, setIsEditingDirectly] = useState(false);
  const [authorName, setAuthorName] = useState('Alex Chen');
  const authorHeadline = eventName
    ? `${role || 'Attendee'} • Attending ${eventName}`
    : `${role || 'Attendee'} • Industry Professional`;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(24);

  const characterCount = editedContent.length;
  const wordCount = editedContent.trim() ? editedContent.trim().split(/\s+/).length : 0;
  const readTimeSeconds = Math.max(10, Math.ceil((wordCount / 200) * 60));

  const handleCopy = () => {
    if (!editedContent) return;
    navigator.clipboard?.writeText(editedContent).catch(() => {});
    onTriggerToast('Copied post to clipboard!');
  };

  const handleShareToLinkedIn = () => {
    if (!editedContent) return;
    // Copy to clipboard for guaranteed access and fallback
    if (navigator.clipboard) {
      navigator.clipboard.writeText(editedContent).catch(() => {});
    }
    const shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
      editedContent
    )}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    onTriggerToast('Opening LinkedIn with your post! (Also copied to clipboard)');
  };

  const handleToggleLike = () => {
    if (!isLiked) {
      setLikeCount((p) => p + 1);
      setIsLiked(true);
    } else {
      setLikeCount((p) => p - 1);
      setIsLiked(false);
    }
  };

  // Calculate readability score
  const readabilityScore = editedContent
    ? Math.min(
        98,
        Math.max(
          65,
          Math.round(
            85 +
              (editedContent.includes('\n\n') ? 5 : -5) -
              (characterCount > 1500 ? 10 : 0) +
              (postResult?.viralityScore ? (postResult.viralityScore - 80) / 4 : 0)
          )
        )
      )
    : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2">
          {isGenerating ? (
            <span className="text-xs font-bold text-[#0a66c2] flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0a66c2] animate-ping"></span>
              <span>Gemini is generating post...</span>
            </span>
          ) : (
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              LinkedIn Feed Preview
            </span>
          )}
          <button
            onClick={() => setIsEditingDirectly(!isEditingDirectly)}
            disabled={isGenerating}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
              isEditingDirectly
                ? 'bg-[#0a66c2] text-white font-medium'
                : 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 disabled:opacity-40'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {isEditingDirectly ? 'visibility' : 'edit'}
            </span>
            <span>{isEditingDirectly ? 'Preview Mode' : 'Edit Text'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onSaveDraft}
            disabled={!editedContent || isGenerating}
            title="Save draft"
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 disabled:opacity-40 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
          </button>

          <button
            onClick={handleCopy}
            disabled={!editedContent || isGenerating}
            className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
            <span>Copy</span>
          </button>

          <button
            onClick={handleShareToLinkedIn}
            disabled={!editedContent || isGenerating}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
            <span>Post to LinkedIn</span>
          </button>
        </div>
      </div>

      {/* Realistic LinkedIn Post Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all">
        {/* Author Header */}
        <div className="p-4 flex items-start justify-between border-b border-gray-50">
          <div className="flex gap-3 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-2xs"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0a66c2] text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                in
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-gray-900 hover:text-[#0a66c2] cursor-pointer">
                  {authorName}
                </span>
                <span className="text-[11px] text-gray-400 font-medium">• 1st</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">{authorHeadline}</p>
              <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                <span>{isGenerating ? 'Writing draft...' : 'Just now'}</span>
                <span>•</span>
                <span className="material-symbols-outlined text-[13px]">public</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-gray-400">
            <button
              onClick={() => onToggleImage(!hasImage)}
              title={hasImage ? 'Remove photo preview' : 'Attach photo preview'}
              className={`p-1.5 rounded-lg border transition-colors ${
                hasImage
                  ? 'text-[#0a66c2] bg-blue-50 border-blue-200'
                  : 'text-gray-400 hover:text-gray-600 border-gray-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {hasImage ? 'image' : 'hide_image'}
              </span>
            </button>
          </div>
        </div>

        {/* Post Body Content */}
        <div className="p-4 sm:p-5">
          {isGenerating ? (
            <div className="py-6 px-1 space-y-3.5">
              <div className="flex items-center gap-2 bg-[#e8f4fc] text-[#0a66c2] px-3 py-1.5 rounded-lg border border-[#c2e2f8] text-xs font-semibold w-fit">
                <div className="w-3.5 h-3.5 border-2 border-[#0a66c2] border-t-transparent rounded-full animate-spin"></div>
                <span>Gemini AI is crafting your LinkedIn post...</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-md w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-md w-4/6 animate-pulse"></div>
              <div className="h-3 bg-gray-100 rounded-md w-full animate-pulse mt-3"></div>
              <div className="h-3 bg-gray-100 rounded-md w-11/12 animate-pulse"></div>
              <div className="h-3 bg-gray-100 rounded-md w-4/5 animate-pulse"></div>
              <div className="pt-2 flex gap-2">
                <div className="h-3.5 bg-blue-100 rounded-md w-20 animate-pulse"></div>
                <div className="h-3.5 bg-blue-100 rounded-md w-24 animate-pulse"></div>
                <div className="h-3.5 bg-blue-100 rounded-md w-16 animate-pulse"></div>
              </div>
            </div>
          ) : isEditingDirectly ? (
            <textarea
              value={editedContent}
              onChange={(e) => onContentChange(e.target.value)}
              rows={12}
              className="w-full text-sm text-gray-800 leading-relaxed font-sans border border-blue-300 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 resize-y"
              placeholder="Post text here..."
            />
          ) : editedContent ? (
            <div className="text-[13.5px] text-gray-900 leading-relaxed font-sans whitespace-pre-line space-y-2 select-text">
              {editedContent}
            </div>
          ) : (
            <div className="py-14 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0a66c2] flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-[26px]">post_add</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-800">Your Generated LinkedIn Post Will Appear Here</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Add your event details and notes on the left, then click <strong className="text-gray-700">"Generate Post with AI"</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Suggested Trending Hashtags Strip */}
        {postResult?.suggestedHashtags && postResult.suggestedHashtags.length > 0 && editedContent && (
          <div className="px-4 py-2 bg-gradient-to-r from-blue-50/80 to-slate-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-[#0a66c2]">tag</span>
                Trending Tags:
              </span>
              {postResult.suggestedHashtags.map((tag) => {
                const clean = tag.startsWith('#') ? tag : `#${tag}`;
                const isIncluded = editedContent.toLowerCase().includes(clean.toLowerCase());
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (!isIncluded) {
                        onContentChange(`${editedContent}\n\n${clean}`);
                        onTriggerToast(`Added ${clean} to post!`);
                      } else {
                        onTriggerToast(`${clean} is already in the post`);
                      }
                    }}
                    title={isIncluded ? 'Already in post' : 'Click to append to post'}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-mono transition-colors flex items-center gap-0.5 cursor-pointer ${
                      isIncluded
                        ? 'bg-blue-100 text-[#0a66c2] font-semibold'
                        : 'bg-white hover:bg-[#0a66c2] hover:text-white text-[#0a66c2] border border-blue-200'
                    }`}
                  >
                    <span>{isIncluded ? '✓' : '+'}</span>
                    <span>{clean}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                const missingTags = postResult.suggestedHashtags
                  .map((t) => (t.startsWith('#') ? t : `#${t}`))
                  .filter((t) => !editedContent.toLowerCase().includes(t.toLowerCase()));
                if (missingTags.length === 0) {
                  onTriggerToast('All hashtags already in post!');
                  return;
                }
                onContentChange(`${editedContent}\n\n${missingTags.join(' ')}`);
                onTriggerToast('Appended trending hashtags to post!');
              }}
              className="text-[11px] font-bold text-[#0a66c2] hover:underline cursor-pointer"
            >
              + Add All to Post
            </button>
          </div>
        )}

        {/* Optional Attached Media Preview */}
        {hasImage && imageUrl && (editedContent || isGenerating) && (
          <div className="border-t border-gray-100 relative group overflow-hidden max-h-72 bg-gray-900 flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Event banner"
              className="w-full h-full object-cover object-center max-h-72"
            />
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">photo_camera</span>
              <span>{eventName || 'Conference Venue'}</span>
            </div>

            {onRemoveImage && (
              <button
                type="button"
                onClick={onRemoveImage}
                title="Remove photo from post"
                className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1 rounded-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] px-2 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
                <span>Remove</span>
              </button>
            )}
          </div>
        )}

        {/* Social Metrics Bar - only when content is present */}
        {(editedContent || isGenerating) && (
          <>
            <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center -space-x-1">
                  <span className="w-4 h-4 rounded-full bg-[#0a66c2] text-white flex items-center justify-center text-[9px] shadow-xs">
                    👍
                  </span>
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                    ❤️
                  </span>
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                    💡
                  </span>
                </span>
                <span className="text-[11px] font-medium ml-1">{likeCount}</span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                <span>8 comments</span>
                <span>•</span>
                <span>3 reposts</span>
              </div>
            </div>

            {/* LinkedIn Interaction Bar */}
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <button
                onClick={handleToggleLike}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isLiked ? 'text-[#0a66c2] bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isLiked ? 'thumb_up' : 'thumb_up_off_alt'}
                </span>
                <span>Like</span>
              </button>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                <span>Comment</span>
              </button>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-[18px]">repeat</span>
                <span>Repost</span>
              </button>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Send</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* AI Fine-Tuning & Polish Quick Bar */}
      {editedContent && (
        <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#0a66c2] text-[16px]">magic_button</span>
              <span>AI Polish Tools</span>
            </span>
            {isPolishing && (
              <span className="text-[11px] text-[#0a66c2] animate-pulse font-medium">
                Polishing draft with Gemini...
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={onOpenHooksModal}
              disabled={isPolishing}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-[#0a66c2]/40 text-xs font-medium text-gray-700 hover:text-[#0a66c2] transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">bolt</span>
              <span>Viral Hooks</span>
            </button>

            <button
              onClick={() => onTriggerPolish('shorten')}
              disabled={isPolishing}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-[#0a66c2]/40 text-xs font-medium text-gray-700 hover:text-[#0a66c2] transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">content_cut</span>
              <span>Shorten Fluff</span>
            </button>

            <button
              onClick={() => onTriggerPolish('punchy')}
              disabled={isPolishing}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-[#0a66c2]/40 text-xs font-medium text-gray-700 hover:text-[#0a66c2] transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">electric_bolt</span>
              <span>Make Punchy</span>
            </button>

            <button
              onClick={() => onTriggerPolish('add_cta')}
              disabled={isPolishing}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-[#0a66c2]/40 text-xs font-medium text-gray-700 hover:text-[#0a66c2] transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">question_answer</span>
              <span>Strong CTA</span>
            </button>
          </div>
        </div>
      )}

      {/* Post Quality HUD */}
      <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-xs">
        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-gray-100">
          <div>
            <span className="text-[11px] text-gray-400 uppercase font-medium">Characters</span>
            <p className="text-sm font-bold text-gray-800 mt-0.5">
              {characterCount} <span className="text-[11px] font-normal text-gray-400">/ 3000</span>
            </p>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 uppercase font-medium">Read Time</span>
            <p className="text-sm font-bold text-gray-800 mt-0.5">
              {editedContent ? `${readTimeSeconds} sec` : '0 sec'}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 uppercase font-medium">Readability</span>
            <p
              className={`text-sm font-bold mt-0.5 ${
                readabilityScore > 0 ? 'text-emerald-600' : 'text-gray-400'
              }`}
            >
              {readabilityScore > 0 ? `${readabilityScore}%` : '--'}
            </p>
          </div>
        </div>

        {postResult?.viralityTip ? (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-600">
            <span className="material-symbols-outlined text-[16px] text-[#0a66c2] shrink-0 mt-0.5">
              psychology
            </span>
            <p className="leading-relaxed">
              <strong className="text-gray-900 font-semibold">Algorithm Tip:</strong>{' '}
              {postResult.viralityTip}
            </p>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <span className="material-symbols-outlined text-[14px]">insights</span>
            <span>Virality & algorithm tips will appear after generating your post</span>
          </div>
        )}
      </div>
    </div>
  );
};
