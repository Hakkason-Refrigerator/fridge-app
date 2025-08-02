import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useFoodStore } from '../store/foodStore';
import { getExpiryInfo } from '../utils/expiryUtils';

interface MascotProps {
  style?: object;
}

export default function Mascot({ style }: MascotProps) {
  const { foods } = useFoodStore();
  const [message, setMessage] = useState<string>('フリッジくんです！');
  const [tapCount, setTapCount] = useState<number>(0); // タップ回数で管理
  const [fadeAnim] = useState(new Animated.Value(1));

  // メッセージを生成する関数
  const generateMessage = () => {
    // 期限間近の食材を取得
    const expiringFoods = foods.filter(food => {
      if (food.isConsumed) return false;
      const expiryInfo = getExpiryInfo(food.expiryDate, food.registeredDate);
      return expiryInfo.status === 'critical' || expiryInfo.status === 'warning';
    });

    // 奇数回：警告メッセージ（期限間近の食材がある場合のみ）
    if (tapCount % 2 === 1 && expiringFoods.length > 0) {
      const foodNames = expiringFoods.slice(0, 2).map(food => food.name).join('、');
      const warningMessages = [
        `${foodNames}の期限が近いよ！`,
        `${foodNames}を早めに使ってね！`,
        `${foodNames}がピンチ！助けて！`,
        `${foodNames}を忘れないで〜`,
      ];
      
      if (expiringFoods.length > 2) {
        warningMessages.push(`${foodNames}など${expiringFoods.length}個も期限が近いよ！`);
        warningMessages.push(`たくさんの食材が待ってるよ〜`);
      }
      
      return warningMessages[Math.floor(Math.random() * warningMessages.length)];
    }

    // 偶数回または期限間近の食材がない場合：励ましメッセージ
    const encourageMessages = [
      'みんな新鮮だね！',
      '今日も冷蔵庫をチェックしてくれてありがとう！',
      '食材を大切にしてくれて嬉しいよ！',
      '何か料理を作ってみる？',
      '冷蔵庫の管理、上手だね！',
      '食材を無駄にしないのは素晴らしいよ！',
      'また新しい食材を追加してみる？',
      '今日もお疲れさま！',
    ];
    
    return encourageMessages[Math.floor(Math.random() * encourageMessages.length)];
  };

  // デバッグ用のメッセージ生成ターミナル上で表示
  // マスコットをタップしたときの処理
  const handleMascotPress = () => {
    console.log('マスコットがタップされました！');
    console.log('現在のタップ回数:', tapCount);
    console.log('現在のメッセージ:', message);
    
    const newMessage = generateMessage();
    setMessage(newMessage);
    setTapCount(prev => prev + 1);
    
    console.log('新しいメッセージ:', newMessage);
    console.log('新しいタップ回数:', tapCount + 1);
    
    // メッセージ切り替えアニメーション
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 初回表示時は何もしない（初期メッセージ「フリッジくんです！」のまま）
  useEffect(() => {
    // 食材が変更された場合のみ、現在のタップ状態に応じたメッセージを再生成
    if (tapCount > 0) {
      const newMessage = generateMessage();
      setMessage(newMessage);
    }
  }, [foods]);

  return (
    <View style={[styles.container, style]}>
      {/* メッセージ吹き出し - 常時表示 */}
      <Animated.View 
        style={[
          styles.messageContainer,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.bubble}>
          <Text style={styles.messageText}>{message}</Text>
          <View style={styles.bubbleTail} />
        </View>
      </Animated.View>
      
      {/* マスコットキャラクター */}
      <TouchableOpacity onPress={handleMascotPress} style={styles.mascotContainer}>
        <Image 
          source={require('../assets/icons/fridgekun.png')} 
          style={styles.mascotImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 1000,
    alignItems: 'flex-start',
  },
  mascotContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotImage: {
    width: 60,
    height: 60,
  },
  messageContainer: {
    marginBottom: 10,
    maxWidth: 200,
  },
  bubble: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  messageText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -8,
    left: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffffff',
  },
});
