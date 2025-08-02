import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { Food } from "../types/food";
import { addDays } from "../utils/dateUtils";
import Header from "../components/Header";
import FoodCard from "../components/FoodCard";

// サンプルデータ（様々な期限の食材でテスト）
const sampleFoods: Food[] = [
  {
    id: '1',
    name: '牛乳',
    expiryDate: addDays(new Date(), 2),
    registeredDate: new Date(),
    comment: '早めに飲んでくださいね〜',
    isConsumed: false
  },
  {
    id: '2',
    name: '卵',
    expiryDate: addDays(new Date(), 8),
    registeredDate: new Date(),
    comment: 'オムライス作ってもらえる？',
    isConsumed: false
  },
  {
    id: '3',
    name: 'バナナ',
    expiryDate: addDays(new Date(), 1),
    registeredDate: new Date(),
    comment: '明日には食べ頃だよ！',
    isConsumed: false
  },
  {
    id: '4',
    name: 'パン',
    expiryDate: addDays(new Date(), -1),
    registeredDate: new Date(),
    comment: 'ごめん...期限切れちゃった',
    isConsumed: false
  },
  {
    id: '5',
    name: 'ヨーグルト',
    expiryDate: addDays(new Date(), 0),
    registeredDate: new Date(),
    comment: '今日中に食べてね！',
    isConsumed: false
  },
  {
    id: '6',
    name: 'リンゴ',
    expiryDate: addDays(new Date(), 6),
    registeredDate: new Date(),
    comment: 'まだまだ新鮮だよ〜',
    isConsumed: false
  }
];

export default function Home() {
  // 食材リストを状態として管理（削除機能のため）
  const [foods, setFoods] = useState<Food[]>(sampleFoods);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1分ごとに更新

    return () => clearInterval(timer);
  }, []);

  // 期限順にソートされた食材リストを取得
  const sortedFoods = [...foods].sort((a, b) => {
    // 期限日で比較（期限が近い順）
    return a.expiryDate.getTime() - b.expiryDate.getTime();
  });

  const handleAddPress = () => {
    console.log('食材を追加ボタンが押されました！');
    // 後でregister.tsxに遷移する処理を追加予定
  };

  const handleFoodCardPress = (food: Food) => {
    console.log(`${food.name}のカードが押されました！`);
    // 後で食材詳細画面に遷移する処理を追加予定
  };

  // 食材削除のハンドラー関数
  const handleDeleteFood = (foodId: string, foodName: string) => {
    console.log(`${foodName}を削除します`);
    // 食材リストから指定されたIDの食材を削除
    setFoods(currentFoods => currentFoods.filter(food => food.id !== foodId));
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
        {/* FoodCard表示 */}
        {sortedFoods.map((food) => (
          <FoodCard 
            key={food.id}
            food={food}
            onPress={() => handleFoodCardPress(food)}
            onDelete={() => handleDeleteFood(food.id, food.name)}
            showDeleteButton={true}
          />
        ))}
        
        {sortedFoods.length === 0 && (
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
});