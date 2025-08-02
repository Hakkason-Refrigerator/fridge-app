export type Food = {
  id: string;
  name: string;
  comment?: string;
  expiryDate: Date;
  registeredDate: Date;
  isConsumed: boolean;
};

// 性格関連の型定義と設定は削除
// 食材からのコメント機能のみを残す
