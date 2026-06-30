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
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import Icon from '../components/Icon';
import OutletSelector from '../components/OutletSelector';

export default function BankDepositScreen() {
  const [role, setRole] = useState<string | null>(null);
  const [outletId, setOutletId] = useState<string | null>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedSlipUrl, setSelectedSlipUrl] = useState<string | null>(null);

  // Form states
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // Rejection notes state
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedDepositId, setSelectedDepositId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    const storedRole = await AsyncStorage.getItem('role');
    setRole(storedRole);

    let activeOutletId = await AsyncStorage.getItem('outletId');
    if (!activeOutletId && storedRole === 'ADMIN') {
      const outlets = stateService.getOutlets();
      if (outlets.length > 0) {
        const firstId = outlets[0].id.toString();
        activeOutletId = firstId;
        await AsyncStorage.setItem('outletId', firstId);
      }
    }

    if (activeOutletId) {
      setOutletId(activeOutletId);
      const data = await stateService.getBankDeposits(storedRole === 'ADMIN' ? null : activeOutletId);
      setDeposits(data || []);
    }
    setLoading(false);
  };

  const handleOutletChange = async (newOutletId: string) => {
    setLoading(true);
    await AsyncStorage.setItem('outletId', newOutletId);
    setOutletId(newOutletId);
    const data = await stateService.getBankDeposits(newOutletId);
    setDeposits(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAttachSlip = () => {
    // Simulating attaching a file in React Native
    setSelectedFile({
      uri: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500',
      name: 'bank_slip_' + Date.now() + '.jpg',
      type: 'image/jpeg',
    });
    Alert.alert('Success', 'Deposit slip receipt attached successfully!');
  };

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const payload = {
        outletId: parseInt(outletId || '1'),
        depositDate: depositDate,
        amount: parseFloat(amount),
        notes: notes,
        submittedById: userId ? parseInt(userId) : 1,
      };

      const created = await stateService.createBankDeposit(payload);
      
      // Simulate file upload if slip is attached
      if (selectedFile && created && created.id) {
        await stateService.uploadBankDepositSlip(created.id, selectedFile);
      }

      Alert.alert('Success', 'Bank deposit submitted for verification!');
      setIsModalOpen(false);
      setAmount('');
      setNotes('');
      setSelectedFile(null);
      
      // Reload lists
      const data = await stateService.getBankDeposits(role === 'ADMIN' ? null : outletId);
      setDeposits(data || []);
    } catch (err) {
      Alert.alert('Submission Failed', 'Could not record deposit.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    Alert.alert('Confirm Approval', 'Are you sure you want to approve this deposit record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          try {
            setLoading(true);
            await stateService.approveBankDeposit(id);
            Alert.alert('Success', 'Bank deposit approved!');
            const data = await stateService.getBankDeposits(null);
            setDeposits(data || []);
          } catch (err) {
            Alert.alert('Error', 'Failed to approve deposit.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionNotes.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection.');
      return;
    }
    if (selectedDepositId === null) return;

    try {
      setLoading(true);
      await stateService.rejectBankDeposit(selectedDepositId, rejectionNotes);
      Alert.alert('Success', 'Bank deposit rejected.');
      setIsRejectModalOpen(false);
      setRejectionNotes('');
      setSelectedDepositId(null);
      const data = await stateService.getBankDeposits(null);
      setDeposits(data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to reject deposit.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return styles.badgeApproved;
      case 'REJECTED':
        return styles.badgeRejected;
      default:
        return styles.badgePending;
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return styles.textApproved;
      case 'REJECTED':
        return styles.textRejected;
      default:
        return styles.textPending;
    }
  };

  return (
    <LayoutWrapper title={role === 'ADMIN' ? 'Bank Deposit Auditing' : 'Bank Deposits'}>
      {role === 'ADMIN' && (
        <View style={styles.selectorContainer}>
          <OutletSelector selectedOutletId={outletId} onSelect={handleOutletChange} />
        </View>
      )}

      {loading && deposits.length === 0 ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {role !== 'ADMIN' && (
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.8}
                onPress={() => setIsModalOpen(true)}
              >
                <Icon name="plus" color="#fff" size={20} />
                <Text style={styles.addButtonText}>Submit New Deposit</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>Deposit Ledger Logs</Text>
            {deposits.length === 0 ? (
              <Text style={styles.emptyText}>No bank deposit logs recorded yet.</Text>
            ) : (
              deposits.map((item: any) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardTitle}>₹{item.amount.toLocaleString('en-IN')}</Text>
                      <Text style={styles.cardSubtitle}>Date: {item.depositDate}</Text>
                    </View>
                    <View style={[styles.badge, getStatusBadgeStyle(item.status)]}>
                      <Text style={[styles.badgeText, getStatusTextStyle(item.status)]}>{item.status}</Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.cardBody}>
                    {role === 'ADMIN' && (
                      <Text style={styles.detailText}>
                        <Text style={styles.boldText}>Outlet:</Text> {item.outletName || `Outlet #${item.outletId}`}
                      </Text>
                    )}
                    <Text style={styles.detailText}>
                      <Text style={styles.boldText}>Notes:</Text> {item.notes || 'None'}
                    </Text>
                    {item.submittedByName && (
                      <Text style={styles.detailText}>
                        <Text style={styles.boldText}>Submitted By:</Text> {item.submittedByName}
                      </Text>
                    )}
                  </View>

                  {item.depositSlipUrl && (
                    <TouchableOpacity
                      style={styles.slipButton}
                      onPress={() => {
                        setSelectedSlipUrl(item.depositSlipUrl);
                        setIsPreviewModalOpen(true);
                      }}
                    >
                      <Icon name="clipboard" color="#146e4e" size={16} />
                      <Text style={styles.slipButtonText}>View Attached Slip</Text>
                    </TouchableOpacity>
                  )}

                  {role === 'ADMIN' && item.status === 'PENDING' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => handleApprove(item.id)}
                      >
                        <Text style={styles.actionBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => {
                          setSelectedDepositId(item.id);
                          setIsRejectModalOpen(true);
                        }}
                      >
                        <Text style={styles.actionBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* New Deposit Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Cash Deposit Slip</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Icon name="close" color="#3d251e" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.inputLabel}>Deposit Amount (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter deposit amount"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />

              <Text style={styles.inputLabel}>Deposit Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={depositDate}
                onChangeText={setDepositDate}
              />

              <Text style={styles.inputLabel}>Notes / Reference</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Bank name, branch or deposit details..."
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />

              <TouchableOpacity style={styles.attachBtn} onPress={handleAttachSlip}>
                <Icon name="camera" color="#8c6e65" size={20} />
                <Text style={styles.attachBtnText}>
                  {selectedFile ? 'Receipt Attached (Change)' : 'Attach Deposit Slip Photo'}
                </Text>
              </TouchableOpacity>

              {selectedFile && (
                <Text style={styles.attachedFileName}>Attached: {selectedFile.name}</Text>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
              <Text style={styles.submitBtnText}>Submit Deposit</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Rejection Notes Modal */}
      <Modal visible={isRejectModalOpen} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <Text style={styles.modalTitle}>Reject Deposit Request</Text>
            <Text style={styles.inputLabel}>Reason for Rejection *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Explain why this deposit is rejected..."
              multiline
              numberOfLines={3}
              value={rejectionNotes}
              onChangeText={setRejectionNotes}
            />
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => {
                  setIsRejectModalOpen(false);
                  setRejectionNotes('');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectSubmitBtn]}
                onPress={handleRejectSubmit}
              >
                <Text style={styles.actionBtnText}>Confirm Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Slip Image Preview Modal */}
      <Modal visible={isPreviewModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Slip Preview</Text>
              <TouchableOpacity onPress={() => setIsPreviewModalOpen(false)}>
                <Icon name="close" color="#fff" size={26} />
              </TouchableOpacity>
            </View>
            {selectedSlipUrl ? (
              <Image
                source={{ uri: selectedSlipUrl.startsWith('/uploads') ? 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500' : selectedSlipUrl }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.previewError}>No preview image available.</Text>
            )}
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
  addButton: {
    backgroundColor: '#146e4e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0e6df',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#146e4e',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8c6e65',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePending: {
    backgroundColor: '#fff8e1',
  },
  badgeApproved: {
    backgroundColor: '#e8f5e9',
  },
  badgeRejected: {
    backgroundColor: '#ffebee',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  textPending: {
    color: '#f57f17',
  },
  textApproved: {
    color: '#2e7d32',
  },
  textRejected: {
    color: '#c62828',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f5eeea',
    marginVertical: 12,
  },
  cardBody: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#3d251e',
    marginBottom: 4,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#8c6e65',
  },
  slipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcf4f0',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  slipButtonText: {
    fontSize: 13,
    color: '#146e4e',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  approveBtn: {
    backgroundColor: '#146e4e',
  },
  rejectBtn: {
    backgroundColor: '#8c6e65',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
    maxHeight: '85%',
  },
  smallModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    justifyContent: 'center',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ebdcd3',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
    backgroundColor: '#fdfbfa',
  },
  attachBtnText: {
    fontSize: 14,
    color: '#8c6e65',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  attachedFileName: {
    fontSize: 12,
    color: '#146e4e',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: 'bold',
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
  row: {
    flexDirection: 'row',
    marginTop: 16,
  },
  cancelBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ebdcd3',
  },
  cancelBtnText: {
    color: '#8c6e65',
    fontWeight: 'bold',
  },
  rejectSubmitBtn: {
    backgroundColor: '#c62828',
  },
  previewContainer: {
    backgroundColor: '#000',
    width: '100%',
    height: '100%',
    paddingTop: 50,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  previewTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  previewError: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 100,
  },
});
