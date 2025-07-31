import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { Food, PersonalityType, PERSONALITY_CONFIGS } from "../types/food";
import { generateFoodMessage } from "../utils/messageGenerator";
import { formatDateShort, addDays } from "../utils/dateUtils";
import Header from "../components/Header";

// サンプルデータ
const sampleFoods: Food[] = [
  {
    id: '1',
    name: '牛乳',
    expiryDate: addDays(new Date(), 2),
    registeredDate: new Date(),
    personality: 'anxious',
    isConsumed: false
  },
  {
    id: '2',
    name: '卵',
    expiryDate: addDays(new Date(), 5),
    registeredDate: new Date(),
    personality: 'tsundere',
    isConsumed: false
  },
  {
    id: '3',
    name: 'バナナ',
    expiryDate: addDays(new Date(), 1),
    registeredDate: new Date(),
    personality: 'cheerful',
    isConsumed: false
  },
  {
    id: '4',
    name: 'パン',
    expiryDate: addDays(new Date(), -1),
    registeredDate: new Date(),
    personality: 'poetic',
    isConsumed: false
  }
];

export default function Home() {
  const [foods] = useState<Food[]>(sampleFoods);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1分ごとに更新

    return () => clearInterval(timer);
  }, []);

  const handleAddPress = () => {
    console.log('食材を追加ボタンが押されました！');
    // 後でregister.tsxに遷移する処理を追加予定
  };

  const FoodBubble = ({ food }: { food: Food }) => {
    const message = generateFoodMessage(food);
    const personality = PERSONALITY_CONFIGS[food.personality];
    
    const bubbleStyle = {
      ...styles.bubble,
      backgroundColor: 
        message.mood === 'happy' ? '#e8f5e8' :
        message.mood === 'neutral' ? '#f0f8ff' :
        message.mood === 'worried' ? '#fff3cd' :
        message.mood === 'urgent' ? '#f8d7da' :
        '#f5f5f5'
    };

    return (
      <View style={styles.bubbleContainer}>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.personality}>
            {personality.emoji} {personality.name}
          </Text>
          <Text style={styles.expiryDate}>
            期限: {formatDateShort(food.expiryDate)}
          </Text>
        </View>
        <View style={bubbleStyle}>
          <View style={styles.messageHeader}>
            <Text style={styles.messageEmoji}>{message.emoji}</Text>
          </View>
          <Text style={styles.messageText}>{message.message}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="🧊 つめたみボイス"
        subtitle="冷蔵庫の中の声に耳を傾けて..."
        showAddButton={true}
        onAddPress={handleAddPress}
        backgroundColor="#ffffffff"
      />
      
      <ScrollView style={styles.chatContainer} showsVerticalScrollIndicator={false}>
        {foods.map((food) => (
          <FoodBubble key={food.id} food={food} />
        ))}
        
        {foods.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>まだ食材が登録されていません</Text>
            <Text style={styles.emptySubtext}>「+」ボタンから食材を追加してみてください</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bubbleContainer: {
    marginBottom: 20,
  },
  foodInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  personality: {
    fontSize: 12,
    color: "#666",
  },
  expiryDate: {
    fontSize: 12,
    color: "#888",
  },
  bubble: {
    backgroundColor: "#e8f5e8",
    padding: 16,
    borderRadius: 15,
    borderTopLeftRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  messageEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  messageText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});