import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from "expo-router";

interface HeaderProps {
  title: string; 
  subtitle: string;
  showAddButton: boolean;
  onAddPress: () => void;
  backgroundColor: string;
}

export default function Header({ title, subtitle, showAddButton, onAddPress, backgroundColor }: HeaderProps) {
  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {showAddButton && (
        <TouchableOpacity onPress={onAddPress} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity> 
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  subtitle: {
    fontSize: 16,
    color: '#5a5353ff',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
