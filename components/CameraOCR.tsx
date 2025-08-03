// CameraOCR.tsx - カメラでOCR撮影を行うコンポーネント
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { extractTextFromImage, parseOCRResult, OCRResult } from '../utils/ocrUtils';

interface CameraOCRProps {
  onOCRResult: (result: OCRResult) => void;
  onClose: () => void;
}

export default function CameraOCR({ onOCRResult, onClose }: CameraOCRProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  // デバッグ用：手動でテキストを入力してテスト
  const testWithManualText = () => {
    const testTexts = [
      '2025.9.12',
      '2025/9/12', 
      '25.9.12',
      '2025年9月12日',
      '賞味期限 2025.9.12',
      'ヨーグルト 2025.9.12',
      '20250912',
    ];

    Alert.alert(
      'デバッグモード - テキスト選択',
      'テストするテキストを選択してください',
      [
        ...testTexts.map((text, index) => ({
          text: text,
          onPress: () => {
            console.log('デバッグテスト - 入力テキスト:', text);
            const result = parseOCRResult(text);
            console.log('デバッグテスト - 解析結果:', result);
            onOCRResult(result);
            
            Alert.alert(
              'デバッグ結果',
              `入力: ${text}\n食材名: ${result.foodName || 'なし'}\n期限日: ${result.expiryDate?.toLocaleDateString() || 'なし'}`,
              [{ text: 'OK', onPress: onClose }]
            );
          }
        })),
        { text: 'キャンセル', style: 'cancel' as const }
      ]
    );
  };

  // カメラで撮影
  const takePicture = async () => {
    try {
      // カメラの権限をリクエスト
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('権限が必要です', 'カメラの使用権限を許可してください');
        return;
      }

      // カメラを起動
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('エラー', 'カメラの起動に失敗しました');
    }
  };

  // ギャラリーから選択
  const pickImage = async () => {
    try {
      // メディアライブラリの権限をリクエスト
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('権限が必要です', 'フォトライブラリの使用権限を許可してください');
        return;
      }

      // ギャラリーを開く
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('エラー', 'ギャラリーの起動に失敗しました');
    }
  };

  // 画像をOCR処理
  const processImage = async (imageUri: string) => {
    setIsProcessing(true);
    try {
      console.log('OCR処理開始...');
      const extractedText = await extractTextFromImage(imageUri);
      console.log('抽出されたテキスト:', extractedText);
      
      const result = parseOCRResult(extractedText);
      console.log('解析結果:', result);
      
      // 結果を親コンポーネントに渡す
      onOCRResult(result);
      
      // 成功メッセージ
      let message = 'OCR処理が完了しました！\n\n';
      message += `抽出されたテキスト:\n${extractedText.slice(0, 100)}...\n\n`;
      
      if (result.foodName) {
        message += `食材名: ${result.foodName}\n`;
      }
      if (result.expiryDate) {
        message += `期限日: ${result.expiryDate.toLocaleDateString()}\n`;
      }
      if (!result.foodName && !result.expiryDate) {
        message += '期限日が見つかりませんでした。\n手動で入力してください。';
      }
      
      Alert.alert('OCR完了', message, [
        { text: 'OK', onPress: onClose }
      ]);
      
    } catch (error) {
      console.error('OCR processing error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert(
        'OCR エラー', 
        `文字認識に失敗しました。\n\nエラー詳細:\n${errorMessage}\n\n以下をお試しください:\n• より明るい場所で撮影\n• カメラを近づける\n• 文字部分にピントを合わせる`,
        [
          { text: 'もう一度試す', onPress: () => setIsProcessing(false) },
          { text: 'キャンセル', onPress: onClose }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📷 期限をカメラで読み取り</Text>
        <Text style={styles.description}>
          食品パッケージやレシートの期限部分を撮影してください
        </Text>

        {/* 撮影された画像のプレビュー */}
        {capturedImage && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          </View>
        )}

        {/* 処理中インジケーター */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.processingText}>文字を認識中...</Text>
          </View>
        )}

        {/* ボタン群 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cameraButton]} 
            onPress={takePicture}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>📸 カメラで撮影</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.galleryButton]} 
            onPress={pickImage}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>🖼️ ギャラリーから選択</Text>
          </TouchableOpacity>

          {/* デバッグモードボタン */}
          <TouchableOpacity 
            style={[styles.button, styles.debugButton]} 
            onPress={testWithManualText}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>🧪 テストモード</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={onClose}
            disabled={isProcessing}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>キャンセル</Text>
          </TouchableOpacity>
        </View>

        {/* 使い方のヒント */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 撮影のコツ</Text>
          <Text style={styles.tipsText}>• 期限部分にピントを合わせる</Text>
          <Text style={styles.tipsText}>• 明るい場所で撮影する</Text>
          <Text style={styles.tipsText}>• 文字が水平になるように撮影する</Text>
          <Text style={styles.tipsText}>• 影や反射を避ける</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  processingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#4CAF50',
  },
  galleryButton: {
    backgroundColor: '#2196F3',
  },
  debugButton: {
    backgroundColor: '#FF9800',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButtonText: {
    color: '#666',
  },
  tipsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
