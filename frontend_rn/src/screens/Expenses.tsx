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

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [outletId, setOutletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const loadExpenses = async () => {
    const storedRole = await AsyncStorage.getItem('role');
    
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
    setExpenses(stateService.getExpenses(activeOutletId));
    setLoading(false);
  };

  const handleOutletChange = async (newOutletId: string) => {
    setLoading(true);
    await AsyncStorage.setItem('outletId', newOutletId);
    const outlets = stateService.getOutlets();
    const selectedOutlet = outlets.find((o: any) => o.id.toString() === newOutletId);
    if (selectedOutlet) {
      await AsyncStorage.setItem('outletName', selectedOutlet.name);
    }
    setOutletId(newOutletId);
    setExpenses(stateService.getExpenses(newOutletId));
    setLoading(false);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSave = () => {
    if (!name || !amount) {
      Alert.alert('Required Fields', 'Please fill out all required fields.');
      return;
    }

    stateService.addExpense(outletId, {
      name,
      amount: parseFloat(amount),
      description
    });

    loadExpenses();
    setIsModalOpen(false);

    // Reset Form
    setName('');
    setAmount('');
    setDescription('');
  };

  if (loading) {
    return (
      <LayoutWrapper title="Operational Expenses">
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      </LayoutWrapper>
    );
  }

  if (!outletId) {
    return (
      <LayoutWrapper title="Operational Expenses">
        <View style={styles.centeredContainer}>
          <Text style={styles.noOutletText}>
            Log in with an assigned branch manager role to access expense logs.
          </Text>
        </View>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper title="Operational Expenses">
      <OutletSelector selectedOutletId={outletId} onSelect={handleOutletChange} />
      <View style={styles.mainContainer}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {/* Expenses list */}
          <View style={styles.listContainer}>
            {expenses.map((e) => (
              <View key={e.id} style={styles.expenseCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.headerInfo}>
                    <Text style={styles.expenseName}>{e.name}</Text>
                    <Text style={styles.expenseDesc}>
                      {e.description || 'No description provided'}
                    </Text>
                  </View>
                  <Text style={styles.amountText}>
                    ₹{e.amount.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardFooter}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="creditcard" color="#8c6e65" size={14} />
                    <Text style={[styles.payoutText, { marginLeft: 4 }]}>Cash/UPI Payout</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="calendar" color="#8c6e65" size={14} />
                    <Text style={[styles.dateText, { marginLeft: 4 }]}>{e.date}</Text>
                  </View>
                </View>
              </View>
            ))}

            {expenses.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No expenses recorded for this branch.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Add button */}
        <TouchableOpacity
          onPress={() => setIsModalOpen(true)}
          style={styles.floatingButton}
        >
          <Text style={styles.floatingButtonText}>+ Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Add Expense Modal */}
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
              <Text style={styles.modalTitle}>Log Operational Expense</Text>
              <View style={styles.modalDivider} />

              <ScrollView contentContainerStyle={styles.modalFormScroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.formLabel}>Expense Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Gas Cylinder Refill"
                  placeholderTextColor="#8c6e65"
                />

                <Text style={styles.formLabel}>Amount (₹) *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="e.g. 1250"
                  placeholderTextColor="#8c6e65"
                  keyboardType="numeric"
                />

                <Text style={styles.formLabel}>Description/Notes</Text>
                <TextInput
                  style={styles.modalInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="e.g. Paid cash to delivery driver"
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
                    <Text style={styles.saveBtnText}>Log Expense</Text>
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
  expenseCard: {
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
  headerInfo: {
    flex: 1,
    marginRight: 8,
  },
  expenseName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3d251e',
    marginBottom: 4,
  },
  expenseDesc: {
    fontSize: 11,
    color: '#8c6e65',
    fontWeight: '600',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0d4e37',
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
  payoutText: {
    fontSize: 11,
    color: '#8c6e65',
    fontWeight: '700',
  },
  dateText: {
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
});
