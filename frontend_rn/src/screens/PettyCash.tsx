import React, { useState, useEffect } from 'react';
import 
{
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
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function PettyCash() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const [outletId, setOutletId] = useState<string | null>(null);
  const [date] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpReason, setTopUpReason] = useState('');
  
  // Ledger states
  const [openingBalance, setOpeningBalance] = useState(2000);
  const [cashSales, setCashSales] = useState(0);
  const [cashExpenses, setCashExpenses] = useState(0);
  const [cashAdvances, setCashAdvances] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [closingBalance, setClosingBalance] = useState(2000);

  // Form states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [tempOpeningBalance, setTempOpeningBalance] = useState('');
  
  const [txType, setTxType] = useState<'IN' | 'OUT'>('IN');
  const [txAmount, setTxAmount] = useState('');
  const [txReason, setTxReason] = useState('');

  const loadLedgerData = async () => {
    const storedRole = await AsyncStorage.getItem('role');
    setRole(storedRole);
    
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

    // Fetch daily petty cash log (creates one if not exists)
    const log = stateService.getPettyCashLog(activeOutletId, date);
    
    // Auto calculated parameters
    const salesList = stateService.getSales(activeOutletId);
    const todaySales = salesList.find((s: any) => s.date === date);
    const salesCash = todaySales ? (todaySales.cash || 0) : 0;

    const expensesList = stateService.getExpenses(activeOutletId);
    const todayExpenses = expensesList.filter((e: any) => e.date === date);
    const expensesCash = todayExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

    const allAdvances = stateService.getStaffAdvances(0, date.substring(0, 7)); // simple prefix match
    const todayAdvances = allAdvances.filter((a: any) => a.advanceDate === date);
    const advancesCash = todayAdvances.reduce((sum: number, a: any) => sum + (a.amount || 0), 0);

    setOpeningBalance(log.openingBalance);
    setCashSales(salesCash);
    setCashExpenses(expensesCash);
    setCashAdvances(advancesCash);
    setTransactions(log.transactions || []);
    setClosingBalance(log.closingBalance);

    // Fetch petty cash requests
    try {
      const reqData = await stateService.getPettyCashRequests(storedRole === 'ADMIN' ? null : activeOutletId);
      setRequests(reqData || []);
    } catch (e) {
      console.error(e);
    }
    
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
    
    // Reload
    const log = stateService.getPettyCashLog(newOutletId, date);
    setOpeningBalance(log.openingBalance);
    setTransactions(log.transactions || []);
    setClosingBalance(log.closingBalance);
    setLoading(false);
  };

  useEffect(() => {
    loadLedgerData();
  }, [outletId]);

  const handleSaveOpeningBalance = () => {
    const val = parseFloat(tempOpeningBalance);
    if (isNaN(val) || val < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive opening balance.');
      return;
    }
    stateService.updatePettyCashOpeningBalance(outletId, date, val);
    loadLedgerData();
    setIsOpeningModalOpen(false);
    setTempOpeningBalance('');
  };

  const handleSaveTransaction = () => {
    const val = parseFloat(txAmount);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid transaction amount.');
      return;
    }
    if (!txReason.trim()) {
      Alert.alert('Reason Required', 'Please enter a reason/description for the transaction.');
      return;
    }

    stateService.addPettyCashTransaction(outletId, date, {
      type: txType,
      amount: val,
      reason: txReason
    });

    loadLedgerData();
    setIsTxModalOpen(false);
    setTxAmount('');
    setTxReason('');
  };

  const handleDeleteTransaction = (txId: number) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this cash drawer transaction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        stateService.deletePettyCashTransaction(outletId, date, txId);
        loadLedgerData();
      }}
    ]);
  };

  const handleRequestTopUp = async () => {
    if (!topUpAmount || isNaN(parseFloat(topUpAmount)) || parseFloat(topUpAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }
    if (!topUpReason.trim()) {
      Alert.alert('Error', 'Please enter a reason.');
      return;
    }

    try {
      setLoading(true);
      await stateService.createPettyCashRequest({
        outletId: parseInt(outletId || '1'),
        amount: parseFloat(topUpAmount),
        reason: topUpReason.trim(),
        requestDate: date
      });
      Alert.alert('Success', 'Top-up request submitted to Admin!');
      setTopUpAmount('');
      setTopUpReason('');
      setIsTopUpModalOpen(false);
      loadLedgerData();
    } catch (err) {
      Alert.alert('Error', 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveRequest = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    Alert.alert(`Confirm ${status}`, `Are you sure you want to ${status.toLowerCase()} this top-up request?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            setLoading(true);
            await stateService.resolvePettyCashRequest(id, status, 'Admin processed');
            Alert.alert('Success', `Request ${status.toLowerCase()} successfully!`);
            loadLedgerData();
          } catch (err) {
            Alert.alert('Error', 'Failed to process request.');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <LayoutWrapper title="Petty Cash Drawer">
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper title="Petty Cash Drawer">
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <OutletSelector selectedOutletId={outletId} onSelect={handleOutletChange} />

        {/* Header Summary */}
        <View style={styles.dateHeader}>
          <Icon name="calendar" color="#146e4e" size={18} />
          <Text style={styles.dateText}>{getFormattedDate()} (Today)</Text>
        </View>

        {/* Current Cash summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: '#146e4e' }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>Net Cash In Drawer</Text>
            <TouchableOpacity 
              style={styles.editOpeningBtn} 
              onPress={() => {
                setTempOpeningBalance(openingBalance.toString());
                setIsOpeningModalOpen(true);
              }}
            >
              <Icon name="edit" color="#ffffff" size={16} />
              <Text style={styles.editOpeningText}>Edit Opening</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.closingBalanceText}>₹{closingBalance}</Text>
          
          <View style={styles.balanceBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Opening Balance:</Text>
              <Text style={styles.breakdownValue}>₹{openingBalance}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>+ Cash Sales:</Text>
              <Text style={[styles.breakdownValue, { color: '#bbf7d0' }]}>₹{cashSales}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>- Cash Expenses:</Text>
              <Text style={[styles.breakdownValue, { color: '#ffb3b3' }]}>₹{cashExpenses}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>- Salary Advances:</Text>
              <Text style={[styles.breakdownValue, { color: '#ffb3b3' }]}>₹{cashAdvances}</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionBtn} onPress={() => setIsTxModalOpen(true)}>
          <Text style={styles.actionBtnText}>+ Log Manual Cash IN / OUT</Text>
        </TouchableOpacity>

        {role !== 'ADMIN' && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#8c6e65', marginTop: 8 }]} onPress={() => setIsTopUpModalOpen(true)}>
            <Text style={styles.actionBtnText}>Request Petty Cash Top-up</Text>
          </TouchableOpacity>
        )}

        {/* Manual Transactions List */}
        <Text style={styles.sectionTitle}>Manual Transactions Log</Text>
        <View style={styles.card}>
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txLeft}>
                <View style={[styles.txIndicator, { backgroundColor: tx.type === 'IN' ? '#e6f7ed' : '#fdebeb' }]}>
                  <Text style={[styles.txIndicatorText, { color: tx.type === 'IN' ? '#10b981' : '#f44336' }]}>
                    {tx.type}
                  </Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txReason}>{tx.reason}</Text>
                  <Text style={styles.txTime}>{tx.time}</Text>
                </View>
              </View>
              <View style={styles.txRight}>
                <Text style={[styles.txAmountText, { color: tx.type === 'IN' ? '#10b981' : '#f44336' }]}>
                  {tx.type === 'IN' ? '+' : '-'} ₹{tx.amount}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteTransaction(tx.id)} style={styles.deleteBtn}>
                  <Icon name="trash" color="#8c6e65" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {transactions.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No manual cash transactions logged today.</Text>
            </View>
          )}
        </View>

        {/* Petty Cash Top-up Requests Section */}
        <Text style={styles.sectionTitle}>Petty Cash Top-up Requests</Text>
        <View style={styles.card}>
          {requests.map((req) => (
            <View key={req.id} style={styles.txRow}>
              <View style={styles.txLeft}>
                <View style={[styles.txIndicator, { 
                  backgroundColor: req.status === 'APPROVED' ? '#e6f7ed' : (req.status === 'REJECTED' ? '#fdebeb' : '#fff8e1'),
                  minWidth: 80,
                  alignItems: 'center'
                }]}>
                  <Text style={[styles.txIndicatorText, { 
                    color: req.status === 'APPROVED' ? '#10b981' : (req.status === 'REJECTED' ? '#f44336' : '#f57f17') 
                  }]}>
                    {req.status}
                  </Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txReason}>{req.reason || 'Top-up request'}</Text>
                  <Text style={styles.txTime}>{req.requestDate}</Text>
                </View>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txAmountText}>₹{req.amount}</Text>
                {role === 'ADMIN' && req.status === 'PENDING' && (
                  <View style={{ flexDirection: 'row', gap: 6, marginLeft: 10 }}>
                    <TouchableOpacity onPress={() => handleResolveRequest(req.id, 'APPROVED')} style={styles.approveSmallBtn}>
                      <Icon name="check-square" color="#10b981" size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleResolveRequest(req.id, 'REJECTED')} style={styles.rejectSmallBtn}>
                      <Icon name="close" color="#f44336" size={18} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
          {requests.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No top-up requests recorded.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Opening Balance Modal */}
      <Modal visible={isOpeningModalOpen} transparent animationType="slide" onRequestClose={() => setIsOpeningModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Opening Cash</Text>
            <Text style={styles.formLabel}>Opening Cash Amount (₹)</Text>
            <TextInput
              style={styles.modalInput}
              value={tempOpeningBalance}
              onChangeText={setTempOpeningBalance}
              keyboardType="numeric"
              placeholder="e.g. 2000"
              placeholderTextColor="#8c6e65"
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity onPress={() => setIsOpeningModalOpen(false)} style={[styles.modalBtn, styles.cancelBtn]}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveOpeningBalance} style={[styles.modalBtn, styles.saveBtn]}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Manual Tx Modal */}
      <Modal visible={isTxModalOpen} transparent animationType="slide" onRequestClose={() => setIsTxModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log Cash Transaction</Text>
            
            <Text style={styles.formLabel}>Transaction Type</Text>
            <View style={styles.txToggleRow}>
              <TouchableOpacity 
                style={[styles.toggleBtn, txType === 'IN' && styles.activeToggleIn]}
                onPress={() => setTxType('IN')}
              >
                <Text style={[styles.toggleText, txType === 'IN' && styles.activeToggleText]}>Cash IN (Deposit)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, txType === 'OUT' && styles.activeToggleOut]}
                onPress={() => setTxType('OUT')}
              >
                <Text style={[styles.toggleText, txType === 'OUT' && styles.activeToggleText]}>Cash OUT (Withdrawal)</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabel}>Amount (₹)</Text>
            <TextInput
              style={styles.modalInput}
              value={txAmount}
              onChangeText={setTxAmount}
              keyboardType="numeric"
              placeholder="e.g. 500"
              placeholderTextColor="#8c6e65"
            />

            <Text style={styles.formLabel}>Reason / Description</Text>
            <TextInput
              style={styles.modalInput}
              value={txReason}
              onChangeText={setTxReason}
              placeholder="e.g. Paid tea vendor, Added change"
              placeholderTextColor="#8c6e65"
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity onPress={() => setIsTxModalOpen(false)} style={[styles.modalBtn, styles.cancelBtn]}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveTransaction} style={[styles.modalBtn, styles.saveBtn]}>
                <Text style={styles.saveBtnText}>Log Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Top-up Request Modal */}
      <Modal visible={isTopUpModalOpen} transparent animationType="slide" onRequestClose={() => setIsTopUpModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Request Cash Top-up</Text>
            
            <Text style={styles.formLabel}>Amount (₹)</Text>
            <TextInput
              style={styles.modalInput}
              value={topUpAmount}
              onChangeText={setTopUpAmount}
              keyboardType="numeric"
              placeholder="e.g. 5000"
              placeholderTextColor="#8c6e65"
            />
            
            <Text style={styles.formLabel}>Reason / Justification</Text>
            <TextInput
              style={styles.modalInput}
              value={topUpReason}
              onChangeText={setTopUpReason}
              placeholder="e.g. Low cash drawer balance"
              placeholderTextColor="#8c6e65"
            />
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity onPress={() => setIsTopUpModalOpen(false)} style={[styles.modalBtn, styles.cancelBtn]}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRequestTopUp} style={[styles.modalBtn, styles.saveBtn]}>
                <Text style={styles.saveBtnText}>Submit Request</Text>
              </TouchableOpacity>
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
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#146e4e',
    marginLeft: 8,
  },
  summaryCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#146e4e',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#bbf7d0',
  },
  editOpeningBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editOpeningText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 4,
  },
  closingBalanceText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 16,
  },
  balanceBreakdown: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 12,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#bbf7d0',
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '800',
  },
  actionBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#146e4e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#146e4e',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3d251e',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    padding: 16,
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e8e3',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  txIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 44,
    alignItems: 'center',
  },
  txIndicatorText: {
    fontSize: 10,
    fontWeight: '900',
  },
  txInfo: {
    flex: 1,
  },
  txReason: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3d251e',
  },
  txTime: {
    fontSize: 10,
    color: '#8c6e65',
    marginTop: 2,
  },
  txRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  txAmountText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3d251e',
  },
  deleteBtn: {
    padding: 4,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#8c6e65',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(61, 37, 30, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    padding: 24,
    elevation: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3d251e',
    marginBottom: 16,
    textAlign: 'center',
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3d251e',
    marginBottom: 6,
    marginTop: 12,
  },
  txToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  toggleBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggleIn: {
    backgroundColor: '#e6f7ed',
    borderColor: '#10b981',
  },
  activeToggleOut: {
    backgroundColor: '#fdebeb',
    borderColor: '#f44336',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8c6e65',
  },
  activeToggleText: {
    color: '#3d251e',
  },
  modalInput: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#3d251e',
    backgroundColor: '#ffffff',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ebdcd3',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8c6e65',
  },
  saveBtn: {
    backgroundColor: '#146e4e',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  approveSmallBtn: {
    padding: 6,
    backgroundColor: '#e6f7ed',
    borderRadius: 4,
  },
  rejectSmallBtn: {
    padding: 6,
    backgroundColor: '#fdebeb',
    borderRadius: 4,
  },
});
