import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import Header from "../components/Header";
import FoodCard from "../components/FoodCard";
import Mascot from "../components/Mascot";
import { useRouter } from "expo-router";
import { useFoodStore } from "../store/foodStore";



export default function Home() {
  const { foods, fetchFoods, deleteFood } = useFoodStore();
  const router = useRouter();

  useEffect(() => {
    fetchFoods();
  }, []);

  // 期限順にソートされた食材リストを取得
  const sortedFoods = [...foods].sort((a, b) => {
    // 期限日で比較（期限が近い順）
    return a.expiryDate.getTime() - b.expiryDate.getTime();
  });

  //食材追加ページへ移動
  const handleAddPress = () => {
    console.log('食材を追加ボタンが押されました！');
    router.push('/register');
  };

  const handleFoodCardPress = (food: any) => {
    console.log(`${food.name}のカードが押されました！`);
    // 食材詳細画面に遷移
    router.push(`/${food.id}`);
  };

  // 食材削除のハンドラー関数
  const handleDeleteFood = (id: string, name: string) => {
    Alert.alert(
      '確認',
      `「${name}」を食べたことにしますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '食べた！', style: 'destructive', onPress: () => deleteFood(id) },
      ]
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
      
      {/* マスコットキャラクター */}
      <Mascot />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0ecff', // 明るい青色
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