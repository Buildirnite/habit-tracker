import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HabitsContext } from '../context/HabitsContext';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function CalendarScreen() {
  const { habits } = useContext(HabitsContext);
  const scrollRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [allNotes, setAllNotes] = useState({});

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, []);

  // Cargar notas al iniciar
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const storedNotes = await AsyncStorage.getItem('@calendar_notes');
        if (storedNotes) setAllNotes(JSON.parse(storedNotes));
      } catch (error) {
        console.error('Error cargando notas', error);
      }
    };
    loadNotes();
  }, []);

  // Generar los últimos 3 meses con alineación correcta
  const monthsData = useMemo(() => {
    const data = [];
    const todayObj = new Date();
    const currentTodayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

    for (let i = 0; i < 3; i++) {
      const targetMonth = new Date(todayObj.getFullYear(), todayObj.getMonth() - i, 1);
      const year = targetMonth.getFullYear();
      const month = targetMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Calcular días vacíos al inicio (0 = Domingo, 1 = Lunes, etc.)
      let firstDayOfWeek = targetMonth.getDay();
      firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Ajustar para que Lunes sea 0

      const days = Array(firstDayOfWeek).fill(null); // Días vacíos

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        const completedHabits = habits.filter(h => h.completions[dateStr]);
        let status = 'none'; // gris
        if (habits.length > 0 && completedHabits.length === habits.length) status = 'all'; // verde
        else if (completedHabits.length > 0) status = 'some'; // naranja (solicitado como naranja en vez de rojo)

        days.push({ day: d, dateStr, status, completedHabits, isToday: dateStr === currentTodayStr });
      }
      data.push({ name: targetMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' }), days });
    }
    return data.reverse();
  }, [habits]);

  const handleDayPress = (dayData) => {
    if (!dayData) return; // Ignorar toques en días vacíos
    setSelectedDate(dayData);
    setNoteText(allNotes[dayData.dateStr] || '');
    setModalVisible(true);
  };

  const handleSaveNote = async () => {
    const updatedNotes = { ...allNotes, [selectedDate.dateStr]: noteText };
    setAllNotes(updatedNotes);
    try {
      await AsyncStorage.setItem('@calendar_notes', JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error guardando nota', error);
    }
    setModalVisible(false);
  };

  const getColorForStatus = (status) => {
    if (status === 'all') return '#2ecc71'; // Verde
    if (status === 'some') return '#f39c12'; // Naranja
    return '#f0f0f0'; // Gris
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef}>
        {monthsData.map((month, index) => (
          <View key={index} style={styles.monthSection}>
            <Text style={styles.monthTitle}>{month.name}</Text>

            {/* Headers de días */}
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((day, idx) => (
                <Text key={idx} style={styles.weekdayText}>{day}</Text>
              ))}
            </View>

            {/* Grid de días alineado a 7 columnas */}
            <View style={styles.daysGrid}>
              {month.days.map((dayData, idx) => {
                if (!dayData) return <View key={idx} style={styles.emptyDay} />;

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dayCircle,
                      { backgroundColor: getColorForStatus(dayData.status) },
                      dayData.isToday && styles.todayCircle
                    ]}
                    onPress={() => handleDayPress(dayData)}
                  >
                    <Text style={[
                      styles.dayText,
                      dayData.status === 'none' && { color: '#333' },
                      dayData.isToday && styles.todayText
                    ]}>
                      {dayData.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Leyenda */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#2ecc71' }]} /><Text>Todo</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#f39c12' }]} /><Text>Parcial</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#f0f0f0' }]} /><Text>Ninguno</Text></View>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Modal Bottom Sheet */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedDate?.dateStr}</Text>

            <View style={styles.completedSection}>
              {selectedDate?.completedHabits.length > 0 ? (
                selectedDate.completedHabits.map(h => (
                  <View key={h.id} style={styles.habitItem}>
                    <Ionicons name={h.icon} size={20} color={h.color} />
                    <Text style={styles.habitText}>{h.name}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noHabitsText}>Ningún hábito completado.</Text>
              )}
            </View>

            <Text style={styles.noteLabel}>Nota del día:</Text>
            <TextInput
              style={styles.noteInput}
              multiline
              numberOfLines={4}
              placeholder="Escribe algo sobre este día..."
              value={noteText}
              onChangeText={setNoteText}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveNoteButton} onPress={handleSaveNote}>
                <Text style={styles.saveNoteButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  monthSection: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  monthTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textTransform: 'capitalize', textAlign: 'center' },
  weekdaysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  weekdayText: { width: '14%', textAlign: 'center', fontWeight: 'bold', color: '#888' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  emptyDay: { width: '14%', aspectRatio: 1 },
  dayCircle: { width: '14%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 20, marginVertical: 2, borderWidth: 2, borderColor: 'transparent' },
  todayCircle: { borderColor: '#2ecc71', backgroundColor: '#fff' },
  dayText: { color: '#fff', fontWeight: 'bold' },
  todayText: { color: '#2ecc71' },
  legendContainer: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 20, padding: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 15, height: 15, borderRadius: 7.5, marginRight: 5 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, minHeight: 400 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  completedSection: { maxHeight: 150, marginBottom: 20 },
  habitItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  habitText: { fontSize: 16, marginLeft: 10 },
  noHabitsText: { textAlign: 'center', color: '#888', fontStyle: 'italic' },
  noteLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  noteInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, height: 100, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', gap: 15, marginTop: 20 },
  closeButton: { flex: 1, backgroundColor: '#eee', padding: 15, borderRadius: 10, alignItems: 'center' },
  closeButtonText: { color: '#333', fontWeight: 'bold' },
  saveNoteButton: { flex: 1, backgroundColor: '#2ecc71', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveNoteButtonText: { color: '#fff', fontWeight: 'bold' }
});
