import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import Icon from '../components/Icon';
import OutletSelector from '../components/OutletSelector';

export default function Checklist() {
  const [checklist, setChecklist] = useState<any[]>([]);
  const [date] = useState(new Date().toISOString().split('T')[0]);
  const [outletId, setOutletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'OPENING' | 'CLOSING'>('OPENING');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [role, setRole] = useState<string | null>(null);

  const fetchChecklist = async (activeOutletId?: string) => {
    const id = activeOutletId || await AsyncStorage.getItem('outletId');
    const userRole = await AsyncStorage.getItem('role');
    setRole(userRole);
    if (!id) {
      if (userRole === 'ADMIN') {
        const outlets = stateService.getOutlets();
        if (outlets.length > 0) {
          const firstId = outlets[0].id.toString();
          await AsyncStorage.setItem('outletId', firstId);
          await AsyncStorage.setItem('outletName', outlets[0].name);
          setOutletId(firstId);
          setChecklist(stateService.getChecklist(firstId, date));
        }
      }
      setLoading(false);
      return;
    }
    setOutletId(id);
    setChecklist(stateService.getChecklist(id, date));
    setLoading(false);
  };

  const handleOutletChange = async (newOutletId: string) => {
    setLoading(true);
    await AsyncStorage.setItem('outletId', newOutletId);
    const outlets = stateService.getOutlets();
    const selected = outlets.find((o: any) => o.id.toString() === newOutletId);
    if (selected) await AsyncStorage.setItem('outletName', selected.name);
    setOutletId(newOutletId);
    setChecklist(stateService.getChecklist(newOutletId, date));
    setLoading(false);
  };

  useEffect(() => {
    fetchChecklist();
  }, []);

  const isTimeAllowed = (type: 'OPENING' | 'CLOSING') => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    if (type === 'OPENING') {
      // 11:00 AM to 12:15 PM -> 660 mins to 735 mins
      return totalMinutes >= 660 && totalMinutes <= 735;
    } else {
      // 10:00 PM to 11:30 PM -> 1320 mins to 1410 mins
      return totalMinutes >= 1320 && totalMinutes <= 1410;
    }
  };

  const handleToggle = (id: number, currentStatus: string, type: 'OPENING' | 'CLOSING') => {
    if (!isTimeAllowed(type)) {
      const msg = type === 'OPENING' 
        ? 'Opening checklists can only be marked between 11:00 AM and 12:15 PM.'
        : 'Closing checklists can only be marked between 10:00 PM and 11:30 PM.';
      Alert.alert('Restricted Time', msg);
      return;
    }

    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    stateService.toggleChecklistItem(id, nextStatus);
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item));
  };

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    if (outletId) {
      const newItem = stateService.addChecklistItem(outletId, date, newTaskName, activeTab);
      setChecklist(prev => [...prev, newItem]);
    }
    setNewTaskName('');
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: number) => {
    Alert.alert('Delete Task', 'Are you sure you want to remove this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        stateService.deleteChecklistItem(id);
        setChecklist(prev => prev.filter(c => c.id !== id));
      }}
    ]);
  };

  const getTaskIconName = (name: string) => {
    const lowercase = name.toLowerCase();
    if (lowercase.includes('open')) return 'unlock';
    if (lowercase.includes('clean')) return 'clean';
    if (lowercase.includes('kitchen')) return 'kitchen';
    if (lowercase.includes('inventory')) return 'inventory';
    if (lowercase.includes('cash') || lowercase.includes('counter')) return 'sales';
    if (lowercase.includes('attendance') || lowercase.includes('staff')) return 'staff';
    if (lowercase.includes('gas')) return 'gas';
    return 'checklist';
  };

  if (loading) {
    return (
      <LayoutWrapper title="Operations Checklist">
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      </LayoutWrapper>
    );
  }

  if (!outletId) {
    return (
      <LayoutWrapper title="Operations Checklist">
        <View style={styles.centeredContainer}>
          <Text style={styles.noOutletText}>
            Log in with an assigned branch manager role to access the daily operational checklist.
          </Text>
        </View>
      </LayoutWrapper>
    );
  }

  const currentTasks = checklist.filter(c => c.timeRange === activeTab);
  const completedCount = currentTasks.filter(c => c.status === 'COMPLETED').length;
  const totalCount = currentTasks.length;

  return (
    <LayoutWrapper title="Operations Checklist">
      <OutletSelector selectedOutletId={outletId} onSelect={handleOutletChange} />
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'OPENING' && styles.activeTab]}
          onPress={() => setActiveTab('OPENING')}
        >
          <Text style={[styles.tabText, activeTab === 'OPENING' && styles.activeTabText]}>Opening Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'CLOSING' && styles.activeTab]}
          onPress={() => setActiveTab('CLOSING')}
        >
          <Text style={[styles.tabText, activeTab === 'CLOSING' && styles.activeTabText]}>Closing Tasks</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header summary info */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryTitle}>Today's {activeTab === 'OPENING' ? 'Opening' : 'Closing'}</Text>
            <Text style={styles.summaryDate}>{date}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: completedCount === totalCount && totalCount > 0 ? '#f0fdf4' : '#fdfbfa', borderColor: completedCount === totalCount && totalCount > 0 ? '#bbf7d0' : '#ebdcd3', borderWidth: 1 }]}>
            <Text style={[styles.badgeText, { color: completedCount === totalCount && totalCount > 0 ? '#146e4e' : '#146e4e' }]}>
              {completedCount} of {totalCount} Done
            </Text>
          </View>
        </View>

        {/* Task List */}
        <View style={styles.card}>
          {currentTasks.map((item, index) => {
            const isCompleted = item.status === 'COMPLETED';
            return (
              <View
                key={item.id}
                style={[
                  styles.taskItem,
                  index !== currentTasks.length - 1 && styles.divider
                ]}
              >
                <View style={styles.taskLeft}>
                  {role === 'ADMIN' && (
                    <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={styles.deleteBtn}>
                      <Icon name="trash" color="#d32f2f" size={16} />
                    </TouchableOpacity>
                  )}
                  <View style={[styles.iconCircle, isCompleted && styles.activeIconCircle]}>
                      <Icon name={getTaskIconName(item.taskName)} color={isCompleted ? '#146e4e' : '#146e4e'} size={18} />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskName, isCompleted && styles.completedTaskName]}>
                      {item.taskName}
                    </Text>
                    <Text style={[styles.taskStatus, isCompleted && styles.completedStatus]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Switch
                  value={isCompleted}
                  onValueChange={() => handleToggle(item.id, item.status, item.timeRange)}
                  trackColor={{ false: '#ebdcd3', true: '#a67c6d' }}
                  thumbColor={isCompleted ? '#146e4e' : '#f4f3f4'}
                />
              </View>
            );
          })}

          {currentTasks.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()} checklists registered for today.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add button */}
      {role === 'ADMIN' && (
        <TouchableOpacity
          onPress={() => setIsModalOpen(true)}
          style={styles.floatingButton}
        >
          <Text style={styles.floatingButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      )}

      {/* Add Task Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add {activeTab === 'OPENING' ? 'Opening' : 'Closing'} Task</Text>
              
              <Text style={styles.formLabel}>Task Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={newTaskName}
                onChangeText={setNewTaskName}
                placeholder="e.g. Turn off AC"
                placeholderTextColor="#8c6e65"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddTask} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  noOutletText: {
    fontSize: 14,
    color: '#8c6e65',
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#ebdcd3',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: '#146e4e',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8c6e65',
  },
  activeTabText: {
    color: '#146e4e',
    fontWeight: '900',
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ebdcd3',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3d251e',
  },
  summaryDate: {
    fontSize: 12,
    color: '#8c6e65',
    fontWeight: '600',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#ebdcd3',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deleteBtn: {
    marginRight: 12,
    padding: 6,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdfbfa',
    borderWidth: 1.5,
    borderColor: '#ebdcd3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activeIconCircle: {
    backgroundColor: '#e8f5e9',
    borderColor: '#10b981',
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3d251e',
  },
  completedTaskName: {
    textDecorationLine: 'line-through',
    color: '#8c6e65',
  },
  taskStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8c6e65',
    marginTop: 2,
  },
  completedStatus: {
    color: '#146e4e',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#8c6e65',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    backgroundColor: '#146e4e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  floatingButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(61, 37, 30, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3d251e',
    marginBottom: 20,
    textAlign: 'center',
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3d251e',
    marginBottom: 6,
  },
  modalInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#3d251e',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8c6e65',
  },
  saveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#146e4e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
