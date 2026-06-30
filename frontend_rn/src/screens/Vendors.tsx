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
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from '../components/Icon';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import api from '../api';
import { useLanguage } from '../i18n/LanguageContext';

export default function Vendors({ route, navigation }: any) {
  const user = route?.params?.user || {};
  const currentOutletId = user.outletId;

  const { t } = useLanguage();
  const [vendors, setVendors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [vendorGroups, setVendorGroups] = useState<any[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [vendorLedgers, setVendorLedgers] = useState<any>({});
  
  // Group Form
  const [newGroupName, setNewGroupName] = useState('');

  const loadLedgers = async (vList: any[]) => {
    try {
      const res = await api.get('/purchases');
      const purchases = res.data;
      const ledgers: any = {};
      for (let v of vList) {
        const unpaid = purchases.filter((p: any) => p.vendorId === v.id && !p.isPaid);
        const totalDue = unpaid.reduce((sum: number, p: any) => sum + (p.totalAmount || 0), 0);
        let isDue = false;
        if (unpaid.length > 0) {
          unpaid.sort((a: any, b: any) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
          const oldest = unpaid[0];
          const daysDiff = (new Date().getTime() - new Date(oldest.purchaseDate).getTime()) / (1000 * 3600 * 24);
          if (daysDiff > (v.billingCycleDays || 10)) {
            isDue = true;
          }
        }
        ledgers[v.id] = { totalDue, isDue };
      }
      setVendorLedgers(ledgers);
    } catch (err) {
      console.error('Failed to load ledgers', err);
    }
  };

  const loadVendors = () => {
    const vList = stateService.getVendors(currentOutletId);
    setVendors(vList);
    setVendorGroups(stateService.getVendorGroups());
    loadLedgers(vList);
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const groupedVendors = vendors.reduce((acc: any, vendor: any) => {
    const cat = vendor.productCategory || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(vendor);
    return acc;
  }, {});

  const handleSave = () => {
    if (!name || !mobileNumber || !whatsappNumber || !category) {
      Alert.alert('Required Fields', 'Please fill out all required fields.');
      return;
    }

    const newVendor = stateService.addVendor({
      name,
      mobileNumber,
      whatsappNumber,
      address,
      productCategory: category,
      outletId: currentOutletId // If admin wants global, we could add a toggle, but default to current outlet
    });

    if (selectedGroups.length > 0) {
      stateService.assignVendorToGroups(newVendor.id, selectedGroups);
    }

    loadVendors();
    setIsModalOpen(false);

    // Reset Form
    setName('');
    setMobileNumber('');
    setWhatsappNumber('');
    setAddress('');
    setCategory('');
    setSelectedGroups([]);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      Alert.alert('Required', 'Please enter a group name');
      return;
    }
    stateService.addVendorGroup({ name: newGroupName, outletId: currentOutletId });
    setNewGroupName('');
    loadVendors();
  };

  const toggleGroupSelection = (id: number) => {
    if (selectedGroups.includes(id)) {
      setSelectedGroups(selectedGroups.filter(g => g !== id));
    } else {
      setSelectedGroups([...selectedGroups, id]);
    }
  };

  const handleCall = (num: string) => {
    Linking.openURL(`tel:${num.replace(/\D/g, '')}`).catch(() => {
      Alert.alert('Error', 'Unable to initiate call.');
    });
  };

  const handleWhatsApp = (num: string) => {
    const cleanNum = num.replace(/\D/g, '');
    const waUrl = `https://wa.me/91${cleanNum}`;
    Linking.openURL(waUrl).catch(() => {
      Alert.alert('Error', 'Unable to open WhatsApp.');
    });
  };

  const handleSettle = (vendorId: number, vendorName: string, totalDue: number) => {
    Alert.alert(
      'Settle Bill',
      `Are you sure you want to settle the outstanding amount of ₹${totalDue.toLocaleString('en-IN')} for ${vendorName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Settle',
          onPress: async () => {
            try {
              await api.post(`/vendors/${vendorId}/settle`);
              loadVendors();
              Alert.alert('Success', 'Bill settled successfully.');
            } catch (err) {
              Alert.alert('Error', 'Failed to settle bill.');
            }
          }
        }
      ]
    );
  };

  const handleUploadBill = (vendorId: number) => {
    Linking.openURL(`https://palvi.onrender.com/vendor-upload?vendorId=${vendorId}`);
  };

  return (
    <LayoutWrapper title={t('supplierDirectory')}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <Text style={styles.sectionHeader}>Supplier Directory</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => navigation.navigate('VendorBills')} style={styles.manageGroupsBtn}>
                <Text style={styles.manageGroupsText}>View Bills</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsGroupModalOpen(true)} style={styles.manageGroupsBtn}>
                <Text style={styles.manageGroupsText}>Manage Groups</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Vendors list */}
          <View style={styles.listContainer}>
            {Object.keys(groupedVendors).map((categoryName) => (
              <View key={categoryName} style={styles.categoryGroup}>
                <Text style={styles.categoryTitle}>{categoryName}</Text>
                {groupedVendors[categoryName].map((v: any) => (
                  <View key={v.id} style={styles.vendorCard}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.vendorName}>{v.name}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.totalDueText}>
                          {t('due')}: ₹{(vendorLedgers[v.id]?.totalDue || 0).toLocaleString('en-IN')}
                        </Text>
                        {vendorLedgers[v.id]?.isDue && (
                          <Text style={styles.paymentDueText}>{t('paymentDue')}</Text>
                        )}
                      </View>
                    </View>

                    {v.address ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Icon name="pin" color="#8c6e65" size={14} />
                        <Text style={[styles.vendorAddress, { marginTop: 0, marginLeft: 4 }]}>{v.address}</Text>
                      </View>
                    ) : null}

                    <View style={styles.cardDivider} />

                    <View style={styles.cardFooter}>
                      <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity onPress={() => handleCall(v.mobileNumber)} style={styles.actionBtn}>
                          <Icon name="phone" color="#8c6e65" size={14} />
                          <Text style={styles.actionBtnText}>{t('call')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleWhatsApp(v.whatsappNumber)} style={styles.waBtn}>
                          <Icon name="chat" color="#25D366" size={14} />
                          <Text style={styles.waBtnText}>{t('whatsapp')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleUploadBill(v.id)} style={styles.uploadBillBtn}>
                          <Icon name="upload" color="#146e4e" size={14} />
                          <Text style={styles.uploadBillBtnText}>Upload Bill</Text>
                        </TouchableOpacity>
                      </View>
                      {vendorLedgers[v.id]?.totalDue > 0 && (
                        <TouchableOpacity onPress={() => handleSettle(v.id, v.name, vendorLedgers[v.id].totalDue)} style={styles.settleBtn}>
                          <Text style={styles.settleBtnText}>{t('settleBill')}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ))}

            {vendors.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('noSuppliers')}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Add button */}
        <TouchableOpacity
          onPress={() => setIsModalOpen(true)}
          style={styles.floatingButton}
        >
          <Text style={styles.floatingButtonText}>+ {t('addSupplier')}</Text>
        </TouchableOpacity>
      </View>

      {/* Add Vendor Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('addSupplier')}</Text>
              <View style={styles.modalDivider} />

              <ScrollView contentContainerStyle={styles.modalFormScroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.formLabel}>{t('name')} *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Fresh Veggies Wholesale"
                  placeholderTextColor="#8c6e65"
                />

                <Text style={styles.formLabel}>{t('mobile')} *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor="#8c6e65"
                  keyboardType="phone-pad"
                />

                <Text style={styles.formLabel}>{t('whatsapp')} *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={whatsappNumber}
                  onChangeText={setWhatsappNumber}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor="#8c6e65"
                  keyboardType="phone-pad"
                />

                <Text style={styles.formLabel}>{t('category')} *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={category}
                  onChangeText={setCategory}
                  placeholder="e.g. Vegetables, Dairy"
                  placeholderTextColor="#8c6e65"
                />

                <Text style={styles.formLabel}>{t('address')}</Text>
                <TextInput
                  style={[styles.modalInput, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="e.g. Market Yard, Pune"
                  placeholderTextColor="#8c6e65"
                  multiline={true}
                  numberOfLines={3}
                />

                <Text style={styles.formLabel}>Assign to Groups</Text>
                <View style={styles.checkboxContainer}>
                  {vendorGroups.map(g => (
                    <TouchableOpacity
                      key={g.id}
                      style={styles.checkboxRow}
                      onPress={() => toggleGroupSelection(g.id)}
                    >
                      <View style={[styles.checkbox, selectedGroups.includes(g.id) && styles.checkboxChecked]}>
                        {selectedGroups.includes(g.id) && <Icon name="check" color="#fff" size={12} />}
                      </View>
                      <Text style={styles.checkboxLabel}>{g.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {vendorGroups.length === 0 && (
                    <Text style={styles.emptyText}>No groups created yet.</Text>
                  )}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setIsModalOpen(false)}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSave}
                    style={styles.saveBtn}
                  >
                    <Text style={styles.saveBtnText}>{t('save')}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Manage Groups Modal */}
      <Modal
        visible={isGroupModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsGroupModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Manage Vendor Groups</Text>
              <View style={styles.modalDivider} />

              <View style={styles.listContainer}>
                {vendorGroups.map(g => (
                  <View key={g.id} style={styles.groupListItem}>
                    <Text style={styles.groupListItemText}>{g.name}</Text>
                    <Text style={styles.groupListItemSub}>{(g.vendorIds || []).length} Vendors</Text>
                  </View>
                ))}
                {vendorGroups.length === 0 && (
                  <Text style={styles.emptyText}>No groups created yet.</Text>
                )}
              </View>

              <Text style={[styles.formLabel, { marginTop: 20 }]}>Create New Group</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  placeholder="e.g. Morning Vendors"
                  placeholderTextColor="#8c6e65"
                />
                <TouchableOpacity onPress={handleCreateGroup} style={styles.createGroupBtn}>
                  <Text style={styles.createGroupBtnText}>Add</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setIsGroupModalOpen(false)}
                style={[styles.cancelBtn, { marginTop: 24 }]}
              >
                <Text style={styles.cancelBtnText}>Done</Text>
              </TouchableOpacity>
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
  listContainer: {
    gap: 12,
  },
  categoryGroup: {
    marginBottom: 8,
    gap: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#146e4e',
    marginLeft: 4,
    marginBottom: 4,
  },
  vendorCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3d251e',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#fdfbfa',
    borderWidth: 1,
    borderColor: '#ebdcd3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#146e4e',
  },
  vendorAddress: {
    fontSize: 12,
    color: '#8c6e65',
    fontWeight: '600',
    marginTop: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#ebdcd3',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
    flex: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8c6e65',
  },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  waBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#25D366',
  },
  uploadBillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  uploadBillBtnText: {
    fontSize: 12,
    fontWeight: '800',
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
  totalDueText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3d251e',
  },
  paymentDueText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#c62828',
    backgroundColor: '#ffebee',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  settleBtn: {
    backgroundColor: '#146e4e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  settleBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3d251e',
  },
  manageGroupsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f0ed',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ebdcd3',
  },
  manageGroupsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#146e4e',
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#3d251e',
  },
  groupListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ebdcd3',
  },
  groupListItemText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3d251e',
  },
  groupListItemSub: {
    fontSize: 12,
    color: '#8c6e65',
  },
  createGroupBtn: {
    backgroundColor: '#146e4e',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  createGroupBtnText: {
    color: '#fff',
    fontWeight: '700',
  }
});
