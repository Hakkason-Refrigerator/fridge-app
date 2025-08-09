// ExpiryProgressBar.tsx - 期限を視覚的に表示するプログレスバーコンポーネント
// 期限の残り日数に応じてバーの長さと色が変化する
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ExpiryInfo } from '../utils/expiryUtils';

interface ExpiryProgressBarProps {
  expiryInfo: ExpiryInfo;
  showPercentage?: boolean;  // パーセンテージ表示の有無（デフォルト: false）
  height?: number;           // バーの高さ（デフォルト: 6）
  useHeaderColor?: boolean;  // ヘッダーと同じ色を使用するか（デフォルト: true）
}

export default function ExpiryProgressBar({ 
  expiryInfo, 
  showPercentage = false, 
  height = 6,
  useHeaderColor = true
}: ExpiryProgressBarProps) {
  const { progressPercentage, backgroundColor } = expiryInfo;
  
  // ヘッダー内では背景を少し暗めに調整
  const barBackgroundColor = useHeaderColor ? 'rgba(255, 255, 255, 0.3)' : '#E5E5E5';
  // ヘッダー内では前景を少し明るめに調整
  const barForegroundColor = useHeaderColor ? 'rgba(255, 255, 255, 0.8)' : backgroundColor;
  
  // バーの背景スタイル
  const barBackgroundStyle: ViewStyle = {
    ...styles.barBackground,
    backgroundColor: barBackgroundColor,
    height,
  };
  
  // バーの前景スタイル（進行状況を表示）
  const barForegroundStyle: ViewStyle = {
    ...styles.barForeground,
    width: `${progressPercentage}%`,
    backgroundColor: barForegroundColor,
    height,
  };
  
  return (
    <View style={styles.container}>
      {/* プログレスバー本体 */}
      <View style={barBackgroundStyle}>
        <View style={barForegroundStyle} />
      </View>
      
      {/* パーセンテージ表示（オプション） */}
      {showPercentage && (
        <Text style={styles.percentageText}>
          {progressPercentage}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  barBackground: {
    borderRadius: 3,
    overflow: 'hidden',
    flex: 1,
    // backgroundColorは動的に設定
  },
  barForeground: {
    borderRadius: 3,
    // バックグラウンドカラーは動的に設定
  },
  percentageText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    minWidth: 35,  // 数値の表示幅を固定
    textAlign: 'right',
  },
});
