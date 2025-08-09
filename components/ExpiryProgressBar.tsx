// ExpiryProgressBar.tsx - 期限を視覚的に表示するプログレスバーコンポーネント
// 期限の残り日数に応じてバーの長さと色が変化する
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ExpiryInfo } from '../utils/expiryUtils';

interface ExpiryProgressBarProps {
  expiryInfo: ExpiryInfo;
  showPercentage?: boolean;  // パーセンテージ表示の有無（デフォルト: false）
  height?: number;           // バーの高さ（デフォルト: 6）
}

export default function ExpiryProgressBar({ 
  expiryInfo, 
  showPercentage = false, 
  height = 6
}: ExpiryProgressBarProps) {
  const { progressPercentage, backgroundColor, status } = expiryInfo;
  
  // バーの背景スタイル
  const barBackgroundStyle: ViewStyle = {
    ...styles.barBackground,
    height,
  };
  
  // バーの前景スタイル（進行状況を表示）
  const barForegroundStyle: ViewStyle = {
    ...styles.barForeground,
    width: `${progressPercentage}%`,
    backgroundColor,
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
    backgroundColor: '#E5E5E5',  // 薄いグレーの背景
    borderRadius: 3,
    overflow: 'hidden',
    flex: 1,
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
