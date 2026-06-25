import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from '../components/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import OutletSelector from '../components/OutletSelector';

export default function Sales() {
  const [sales, setSales] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [outletId, setOutletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [cashSale, setCashSale] = useState('');
  const [upiSale, setUpiSale] = useState('');
  const [cardSale, setCardSale] = useState('');
  const [swiggySale, setSwiggySale] = useState('');
  const [zomatoSale, setZomatoSale] = useState('');
  const [otherOnlineSale, setOtherOnlineSale] = useState('');
  const [complimentarySale, setComplimentarySale] = useState('');

  const loadSales = async () => {
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
    setSales(stateService.getSales(activeOutletId));
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
    setSales(stateService.getSales(newOutletId));
    setLoading(false);
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleSave = () => {
    stateService.addSale(outletId, {
      cash: parseFloat(cashSale) || 0,
      upi: parseFloat(upiSale) || 0,
      card: parseFloat(cardSale) || 0,
      swiggy: parseFloat(swiggySale) || 0,
      zomato: parseFloat(zomatoSale) || 0,
      online: parseFloat(otherOnlineSale) || 0,
      complimentary: parseFloat(complimentarySale) || 0
    });

    loadSales();
    setIsModalOpen(false);

    // Reset Form
    setCashSale('');
    setUpiSale('');
    setCardSale('');
    setSwiggySale('');
    setZomatoSale('');
    setOtherOnlineSale('');
    setComplimentarySale('');
  };

  if (loading) {
    return (
      <LayoutWrapper title="Sales History Audits">
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      </LayoutWrapper>
    );
  }

  if (!outletId) {
    return (
      <LayoutWrapper title="Sales History Audits">
        <View style={styles.centeredContainer}>
          <Text style={styles.noOutletText}>
            Log in with an assigned branch manager role to access sales logs.
          </Text>
        </View>
      </LayoutWrapper>
    );
  }

  // Calculate Today's Summary
  const dateToday = new Date().toISOString().split('T')[0];
  const todaySale = sales.find(s => s.date === dateToday);
  
  let todayGross = 0;
  let todayComp = 0;
  let todayNet = 0;

  if (todaySale) {
    todayGross = (todaySale.cash || 0) + (todaySale.upi || 0) + (todaySale.card || 0) + (todaySale.swiggy || 0) + (todaySale.zomato || 0) + (todaySale.online || 0);
    todayComp = todaySale.complimentary || 0;
    todayNet = todayGross - todayComp;
  }

  return (
    <LayoutWrapper title="Sales History Audits">
      <OutletSelector selectedOutletId={outletId} onSelect={handleOutletChange} />
      <View style={styles.mainContainer}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          
          {/* Today's Summary Widget */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Today's Sales Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Gross Sales</Text>
                <Text style={styles.summaryValueGross}>₹{todayGross.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Free Meals</Text>
                <Text style={styles.summaryValueComp}>- ₹{todayComp.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Net Sales</Text>
                <Text style={styles.summaryValueNet}>₹{todayNet.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Sales Logs */}
          <View style={styles.listContainer}>
            {sales.map((s) => {
              const sGross = (s.cash || 0) + (s.upi || 0) + (s.card || 0) + (s.swiggy || 0) + (s.zomato || 0) + (s.online || 0);
              const sComp = s.complimentary || 0;
              const sNet = sGross - sComp;

              return (
                <View key={s.id} style={styles.salesCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.salesTitle}>Sales on {s.date}</Text>
                    <Text style={styles.salesAmount}>
                      ₹{sNet.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.channelsGrid}>
                    <View style={styles.channelRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="rupee" color="#8c6e65" size={14} />
                        <Text style={[styles.channelLabel, { marginLeft: 4 }]}>Cash:</Text>
                      </View>
                      <Text style={styles.channelValue}>₹{(s.cash || 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.channelRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="upi" color="#8c6e65" size={14} />
                        <Text style={[styles.channelLabel, { marginLeft: 4 }]}>UPI:</Text>
                      </View>
                      <Text style={styles.channelValue}>₹{(s.upi || 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.channelRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="creditcard" color="#8c6e65" size={14} />
                        <Text style={[styles.channelLabel, { marginLeft: 4 }]}>Card:</Text>
                      </View>
                      <Text style={styles.channelValue}>₹{(s.card || 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.channelRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="delivery" color="#8c6e65" size={14} />
                        <Text style={[styles.channelLabel, { marginLeft: 4 }]}>Apps:</Text>
                      </View>
                      <Text style={styles.channelValue}>
                        ₹{((s.swiggy || 0) + (s.zomato || 0)).toLocaleString()}
                      </Text>
                    </View>

                    {/* Show Complimentary Deduction if exists */}
                    {sComp > 0 && (
                      <>
                        <View style={[styles.channelRow, { width: '100%', marginTop: 8 }]}>
                           <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="alert" color="#d32f2f" size={14} />
                            <Text style={[styles.channelLabel, { marginLeft: 4, color: '#d32f2f' }]}>Complimentary (Deduction):</Text>
                          </View>
                          <Text style={[styles.channelValue, { color: '#d32f2f' }]}>- ₹{sComp.toLocaleString()}</Text>
                        </View>
                      </>
                    )}

                  </View>
                </View>
              );
            })}

            {sales.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No sales logs entered for this branch.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Add button */}
        <TouchableOpacity
          onPress={() => setIsModalOpen(true)}
          style={styles.floatingButton}
        >
          <Text style={styles.floatingButtonText}>+ Audit Sales</Text>
        </TouchableOpacity>
      </View>

      {/* Audit Sales Modal */}
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
              <Text style={styles.modalTitle}>Record Daily Channel Sales</Text>
              <View style={styles.modalDivider} />

              <ScrollView contentContainerStyle={styles.modalFormScroll} keyboardShouldPersistTaps="handled">
                <View style={styles.formRow}>
                  <View style={styles.rowItem}>
                    <Text style={styles.formLabel}>Cash Sales (₹)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={cashSale}
                      onChangeText={setCashSale}
                      placeholder="e.g. 15000"
                      placeholderTextColor="#8c6e65"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.rowItem}>
                    <Text style={styles.formLabel}>UPI Sales (₹)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={upiSale}
                      onChangeText={setUpiSale}
                      placeholder="e.g. 20000"
                      placeholderTextColor="#8c6e65"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.rowItem}>
                    <Text style={styles.formLabel}>Card Sales (₹)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={cardSale}
                      onChangeText={setCardSale}
                      placeholder="e.g. 5000"
                      placeholderTextColor="#8c6e65"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.rowItem}>
                    <Text style={styles.formLabel}>Swiggy Sales (₹)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={swiggySale}
                      onChangeText={setSwiggySale}
                      placeholder="e.g. 8000"
                      placeholderTextColor="#8c6e65"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.rowItem}>
                    <Text style={styles.formLabel}>Zomato Sales (₹)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={zomatoSale}
                      onChangeText={setZomatoSale}
                      placeholder="e.g. 9500"
                      placeholderTextColor="#8c6e65"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.rowItem}>
                    <Text style={styles.formLabel}>Other Online (₹)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={otherOnlineSale}
                      onChangeText={setOtherOnlineSale}
                      placeholder="e.g. 1200"
                      placeholderTextColor="#8c6e65"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Complimentary Meals Field */}
                <View style={styles.formRow}>
                  <View style={styles.rowItem}>
                    <Text style={[styles.formLabel, { color: '#d32f2f' }]}>Complimentary Meals / Free Guests (₹)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={complimentarySale}
                      onChangeText={setComplimentarySale}
                      placeholder="e.g. 500"
                      placeholderTextColor="#8c6e65"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

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
                    <Text style={styles.saveBtnText}>Audit Entry</Text>
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
  summaryCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    elevation: 3,
    shadowColor: '#146e4e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#146e4e',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryCol: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#bbf7d0',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#146e4e',
    opacity: 0.8,
    marginBottom: 4,
  },
  summaryValueGross: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3d251e',
  },
  summaryValueComp: {
    fontSize: 14,
    fontWeight: '800',
    color: '#d32f2f',
  },
  summaryValueNet: {
    fontSize: 16,
    fontWeight: '900',
    color: '#146e4e',
  },
  listContainer: {
    gap: 12,
  },
  salesCard: {
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
    alignItems: 'center',
  },
  salesTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3d251e',
  },
  salesAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#146e4e',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#ebdcd3',
    marginVertical: 12,
  },
  channelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  channelRow: {
    width: '47%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  channelLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8c6e65',
  },
  channelValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3d251e',
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
});
