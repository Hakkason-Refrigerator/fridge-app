// ocrUtils.ts - OCR機能のユーティリティ
// OCR.space APIを使用した無料のOCR機能

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * OCR.space APIを使用して画像からテキストを抽出
 * 月25,000リクエストまで無料
 */
export async function extractTextFromImage(imageUri: string): Promise<string> {
  try {
    console.log('OCR処理開始 - 画像URI:', imageUri);
    
    // 画像を読み込んでファイルサイズを確認
    let processedImageUri = imageUri;
    const response = await fetch(imageUri);
    const blob = await response.blob();
    console.log('元の画像サイズ:', blob.size, 'bytes');
    
    if (blob.size === 0) {
      throw new Error('画像ファイルが空です');
    }

    // ファイルサイズが大きい場合はリサイズ
    if (blob.size > 512 * 1024) { // 512KB以上の場合
      console.log('画像が大きいためリサイズします...');
      try {
        const resizedImage = await manipulateAsync(
          imageUri,
          [
            { resize: { width: 1024 } }, // 幅を1024pxにリサイズ
          ],
          {
            compress: 0.7, // 圧縮率70%
            format: SaveFormat.JPEG,
          }
        );
        
        processedImageUri = resizedImage.uri;
        console.log('リサイズ完了 - 新しいURI:', processedImageUri);
        
        // リサイズ後のサイズを確認
        const resizedResponse = await fetch(processedImageUri);
        const resizedBlob = await resizedResponse.blob();
        console.log('リサイズ後のサイズ:', resizedBlob.size, 'bytes');
        
      } catch (resizeError) {
        console.warn('リサイズに失敗、元画像を使用:', resizeError);
        // リサイズに失敗した場合は元画像を使用
      }
    }

    // 最終的な画像を使用してOCR処理
    const finalResponse = await fetch(processedImageUri);
    const finalBlob = await finalResponse.blob();
    
    if (finalBlob.size === 0) {
      throw new Error('リサイズ後の画像ファイルが空です');
    }
    
    if (finalBlob.size > 1024 * 1024) { // 1MB制限
      throw new Error('画像ファイルが大きすぎます。より小さな画像を使用してください。');
    }

    const formData = new FormData();
    
    // React Nativeでのファイル添付方法を修正
    const fileExtension = processedImageUri.includes('.jpg') || processedImageUri.includes('.jpeg') ? 'jpg' : 'png';
    const fileName = `image.${fileExtension}`;
    
    // React Native用のファイル形式
    formData.append('file', {
      uri: processedImageUri,
      type: 'image/jpeg',
      name: fileName,
    } as any);
    
    formData.append('apikey', 'helloworld');
    formData.append('language', 'eng'); // 数字認識に強い英語モード
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '1'); // エンジン1（基本的だが安定）
    formData.append('isTable', 'false');

    console.log('OCR.space APIにリクエスト送信中...');

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('リクエストがタイムアウトしました')), 30000)
    );

    const fetchPromise = fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    const ocrResponse = await Promise.race([fetchPromise, timeoutPromise]) as Response;

    if (!ocrResponse.ok) {
      throw new Error(`HTTP Error: ${ocrResponse.status} ${ocrResponse.statusText}`);
    }

    const result = await ocrResponse.json();
    console.log('OCR API レスポンス:', JSON.stringify(result, null, 2));

    // エラーチェック
    if (result.IsErroredOnProcessing) {
      throw new Error(`OCR処理エラー: ${result.ErrorMessage || 'Unknown processing error'}`);
    }

    if (result.OCRExitCode > 1) {
      throw new Error(`OCR終了コードエラー: ${result.OCRExitCode}`);
    }

    if (!result.ParsedResults || result.ParsedResults.length === 0) {
      throw new Error('OCR結果が取得できませんでした');
    }

    const extractedText = result.ParsedResults[0].ParsedText || '';
    console.log('抽出されたテキスト:', extractedText);
    
    if (!extractedText.trim()) {
      throw new Error('テキストが抽出されませんでした。画像がぼやけているか、文字が小さすぎる可能性があります。');
    }
    
    return extractedText;

  } catch (error) {
    console.error('OCR Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`文字認識に失敗しました: ${errorMessage}`);
  }
}

/**
 * テキストから期限日を抽出する関数
 * 様々な日付形式に対応
 */
