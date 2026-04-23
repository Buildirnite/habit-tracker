import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const HabitsContext = createContext();

export const HabitsProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);

  // Cargar hábitos al iniciar la app
  useEffect(() => {
    const loadHabits = async () => {
      try {
        const storedHabits = await AsyncStorage.getItem('@habits');
        if (storedHabits) {
          setHabits(JSON.parse(storedHabits));
        }
      } catch (error) {
        console.error('Error cargando hábitos', error);
      }
    };
    loadHabits();
  }, []);

  // Función interna para guardar en estado y en Storage al mismo tiempo
  const saveHabits = async (newHabits) => {
    setHabits(newHabits);
    try {
      await AsyncStorage.setItem('@habits', JSON.stringify(newHabits));
    } catch (error) {
      console.error('Error guardando hábitos', error);
    }
  };

  const addHabit = (habit) => {
    saveHabits([...habits, { ...habit, id: Date.now().toString(), completions: {} }]);
  };

  const updateHabit = (id, updatedData) => {
    const newHabits = habits.map(h => (h.id === id ? { ...h, ...updatedData } : h));
    saveHabits(newHabits);
  };

  const deleteHabit = (id) => {
    const newHabits = habits.filter(h => h.id !== id);
    saveHabits(newHabits);
  };

  const toggleCompletion = (habitId, dateStr) => {
    const newHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const newCompletions = { ...habit.completions };
        if (newCompletions[dateStr]) {
          delete newCompletions[dateStr];
        } else {
          newCompletions[dateStr] = true;
        }
        return { ...habit, completions: newCompletions };
      }
      return habit;
    });
    saveHabits(newHabits);
  };

  return (
    <HabitsContext.Provider value={{ habits, addHabit, updateHabit, deleteHabit, toggleCompletion }}>
      {children}
    </HabitsContext.Provider>
  );
};
