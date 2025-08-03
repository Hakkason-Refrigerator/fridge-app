import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useFoodStore } from '../store/foodStore';
import { generateMascotMessage, generateConsumedMessage, generateAddedMessage } from '../utils/messageGenerator';

interface MascotProps {
  style?: object;
}

export interface MascotRef {
  showConsumedMessage: (foodName: string) => void;
  showAddedMessage: (foodName: string) => void;
}

const Mascot = forwardRef<MascotRef, MascotProps>(({ style }, ref) => {
  const { foods } = useFoodStore();
  const [message, setMessage] = useState<string>('こんにちは！フリッジくんです！');
  const [tapCount, setTapCount] = useState<number>(0); // タップ回数で管理
  const [fadeAnim] = useState(new Animated.Value(1));
  const [lastFoodCount, setLastFoodCount] = useState<number>(0);

  // メッセージを生成する関数
  const generateMessage = () => {
    return generateMascotMessage(foods, tapCount);
  };

  // 外部からメッセージを設定する関数
  const showConsumedMessage = (foodName: string) => {
    const newMessage = generateConsumedMessage(foodName);
    setMessage(newMessage);
    playMessageAnimation();
  };

  const showAddedMessage = (foodName: string) => {
    const newMessage = generateAddedMessage(foodName);
    setMessage(newMessage);
    playMessageAnimation();
  };

  // refを通じて外部から呼び出せるようにする
  useImperativeHandle(ref, () => ({
    showConsumedMessage,
    showAddedMessage,
  }));

  // メッセージアニメーション
  const playMessageAnimation = () => {
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
    
    playMessageAnimation();
  };

  // 食材の変化を検知
  useEffect(() => {
    const currentFoodCount = foods.filter(food => !food.isConsumed).length;
    
    // 食材が減った場合（消費された）
    if (currentFoodCount < lastFoodCount && lastFoodCount > 0) {
      // 最後に消費された食材名を特定できないので、一般的なメッセージ
      const newMessage = generateConsumedMessage('食材');
      setMessage(newMessage);
      playMessageAnimation();
    }
    // 食材が増えた場合（追加された）
    else if (currentFoodCount > lastFoodCount) {
      // 最後に追加された食材名を特定できないので、一般的なメッセージ
      const newMessage = generateAddedMessage('新しい食材');
      setMessage(newMessage);
      playMessageAnimation();
    }
    // 通常のメッセージ更新（タップされた後のみ）
    else if (tapCount > 0) {
      const newMessage = generateMessage();
      setMessage(newMessage);
    }
    
    setLastFoodCount(currentFoodCount);
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
});

export default Mascot;

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
