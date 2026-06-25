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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import Icon from '../components/Icon';
import OutletSelector from '../components/OutletSelector';

export default function Staff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [outletId, setOutletId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form states
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [staffRole, setStaffRole] = useState('WAITER');
  const [salary, setSalary] = useState('');

  // Advance Payment States
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceReason, setAdvanceReason] = useState('');
  const [staffAdvances, setStaffAdvances] = useState<any[]>([]);
  const [currentMonthPrefix] = useState(new Date().toISOString().slice(0, 7));
  const [totalAdvance, setTotalAdvance] = useState(0);

  const loadStaff = async () => {
    const storedRole = await AsyncStorage.getItem('role');
    setRole(storedRole);
    setIsAdmin(storedRole === 'ADMIN');
    
    let activeOutletId = await AsyncStorage.getItem('outletId');
    if (!activeOutletId && storedRole === 'ADMIN') {
      const outlets = stateService.getOutlets();
      if (outlets.length > 0) {
        const firstId = outlets[0].id.toString();
        activeOutletId = firstId;
        await AsyncStorage.setItem('outletId', firstId);
        await AsyncStorage.setItem('outletName', outlets[0].name);
      }
    }
    
    if (!activeOutletId) {
      setLoading(false);
      return;
    }
    
    setOutletId(activeOutletId);
    const list = stateService.getStaff(activeOutletId);
    setStaff(list);
    setLoading(false);
  };

  const handleOutletChange = async (newOutletId: string) => {
    setLoading(true);
    await AsyncStorage.setItem('outletId', newOutletId);
    const outlets = stateService.getOutlets();
    const sel = outlets.find((o: any) => o.id.toString() === newOutletId);
    if (sel) await AsyncStorage.setItem('outletName', sel.name);
    setOutletId(newOutletId);
    const list = stateService.getStaff(newOutletId);
    setStaff(list);
    setLoading(false);
  };

  useEffect(() => { loadStaff(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setEmployeeId(''); setFullName(''); setMobileNumber(''); setAddress(''); setStaffRole('WAITER'); setSalary('');
    setIsModalOpen(true);
  };

  const openEdit = (s: any) => {
    setEditingId(s.id);
    setEmployeeId(s.employeeId);
    setFullName(s.fullName);
    setMobileNumber(s.mobileNumber);
    setAddress(s.address || '');
    setStaffRole(s.role);
    setSalary(String(s.salary));
    setIsModalOpen(true);
  };

  const handleDelete = (s: any) => {
    Alert.alert(
      'Remove Employee',
      `Remove ${s.fullName} from the registry?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => { stateService.deleteStaff(s.id); loadStaff(); } }
      ]
    );
  };

  const handleSave = () => {
    if (!employeeId || !fullName || !mobileNumber || !salary) {
      Alert.alert('Required Fields', 'Please fill out all required fields.');
      return;
    }

    if (editingId !== null) {
      stateService.updateStaff(editingId, {
        employeeId, fullName, mobileNumber, address,
        role: staffRole, salary: parseFloat(salary)
      });
    } else {
      stateService.addStaff({
        employeeId, fullName, mobileNumber, address,
        role: staffRole, salary: parseFloat(salary),
        outletId: outletId ? parseInt(outletId) : 1
      });
    }

    loadStaff();
    setIsModalOpen(false);
  };

  const openAdvanceModal = (s: any) => {
    setSelectedStaff(s);
    const advances = stateService.getStaffAdvances(s.id, currentMonthPrefix);
    setStaffAdvances(advances);
    const total = advances.reduce((sum: number, a: any) => sum + parseFloat(a.amount || 0), 0);
    setTotalAdvance(total);
    setAdvanceAmount('');
    setAdvanceReason('');
    setIsAdvanceModalOpen(true);
  };

  const handleSaveAdvance = () => {
    if (!advanceAmount || isNaN(Number(advanceAmount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid advance amount.');
      return;
    }
    stateService.addStaffAdvance({
      staffId: selectedStaff.id,
      amount: parseFloat(advanceAmount),
      reason: advanceReason
    });
    
    // reload advance data
    const advances = stateService.getStaffAdvances(selectedStaff.id, currentMonthPrefix);
    setStaffAdvances(advances);
    const total = advances.reduce((sum: number, a: any) => sum + parseFloat(a.amount || 0), 0);
    setTotalAdvance(total);
    setAdvanceAmount('');
    setAdvanceReason('');
  };

  if (loading) {
    return (
      <LayoutWrapper title="Employee Registry">
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      </LayoutWrapper>
    );
  }

  if (!outletId && role !== 'ADMIN') {
    return (
      <LayoutWrapper title="Employee Registry">
        <View style={styles.centeredContainer}>
          <Text style={styles.noOutletText}>
            Please assign a branch outlet to view the staff registry.
          </Text>
        </View>
      </LayoutWrapper>
    );
  }

  const staffRoles = ['WAITER', 'COOK', 'CLEANER', 'CASHIER', 'STORE_KEEPER'];

  return (
    <LayoutWrapper title="Employee Registry">
      <OutletSelector selectedOutletId={outletId} onSelect={handleOutletChange} />
      <View style={styles.mainContainer}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {/* Staff List */}
          <View style={styles.listContainer}>
            {staff.map((s) => (
              <View key={s.id} style={styles.staffCard}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{s.fullName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.staffInfo}>
                    <Text style={styles.staffName}>{s.fullName}</Text>
                    <Text style={styles.staffIdText}>ID: {s.employeeId}</Text>
                  </View>
                  <View style={styles.roleChip}>
                    <Text style={styles.roleChipText}>{s.role}</Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardBottom}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="phone" color="#8c6e65" size={12} />
                    <Text style={[styles.staffPhone, { marginLeft: 4 }]}>{s.mobileNumber}</Text>
                  </View>
                  <Text style={styles.staffSalary}>₹{s.salary.toLocaleString('en-IN')}/mo</Text>
                </View>

                <TouchableOpacity style={styles.advanceBtn} onPress={() => openAdvanceModal(s)}>
                  <Icon name="sales" color="#146e4e" size={14} />
                  <Text style={styles.advanceBtnText}>Advance / Payroll</Text>
                </TouchableOpacity>

                {isAdmin && (
                  <View style={styles.adminActionsRow}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(s)}>
                      <Icon name="edit" color="#146e4e" size={14} />
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(s)}>
                      <Icon name="delete" color="#0d4e37" size={14} />
                      <Text style={styles.deleteBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            {staff.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No staff members registered for this branch.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Add button */}
        <TouchableOpacity
          onPress={openAdd}
          style={styles.floatingButton}
        >
          <Text style={styles.floatingButtonText}>+ Add Employee</Text>
        </TouchableOpacity>
      </View>

      {/* Add / Edit Staff Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide" onRequestClose={() => setIsModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Employee' : 'Register Employee'}</Text>
              <View style={styles.modalDivider} />

              <ScrollView contentContainerStyle={styles.modalFormScroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.formLabel}>Employee ID *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={employeeId}
                  onChangeText={setEmployeeId}
                  placeholder="e.g. EMP102"
                  placeholderTextColor="#8c6e65"
                />

                <Text style={styles.formLabel}>Full Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. Sunny Deol"
                  placeholderTextColor="#8c6e65"
                />

                <Text style={styles.formLabel}>Mobile Number *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder="e.g. +91 9999999999"
                  placeholderTextColor="#8c6e65"
                  keyboardType="phone-pad"
                />

                <Text style={styles.formLabel}>Home Address</Text>
                <TextInput
                  style={[styles.modalInput, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="e.g. Flat 12, Pune Residency"
                  placeholderTextColor="#8c6e65"
                  multiline={true}
                  numberOfLines={3}
                />

                <Text style={styles.formLabel}>Role *</Text>
                <View style={styles.roleGrid}>
                  {staffRoles.map((r) => {
                    const isSel = staffRole === r;
                    return (
                      <TouchableOpacity
                        key={r}
                        onPress={() => setStaffRole(r)}
                        style={[styles.roleOption, isSel && styles.activeRoleOption]}
                      >
                        <Text style={[styles.roleOptionText, isSel && styles.activeRoleOptionText]}>
                          {r.replace('_', ' ')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.formLabel}>Monthly Salary (₹) *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={salary}
                  onChangeText={setSalary}
                  placeholder="e.g. 15000"
                  placeholderTextColor="#8c6e65"
                  keyboardType="numeric"
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                    <Text style={styles.saveBtnText}>{editingId ? 'Save Changes' : 'Register'}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Advance / Payroll Modal */}
      <Modal visible={isAdvanceModalOpen} transparent animationType="slide" onRequestClose={() => setIsAdvanceModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Payroll & Advances</Text>
                <TouchableOpacity onPress={() => setIsAdvanceModalOpen(false)}>
                  <Icon name="close" color="#3d251e" size={20} />
                </TouchableOpacity>
              </View>

              {selectedStaff && (
                <ScrollView style={{ maxHeight: 500 }} keyboardShouldPersistTaps="handled">
                  <View style={styles.payrollSummary}>
                    <Text style={styles.payrollStaffName}>{selectedStaff.fullName}</Text>
                    
                    <View style={styles.payrollRow}>
                      <Text style={styles.payrollLabel}>Total Salary (Monthly):</Text>
                      <Text style={styles.payrollValue}>₹{selectedStaff.salary}</Text>
                    </View>
                    <View style={styles.payrollRow}>
                      <Text style={styles.payrollLabel}>Advances this month:</Text>
                      <Text style={[styles.payrollValue, { color: '#c62828' }]}>- ₹{totalAdvance}</Text>
                    </View>
                    <View style={styles.cardDivider} />
                    <View style={styles.payrollRow}>
                      <Text style={[styles.payrollLabel, { fontWeight: '900', color: '#146e4e' }]}>Net Payable:</Text>
                      <Text style={[styles.payrollValue, { fontWeight: '900', color: '#146e4e' }]}>
                        ₹{selectedStaff.salary - totalAdvance}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Record New Advance</Text>
                  <View style={styles.advanceFormRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.formLabel}>Amount (₹)</Text>
                      <TextInput
                        style={[styles.modalInput, { marginBottom: 0 }]}
                        value={advanceAmount}
                        onChangeText={setAdvanceAmount}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                    </View>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.formLabel}>Reason</Text>
                      <TextInput
                        style={[styles.modalInput, { marginBottom: 0 }]}
                        value={advanceReason}
                        onChangeText={setAdvanceReason}
                        placeholder="e.g. Medical"
                      />
                    </View>
                    <TouchableOpacity style={styles.addAdvanceBtn} onPress={handleSaveAdvance}>
                      <Text style={styles.addAdvanceBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Recent Advances ({currentMonthPrefix})</Text>
                  {staffAdvances.length === 0 ? (
                    <Text style={styles.emptyText}>No advances recorded this month.</Text>
                  ) : (
                    staffAdvances.map((adv: any, index: number) => (
                      <View key={index} style={styles.advanceItem}>
                        <View>
                          <Text style={styles.advanceItemDate}>{adv.advanceDate}</Text>
                          <Text style={styles.advanceItemReason}>{adv.reason || 'No reason provided'}</Text>
                        </View>
                        <Text style={styles.advanceItemAmount}>- ₹{adv.amount}</Text>
                      </View>
                    ))
                  )}
                </ScrollView>
              )}
            </View>
          </View>
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
  listContainer: {
    gap: 12,
  },
  staffCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    padding: 16,
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#146e4e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3d251e',
  },
  staffIdText: {
    fontSize: 11,
    color: '#8c6e65',
    fontWeight: '600',
    marginTop: 2,
  },
  roleChip: {
    backgroundColor: '#a67c6d',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#ebdcd3',
    marginVertical: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffPhone: {
    fontSize: 12,
    color: '#8c6e65',
    fontWeight: '700',
  },
  staffSalary: {
    fontSize: 12,
    color: '#146e4e',
    fontWeight: '800',
  },
  adminActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ebdcd3',
  },
  editBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#146e4e',
  },
  deleteBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0d4e37',
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
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
  modalFormScroll: {
    paddingBottom: 24,
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
    marginBottom: 16,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  roleOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#ffffff',
  },
  activeRoleOption: {
    backgroundColor: '#146e4e',
    borderColor: '#146e4e',
  },
  roleOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3d251e',
  },
  activeRoleOptionText: {
    color: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
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
  advanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 6,
  },
  advanceBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#146e4e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ebdcd3',
    paddingBottom: 10,
  },
  payrollSummary: {
    backgroundColor: '#fdfbfa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ebdcd3',
  },
  payrollStaffName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3d251e',
    marginBottom: 12,
  },
  payrollRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  payrollLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8c6e65',
  },
  payrollValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3d251e',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: '#3d251e',
    marginBottom: 12,
  },
  advanceFormRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
  },
  addAdvanceBtn: {
    backgroundColor: '#146e4e',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
    flexShrink: 0,
    minWidth: 60,
    alignItems: 'center',
  },
  addAdvanceBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  advanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ebdcd3',
  },
  advanceItemDate: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3d251e',
  },
  advanceItemReason: {
    fontSize: 11,
    color: '#8c6e65',
    marginTop: 2,
  },
  advanceItemAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#c62828',
  },
});
