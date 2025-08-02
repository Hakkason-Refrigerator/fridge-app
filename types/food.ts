export interface Food {
  id: string;
  name: string;
  expiryDate: Date;
  registeredDate: Date;
  comment?: string;           // 食材からのコメント（オプション）
  isConsumed: boolean;
  consumedDate?: Date;
  consumedMethod?: 'eaten' | 'thrown';
}

// 性格関連の型定義と設定は削除
// 食材からのコメント機能のみを残す
