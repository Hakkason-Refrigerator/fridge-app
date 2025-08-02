
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e0ecff',
        padding: 0,
        paddingTop: 100,
        alignItems: 'center',
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
import { useRouter } from "expo-router";

export default function Register() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    const [expiryDate, setExpiryDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSubmit = () => {
        if (!name) {
        alert("食材名を入力してください");
        return;
        }
        console.log({ name, comment, expiryDate });
        router.back(); // 仮で戻るだけ
    };

    return (
        <View style={styles.container}>
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

            {/* 保存ボタン */}
            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSubmit}
            >
                <Text style={styles.saveButtonText}>保存して戻る</Text>
            </TouchableOpacity>
        </View>
    );
}
