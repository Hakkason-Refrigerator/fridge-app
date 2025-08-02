import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Food } from '../types/food';
import { getExpiryInfo } from '../utils/expiryUtils';
import { useFoodStore } from '../store/foodStore';

// レシピサイトの設定
const RECIPE_SITES = [
  { name: 'クックパッド', color: '#ff8c00', urlTemplate: 'https://cookpad.com/search/' },
  { name: 'クラシル', color: '#e64312ff', urlTemplate: 'https://www.kurashiru.com/search?query=' },
  { name: '楽天レシピ', color: '#ffae01ff', urlTemplate: 'https://recipe.rakuten.co.jp/search/' }
];

// 食材名からレシピ検索URLを生成する関数
const generateRecipeUrl = (foodName: string, urlTemplate: string) => {
  const encodedName = encodeURIComponent(foodName);
  return urlTemplate + encodedName + (urlTemplate.includes('rakuten') ? '/' : '');
};

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams();
  const { foods, updateFood } = useFoodStore();
  
  // IDに基づいて食材データを取得
  const food = foods.find(f => f.id === id);

  // 編集状態の管理
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(food?.name || '');
  const [editedExpiryDate, setEditedExpiryDate] = useState(
    food?.expiryDate.toISOString().split('T')[0] || ''
  );
  const [editedRegisteredDate, setEditedRegisteredDate] = useState(
    food?.registeredDate.toISOString().split('T')[0] || ''
  );

  if (!food) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>食材が見つかりません</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 保存処理
  const handleSave = async () => {
    if (!food) return;
    
    try {
      await updateFood(food.id, {
        name: editedName,
        expiryDate: new Date(editedExpiryDate),
        registeredDate: new Date(editedRegisteredDate),
      });
      Alert.alert('保存完了', '変更が保存されました', [
        { text: 'OK', onPress: () => setIsEditing(false) }
      ]);
    } catch (error) {
      Alert.alert('エラー', '保存に失敗しました');
      console.error('Save error:', error);
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    setEditedName(food.name);
    setEditedExpiryDate(food.expiryDate.toISOString().split('T')[0]);
    setEditedRegisteredDate(food.registeredDate.toISOString().split('T')[0]);
    setIsEditing(false);
  };

  const openRecipeUrl = async (url: string, siteName: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('エラー', `${siteName}を開けませんでした`);
      }
    } catch (error) {
      Alert.alert('エラー', 'URLを開く際にエラーが発生しました');
    }
  };

  // 期限情報を取得（メインページと同じ色を使用）
  const expiryInfo = getExpiryInfo(food.expiryDate, food.registeredDate);
  const daysDifference = Math.ceil((food.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const expiryStatus = daysDifference > 0 ? `あと${daysDifference}日` : 
                      daysDifference === 0 ? '今日が期限' : `${Math.abs(daysDifference)}日経過`;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* 食材名ヘッダー - 状態に応じた背景色 */}
        <View style={[styles.foodNameHeader, { backgroundColor: expiryInfo.backgroundColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonInHeader}>
            <Text style={[styles.backButtonText, { color: expiryInfo.color }]}>← 戻る</Text>
          </TouchableOpacity>
          
          {/* 編集ボタン */}
          <TouchableOpacity 
            onPress={isEditing ? handleCancel : () => setIsEditing(true)} 
            style={styles.editButtonInHeader}
          >
            <Text style={[styles.editButtonText, { color: expiryInfo.color }]}>
              {isEditing ? 'キャンセル' : '編集'}
            </Text>
          </TouchableOpacity>

          {/* 食材名 - 編集可能 */}
          {isEditing ? (
            <TextInput
              style={[styles.foodNameInput, { color: expiryInfo.color }]}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="食材名"
              placeholderTextColor={`${expiryInfo.color}80`}
            />
          ) : (
            <Text style={[styles.foodName, { color: expiryInfo.color }]}>{food.name}</Text>
          )}

          {/* コメント - 表示のみ */}
          <Text style={[styles.comment, { color: expiryInfo.color }]}>"{food.comment}"</Text>
        </View>
      </View>
      
      <View style={styles.mainContent}>
        
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>詳細情報</Text>
            {isEditing && (
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* 登録日 - 編集可能 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>登録日: </Text>
            {isEditing ? (
              <TextInput
                style={styles.dateInput}
                value={editedRegisteredDate}
                onChangeText={setEditedRegisteredDate}
                placeholder="YYYY-MM-DD"
              />
            ) : (
              <Text style={styles.infoValue}>{food.registeredDate.toLocaleDateString()}</Text>
            )}
          </View>
          
          {/* 期限日 - 編集可能 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>期限: </Text>
            {isEditing ? (
              <TextInput
                style={styles.dateInput}
                value={editedExpiryDate}
                onChangeText={setEditedExpiryDate}
                placeholder="YYYY-MM-DD"
              />
            ) : (
              <Text style={styles.infoValue}>{food.expiryDate.toLocaleDateString()}</Text>
            )}
          </View>
          
          <Text style={[styles.infoText, { color: expiryInfo.color }]}>
            状態: {expiryStatus}
          </Text>
        </View>

        <View style={styles.recipeSection}>
          <Text style={styles.sectionTitle}>🍳 レシピを探す</Text>
          <Text style={styles.recipeDescription}>
            {food.name}を使った料理レシピを探してみましょう！
          </Text>
          
          {RECIPE_SITES.map((site) => (
            <TouchableOpacity 
              key={site.name}
              style={[styles.recipeButton, { backgroundColor: site.color }]}
              onPress={() => openRecipeUrl(generateRecipeUrl(food.name, site.urlTemplate), site.name)}
            >
              <Text style={styles.recipeButtonText}>{site.name}で検索</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 0,
  },
  mainContent: {
    padding: 20,
  },
  foodNameHeader: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    paddingTop: 80,
    marginBottom: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonInHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  editButtonInHeader: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  foodName: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  foodNameInput: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 5,
    minWidth: 200,
  },
  comment: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.9,
  },
  commentInput: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 5,
    minWidth: 200,
    minHeight: 40,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  dateInput: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 2,
    paddingHorizontal: 8,
    minWidth: 120,
  },
  recipeSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  recipeButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  recipeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 50,
  },
});
