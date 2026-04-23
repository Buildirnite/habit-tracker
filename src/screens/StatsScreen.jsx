import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitsContext } from '../context/HabitsContext';

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const SHORT_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function StatsScreen() {
  const { habits } = useContext(HabitsContext);

  // Helper para generar formato YYYY-MM-DD sin problemas de zona horaria
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const statsData = useMemo(() => {
    let totalCompletions = 0;
    let bestStreak = 0;
    let bestStreakHabitName = 'Ninguna';
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // L a D

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDate(today);

    // Calcular días previos para las rachas
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    habits.forEach(habit => {
      const completionDates = Object.keys(habit.completions);
      totalCompletions += completionDates.length;

      // Calcular mejor racha actual del hábito
      let currentStreak = 0;
      let checkDate = new Date(today);
      let checkDateStr = todayStr;

      // Si no se hizo hoy, verificamos si la racha sigue viva desde ayer
      if (!habit.completions[checkDateStr]) {
        checkDate.setDate(checkDate.getDate() - 1);
        checkDateStr = formatDate(checkDate);
      }

      while (habit.completions[checkDateStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        checkDateStr = formatDate(checkDate);
      }

      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
        bestStreakHabitName = habit.name;
      }

      // Calcular mejor día de la semana
      completionDates.forEach(dateStr => {
        const [y, m, d] = dateStr.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        let jsDay = dateObj.getDay(); // 0 = Domingo
        let ourDay = jsDay === 0 ? 6 : jsDay - 1; // Convertir a L=0, M=1... D=6
        dayCounts[ourDay]++;
      });
    });

    const maxDayCount = Math.max(...dayCounts, 1); // Evitar división por cero

    // Calcular datos de los últimos 7 días
    const last7Days = [];
    const totalHabitsCount = habits.length;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = formatDate(d);
      const displayDate = `${d.getDate()}/${d.getMonth() + 1}`;

      let completedCount = 0;
      habits.forEach(h => {
        if (h.completions[dateStr]) completedCount++;
      });

      last7Days.push({ dateStr, displayDate, completedCount });
    }

    return { totalCompletions, bestStreak, bestStreakHabitName, dayCounts, maxDayCount, last7Days, totalHabitsCount };
  }, [habits]);

  const calculateHabitRendimiento = (completions) => {
    const totalCompletions = Object.keys(completions).length;
    // Asumimos porcentaje basado en 30 días
    const percent = Math.min((totalCompletions / 30) * 100, 100).toFixed(0);

    let barColor = '#e74c3c'; // Rojo < 40%
    if (percent >= 70) barColor = '#2ecc71'; // Verde
    else if (percent >= 40) barColor = '#f1c40f'; // Amarillo

    return { total: totalCompletions, percent, barColor };
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* SECCIÓN 1: Resumen General */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="list" size={24} color="#3498db" />
          <Text style={styles.summaryValue}>{habits.length}</Text>
          <Text style={styles.summaryLabel}>Activos</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="checkmark-done" size={24} color="#2ecc71" />
          <Text style={styles.summaryValue}>{statsData.totalCompletions}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="flame" size={24} color="#e67e22" />
          <Text style={styles.summaryValue}>{statsData.bestStreak}</Text>
          <Text style={styles.summaryLabel} numberOfLines={1}>{statsData.bestStreakHabitName}</Text>
        </View>
      </View>

      {/* SECCIÓN 4: Últimos 7 Días */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Últimos 7 días</Text>
        <View style={styles.last7DaysContainer}>
          {statsData.last7Days.map((day, idx) => {
            // Altura máxima del gráfico 100px
            const columnHeight = statsData.totalHabitsCount > 0
              ? (day.completedCount / statsData.totalHabitsCount) * 100
              : 0;

            const isToday = idx === 6;

            return (
              <View key={idx} style={styles.verticalColumnWrapper}>
                <Text style={styles.columnCountText}>{day.completedCount}</Text>
                <View style={styles.columnTrack}>
                  <View
                    style={[
                      styles.columnFill,
                      { height: `${Math.max(columnHeight, 5)}%`, backgroundColor: isToday ? '#2ecc71' : '#3498db' }
                    ]}
                  />
                </View>
                <Text style={[styles.columnDateText, isToday && styles.todayDateText]}>{day.displayDate}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* SECCIÓN 3: Mejor día de la semana */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mejor día de la semana</Text>
        <View style={styles.daysChartContainer}>
          {WEEKDAYS.map((dayName, idx) => {
            const count = statsData.dayCounts[idx];
            const isBest = count === statsData.maxDayCount && count > 0;
            const widthPercent = (count / statsData.maxDayCount) * 100;

            return (
              <View key={idx} style={styles.horizontalBarRow}>
                <Text style={styles.horizontalBarLabel}>{SHORT_DAYS[idx]}</Text>
                <View style={styles.horizontalBarTrack}>
                  <View
                    style={[
                      styles.horizontalBarFill,
                      { width: `${widthPercent}%`, backgroundColor: isBest ? '#2ecc71' : '#bdc3c7' }
                    ]}
                  />
                </View>
                <Text style={styles.horizontalBarCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* SECCIÓN 2: Rendimiento por hábito */}
      <View style={[styles.section, { paddingBottom: 40 }]}>
        <Text style={styles.sectionTitle}>Rendimiento por hábito (30 días)</Text>
        {habits.map((item) => {
          const stats = calculateHabitRendimiento(item.completions);
          return (
            <View key={item.id} style={styles.statCard}>
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <Ionicons name={item.icon} size={20} color={item.color} style={{ marginRight: 8 }} />
                  <Text style={styles.habitName}>{item.name}</Text>
                </View>
                <Text style={styles.statTextPercent}>{stats.percent}%</Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${stats.percent}%`, backgroundColor: stats.barColor }
                  ]}
                />
              </View>
              <Text style={styles.statTotalText}>{stats.total} días completados en total</Text>
            </View>
          );
        })}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  section: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 15, padding: 20, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#2c3e50' },

  // Section 1
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 15 },
  summaryCard: { flex: 1, backgroundColor: '#fff', padding: 15, marginHorizontal: 5, borderRadius: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  summaryValue: { fontSize: 22, fontWeight: 'bold', marginTop: 10, color: '#333' },
  summaryLabel: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },

  // Section 2
  statCard: { marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  habitName: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  statTextPercent: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  progressBarContainer: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 5 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  statTotalText: { fontSize: 13, color: '#95a5a6', alignSelf: 'flex-end' },

  // Section 3
  daysChartContainer: { gap: 10 },
  horizontalBarRow: { flexDirection: 'row', alignItems: 'center' },
  horizontalBarLabel: { width: 20, fontSize: 14, fontWeight: 'bold', color: '#7f8c8d' },
  horizontalBarTrack: { flex: 1, height: 12, backgroundColor: '#f1f2f6', borderRadius: 6, marginHorizontal: 10, overflow: 'hidden' },
  horizontalBarFill: { height: '100%', borderRadius: 6 },
  horizontalBarCount: { width: 25, textAlign: 'right', fontSize: 14, color: '#2c3e50', fontWeight: 'bold' },

  // Section 4
  last7DaysContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, paddingTop: 10 },
  verticalColumnWrapper: { alignItems: 'center', width: '13%' },
  columnCountText: { fontSize: 12, color: '#7f8c8d', marginBottom: 5, fontWeight: '600' },
  columnTrack: { width: 20, height: 100, backgroundColor: '#f1f2f6', borderRadius: 10, justifyContent: 'flex-end', overflow: 'hidden' },
  columnFill: { width: '100%', borderRadius: 10 },
  columnDateText: { fontSize: 11, color: '#95a5a6', marginTop: 8 },
  todayDateText: { color: '#2ecc71', fontWeight: 'bold' }
});
