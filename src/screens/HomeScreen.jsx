import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitsContext } from '../context/HabitsContext';

export default function HomeScreen() {
  const { habits, toggleCompletion } = useContext(HabitsContext);
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus hábitos para hoy</Text>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isCompleted = item.completions[todayStr];
          return (
            <TouchableOpacity
              style={[styles.habitCard, isCompleted && styles.completedCard]}
              onPress={() => toggleCompletion(item.id, todayStr)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={24} color="#fff" />
              </View>
              <Text style={[styles.habitName, isCompleted && styles.completedText]}>
                {item.name}
              </Text>
              <Ionicons
                name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
                size={28}
                color={isCompleted ? "#2ecc71" : "#ccc"}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  habitCard: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#f8f9fa', borderRadius: 12, marginBottom: 10 },
  completedCard: { opacity: 0.7 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  habitName: { flex: 1, fontSize: 16, fontWeight: '600' },
  completedText: { textDecorationLine: 'line-through', color: '#888' }
});
