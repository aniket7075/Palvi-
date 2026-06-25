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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '../components/Icon';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';

export default function Managers() {
  const [managers, setManagers] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MANAGER');
  const [selectedOutletId, setSelectedOutletId] = useState<number | null>(null);

  const loadData = async () => {
    const role = await AsyncStorage.getItem('role');
    setIsAdmin(role === 'ADMIN');
    setManagers(stateService.getManagers());
    setOutlets(stateService.getOutlets());
  };

  useEffect(() => { loadData(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setFullName(''); setEmail(''); setMobileNumber(''); setPassword(''); setRole('MANAGER'); setSelectedOutletId(null);
    setIsModalOpen(true);
  };

  const openEdit = (m: any) => {
    setEditingId(m.id);
    setFullName(m.fullName);
    setEmail(m.email);
    setMobileNumber(m.mobileNumber);
    setPassword('');
    setRole(m.role || 'MANAGER');
    setSelectedOutletId(m.outletId);
    setIsModalOpen(true);
  };

  const handleDelete = (m: any) => {
    Alert.alert(
      'Remove User',
      `Are you sure you want to remove ${m.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            stateService.deleteManager(m.id);
            loadData();
          }
        }
      ]
    );
  };

  const handleSave = () => {
    if (!fullName || !email || !mobileNumber) {
      Alert.alert('Required Fields', 'Please fill out all required fields.');
      return;
    }
    
    if ((role === 'MANAGER' || role === 'FRANCHISEE') && selectedOutletId === null) {
      Alert.alert('Required Fields', `Please assign an outlet to the ${role.toLowerCase()}.`);
      return;
    }

    if (editingId !== null) {
      stateService.updateManager(editingId, { fullName, email, mobileNumber, role, outletId: selectedOutletId });
    } else {
      if (!password) { Alert.alert('Required', 'Password is required for new users.'); return; }
      stateService.addManager({ fullName, email, mobileNumber, password, role, outletId: selectedOutletId });
    }

    loadData();
    setIsModalOpen(false);
  };

  return (
    <LayoutWrapper title="Outlet Managers">
      <View style={styles.mainContainer}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.listContainer}>
            {managers.map((m) => (
              <View key={m.id} style={styles.managerCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{m.fullName.charAt(0).toUpperCase()}</Text>
                </View>

                <View style={styles.managerInfo}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.managerName}>{m.fullName}</Text>
                    <View style={[styles.roleBadge, m.role === 'ADMIN' && { backgroundColor: '#ffebee', borderColor: '#ffcdd2' }]}>
                      <Text style={[styles.roleBadgeText, m.role === 'ADMIN' && { color: '#c62828' }]}>{m.role}</Text>
                    </View>
                  </View>
                  <Text style={styles.managerContact}>{m.email} • {m.mobileNumber}</Text>
                  <View style={styles.outletRow}>
                    <Icon name="outlet" color="#146e4e" size={14} />
                    <Text style={[styles.outletName, { marginLeft: 4 }]}>
                      {m.outlet ? m.outlet.name : 'Unassigned Outlet'}
                    </Text>
                  </View>
                </View>

                {/* Admin action buttons */}
                {isAdmin && (
                  <View style={styles.actionCol}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(m)}>
                      <Icon name="edit" color="#146e4e" size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(m)}>
                      <Icon name="delete" color="#0d4e37" size={16} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            {managers.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No registered managers found.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {isAdmin && (
          <TouchableOpacity onPress={openAdd} style={styles.floatingButton}>
            <Text style={styles.floatingButtonText}>+ Add User</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Add / Edit User Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide" onRequestClose={() => setIsModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit User' : 'Register User'}</Text>
              <View style={styles.modalDivider} />

              <ScrollView contentContainerStyle={styles.modalFormScroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.formLabel}>Full Name *</Text>
                <TextInput style={styles.modalInput} value={fullName} onChangeText={setFullName} placeholder="e.g. Jane Smith" placeholderTextColor="#8c6e65" />

                <Text style={styles.formLabel}>Email Address *</Text>
                <TextInput style={styles.modalInput} value={email} onChangeText={setEmail} placeholder="e.g. jane@gmail.com" placeholderTextColor="#8c6e65" keyboardType="email-address" autoCapitalize="none" />

                <Text style={styles.formLabel}>Mobile Number *</Text>
                <TextInput style={styles.modalInput} value={mobileNumber} onChangeText={setMobileNumber} placeholder="e.g. +91 8888888888" placeholderTextColor="#8c6e65" keyboardType="phone-pad" />

                {!editingId && (
                  <>
                    <Text style={styles.formLabel}>Password *</Text>
                    <TextInput style={styles.modalInput} value={password} onChangeText={setPassword} secureTextEntry placeholder="Minimum 6 characters" placeholderTextColor="#8c6e65" autoCapitalize="none" />
                  </>
                )}

                <Text style={styles.formLabel}>User Role *</Text>
                <View style={styles.outletList}>
                  <TouchableOpacity 
                    onPress={() => setRole('MANAGER')} 
                    style={[styles.outletOption, role === 'MANAGER' && styles.activeOutletOption]}
                  >
                    <Text style={[styles.outletOptionText, role === 'MANAGER' && styles.activeOutletOptionText]}>Manager</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setRole('ADMIN')} 
                    style={[styles.outletOption, role === 'ADMIN' && styles.activeOutletOption]}
                  >
                    <Text style={[styles.outletOptionText, role === 'ADMIN' && styles.activeOutletOptionText]}>Admin</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setRole('INVENTORY_MANAGER')} 
                    style={[styles.outletOption, role === 'INVENTORY_MANAGER' && styles.activeOutletOption]}
                  >
                    <Text style={[styles.outletOptionText, role === 'INVENTORY_MANAGER' && styles.activeOutletOptionText]}>Inventory Manager</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setRole('FRANCHISEE')} 
                    style={[styles.outletOption, role === 'FRANCHISEE' && styles.activeOutletOption]}
                  >
                    <Text style={[styles.outletOptionText, role === 'FRANCHISEE' && styles.activeOutletOptionText]}>Franchisee</Text>
                  </TouchableOpacity>
                </View>

                {(role === 'MANAGER' || role === 'FRANCHISEE') && (
                  <>
                    <Text style={styles.formLabel}>Assign Branch Outlet *</Text>
                    <View style={styles.outletList}>
                      {outlets.map((o) => {
                        const isSel = selectedOutletId === o.id;
                        return (
                          <TouchableOpacity key={o.id} onPress={() => setSelectedOutletId(o.id)} style={[styles.outletOption, isSel && styles.activeOutletOption]}>
                            <Text style={[styles.outletOptionText, isSel && styles.activeOutletOptionText]}>{o.name}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}

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
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  container: { flex: 1, backgroundColor: '#ffffff' },
  contentContainer: { padding: 16, paddingBottom: 90 },
  listContainer: { gap: 12 },
  managerCard: {
    backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#ebdcd3',
    padding: 16, flexDirection: 'row', alignItems: 'center',
    elevation: 2, shadowColor: '#3d251e', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#a67c6d', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { fontSize: 20, fontWeight: '900', color: '#ffffff' },
  managerInfo: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  managerName: { fontSize: 15, fontWeight: '800', color: '#3d251e' },
  roleBadge: { backgroundColor: '#fdfbfa', borderWidth: 1, borderColor: '#ebdcd3', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  roleBadgeText: { fontSize: 9, fontWeight: '800', color: '#146e4e' },
  managerContact: { fontSize: 12, color: '#8c6e65', fontWeight: '600', marginBottom: 6 },
  outletRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  outletName: { fontSize: 12, fontWeight: '800', color: '#146e4e' },
  actionCol: { flexDirection: 'column', gap: 8, marginLeft: 8 },
  editBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 13, color: '#8c6e65' },
  floatingButton: { position: 'absolute', bottom: 24, right: 16, backgroundColor: '#146e4e', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, elevation: 6 },
  floatingButtonText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(61, 37, 30, 0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#3d251e', textAlign: 'center', marginBottom: 12 },
  modalDivider: { height: 1, backgroundColor: '#ebdcd3', marginBottom: 16 },
  modalFormScroll: { paddingBottom: 24 },
  formLabel: { fontSize: 12, fontWeight: '700', color: '#3d251e', marginBottom: 6 },
  modalInput: { height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#ebdcd3', backgroundColor: '#ffffff', paddingHorizontal: 12, fontSize: 14, color: '#3d251e', marginBottom: 16 },
  outletList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  outletOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#ebdcd3', backgroundColor: '#ffffff' },
  activeOutletOption: { backgroundColor: '#146e4e', borderColor: '#146e4e' },
  outletOptionText: { fontSize: 12, fontWeight: '700', color: '#3d251e' },
  activeOutletOptionText: { color: '#ffffff' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelBtn: { flex: 1, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#ebdcd3', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#8c6e65' },
  saveBtn: { flex: 1, height: 44, borderRadius: 22, backgroundColor: '#146e4e', alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
});
