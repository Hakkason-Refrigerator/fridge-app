import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import Header from "../components/Header";
import FoodCard from "../components/FoodCard";
import Mascot, { MascotRef } from "../components/Mascot";
import { useRouter } from "expo-router";
import { useFoodStore } from "../store/foodStore";
import { supabase } from "../lib/supabase";
import { signInIfNeeded } from "../lib/auth";
import { 
  sortFoods, 
  toggleSort, 
  getSortDisplayName, 
  getSortDirectionIcon,
  DEFAULT_SORT_CONFIG,
  SortType, 
  SortDirection 
} from "../utils/sortUtils";

export default function Home() {
  const { foods, fetchFoods, deleteFood } = useFoodStore();
  const router = useRouter();
  const mascotRef = useRef<MascotRef>(null);
  
  // ソート状態
  const [sortType, setSortType] = useState<SortType>(DEFAULT_SORT_CONFIG.type);
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_SORT_CONFIG.direction);

  useEffect(() => {
    signInIfNeeded(); // ログインチェックを実行
    const signInAnonymously = async () => {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error("匿名ログインに失敗しました:", error.message);
      } else {
        console.log("匿名ログイン成功:", data);
        fetchFoods(); // ✅ ログイン成功後に fetch 「食材データ（foods）」を fetchFoods() 関数でSupabaseから読み込み
      }
    };

    signInAnonymously();
    
  }, []);

  // ソート切り替えハンドラー
  const handleSortChange = (newSortType: SortType) => {
    const newSortConfig = toggleSort(sortType, sortDirection, newSortType);
    setSortType(newSortConfig.type);
    setSortDirection(newSortConfig.direction);
  };

  // ソートされた食材リストを取得
  const sortedFoods = sortFoods(foods, sortType, sortDirection);

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
  const handleDeleteFood = async (id: string, name: string) => {
    Alert.alert(
      '確認',
      `「${name}」を食べたことにしますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '食べた！', 
          style: 'destructive', 
          onPress: async () => {
            await deleteFood(id);
            // マスコットに消費メッセージを表示
            if (mascotRef.current?.showConsumedMessage) {
              mascotRef.current.showConsumedMessage(name);
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        showAddButton={true}
        onAddPress={handleAddPress}
      />
      
      {/* ソートボタン */}
      <View style={styles.sortContainer}>
        <TouchableOpacity 
          style={[styles.sortButton, sortType === 'expiry' && styles.activeSortButton]}
          onPress={() => handleSortChange('expiry')}
        >
          <Text style={[styles.sortButtonText, sortType === 'expiry' && styles.activeSortButtonText]}>
            {getSortDisplayName('expiry')} {sortType === 'expiry' && getSortDirectionIcon(sortDirection)}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sortButton, sortType === 'name' && styles.activeSortButton]}
          onPress={() => handleSortChange('name')}
        >
          <Text style={[styles.sortButtonText, sortType === 'name' && styles.activeSortButtonText]}>
            {getSortDisplayName('name')} {sortType === 'name' && getSortDirectionIcon(sortDirection)}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sortButton, sortType === 'registered' && styles.activeSortButton]}
          onPress={() => handleSortChange('registered')}
        >
          <Text style={[styles.sortButtonText, sortType === 'registered' && styles.activeSortButtonText]}>
            {getSortDisplayName('registered')} {sortType === 'registered' && getSortDirectionIcon(sortDirection)}
          </Text>
        </TouchableOpacity>
      </View>
      
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
            <Text style={styles.emptyText}>まだ食材が登録されていないようです</Text>
            <Text style={styles.emptySubtext}>右下の「+」ボタンから食材を追加してみましょう！</Text>
          </View>
        )}
      </ScrollView>
      
      {/* マスコットキャラクター */}
      <Mascot ref={mascotRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0ecff', // 明るい青色
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e0ecff',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeSortButton: {
    backgroundColor: '#ffffff',
    borderColor: '#007bff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeSortButtonText: {
    color: '#007bff',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
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