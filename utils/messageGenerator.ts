import { Food, PersonalityType } from '../types/food';
import { getDaysUntilExpiry } from './dateUtils';

export interface FoodMessage {
  message: string;
  mood: 'happy' | 'neutral' | 'worried' | 'urgent' | 'expired';
  emoji: string;
}

export function generateFoodMessage(food: Food): FoodMessage {
  const daysLeft = getDaysUntilExpiry(food.expiryDate);
  
  if (daysLeft < -3) {
    return generateExpiredMessage(food.personality);
  } else if (daysLeft <= 0) {
    return generateUrgentMessage(food.personality);
  } else if (daysLeft <= 2) {
    return generateWorriedMessage(food.personality, daysLeft);
  } else if (daysLeft <= 6) {
    return generateNeutralMessage(food.personality, daysLeft);
  } else {
    return generateHappyMessage(food.personality, daysLeft);
  }
}

function generateHappyMessage(personality: PersonalityType, daysLeft: number): FoodMessage {
  const messages = {
    serious: {
      message: `まだ${daysLeft}日あります。計画的に使用してください。`,
      emoji: '😐'
    },
    tsundere: {
      message: `べ、別に急がなくてもいいんだからね！まだ${daysLeft}日もあるし...`,
      emoji: '😤'
    },
    cheerful: {
      message: `やったー！まだ${daysLeft}日も一緒にいられるね〜♪`,
      emoji: '😊'
    },
    anxious: {
      message: `${daysLeft}日もあるけど...本当に大丈夫かな？心配...`,
      emoji: '😅'
    },
    poetic: {
      message: `${daysLeft}日という美しい時間が、私たちを待っている...`,
      emoji: '✨'
    }
  };
  
  return {
    ...messages[personality],
    mood: 'happy'
  };
}

function generateNeutralMessage(personality: PersonalityType, daysLeft: number): FoodMessage {
  const messages = {
    serious: {
      message: `残り${daysLeft}日です。そろそろ使用予定を立てませんか？`,
      emoji: '🤔'
    },
    tsundere: {
      message: `${daysLeft}日か...そろそろ私の出番かもしれないわね`,
      emoji: '😏'
    },
    cheerful: {
      message: `あと${daysLeft}日！そろそろ活躍の時かな〜♪`,
      emoji: '😄'
    },
    anxious: {
      message: `え、もう${daysLeft}日しかない！どうしよう...`,
      emoji: '😟'
    },
    poetic: {
      message: `${daysLeft}日という短い詩が、静かに始まろうとしている...`,
      emoji: '🌸'
    }
  };
  
  return {
    ...messages[personality],
    mood: 'neutral'
  };
}

function generateWorriedMessage(personality: PersonalityType, daysLeft: number): FoodMessage {
  const dayText = daysLeft === 1 ? '明日' : daysLeft === 0 ? '今日' : `あと${daysLeft}日`;
  
  const messages = {
    serious: {
      message: `${dayText}が期限です。至急使用してください。`,
      emoji: '⚠️'
    },
    tsundere: {
      message: `${dayText}なんだけど...べ、別に心配してるわけじゃないからね！`,
      emoji: '😳'
    },
    cheerful: {
      message: `${dayText}だよ〜！一緒に頑張ろうね！`,
      emoji: '💪'
    },
    anxious: {
      message: `${dayText}...お願い、忘れないで...！`,
      emoji: '😰'
    },
    poetic: {
      message: `${dayText}、運命の時が静かに近づいている...`,
      emoji: '🌙'
    }
  };
  
  return {
    ...messages[personality],
    mood: 'worried'
  };
}

function generateUrgentMessage(personality: PersonalityType): FoodMessage {
  const messages = {
    serious: {
      message: '期限です。直ちに処理してください。',
      emoji: '🚨'
    },
    tsundere: {
      message: 'も、もう期限よ！早く...早く食べてよ！',
      emoji: '😤'
    },
    cheerful: {
      message: '今日が期限だよ〜！最後のチャンス！',
      emoji: '⏰'
    },
    anxious: {
      message: '今日で期限...助けて...！',
      emoji: '😱'
    },
    poetic: {
      message: '今日という舞台で、最後の演技を...！',
      emoji: '🎭'
    }
  };
  
  return {
    ...messages[personality],
    mood: 'urgent'
  };
}

function generateExpiredMessage(personality: PersonalityType): FoodMessage {
  const messages = {
    serious: {
      message: '期限を過ぎました。適切に処理してください。',
      emoji: '💀'
    },
    tsundere: {
      message: 'もう...遅いわよ...でも思い出だけは残してね...',
      emoji: '😔'
    },
    cheerful: {
      message: '期限過ぎちゃった〜...でも楽しかったよ！',
      emoji: '😇'
    },
    anxious: {
      message: 'ごめんなさい...役に立てなくて...',
      emoji: '😭'
    },
    poetic: {
      message: '時という河に流され...永遠の静寂へ...',
      emoji: '🥀'
    }
  };
  
  return {
    ...messages[personality],
    mood: 'expired'
  };
}
