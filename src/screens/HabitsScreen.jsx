import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitsContext } from '../context/HabitsContext';

export default function HabitsScreen({ navigation }) {
  const { habits, deleteHabit } = useContext(HabitsContext);

  const handleDelete = (id, name) => {
    Alert.alert(
      "Eliminar hábito",
      `¿Estás seguro de que quieres eliminar "${name}"? Perderás todo su historial.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteHabit(id) }
      ]
    );
  };

  if (habits.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="add-circle-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>No tienes hábitos aún</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Agregar')}>
          <Text style={styles.addButtonText}>Crear mi primer hábito</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.habitCard}>
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={24} color="#fff" />
            </View>
            <Text style={styles.habitName}>{item.name}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Editar', { habit: item })}
              >
                <Ionicons name="pencil-outline" size={22} color="#3498db" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(item.id, item.name)}
              >
                <Ionicons name="trash-outline" size={22} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  emptyText: { fontSize: 18, color: '#888', marginTop: 10, marginBottom: 20 },
  addButton: { backgroundColor: '#2ecc71', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  habitCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  habitName: { flex: 1, fontSize: 16, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 15 },
  actionButton: { padding: 5 }
});
