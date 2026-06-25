import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import Icon from '../components/Icon';
import OutletSelector from '../components/OutletSelector';

export default function VendorOrders() {
  const [reqs, setReqs] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [outletId, setOutletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [editingReqId, setEditingReqId] = useState<number | null>(null);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [vendorGroups, setVendorGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [msgLanguage, setMsgLanguage] = useState<'EN' | 'MR'>('EN');

  // Form states
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('KG');

  const loadRequirements = async () => {
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
    setReqs(stateService.getRequirements(activeOutletId));
    setVendors(stateService.getVendors());
    setVendorGroups(stateService.getVendorGroups());
    setInventoryItems(stateService.getInventory(activeOutletId));
    setLoading(false);
  };

  const handleOutletChange = async (newOutletId: string) => {
    setLoading(true);
    await AsyncStorage.setItem('outletId', newOutletId);
    const outlets = stateService.getOutlets();
    const sel = outlets.find((o: any) => o.id.toString() === newOutletId);
    if (sel) await AsyncStorage.setItem('outletName', sel.name);
    setOutletId(newOutletId);
    setReqs(stateService.getRequirements(newOutletId));
    setVendors(stateService.getVendors());
    setVendorGroups(stateService.getVendorGroups());
    setInventoryItems(stateService.getInventory(newOutletId));
    setSelectedVendorId(null);
    setLoading(false);
  };

  useEffect(() => { loadRequirements(); }, []);

  const handleAdd = () => {
    if (!itemName || !quantity || !unit) {
      Alert.alert('Required Fields', 'Please enter all details for the requirement item.');
      return;
    }

    if (editingReqId) {
      stateService.updateRequirement(editingReqId, {
        itemName,
        quantity: parseFloat(quantity),
        unit
      });
    } else {
      stateService.addRequirement(outletId, {
        itemName,
        quantity: parseFloat(quantity),
        unit
      });
    }

    loadRequirements();

    // Reset fields
    setEditingReqId(null);
    setItemName('');
    setQuantity('');
    setUnit('KG');
  };

  const handleEdit = (r: any) => {
    setEditingReqId(r.id);
    setItemName(r.itemName);
    setQuantity(r.quantity.toString());
    setUnit(r.unit);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Requirement', 'Are you sure you want to delete this requirement?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        stateService.deleteRequirement(id);
        loadRequirements();
      }}
    ]);
  };

  const handleSendWhatsApp = () => {
    if (selectedVendorId === null) {
      Alert.alert('Supplier Selection Required', 'Please select a Supplier/Vendor to dispatch the order.');
      return;
    }

    const vendor = vendors.find(v => v.id === selectedVendorId);
    if (!vendor || !vendor.whatsappNumber) {
      Alert.alert('Contact Missing', 'Selected vendor does not have a valid WhatsApp contact number.');
      return;
    }

    let messageText = '';
    
    if (msgLanguage === 'MR') {
      messageText = `नमस्कार ${vendor.name},\n\nकृपया खालील साहित्य उद्या पाठवून द्या:\n\n`;
      reqs.forEach((item, index) => {
        messageText += `${index + 1}. ${item.itemName} - ${item.quantity} ${item.unit}\n`;
      });
      
      const outlets = stateService.getOutlets();
      const currentOutlet = outlets.find((o: any) => o.id.toString() === outletId);

      if (currentOutlet) {
        messageText += `\n*डिलिव्हरी पत्ता:*\n`;
        messageText += `शाखा: ${currentOutlet.name}\n`;
        messageText += `संपर्क: ${currentOutlet.mobileNumber}\n`;
        messageText += `पत्ता: ${currentOutlet.address}, ${currentOutlet.city}\n`;
      }

      messageText += `\n*तुमचे बिल येथे अपलोड करा:*\n`;
      messageText += `http://localhost:8080/vendor-upload?vendorId=${vendor.id}\n`;
      messageText += `\nधन्यवाद.\nपालवी हॉटेल`;

    } else {
      messageText = `Hello ${vendor.name},\n\nPlease dispatch the following inventory items tomorrow:\n\n`;
      reqs.forEach((item, index) => {
        messageText += `${index + 1}. ${item.itemName} - ${item.quantity} ${item.unit}\n`;
      });

      const outlets = stateService.getOutlets();
      const currentOutlet = outlets.find((o: any) => o.id.toString() === outletId);

      if (currentOutlet) {
        messageText += `\n*Delivery Details:*\n`;
        messageText += `Branch: ${currentOutlet.name}\n`;
        messageText += `Contact: ${currentOutlet.mobileNumber}\n`;
        messageText += `Address: ${currentOutlet.address}, ${currentOutlet.city}\n`;
      }

      messageText += `\n*Upload your bill/invoice here:*\n`;
      messageText += `http://localhost:8080/vendor-upload?vendorId=${vendor.id}\n`;
      messageText += `\nThank You.\nPalvi Outlets`;
    }

    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/91${vendor.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedText}`;
    
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'Unable to open WhatsApp.');
    });
  };

  if (loading) {
    return (
      <LayoutWrapper title="Requirement Planning">
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      </LayoutWrapper>
    );
  }

  if (!outletId) {
    return (
      <LayoutWrapper title="Requirement Planning">
        <View style={styles.centeredContainer}>
          <Text style={styles.noOutletText}>
            Log in with an assigned branch manager role to access planning sheets.
          </Text>
        </View>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper title="Requirement Planning">
      <OutletSelector selectedOutletId={outletId} onSelect={handleOutletChange} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Add Requirement Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Requirement Item</Text>
          <View style={styles.cardDivider} />

          <Text style={styles.formLabel}>Item Name</Text>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setIsItemModalOpen(true)}
          >
            <Text style={[styles.dropdownButtonText, !itemName && { color: '#8c6e65' }]}>
              {itemName || 'Select an item from inventory'}
            </Text>
            <Icon name="down-arrow" color="#8c6e65" size={14} />
          </TouchableOpacity>

          <View style={styles.formRow}>
            <View style={styles.rowItem}>
              <Text style={styles.formLabel}>Quantity Needed</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="e.g. 15"
                placeholderTextColor="#8c6e65"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.formLabel}>Unit</Text>
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
                placeholder="e.g. KG"
                placeholderTextColor="#8c6e65"
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            {editingReqId && (
              <TouchableOpacity 
                onPress={() => {
                  setEditingReqId(null);
                  setItemName('');
                  setQuantity('');
                  setUnit('KG');
                }} 
                style={[styles.addBtn, { flex: 1, backgroundColor: '#8c6e65' }]}
              >
                <Text style={styles.addBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleAdd} style={[styles.addBtn, { flex: 2 }]}>
              <Text style={styles.addBtnText}>{editingReqId ? 'Update Draft Item' : '+ Add to Draft Sheet'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Draft List */}
        <Text style={styles.sectionHeader}>Draft Requirements List</Text>
        <View style={styles.draftCard}>
          {reqs.map((r, index) => (
            <View
              key={r.id}
              style={[
                styles.draftItem,
                index !== reqs.length - 1 && styles.divider
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.draftItemName}>{r.itemName}</Text>
                <Text style={styles.draftItemQty}>{r.quantity} {r.unit}</Text>
              </View>
              {userRole === 'ADMIN' && (
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity onPress={() => handleEdit(r)}>
                    <Icon name="edit" color="#146e4e" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(r.id)}>
                    <Icon name="trash" color="#d32f2f" size={16} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {reqs.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items drafted. Add items above.</Text>
            </View>
          )}
        </View>

        {/* WhatsApp Dispatch */}
        {reqs.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>WhatsApp Order Dispatch</Text>
            <Text style={styles.cardInfo}>
              Choose a supplier. Clicking the dispatch button will compile the items and launch WhatsApp.
            </Text>
            <View style={styles.cardDivider} />

            {/* Vendor Group Filter */}
            {vendorGroups.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.formLabel}>Filter by Vendor Group</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    onPress={() => setSelectedGroupId(null)}
                    style={[styles.groupPill, selectedGroupId === null && styles.activeGroupPill]}
                  >
                    <Text style={[styles.groupPillText, selectedGroupId === null && styles.activeGroupPillText]}>
                      All Vendors
                    </Text>
                  </TouchableOpacity>
                  {vendorGroups.map(g => (
                    <TouchableOpacity
                      key={g.id}
                      onPress={() => setSelectedGroupId(g.id)}
                      style={[styles.groupPill, selectedGroupId === g.id && styles.activeGroupPill]}
                    >
                      <Text style={[styles.groupPillText, selectedGroupId === g.id && styles.activeGroupPillText]}>
                        {g.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={styles.formLabel}>Choose Supplier/Vendor</Text>
            <View style={styles.vendorChoiceList}>
              {vendors
                .filter(v => selectedGroupId === null || (vendorGroups.find(g => g.id === selectedGroupId)?.vendorIds || []).includes(v.id))
                .map((v) => {
                  const isSel = selectedVendorId === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      onPress={() => setSelectedVendorId(v.id)}
                      style={[styles.vendorOption, isSel && styles.activeVendorOption]}
                    >
                      <Text style={[styles.vendorOptionText, isSel && styles.activeVendorOptionText]}>
                        {v.name} ({v.productCategory || v.category})
                      </Text>
                    </TouchableOpacity>
                  );
              })}
              {vendors.filter(v => selectedGroupId === null || (vendorGroups.find(g => g.id === selectedGroupId)?.vendorIds || []).includes(v.id)).length === 0 && (
                <Text style={styles.emptyText}>No vendors found in this group.</Text>
              )}
            </View>

            <View style={styles.cardDivider} />

            {/* Language Selection */}
            <Text style={styles.formLabel}>Message Language</Text>
            <View style={styles.languageRow}>
              <TouchableOpacity 
                onPress={() => setMsgLanguage('EN')}
                style={[styles.langOption, msgLanguage === 'EN' && styles.activeLangOption]}
              >
                <Text style={[styles.langText, msgLanguage === 'EN' && styles.activeLangText]}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setMsgLanguage('MR')}
                style={[styles.langOption, msgLanguage === 'MR' && styles.activeLangOption]}
              >
                <Text style={[styles.langText, msgLanguage === 'MR' && styles.activeLangText]}>मराठी</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleSendWhatsApp} style={styles.dispatchBtn}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="chat" color="#ffffff" size={16} />
                <Text style={[styles.dispatchBtnText, { marginLeft: 8 }]}>Dispatch WhatsApp Order</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Item Selection Modal */}
      <Modal visible={isItemModalOpen} transparent={true} animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Inventory Item</Text>
                <TouchableOpacity onPress={() => setIsItemModalOpen(false)}>
                  <Icon name="close" color="#3d251e" size={20} />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 300 }}>
                {inventoryItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.modalOption}
                    onPress={() => {
                      setItemName(item.name);
                      setUnit(item.unit);
                      setIsItemModalOpen(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{item.name}</Text>
                    <Text style={styles.modalOptionSubText}>Current Stock: {item.quantity} {item.unit}</Text>
                  </TouchableOpacity>
                ))}
                {inventoryItems.length === 0 && (
                  <Text style={{ textAlign: 'center', color: '#8c6e65', marginTop: 20 }}>
                    No inventory items found. Add items from the Inventory tab.
                  </Text>
                )}
              </ScrollView>
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
    paddingBottom: 40,
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#3d251e',
    marginBottom: 8,
  },
  cardInfo: {
    fontSize: 11,
    color: '#8c6e65',
    fontWeight: '600',
    lineHeight: 15,
    marginBottom: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#ebdcd3',
    marginVertical: 12,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3d251e',
    marginBottom: 6,
  },
  input: {
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
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  addBtn: {
    height: 44,
    backgroundColor: '#146e4e',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: '#3d251e',
    marginBottom: 12,
    marginLeft: 4,
  },
  draftCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  draftItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#ebdcd3',
  },
  draftItemName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3d251e',
  },
  draftItemQty: {
    fontSize: 12,
    fontWeight: '800',
    color: '#146e4e',
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#8c6e65',
  },
  vendorChoiceList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
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
    backgroundColor: '#a67c6d',
    borderColor: '#a67c6d',
  },
  vendorOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3d251e',
  },
  activeVendorOptionText: {
    color: '#ffffff',
  },
  dispatchBtn: {
    height: 44,
    backgroundColor: '#25D366',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dispatchBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  dropdownButton: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#3d251e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
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
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3d251e',
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f0ed',
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3d251e',
  },
  modalOptionSubText: {
    fontSize: 12,
    color: '#8c6e65',
    marginTop: 2,
  },
  groupPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f0ed',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ebdcd3',
  },
  activeGroupPill: {
    backgroundColor: '#146e4e',
    borderColor: '#146e4e',
  },
  groupPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3d251e',
  },
  activeGroupPillText: {
    color: '#ffffff',
  },
  languageRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  langOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#ffffff',
  },
  activeLangOption: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  langText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8c6e65',
  },
  activeLangText: {
    color: '#ffffff',
  },
});
