import { Food } from '../types/food';
import { getExpiryInfo } from './expiryUtils';

// マスコット用メッセージ生成
export function generateMascotMessage(foods: Food[], tapCount: number): string {
  // 食材が空の場合：登録を促すメッセージ
  if (foods.length === 0) {
    return getRandomMessage(getEmptyStateMessages());
  }

  // 食材を状態別に分類
  const categorizedFoods = foods.reduce((acc, food) => {
    if (food.isConsumed) return acc;
    const expiryInfo = getExpiryInfo(food.expiryDate, food.registeredDate);
    
    if (expiryInfo.status === 'expired') {
      acc.expired.push(food);
    } else if (expiryInfo.status === 'critical' || expiryInfo.status === 'warning') {
      acc.expiring.push(food);
    }
    return acc;
  }, { expired: [] as Food[], expiring: [] as Food[] });

  // メッセージタイプを決定（3パターン循環）
  const messageType = tapCount % 3;
  
  // メッセージ生成ヘルパー関数
  const createFoodMessage = (foods: Food[], messages: string[]) => {
    const foodNames = foods.slice(0, 2).map(food => food.name).join('、');
    const baseMessages = messages.map(msg => msg.replace('${foodNames}', foodNames));
    
    if (foods.length > 2) {
      baseMessages.push(`${foodNames}など${foods.length}個も期限が近いよ！`);
      baseMessages.push(`たくさんの食材が待ってるよ〜`);
    }
    
    return baseMessages[Math.floor(Math.random() * baseMessages.length)];
  };

  // タイプ別メッセージ生成
  if (messageType === 0 && categorizedFoods.expired.length > 0) {
    return createFoodMessage(categorizedFoods.expired, getExpiredMessages());
  }

  if (messageType === 1 && categorizedFoods.expiring.length > 0) {
    return createFoodMessage(categorizedFoods.expiring, getExpiringMessages());
  }

  // デフォルト：励ましメッセージ
  return getRandomMessage(getEncourageMessages());
}

// 食材消費時のメッセージ
export function generateConsumedMessage(foodName: string): string {
  const messages = [
    `${foodName}、お疲れさまでした！`,
    `${foodName}が役目を果たしたね〜`,
    `${foodName}、美味しく食べてもらえて良かった！`,
    `${foodName}がなくなっちゃった...さみしいな`,
    `${foodName}を食べきったね！偉い偉い♪`,
    `${foodName}の分もまた頑張ろう！`,
    `${foodName}、ありがとうございました〜`,
    `また美味しい${foodName}を迎えようね！`,
  ];
  
  return getRandomMessage(messages);
}

// 食材追加時のメッセージ
export function generateAddedMessage(foodName: string): string {
  const messages = [
    `${foodName}、ようこそ〜！`,
    `新しい仲間の${foodName}が来たよ！`,
    `${foodName}が加わったね♪よろしく！`,
    `${foodName}、冷蔵庫でゆっくりしてね〜`,
    `${foodName}を大切に管理しよう！`,
    `${foodName}と一緒に頑張ろうね！`,
    `${foodName}、期限まで見守ってるからね〜`,
    `新鮮な${foodName}、いらっしゃい！`,
  ];
  
  return getRandomMessage(messages);
}

// 食材が空の時のメッセージ配列
function getEmptyStateMessages(): string[] {
  return [
    '冷蔵庫が空っぽだよ〜！何か追加してみる？',
    'お腹すいちゃった...食材を登録してほしいな',
    '新しい食材を待ってるよ〜♪',
    '冷蔵庫に何か入れてもらえる？',
    'さみしいな...食材がいないよ〜',
    '「+」ボタンから食材を追加してね！',
    '美味しい食材を迎えに行こう！',
    '今度は何を冷蔵庫に入れる？',
    '食材登録をお待ちしております〜',
    '新しい仲間が欲しいな♪',
  ];
}

// 期限切れメッセージ配列
function getExpiredMessages(): string[] {
  return [
    '${foodNames}が期限切れだよ！急いで！',
    '${foodNames}がもう期限切れ...確認してね！',
    '${foodNames}の期限が過ぎてるよ〜',
    '${foodNames}を忘れてない？期限切れだよ！',
    '${foodNames}が危険！すぐにチェックして！',
    '${foodNames}の処理をお忘れなく！',
    '${foodNames}の状態をチェックしてみて！',
    '${foodNames}を見直してくれる？',
  ];
}

// 期限間近メッセージ配列
function getExpiringMessages(): string[] {
  return [
    '${foodNames}の期限が近いよ！',
    '${foodNames}を早めに使ってね！',
    '${foodNames}がピンチ！助けて！',
    '${foodNames}を忘れないで〜',
    '${foodNames}を使った料理を調べてみない？',
    '${foodNames}で何作ろうか？',
    '${foodNames}の出番が近いよ〜',
    '${foodNames}を活用する時だね！',
  ];
}

// 励ましメッセージ配列
function getEncourageMessages(): string[] {
  return [
    'みんな新鮮だね！',
    '今日も冷蔵庫をチェックしてくれてありがとう！',
    '食材を大切にしてくれて嬉しいよ！',
    '何か料理を作ってみる？',
    '冷蔵庫の管理、上手だね！',
    '食材を無駄にしないのは素晴らしいよ！',
    'また新しい食材を追加してみる？',
    '今日もお疲れさま！',
    '冷蔵庫の中が整理されてるね！',
    'フリッジくんも嬉しいよ〜',
    '今度は何を買い物に行く？',
    '料理の腕を上げちゃおう！',
  ];
}

// ランダムメッセージ選択ヘルパー
function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}
