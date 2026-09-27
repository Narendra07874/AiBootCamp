export type ToneOption =
  | 'thought_leader'
  | 'storyteller'
  | 'bullet_takeaways'
  | 'gratitude'
  | 'discussion_starter';

export type LengthOption = 'concise' | 'standard' | 'in_depth';

export interface PostGenerationParams {
  eventName: string;
  theme: string;
  role: string;
  highlights: string;
  tone: ToneOption;
  length: LengthOption;
  includeEmojis: boolean;
  customTags: string;
}

export interface GeneratedPostResult {
  hook: string;
  content: string;
  suggestedHashtags: string[];
  keyTakeaways: string[];
  viralityScore: number;
  viralityTip: string;
}

export interface SavedDraft {
  id: string;
  createdAt: string;
  eventName: string;
  role: string;
  tone: ToneOption;
  content: string;
  hashtags: string[];
  imageUrl?: string;
  viralityScore?: number;
}

export interface HookVariation {
  type: string;
  text: string;
}

export interface DiscoveredHashtags {
  officialEventTags: string[];
  trendingTopicTags: string[];
  highEngagementTags: string[];
  explanation?: string;
}

export interface EventPreset {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: string;
  defaultRole: string;
  theme: string;
  highlights: string;
  suggestedTone: ToneOption;
  tags: string[];
  bannerUrl: string;
}
