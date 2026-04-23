import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitsContext } from '../context/HabitsContext';

const ICONS = [
  'fitness-outline', 'walk-outline', 'book-outline', 'water-outline',
  'body-outline', 'trophy-outline', 'pencil-outline', 'nutrition-outline',
  'moon-outline', 'color-palette-outline'
];

const COLORS = [
  '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db',
  '#9b59b6', '#e91e63', '#ff5722', '#795548', '#607d8b', '#34495e',
  '#ff8a80', '#ea80fc', '#8c9eff', '#80d8ff', '#ccff90', '#ffd180'
];

export default function EditHabitScreen({ route, navigation }) {
  const { habit } = route.params;
  const { updateHabit } = useContext(HabitsContext);

  const [name, setName] = useState(habit.name);
  const [selectedIcon, setSelectedIcon] = useState(habit.icon);
  const [selectedColor, setSelectedColor] = useState(habit.color);

  const handleSave = () => {
    if (!name.trim()) return;
    updateHabit(habit.id, { name, icon: selectedIcon, color: selectedColor });
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nombre del Hábito</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Ícono</Text>
      <View style={styles.grid}>
        {ICONS.map((icon) => (
          <TouchableOpacity
            key={icon}
            style={[styles.iconItem, selectedIcon === icon && styles.selectedItem]}
            onPress={() => setSelectedIcon(icon)}
          >
            <Ionicons name={icon} size={30} color={selectedIcon === icon ? '#2ecc71' : '#333'} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Color</Text>
      <View style={styles.colorGrid}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.colorItem, { backgroundColor: color }, selectedColor === color && styles.selectedColorItem]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Actualizar</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  iconItem: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 10 },
  selectedItem: { borderColor: '#2ecc71', backgroundColor: '#f0fdf4' },
  colorItem: { width: 45, height: 45, borderRadius: 22.5 },
  selectedColorItem: { borderWidth: 3, borderColor: '#333' },
  buttonsContainer: { flexDirection: 'row', gap: 15, marginTop: 30 },
  cancelButton: { flex: 1, backgroundColor: '#e0e0e0', padding: 15, borderRadius: 10, alignItems: 'center' },
  cancelButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  saveButton: { flex: 1, backgroundColor: '#2ecc71', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