export function extractExpiryDate(text: string): Date | null {
  // 日付パターンを定義（より柔軟なパターンに変更）
  const datePatterns = [
    // 年月日
    /(\d{2,4})\.(\d{1,2})\.(\d{1,2})/g,
    /(\d{2,4})\/(\d{1,2})\/(\d{1,2})/g,
    /(\d{2,4})-(\d{1,2})-(\d{1,2})/g,
    /(\d{2,4})年(\d{1,2})月(\d{1,2})日/g,
    /令和(\d{1,2})年(\d{1,2})月(\d{1,2})日/g,
    /(\d{2,4})\s+(\d{1,2})\s+(\d{1,2})/g,
    /(\d{4})(\d{2})(\d{2})/g,
    // 年月のみ（例: 2025.9, 25.9, 2025/9, 25/9, 2025-9, 25-9, 2025年9月, 令和7年9月, 2025 9）
    /(\d{2,4})\.(\d{1,2})/g,
    /(\d{2,4})\/(\d{1,2})/g,
    /(\d{2,4})-(\d{1,2})/g,
    /(\d{2,4})年(\d{1,2})月/g,
    /令和(\d{1,2})年(\d{1,2})月/g,
    /(\d{2,4})\s+(\d{1,2})/g,
  ];

  const cleanText = text.replace(/\s+/g, ''); // 空白を除去
  console.log('期限抽出処理 - 入力テキスト:', text);
  console.log('期限抽出処理 - クリーン後:', cleanText);

  for (let i = 0; i < datePatterns.length; i++) {
    const pattern = datePatterns[i];
    const matches = [...cleanText.matchAll(pattern)];
    
    console.log(`パターン${i + 1} (${pattern.source}):`, matches.length > 0 ? '一致あり' : '一致なし');
    
    for (const match of matches) {
      console.log('一致した文字列:', match[0], '要素:', match.slice(1));
      try {
        let year: number;
        let month: number;
        let day: number = 1; // デフォルトは1日

        if (pattern.source.includes('令和')) {
          // 令和年号を西暦に変換
          const reiwaYear = parseInt(match[1]);
          year = reiwaYear + 2018; // 令和1年 = 2019年
          month = parseInt(match[2]);
          day = match[3] ? parseInt(match[3]) : 1;
        } else if (pattern.source.includes('(\\d{4})(\\d{2})(\\d{2})')) {
          // 8桁連続数字の場合 (例: 20250912)
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);
        } else if (match.length === 3) {
          // 年月のみ（dayが無い）
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          // 2桁年の場合は20xxに変換
          if (year < 100) {
            year = year < 50 ? 2000 + year : 1900 + year;
          }
          // 月末日を計算（タイムゾーンの影響を回避するため正午で計算）
          const tempDate = new Date(year, month, 0, 12, 0, 0, 0);
          day = tempDate.getDate();
        } else {
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);

          // 2桁年の場合は20xxに変換
          if (year < 100) {
            year = year < 50 ? 2000 + year : 1900 + year;
          }
        }

        // 妥当な日付かチェック
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          // タイムゾーンの影響を回避するため、正午（12:00）に設定
          const date = new Date(year, month - 1, day, 12, 0, 0, 0);
          console.log('作成された日付:', date.toLocaleDateString(), '有効性チェック中...');
          
          // 有効な日付で、未来の日付である場合のみ返す
          const today = new Date();
          today.setHours(0, 0, 0, 0); // 今日の0時に設定
          if (date.getTime() >= today.getTime() - 86400000) { // 1日前まで許可
            console.log('✅ 有効な期限日が見つかりました:', date.toLocaleDateString());
            return date;
          } else {
            console.log('❌ 日付が古すぎます:', date.toLocaleDateString());
          }
        } else {
          console.log('❌ 無効な日付:', `${year}/${month}/${day}`);
        }
      } catch (error) {
        console.log('❌ 日付変換エラー:', error);
        continue; // 次のパターンを試す
      }
    }
  }

  console.log('❌ 期限日が見つかりませんでした');
  return null;
}

/**
 * テキストから食材名を推測する関数
 * 一般的な食材キーワードを検索
 */
export function extractFoodName(text: string): string | null {
  const commonFoods = [
    'ヨーグルト', 'ヨーグル', 'プレーンヨーグルト',
    '牛乳', 'ミルク', '乳飲料',
    'チーズ', 'バター', 'マーガリン',
    'パン', '食パン', 'ロールパン',
    '卵', 'たまご', '玉子',
    'サラダ', 'レタス', 'キャベツ',
    'トマト', 'きゅうり', 'にんじん',
    '肉', '牛肉', '豚肉', '鶏肉',
    '魚', 'さかな', 'サーモン',
    '豆腐', 'とうふ', '納豆',
    'おにぎり', 'お弁当', '弁当',
  ];

  const cleanText = text.replace(/\s+/g, '');

  for (const food of commonFoods) {
    if (cleanText.includes(food)) {
      return food;
    }
  }

  return null;
}

/**
 * OCR結果を整形して返す関数
 */
export interface OCRResult {
  foodName?: string;
  expiryDate?: Date;
  rawText?: string; // オプショナルに変更
}

export function parseOCRResult(text: string): OCRResult {
  return {
    foodName: extractFoodName(text) || undefined,
    expiryDate: extractExpiryDate(text) || undefined,
    rawText: text, // 常にrawTextを含める（呼び出し側で制御）
  };
}
