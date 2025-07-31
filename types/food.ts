export interface Food {
  id: string;
  name: string;
  expiryDate: Date;
  registeredDate: Date;
  personality: PersonalityType;
  isConsumed: boolean;
  consumedDate?: Date;
  consumedMethod?: 'eaten' | 'thrown';
}

export type PersonalityType = 'serious' | 'tsundere' | 'cheerful' | 'anxious' | 'poetic';

export interface PersonalityConfig {
  name: string;
  emoji: string;
  description: string;
}

export const PERSONALITY_CONFIGS: Record<PersonalityType, PersonalityConfig> = {
  serious: {
    name: '真面目',
    emoji: '😐',
    description: '責任感が強く、期限を守ることを重視する'
  },
  tsundere: {
    name: 'ツンデレ',
    emoji: '😤',
    description: '素直になれないけど、実は食べてもらいたがっている'
  },
  cheerful: {
    name: '明るい',
    emoji: '😊',
    description: 'いつでもポジティブで元気いっぱい'
  },
  anxious: {
    name: '心配性',
    emoji: '😰',
    description: '常に不安で、期限が気になって仕方がない'
  },
  poetic: {
    name: '詩的',
    emoji: '🎭',
    description: '美しい言葉で自分の気持ちを表現する'
  }
};
