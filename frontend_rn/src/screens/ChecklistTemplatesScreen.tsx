import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import Icon from '../components/Icon';

export default function ChecklistTemplatesScreen() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [editId, setEditId] = useState<number | null>(null);
  const [taskName, setTaskName] = useState('');
  const [timeRange, setTimeRange] = useState('Morning'); // "Morning", "Evening", "All Day"
  const [active, setActive] = useState(true);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await stateService.getChecklistTemplates();
      setTemplates(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleOpenAddModal = () => {
    setEditId(null);
    setTaskName('');
    setTimeRange('Morning');
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditId(item.id);
    setTaskName(item.taskName);
    setTimeRange(item.timeRange || 'Morning');
    setActive(item.active);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Please enter a task name.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        taskName: taskName.trim(),
        timeRange: timeRange,
        active: active,
      };

      if (editId) {
        await stateService.updateChecklistTemplate(editId, payload);
        Alert.alert('Success', 'Checklist task template updated!');
      } else {
        await stateService.createChecklistTemplate(payload);
        Alert.alert('Success', 'New checklist task template added!');
      }

      setIsModalOpen(false);
      loadTemplates();
    } catch (err) {
      Alert.alert('Error', 'Failed to save template.');
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to permanently delete this checklist task template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              setLoading(true);
              await stateService.deleteChecklistTemplate(id);
              Alert.alert('Success', 'Template deleted!');
              loadTemplates();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete template.');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <LayoutWrapper title="Audit & Checklist Templates">
      {loading && templates.length === 0 ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.8}
              onPress={handleOpenAddModal}
            >
              <Icon name="plus" color="#fff" size={20} />
              <Text style={styles.addButtonText}>Add New Checklist Task</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Daily Checklist Task Templates</Text>
            <Text style={styles.subText}>
              These tasks are generated automatically every day for all active outlets.
            </Text>

            {templates.length === 0 ? (
              <Text style={styles.emptyText}>No checklist templates created yet.</Text>
            ) : (
              templates.map((item: any) => (
                <View key={item.id} style={[styles.card, !item.active && styles.inactiveCard]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.taskTitle, !item.active && styles.inactiveText]}>
                        {item.taskName}
                      </Text>
                      <View style={styles.tagRow}>
                        <View style={styles.timeTag}>
                          <Text style={styles.timeTagText}>{item.timeRange || 'All Day'}</Text>
                        </View>
                        <View style={[styles.statusTag, item.active ? styles.tagActive : styles.tagInactive]}>
                          <Text style={styles.statusTagText}>{item.active ? 'ACTIVE' : 'INACTIVE'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.actionColumn}>
                      <TouchableOpacity
                        style={styles.actionIcon}
                        onPress={() => handleOpenEditModal(item)}
                      >
                        <Icon name="edit" color="#146e4e" size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionIcon}
                        onPress={() => handleDelete(item.id)}
                      >
                        <Icon name="trash" color="#c62828" size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* Edit/Add Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editId ? 'Edit Checklist Task Template' : 'Add Checklist Task Template'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Icon name="close" color="#3d251e" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.inputLabel}>Task Description *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sanitize kitchen and prep tables"
                value={taskName}
                onChangeText={setTaskName}
              />

              <Text style={styles.inputLabel}>Shift / Time Range *</Text>
              <View style={styles.shiftRow}>
                {['Morning', 'Evening', 'All Day'].map(range => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.shiftBtn,
                      timeRange === range && styles.shiftBtnActive,
                    ]}
                    onPress={() => setTimeRange(range)}
                  >
                    <Text style={[
                      styles.shiftBtnText,
                      timeRange === range && styles.shiftBtnTextActive,
                    ]}>
                      {range}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Active Status</Text>
                <Switch
                  value={active}
                  onValueChange={setActive}
                  trackColor={{ false: '#ebdcd3', true: '#a5d6a7' }}
                  thumbColor={active ? '#146e4e' : '#8c6e65'}
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
              <Text style={styles.submitBtnText}>Save Template</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcfaf7',
  },
  contentContainer: {
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#146e4e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d251e',
    marginBottom: 4,
  },
  subText: {
    fontSize: 13,
    color: '#8c6e65',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8c6e65',
    marginVertical: 40,
    fontSize: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f0e6df',
  },
  inactiveCard: {
    backgroundColor: '#f7f5f2',
    borderColor: '#e8e2dd',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3d251e',
    lineHeight: 20,
  },
  inactiveText: {
    color: '#8c6e65',
    textDecorationLine: 'line-through',
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  timeTag: {
    backgroundColor: '#fcf4f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  timeTagText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8c6e65',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagActive: {
    backgroundColor: '#e8f5e9',
  },
  tagInactive: {
    backgroundColor: '#ffebee',
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#146e4e',
  },
  statusTagTextInactive: {
    color: '#c62828',
  },
  actionColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionIcon: {
    padding: 8,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d251e',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8c6e65',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ebdcd3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fdfbfa',
    color: '#3d251e',
  },
  shiftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  shiftBtn: {
    flex: 1,
    backgroundColor: '#fcf4f0',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#f0e6df',
  },
  shiftBtnActive: {
    backgroundColor: '#146e4e',
    borderColor: '#146e4e',
  },
  shiftBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8c6e65',
  },
  shiftBtnTextActive: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f5eeea',
    paddingTop: 12,
  },
  submitBtn: {
    backgroundColor: '#146e4e',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
