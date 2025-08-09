import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform, StyleSheet, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useFoodStore } from "../store/foodStore";
import CameraOCR from "../components/CameraOCR";
import { OCRResult } from "../utils/ocrUtils";

export default function Register() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    // タイムゾーンの影響を回避するため、今日の正午に設定
    const [expiryDate, setExpiryDate] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0);
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showOCRModal, setShowOCRModal] = useState(false);

    // OCR結果を処理する関数
    const handleOCRResult = (result: OCRResult) => {
        if (result.foodName) {
            setName(result.foodName);
        }
        if (result.expiryDate) {
            setExpiryDate(result.expiryDate);
        }
    };

    const handleSubmit = async () => {
        if (!name) {
        alert("食材名を入力してください");
        return;
        }

        try {

        await useFoodStore.getState().addFood({
            name,
            comment,
            expiry_date: expiryDate.toISOString().slice(0, 10), // YYYY-MM-DD
            registered_date: new Date().toISOString(),
            is_consumed: false,
        } as any);

        router.back(); // 登録後に前の画面に戻る
        } catch (error) {
        console.error("登録エラー:", error);
        alert("食材の登録に失敗しました");
        }
    };

    return (
        <View style={styles.container}>
        {/* 戻るボタン */}
        <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
        >
            <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>

        <Text style={styles.title}>食材を登録</Text>

        {/* 食材名 */}
        <Text style={styles.label}>📝 食材名</Text>
        <TextInput
            style={styles.input}
            placeholder="例：ヨーグルト"
            value={name}
            onChangeText={setName}
        />

        {/* コメント */}
        <Text style={styles.label}>💬 コメント（任意）</Text>
        <TextInput
            style={styles.input}
            placeholder="例：早めに食べてね〜"
            value={comment}
            onChangeText={setComment}
        />

        {/* 賞味期限 */}
        <Text style={styles.label}>📅 賞味期限</Text>
        <TouchableOpacity
            style={[styles.input, styles.dateButton]}
            onPress={() => setShowDatePicker(true)}
        >
            <Text style={styles.dateText}>{expiryDate.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
            <DateTimePicker
            value={expiryDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setExpiryDate(selectedDate);
            }}
            />
        )}

        {/* OCRボタン */}
        <TouchableOpacity
            style={styles.ocrButton}
            onPress={() => setShowOCRModal(true)}
        >
            <Text style={styles.ocrButtonText}>📷 カメラで期限を読み取り</Text>
        </TouchableOpacity>

        {/* 保存ボタン */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
            <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>

        {/* OCRモーダル */}
        <Modal
            visible={showOCRModal}
            animationType="slide"
            presentationStyle="fullScreen"
        >
            <CameraOCR
                onOCRResult={handleOCRResult}
                onClose={() => setShowOCRModal(false)}
            />
        </Modal>
        </View>
    );
}const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e0ecff',
        paddingTop: 100,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 70,
        left: 30,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 1,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3748',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2d3748',
        marginBottom: 24,
        width: 500,
    },
    label: {
        fontSize: 16,
        color: '#374151',
        marginBottom: 4,
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        marginBottom: 16,
        width: 330,
    },
    dateButton: {
        alignItems: 'center',
    },
    dateText: {
        color: '#374151',
    },
    ocrButton: {
        backgroundColor: '#10b981',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
        width: 330,
    },
    ocrButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
        width: 330,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
