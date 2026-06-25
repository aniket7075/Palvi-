import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import OutletSelector from '../components/OutletSelector';

export default function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffAttendance, setStaffAttendance] = useState<any[]>([]);
  const [alertMsg, setAlertMsg] = useState('');
  const [outletId, setOutletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal selector state
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchAttendance = async (activeOutletId?: string) => {
    const storedRole = await AsyncStorage.getItem('role');
    let id = activeOutletId || await AsyncStorage.getItem('outletId');
    if (!id && storedRole === 'ADMIN') {
      const outlets = stateService.getOutlets();
      if (outlets.length > 0) {
        const firstId = outlets[0].id.toString();
        id = firstId;
        await AsyncStorage.setItem('outletId', firstId);
        await AsyncStorage.setItem('outletName', outlets[0].name);
      }
    }
    if (!id) {
      setLoading(false);
      return;
    }
    setOutletId(id);
    const data = stateService.getAttendance(id, date);
    setStaffAttendance(data);
    setLoading(false);
  };

  const handleOutletChange = async (newOutletId: string) => {
    setLoading(true);
    await AsyncStorage.setItem('outletId', newOutletId);
    const outlets = stateService.getOutlets();
    const sel = outlets.find((o: any) => o.id.toString() === newOutletId);
    if (sel) await AsyncStorage.setItem('outletName', sel.name);
    setOutletId(newOutletId);
    const data = stateService.getAttendance(newOutletId, date);
    setStaffAttendance(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const shiftDate = (days: number) => {
    const current = new Date(date);
    current.setDate(current.getDate() + days);
    setDate(current.toISOString().split('T')[0]);
  };

  const openStatusSelector = (staffId: number) => {
    setSelectedStaffId(staffId);
    setIsModalVisible(true);
  };

  const selectStatus = (status: string) => {
    if (selectedStaffId === null) return;
    const updated = staffAttendance.map(s => {
      if (s.staffId === selectedStaffId) {
        return { ...s, status };
      }
      return s;
    });
    setStaffAttendance(updated);
    setIsModalVisible(false);
    setSelectedStaffId(null);
  };

  const handleSave = () => {
    const records = staffAttendance.map(s => ({
      staffId: s.staffId,
      status: s.status,
      date
    }));

    stateService.saveAttendance(records);
    setAlertMsg('Attendance log saved successfully!');
    setTimeout(() => setAlertMsg(''), 2500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return '#10b981';
      case 'ABSENT': return '#0d4e37';
      case 'HALF_DAY': return '#f59e0b';
      case 'LEAVE': return '#6366f1';
      default: return '#8c6e65';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'Present';
      case 'ABSENT': return 'Absent';
      case 'HALF_DAY': return 'Half Day';
      case 'LEAVE': return 'Leave';
      default: return 'Not Marked';
    }
  };

  const statusOptions = [
    { value: 'NOT_MARKED', label: 'Not Marked' },
    { value: 'PRESENT', label: 'Present' },
    { value: 'ABSENT', label: 'Absent' },
    { value: 'HALF_DAY', label: 'Half Day' },
    { value: 'LEAVE', label: 'Leave' }
  ];

  if (loading) {
    return (
      <LayoutWrapper title="Staff Attendance">
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      </LayoutWrapper>
    );
  }

  if (!outletId) {
    return (
      <LayoutWrapper title="Staff Attendance">
        <View style={styles.centeredContainer}>
          <Text style={styles.noOutletText}>
            Select an assigned branch manager role to log employee attendance.
          </Text>
        </View>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper title="Staff Attendance">
      <OutletSelector selectedOutletId={outletId} onSelect={handleOutletChange} />
      <View style={styles.mainContainer}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {alertMsg ? (
            <View style={styles.successAlert}>
              <Text style={styles.successText}>{alertMsg}</Text>
            </View>
          ) : null}

          {/* Date Selector Row */}
          <View style={styles.dateCard}>
            <Text style={styles.dateCardLabel}>Log Date</Text>
            <View style={styles.dateSelector}>
              <TouchableOpacity onPress={() => shiftDate(-1)} style={styles.dateArrow}>
                <Text style={styles.arrowText}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.dateDisplay}>{date}</Text>
              <TouchableOpacity onPress={() => shiftDate(1)} style={styles.dateArrow}>
                <Text style={styles.arrowText}>▶</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Staff List */}
          <View style={styles.card}>
            {staffAttendance.map((s, index) => {
              const activeColor = getStatusColor(s.status);
              return (
                <View
                  key={s.staffId}
                  style={[
                    styles.staffItem,
                    index !== staffAttendance.length - 1 && styles.divider
                  ]}
                >
                  <View style={styles.staffInfo}>
                    <Text style={styles.staffName}>{s.fullName}</Text>
                    <Text style={styles.staffRole}>{s.role}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => openStatusSelector(s.staffId)}
                    style={[styles.statusSelectorBtn, { borderColor: activeColor }]}
                  >
                    <Text style={[styles.statusSelectorBtnText, { color: activeColor }]}>
                      {getStatusLabel(s.status)} ▾
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {staffAttendance.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No active staff registry data found for this branch.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Save button fixed at the bottom of the container */}
        {staffAttendance.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Attendance Roll Call</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Status Selection Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsModalVisible(false)}
            style={styles.modalBackdrop}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Staff Status</Text>
              <View style={styles.modalDivider} />
              {statusOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => selectStatus(opt.value)}
                  style={styles.modalOption}
                >
                  <Text style={[styles.modalOptionText, { color: getStatusColor(opt.value) }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
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
  successAlert: {
    width: '100%',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#146e4e',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  dateCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ebdcd3',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  dateCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8c6e65',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateArrow: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ebdcd3',
  },
  arrowText: {
    fontSize: 12,
    color: '#146e4e',
  },
  dateDisplay: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3d251e',
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
  staffItem: {
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
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3d251e',
  },
  staffRole: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8c6e65',
    marginTop: 2,
  },
  statusSelectorBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fdfbfa',
    minWidth: 110,
    alignItems: 'center',
  },
  statusSelectorBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#8c6e65',
  },
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#ebdcd3',
  },
  saveButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#146e4e',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#146e4e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(61, 37, 30, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    padding: 24,
    elevation: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3d251e',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#ebdcd3',
    marginBottom: 16,
  },
  modalOption: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
