import { EventPreset } from '../types';

export const EVENT_PRESETS: EventPreset[] = [
  {
    id: 'ai-summit',
    title: 'Global AI Summit & Expo 2026',
    subtitle: 'Enterprise AI & Autonomous Agents',
    category: 'Artificial Intelligence',
    icon: 'psychology',
    defaultRole: 'Attendee',
    theme: 'Deploying autonomous multi-agent workflows in enterprise production',
    highlights:
      '- Keynote insight: 90% of prompt engineering is being replaced by systematic evaluation harnesses.\n- Met extraordinary engineering leaders from OpenAI, Google, and Anthropic.\n- Biggest realization: Latency and observability matter 10x more than raw model size in real applications.',
    suggestedTone: 'thought_leader',
    tags: ['ArtificialIntelligence', 'GenAI', 'TechSummit2026', 'MachineLearning'],
    bannerUrl:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'founders-mixer',
    title: 'SaaS Founders & Investors Retreat',
    subtitle: 'Bootstrapping & Venture Scaling',
    category: 'Startup & Venture',
    icon: 'rocket_launch',
    defaultRole: 'Founder / CEO',
    theme: 'Efficient growth, net revenue retention, and product-market fit',
    highlights:
      '- Spoke with founders doing $5M+ ARR with teams under 10 people.\n- Core takeaway: Distribution is no longer a downstream step—it has to be built into the product loop from day 1.\n- Invaluable 1-on-1 feedback on our pricing model from seasoned operators.',
    suggestedTone: 'storyteller',
    tags: ['SaaS', 'Startups', 'VentureCapital', 'FounderJourney', 'Growth'],
    bannerUrl:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'developer-con',
    title: 'NextGen Cloud & Systems Conference',
    subtitle: 'Distributed Systems & Infrastructure',
    category: 'Engineering & DevOps',
    icon: 'terminal',
    defaultRole: 'Senior Software Engineer',
    theme: 'Modern edge compute, WebAssembly, and resilient distributed databases',
    highlights:
      '- Brilliant deep-dive into distributed consensus protocols without lock contention.\n- Learned how modern teams are slashing cloud bills by 40% using specialized edge runtimes.\n- Huge kudos to the speaker panel for answering tough architectural questions with zero corporate fluff.',
    suggestedTone: 'bullet_takeaways',
    tags: ['SoftwareEngineering', 'CloudComputing', 'DevOps', 'DistributedSystems'],
    bannerUrl:
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'design-product',
    title: 'UX Design & Product Strategy 2026',
    subtitle: 'Human-Centered Spatial & AI UX',
    category: 'Design & UX',
    icon: 'palette',
    defaultRole: 'Product Designer',
    theme: 'Rethinking human-computer interaction in the era of generative interfaces',
    highlights:
      '- Inspiring workshop on adaptive UI that shapes itself to user intent in real-time.\n- Best quote: "Clean UX is not about minimalism; it is about cognitive clarity."\n- Reconnected with design leaders from across the globe.',
    suggestedTone: 'gratitude',
    tags: ['ProductDesign', 'UXDesign', 'DesignSystems', 'UserExperience'],
    bannerUrl:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  },
];
