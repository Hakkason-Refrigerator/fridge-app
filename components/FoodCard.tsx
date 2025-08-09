// FoodCard.tsx - 食材カードコンポーネント
// 冷蔵庫内の食材を表示するためのカードコンポーネント
// 期限が迫るにつれてカードの色が変化する機能付き
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Food } from '../types/food';
import { getExpiryInfo, getExpiryMessage } from '../utils/expiryUtils';
import ExpiryProgressBar from './ExpiryProgressBar';

// FoodCardコンポーネントのプロパティ型定義
interface FoodCardProps {
  food: Food;           // 表示する食材データ
  onPress: () => void;  // カードをタップした時の処理
  onDelete?: () => void; // 削除ボタンを押した時の処理（オプション）
  showDeleteButton?: boolean; // 削除ボタンを表示するかどうか（オプション）
  style?: object;       // 追加のスタイル（オプション）
}

// FoodCardコンポーネント本体
export default function FoodCard({ food, onPress, onDelete, showDeleteButton = false, style }: FoodCardProps) {
  // 期限情報を取得（色とメッセージを含む）
  const expiryInfo = getExpiryInfo(food.expiryDate, food.registeredDate);
  const expiryMessage = getExpiryMessage(expiryInfo, food.expiryDate);
  
  // 期限状態に応じたヘッダースタイルを作成（色付きヘッダー用）
  const headerStyle = {
    ...styles.cardHeader,
    backgroundColor: expiryInfo.backgroundColor,
  };
  
  // 期限状態に応じたテキストスタイルを作成
  const textStyle = {
    ...styles.foodName,
    color: expiryInfo.color,
  };
  
  const expiryTextStyle = {
    ...styles.expiryDate,
    color: expiryInfo.color,
  };
  
  const commentTextStyle = {
    ...styles.comment,
    color: '#4A90E2', // 常に青色で固定
  };

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, style]}>
      {/* カード上部：食材名（左上）と期限（右上） - 色付きヘッダー */}
      <View style={headerStyle}>
        {/* 食材名を左上に表示 */}
        <Text style={textStyle}>{food.name}</Text>
        {/* 期限を右上に表示 */}
        <Text style={expiryTextStyle}>{expiryMessage}</Text>
      </View>
      
      {/* 中央：食材からのコメント（左揃え） */}
      {food.comment && (
        <View style={styles.messageContainer}>
          <Text style={commentTextStyle}>💬メモ： {food.comment}</Text>
        </View>
      )}
      
      {/* 期限バー */}
      <View style={styles.progressBarContainer}>
        <ExpiryProgressBar expiryInfo={expiryInfo} />
      </View>
      
      {/* 下部：食べたボタンを右下に配置 */}
      <View style={styles.bottomContainer}>
        {showDeleteButton && onDelete && (
          <TouchableOpacity 
            onPress={onDelete} 
            style={styles.deleteButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} // タップ領域を拡大
          >
            <Text style={styles.deleteButtonText}>🍽食べた！</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
// スタイル定義
const styles = StyleSheet.create({
  // カード全体のベーススタイル（白背景に固定）
  card: {
    backgroundColor: '#FFFFFF',   // 常に白背景
    padding: 0,                   // パディングを削除（ヘッダーで個別に設定）
    borderRadius: 8,              // 角を丸くする
    marginVertical: 8,            // 上下のマージン
    marginHorizontal: 24,         // 左右のマージンを追加して横幅を狭く
    shadowColor: '#000',          // 影の色
    shadowOffset: { width: 0, height: 2 },  // 影の位置
    shadowOpacity: 0.25,          // 影の透明度
    shadowRadius: 3.84,           // 影のぼかし
    elevation: 5,                 // Android用の影
    overflow: 'hidden',           // 角丸を維持するため
  },
  // カードヘッダー（食材名と期限を横並びに配置、期限状態に応じて背景色が変化）
  cardHeader: {
    flexDirection: 'row',         // 横並び
    justifyContent: 'space-between', // 両端揃え（左上と右上）
    alignItems: 'flex-start',     // 上揃え
    padding: 12,                  // ヘッダー内の余白を狭く（16→12）
    borderTopLeftRadius: 8,       // 左上の角丸
    borderTopRightRadius: 8,      // 右上の角丸
    marginBottom: 0,              // 下のマージンを削除
  },
  // 食材名のベーススタイル（文字色は動的に変更）
  foodName: {
    fontSize: 18,              // フォントサイズ
    fontWeight: 'bold',        // 太字
    flex: 1,                   // 残りスペースを占有
    marginRight: 12,           // 期限との間隔
  },
  // メッセージコンテナ（中央左揃え用、白背景部分）
  messageContainer: {
    paddingHorizontal: 12,     // 横の内側余白を狭く（16→12）
    paddingVertical: 2,        // 上下の内側余白をさらに狭く（4→2）
    alignItems: 'flex-start',  // 左揃え
    backgroundColor: '#FFFFFF', // 明示的に白背景
  },
  // 下部コンテナ（ボタンを右下に配置、白背景部分）
  bottomContainer: {
    flexDirection: 'row',      // 横並び
    justifyContent: 'flex-end', // 右揃え
    alignItems: 'center',      // 垂直方向中央揃え
    paddingHorizontal: 12,     // 横の内側余白を狭く（16→12）
    paddingBottom: 8,          // 下の内側余白をさらに狭く（12→8）
    paddingTop: 2,             // 上の内側余白をさらに狭く（4→2）
    backgroundColor: '#FFFFFF', // 明示的に白背景
  },
  // 削除ボタンのスタイル
  deleteButton: {
    paddingHorizontal: 12,     // 横の内側余白を狭く（16→12）
    paddingVertical: 8,        // 縦の内側余白を狭く（10→8）
    borderRadius: 16,          // 角を少し小さく（20→16）
    backgroundColor: '#007bff', // 青色背景
    minWidth: 70,              // 最小幅を狭く（80→70）
    alignItems: 'center',      // 中央揃え
    justifyContent: 'center',  // 中央揃え
    shadowColor: '#000',       // 影を追加
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,              // Android用の影
  },
  // 削除ボタンのテキストスタイル
  deleteButtonText: {
    fontSize: 14,              // フォントサイズ
    fontWeight: '600',         // セミボールド
    color: '#ffffff',          // 白色
  },
  // 賞味期限のベーススタイル（文字色は動的に変更）
  expiryDate: {
    fontSize: 14,              // フォントサイズ
    marginTop: 4,              // 上のマージン
    fontWeight: '600',         // セミボールド
  },
  // 食材からのコメントのベーススタイル（文字色は動的に変更）
  comment: {
    fontSize: 16,              // フォントサイズを少し小さく（18→16）
    marginTop: 2,              // 上のマージンをさらに狭く（3→2）
    fontStyle: 'italic',       // 斜体
  },
  // 期限バーのコンテナ
  progressBarContainer: {
    paddingHorizontal: 12,     // 左右のマージン
    paddingVertical: 6,        // 上下のマージン
    backgroundColor: '#FFFFFF', // 白背景
  },
});