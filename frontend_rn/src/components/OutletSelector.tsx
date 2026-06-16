import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stateService } from '../services/stateService';

interface OutletSelectorProps {
  selectedOutletId: string | null;
  onSelect: (outletId: string) => void;
}

export default function OutletSelector({ selectedOutletId, onSelect }: OutletSelectorProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [outlets, setOutlets] = useState<any[]>([]);

  useEffect(() => {
    const checkRole = async () => {
      const role = await AsyncStorage.getItem('role');
      setIsAdmin(role === 'ADMIN');
      if (role === 'ADMIN') {
        setOutlets(stateService.getOutlets());
      }
    };
    checkRole();
  }, []);

  if (!isAdmin || outlets.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Outlet:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {outlets.map((outlet) => {
          const isSelected = selectedOutletId?.toString() === outlet.id.toString();
          return (
            <TouchableOpacity
              key={outlet.id}
              style={[styles.chip, isSelected && styles.activeChip]}
              onPress={() => onSelect(outlet.id.toString())}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
                {outlet.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#ebdcd3',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8c6e65',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fbf8f3',
    borderWidth: 1,
    borderColor: '#ebdcd3',
  },
  activeChip: {
    backgroundColor: '#146e4e',
    borderColor: '#146e4e',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3d251e',
  },
  activeChipText: {
    color: '#ffffff',
  },
});
