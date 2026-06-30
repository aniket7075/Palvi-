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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import Icon from '../components/Icon';
import OutletSelector from '../components/OutletSelector';

export default function WasteTrackingScreen() {
  const [role, setRole] = useState<string | null>(null);
  const [outletId, setOutletId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [wasteLogs, setWasteLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('SPOILED'); // "EXPIRED", "SPOILED", "BURNT", "OTHER"
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Dropdown selector modal state
  const [isItemSelectorOpen, setIsItemSelectorOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const storedRole = await AsyncStorage.getItem('role');
    setRole(storedRole);

    let activeOutletId = await AsyncStorage.getItem('outletId');
    if (!activeOutletId && storedRole === 'ADMIN') {
      const outlets = stateService.getOutlets();
      if (outlets.length > 0) {
        activeOutletId = outlets[0].id.toString();
      }
    }

    if (activeOutletId) {
      setOutletId(activeOutletId);
      
      // Load inventory to choose from
      const stock = stateService.getInventory(activeOutletId);
      setInventory(stock || []);

      // Load waste logs
      const logs = await stateService.getWasteLogs(storedRole === 'ADMIN' ? null : activeOutletId);
      setWasteLogs(logs || []);
    }
    setLoading(false);
  };

  const handleOutletChange = async (newOutletId: string) => {
    setLoading(true);
    setOutletId(newOutletId);
    const logs = await stateService.getWasteLogs(newOutletId);
    setWasteLogs(logs || []);
    const stock = stateService.getInventory(newOutletId);
    setInventory(stock || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!selectedItemId) {
      Alert.alert('Error', 'Please select an item.');
      return;
    }
    if (!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid positive quantity.');
      return;
    }

    const selectedItem = inventory.find(i => i.id === selectedItemId);
    if (!selectedItem) return;

    if (parseFloat(quantity) > selectedItem.quantity) {
      Alert.alert('Warning', `Cannot log waste greater than current stock (${selectedItem.quantity} ${selectedItem.unit}).`);
      return;
    }

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const payload = {
        outletId: parseInt(outletId || '1'),
        inventoryItemId: selectedItemId,
        quantity: parseFloat(quantity),
        unit: selectedItem.unit || 'Kg',
        reason: reason,
        date: date,
        loggedById: userId ? parseInt(userId) : 1,
      };

      await stateService.createWasteLog(payload);
      Alert.alert('Success', 'Food waste logged and inventory updated!');
      setIsModalOpen(false);
      setQuantity('');
      setSelectedItemId(null);
      setReason('SPOILED');

      // Reload
      loadData();
    } catch (err) {
      Alert.alert('Error', 'Failed to log waste.');
      setLoading(false);
    }
  };

  const selectedItemName = selectedItemId 
    ? inventory.find(i => i.id === selectedItemId)?.name 
    : 'Select Item...';

  // Calculate financial losses for Admin overview
  const totalLoss = wasteLogs.reduce((sum, log) => {
    // Find purchase price in inventory or estimate it
    const invItem = inventory.find(i => i.id === log.inventoryItemId);
    const price = invItem?.purchasePrice || log.price || 150; // fallback cost per unit
    return sum + (log.quantity * price);
  }, 0);

  return (
    <LayoutWrapper title={role === 'ADMIN' ? 'Kitchen Waste & Loss' : 'Wastage Log'}>
      {role === 'ADMIN' && (
        <View style={styles.selectorContainer}>
          <OutletSelector selectedOutletId={outletId} onSelect={handleOutletChange} />
        </View>
      )}

      {loading && wasteLogs.length === 0 ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            
            {/* Loss metrics card for Admin */}
            {role === 'ADMIN' && (
              <View style={styles.metricsCard}>
                <View style={styles.metricsIcon}>
                  <Icon name="alert" color="#c62828" size={28} />
                </View>
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={styles.metricsLabel}>Estimated Financial Wastage Loss</Text>
                  <Text style={styles.metricsVal}>₹{totalLoss.toLocaleString('en-IN')}</Text>
                  <Text style={styles.metricsSubText}>Based on purchase costs of logged spoiled goods.</Text>
                </View>
              </View>
            )}

            {role !== 'ADMIN' && (
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.8}
                onPress={() => setIsModalOpen(true)}
              >
                <Icon name="alert" color="#fff" size={20} />
                <Text style={styles.addButtonText}>Report Spoilage / Waste</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>Recorded Spoilage Logs</Text>
            {wasteLogs.length === 0 ? (
              <Text style={styles.emptyText}>No food waste or spoilage logged yet.</Text>
            ) : (
              wasteLogs.map((item: any) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{item.inventoryItemName || 'Ingredient Item'}</Text>
                      <Text style={styles.cardSubtitle}>
                        Quantity: {item.quantity} {item.unit || 'Kg'} | Reason: <Text style={styles.boldText}>{item.reason}</Text>
                      </Text>
                    </View>
                    <Text style={styles.dateText}>{item.date}</Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={styles.detailText}>Logged By: {item.loggedByName || 'Staff Manager'}</Text>
                    {role === 'ADMIN' && (
                      <Text style={styles.detailText}>Outlet: {item.outletName || `Outlet #${item.outletId}`}</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* Log Waste Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Food Spoilage / Waste</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Icon name="close" color="#3d251e" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Custom Dropdown Trigger */}
              <Text style={styles.inputLabel}>Select Stock Item *</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => setIsItemSelectorOpen(true)}
              >
                <Text style={styles.dropdownTriggerText}>{selectedItemName}</Text>
                <Icon name="pin" color="#8c6e65" size={16} />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Quantity to Log *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />

              <Text style={styles.inputLabel}>Reason *</Text>
              <View style={styles.reasonRow}>
                {['SPOILED', 'EXPIRED', 'BURNT', 'OTHER'].map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.reasonBtn,
                      reason === r && styles.reasonBtnActive,
                    ]}
                    onPress={() => setReason(r)}
                  >
                    <Text style={[
                      styles.reasonBtnText,
                      reason === r && styles.reasonBtnTextActive,
                    ]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
              />
            </ScrollView>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
              <Text style={styles.submitBtnText}>Submit Waste Log</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Bottom Sheet Selector for Stock Items */}
      <Modal visible={isItemSelectorOpen} animationType="fade" transparent>
        <View style={styles.selectorModalOverlay}>
          <View style={styles.selectorModalContent}>
            <View style={styles.selectorModalHeader}>
              <Text style={styles.selectorModalTitle}>Select Stock Item</Text>
              <TouchableOpacity onPress={() => setIsItemSelectorOpen(false)}>
                <Icon name="close" color="#3d251e" size={20} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {inventory.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemOption}
                  onPress={() => {
                    setSelectedItemId(item.id);
                    setIsItemSelectorOpen(false);
                  }}
                >
                  <Text style={styles.itemOptionText}>{item.name}</Text>
                  <Text style={styles.itemOptionSub}>
                    Current Stock: {item.quantity} {item.unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  selectorContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0e6df',
  },
  metricsCard: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  metricsIcon: {
    backgroundColor: '#ffcdd2',
    padding: 10,
    borderRadius: 8,
  },
  metricsLabel: {
    fontSize: 13,
    color: '#c62828',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  metricsVal: {
    fontSize: 26,
    fontWeight: '900',
    color: '#b71c1c',
    marginVertical: 2,
  },
  metricsSubText: {
    fontSize: 11,
    color: '#c62828',
    opacity: 0.8,
  },
  addButton: {
    backgroundColor: '#8c6e65',
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
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8c6e65',
    marginVertical: 20,
    fontSize: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0e6df',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d251e',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#8c6e65',
    marginTop: 4,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#146e4e',
  },
  dateText: {
    fontSize: 12,
    color: '#8c6e65',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f5eeea',
    paddingTop: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#8c6e65',
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
    maxHeight: '80%',
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
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#ebdcd3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fdfbfa',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownTriggerText: {
    fontSize: 15,
    color: '#3d251e',
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
  reasonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  reasonBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fcf4f0',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 4,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#f0e6df',
  },
  reasonBtnActive: {
    backgroundColor: '#146e4e',
    borderColor: '#146e4e',
  },
  reasonBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8c6e65',
  },
  reasonBtnTextActive: {
    color: '#fff',
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
  selectorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '85%',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  selectorModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f5eeea',
    paddingBottom: 8,
    marginBottom: 8,
  },
  selectorModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d251e',
  },
  itemOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fcf8f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemOptionText: {
    fontSize: 15,
    color: '#3d251e',
    fontWeight: 'bold',
  },
  itemOptionSub: {
    fontSize: 12,
    color: '#8c6e65',
  },
});
