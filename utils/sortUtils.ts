import { Food } from '../types/food';

// ソートの型定義
export type SortType = 'expiry' | 'name' | 'registered';
export type SortDirection = 'asc' | 'desc';

// ソート設定の型
export interface SortConfig {
  type: SortType;
  direction: SortDirection;
}

/**
 * 食材リストをソートする関数
 * @param foods - ソートする食材の配列
 * @param type - ソートタイプ（期限順、名前順、登録日順）
 * @param direction - ソート方向（昇順、降順）
 * @returns ソートされた食材の配列
 */
export const sortFoods = (foods: Food[], type: SortType, direction: SortDirection): Food[] => {
  return [...foods].sort((a, b) => {
    let comparison = 0;
    
    switch (type) {
      case 'expiry':
        comparison = a.expiryDate.getTime() - b.expiryDate.getTime();
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name, 'ja');
        break;
      case 'registered':
        comparison = a.registeredDate.getTime() - b.registeredDate.getTime();
        break;
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
};

/**
 * ソート設定を切り替える関数
 * @param currentType - 現在のソートタイプ
 * @param currentDirection - 現在のソート方向
 * @param newType - 新しいソートタイプ
 * @returns 新しいソート設定
 */
export const toggleSort = (
  currentType: SortType,
  currentDirection: SortDirection,
  newType: SortType
): SortConfig => {
  if (currentType === newType) {
    // 同じソートタイプの場合は方向を切り替え
    return {
      type: currentType,
      direction: currentDirection === 'asc' ? 'desc' : 'asc'
    };
  } else {
    // 違うソートタイプの場合は昇順に設定
    return {
      type: newType,
      direction: 'asc'
    };
  }
};

/**
 * ソートタイプの表示名を取得する関数
 * @param type - ソートタイプ
 * @returns 表示名
 */
export const getSortDisplayName = (type: SortType): string => {
  switch (type) {
    case 'expiry':
      return '期限順';
    case 'name':
      return 'あいうえお順';
    case 'registered':
      return '登録日順';
    default:
      return '';
  }
};

/**
 * ソート方向のアイコンを取得する関数
 * @param direction - ソート方向
 * @returns アイコン文字列
 */
export const getSortDirectionIcon = (direction: SortDirection): string => {
  return direction === 'asc' ? '↑' : '↓';
};

/**
 * デフォルトのソート設定
 */
export const DEFAULT_SORT_CONFIG: SortConfig = {
  type: 'expiry',
  direction: 'asc'
};
