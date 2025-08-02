// expiryUtils.ts - 期限関連のユーティリティ関数
// APIとの連携時にも使える汎用的な期限判定ロジック

export type ExpiryStatus = 'fresh' | 'good' | 'warning' | 'critical' | 'expired';

export interface ExpiryInfo {
  status: ExpiryStatus;
  daysRemaining: number;
  color: string;
  backgroundColor: string;
}

/**
 * 食材の期限状態を判定し、表示用の情報を返す
 * @param expiryDate 賞味期限
 * @param registeredDate 登録日（オプション、今後のAPI対応用）
 * @returns 期限状態の情報
 */
export function getExpiryInfo(expiryDate: Date, registeredDate?: Date): ExpiryInfo {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiry = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
  
  // 残り日数を計算
  const timeDiff = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  // 期限状態を判定
  let status: ExpiryStatus;
  let color: string;
  let backgroundColor: string;
  
  if (daysRemaining < 0) {
    // 期限切れ - 濃い赤
    status = 'expired';
    color = '#ffffffff';
    backgroundColor = '#f55757ff';
  } else if (daysRemaining === 0) {
    // 今日が期限 - 明るい赤
    status = 'critical';
    color = '#ffffffff';
    backgroundColor = '#ff825cff';
  } else if (daysRemaining <= 1) {
    // 明日期限 - ピンク系
    status = 'critical';
    color = '#ffffffff';
    backgroundColor = '#ffad31ff';
  } else if (daysRemaining <= 3) {
    // 3日以内
    status = 'warning';
    color = '#ffffffff';
    backgroundColor = '#ffe380ff';
  } else if (daysRemaining <= 7) {
    // 1週間以内
    status = 'good';
    color = '#ffffffff';
    backgroundColor = '#6de671ff';
  } else {
    // 新鮮
    status = 'fresh';
    color = '#ffffffff';          // 統一された文字色
    backgroundColor = '#7bbeefff'; // 青色の薄い背景
  }
  
  return {
    status,
    daysRemaining,
    color,
    backgroundColor
  };
}

/**
 * 期限状態に応じたメッセージを取得
 * @param expiryInfo 期限情報
 * @param expiryDate 期限日
 * @returns 表示用メッセージ
 */
export function getExpiryMessage(expiryInfo: ExpiryInfo, expiryDate: Date): string {
  const { status, daysRemaining } = expiryInfo;
  const dateString = expiryDate.toLocaleDateString();
  
  switch (status) {
    case 'expired':
      return `期限: ${dateString} (${Math.abs(daysRemaining)}日経過)`;
    case 'critical':
      if (daysRemaining === 0) {
        return `期限: ${dateString} (今日期限！)`;
      } else {
        return `期限: ${dateString} (明日期限！)`;
      }
    case 'warning':
      return `期限: ${dateString} (あと${daysRemaining}日)`;
    case 'good':
      return `期限: ${dateString} (あと${daysRemaining}日)`;
    case 'fresh':
      return `期限: ${dateString} (あと${daysRemaining}日)`;
    default:
      return `期限: ${dateString}`;
  }
}
