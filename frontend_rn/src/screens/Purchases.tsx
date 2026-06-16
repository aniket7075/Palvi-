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
  Linking,
} from 'react-native';
import Icon from '../components/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import OutletSelector from '../components/OutletSelector';
import { useLanguage } from '../i18n/LanguageContext';

export default function Purchases() {
  const { t } = useLanguage();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [outletId, setOutletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [editingPurchaseId, setEditingPurchaseId] = useState<number | null>(null);

  // Form states
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  const loadData = async () => {
    const storedRole = await AsyncStorage.getItem('role');
    setUserRole(storedRole);
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
    if (!activeOutletId) { setLoading(false); return; }
    setOutletId(activeOutletId);
    setPurchases(stateService.getPurchases(activeOutletId));
    setVendors(stateService.getVendors());
    setLoading(false);
  };

  const handleOutletChange = async (newOutletId: string) => {
    setLoading(true);
    await AsyncStorage.setItem('outletId', newOutletId);
    const outlets = stateService.getOutlets();
    const sel = outlets.find((o: any) => o.id.toString() === newOutletId);
    if (sel) await AsyncStorage.setItem('outletName', sel.name);
    setOutletId(newOutletId);
    setPurchases(stateService.getPurchases(newOutletId));
    setVendors(stateService.getVendors());
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = () => {
    if (selectedVendorId === null || !itemName || !quantity || !unitPrice || !invoiceNumber) {
      Alert.alert('Required Fields', 'Please fill out all fields.');
      return;
    }

    if (editingPurchaseId) {
      stateService.updatePurchase(editingPurchaseId, {
        vendorId: selectedVendorId,
        itemName,
        quantity: parseFloat(quantity),
        price: parseFloat(unitPrice),
        invoiceNumber
      });
    } else {
      stateService.addPurchase(outletId, {
        vendorId: selectedVendorId,
        itemName,
        quantity: parseFloat(quantity),
        price: parseFloat(unitPrice),
        invoiceNumber
      });
    }

    loadData();
    setIsModalOpen(false);

    // Reset Form
    setEditingPurchaseId(null);
    setSelectedVendorId(null);
    setItemName('');
    setQuantity('');
    setUnitPrice('');
    setInvoiceNumber('');
  };

  const handleEdit = (p: any) => {
    setEditingPurchaseId(p.id);
    const v = vendors.find(ven => ven.name === p.vendorName);
    setSelectedVendorId(v ? v.id : null);
    setItemName(p.itemName);
    setQuantity(p.quantity.toString());
    setUnitPrice(p.price.toString());
    setInvoiceNumber(p.invoiceNumber);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Purchase', 'Are you sure you want to delete this purchase record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        stateService.deletePurchase(id);
        loadData();
      }}
    ]);
  };

  if (loading) {
    return (
      <LayoutWrapper title="Purchases Invoice Log">
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      </LayoutWrapper>
    );
  }

  if (!outletId) {
    return (
      <LayoutWrapper title="Purchases Invoice Log">
        <View style={styles.centeredContainer}>
          <Text style={styles.noOutletText}>
            Log in with an assigned branch manager role to access purchase logs.
          </Text>
        </View>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper title={t('purchasesLog')}>
      <OutletSelector selectedOutletId={outletId} onSelect={handleOutletChange} />
      <View style={styles.mainContainer}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {/* Purchases list */}
          <View style={styles.listContainer}>
            {purchases.map((p) => (
              <View key={p.id} style={styles.purchaseCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Text style={styles.itemNameText}>{p.itemName}</Text>
                      {p.isPaid ? (
                        <View style={[styles.statusBadge, { backgroundColor: '#e8f5e9' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#2e7d32' }]}>{t('paid')}</Text>
                        </View>
                      ) : (
                        <View style={[styles.statusBadge, { backgroundColor: '#ffebee' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#c62828' }]}>{t('pending')}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.vendorNameText}>{t('menuVendors')}: {p.vendorName}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.amountText}>
                      ₹{p.totalAmount.toLocaleString('en-IN')}
                    </Text>
                    {userRole === 'ADMIN' && (
                      <View style={{ flexDirection: 'row', marginTop: 8, gap: 16 }}>
                        <TouchableOpacity onPress={() => handleEdit(p)}>
                          <Icon name="edit" color="#146e4e" size={16} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(p.id)}>
                          <Icon name="trash" color="#d32f2f" size={16} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardFooter}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Icon name="inventory" color="#8c6e65" size={14} />
                    <Text style={[styles.qtyText, { marginLeft: 4 }]}>
                      {t('qty')}: {p.quantity} @ ₹{p.price}/{t('unitPrice')}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.invoiceText}>
                      {t('invoice')}: {p.invoiceNumber}
                    </Text>
                    {p.billImagePath ? (
                       <TouchableOpacity 
                         style={styles.actionBtn}
                         onPress={() => Linking.openURL(`http://localhost:8080/uploads/${p.billImagePath}`)}
                       >
                         <Text style={styles.actionBtnText}>{t('viewBill')}</Text>
                       </TouchableOpacity>
                    ) : (
                       <TouchableOpacity 
                         style={styles.actionBtnOutline}
                         onPress={() => Linking.openURL(`http://localhost:8080/purchase-upload?purchaseId=${p.id}`)}
                       >
                         <Text style={styles.actionBtnOutlineText}>+ {t('uploadBill')}</Text>
                       </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}

            {purchases.length === 0 && (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No purchase entries logged for this branch.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Add button */}
        <TouchableOpacity
          onPress={() => {
            setEditingPurchaseId(null);
            setSelectedVendorId(null);
            setItemName('');
            setQuantity('');
            setUnitPrice('');
            setInvoiceNumber('');
            setIsModalOpen(true);
          }}
          style={styles.floatingButton}
        >
          <Text style={styles.floatingButtonText}>+ {t('logInvoice')}</Text>
        </TouchableOpacity>
      </View>

      {/* Log Purchase Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingPurchaseId ? 'Edit Purchase Entry' : 'Log Purchase Entry'}</Text>
            <View style={styles.modalDivider} />

            <ScrollView contentContainerStyle={styles.modalFormScroll} keyboardShouldPersistTaps="handled">
              <Text style={styles.formLabel}>Select Supplier *</Text>
              <View style={styles.vendorOptionsList}>
                {vendors.map((v) => {
                  const isSel = selectedVendorId === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      onPress={() => setSelectedVendorId(v.id)}
                      style={[styles.vendorOption, isSel && styles.activeVendorOption]}
                    >
                      <Text style={[styles.vendorOptionText, isSel && styles.activeVendorOptionText]}>
                        {v.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.formLabel}>Item Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={itemName}
                onChangeText={setItemName}
                placeholder="e.g. Rice"
                placeholderTextColor="#8c6e65"
              />

              <View style={styles.formRow}>
                <View style={styles.rowItem}>
                  <Text style={styles.formLabel}>Quantity *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="e.g. 50"
                    placeholderTextColor="#8c6e65"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.rowItem}>
                  <Text style={styles.formLabel}>Unit Price (₹) *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={unitPrice}
                    onChangeText={setUnitPrice}
                    placeholder="e.g. 60"
                    placeholderTextColor="#8c6e65"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.formLabel}>Invoice/Bill Number *</Text>
              <TextInput
                style={styles.modalInput}
                value={invoiceNumber}
                onChangeText={setInvoiceNumber}
                placeholder="e.g. INV-2026-001"
                placeholderTextColor="#8c6e65"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setIsModalOpen(false)}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={styles.saveBtn}
                >
                  <Text style={styles.saveBtnText}>{editingPurchaseId ? 'Update Entry' : 'Log Entry'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
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
  purchaseCard: {
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
  },
  itemNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3d251e',
    marginBottom: 4,
  },
  vendorNameText: {
    fontSize: 11,
    color: '#8c6e65',
    fontWeight: '600',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#a67c6d',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#ffffff',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 11,
    color: '#8c6e65',
    fontWeight: '700',
  },
  invoiceText: {
    fontSize: 11,
    color: '#8c6e65',
    fontWeight: '700',
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
  vendorOptionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  vendorOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#ffffff',
  },
  activeVendorOption: {
    backgroundColor: '#146e4e',
    borderColor: '#146e4e',
  },
  vendorOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3d251e',
  },
  activeVendorOptionText: {
    color: '#ffffff',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
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
  actionBtn: {
    marginTop: 8,
    backgroundColor: '#146e4e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtnOutline: {
    marginTop: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#146e4e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionBtnOutlineText: {
    color: '#146e4e',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  }
});
