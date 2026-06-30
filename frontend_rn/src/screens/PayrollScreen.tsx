import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import Icon from '../components/Icon';
import OutletSelector from '../components/OutletSelector';

export default function PayrollScreen() {
  const [outletId, setOutletId] = useState<string | null>(null);
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Month and Year selectors
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    { name: 'Jan', val: 1 },
    { name: 'Feb', val: 2 },
    { name: 'Mar', val: 3 },
    { name: 'Apr', val: 4 },
    { name: 'May', val: 5 },
    { name: 'Jun', val: 6 },
    { name: 'Jul', val: 7 },
    { name: 'Aug', val: 8 },
    { name: 'Sep', val: 9 },
    { name: 'Oct', val: 10 },
    { name: 'Nov', val: 11 },
    { name: 'Dec', val: 12 },
  ];

  const years = [2025, 2026, 2027];

  const loadPayroll = async () => {
    setLoading(true);
    let activeOutletId = await AsyncStorage.getItem('outletId');
    const outlets = stateService.getOutlets();
    if (!activeOutletId && outlets.length > 0) {
      activeOutletId = outlets[0].id.toString();
      await AsyncStorage.setItem('outletId', activeOutletId as string);
    }

    if (activeOutletId) {
      setOutletId(activeOutletId);
      const data = await stateService.getPayrollCalculations(activeOutletId, selectedMonth, selectedYear);
      setPayrollData(data || []);
    }
    setLoading(false);
  };

  const handleOutletChange = async (newOutletId: string) => {
    setLoading(true);
    setOutletId(newOutletId);
    const data = await stateService.getPayrollCalculations(newOutletId, selectedMonth, selectedYear);
    setPayrollData(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadPayroll();
  }, [selectedMonth, selectedYear]);

  const handleRecordPayout = (item: any) => {
    Alert.alert(
      'Confirm Payout',
      `Are you sure you want to mark salary as paid for ${item.fullName}? \nNet Payable: ₹${item.netSalary.toLocaleString('en-IN')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Paid',
          onPress: async () => {
            try {
              setLoading(true);
              await stateService.confirmPayrollPayout(item.staffId, selectedMonth, selectedYear, item.netSalary);
              Alert.alert('Success', `Payroll logged as Paid for ${item.fullName}!`);
              
              // Update state locally to show paid status
              setPayrollData(prev => 
                prev.map(p => p.staffId === item.staffId ? { ...p, status: 'PAID' } : p)
              );
            } catch (err) {
              Alert.alert('Error', 'Failed to confirm payout.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <LayoutWrapper title="Payroll & Wages">
      <View style={styles.selectorContainer}>
        <OutletSelector selectedOutletId={outletId} onSelect={handleOutletChange} />
      </View>

      {/* Year & Month Picker Row */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
          {months.map(m => (
            <TouchableOpacity
              key={m.val}
              style={[
                styles.monthBtn,
                selectedMonth === m.val && styles.monthBtnActive,
              ]}
              onPress={() => setSelectedMonth(m.val)}
            >
              <Text style={[
                styles.monthBtnText,
                selectedMonth === m.val && styles.monthBtnTextActive,
              ]}>
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.yearRow}>
          {years.map(y => (
            <TouchableOpacity
              key={y}
              style={[
                styles.yearBtn,
                selectedYear === y && styles.yearBtnActive,
              ]}
              onPress={() => setSelectedYear(y)}
            >
              <Text style={[
                styles.yearBtnText,
                selectedYear === y && styles.yearBtnTextActive,
              ]}>
                {y}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && payrollData.length === 0 ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.sectionTitle}>
            Wages Summary for {months.find(m => m.val === selectedMonth)?.name} {selectedYear}
          </Text>

          {payrollData.length === 0 ? (
            <Text style={styles.emptyText}>No staff members found for payroll calculation.</Text>
          ) : (
            payrollData.map((item: any) => (
              <View key={item.staffId} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.fullName}>{item.fullName}</Text>
                    <Text style={styles.codeText}>Code: {item.employeeCode || 'N/A'}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    item.status === 'PAID' ? styles.badgePaid : styles.badgeCalculated
                  ]}>
                    <Text style={[
                      styles.statusText,
                      item.status === 'PAID' ? styles.textPaid : styles.textCalculated
                    ]}>
                      {item.status || 'CALCULATED'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Calculation breakdown */}
                <View style={styles.breakdownContainer}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Base Salary (Monthly)</Text>
                    <Text style={styles.value}>₹{item.baseSalary.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Attendance</Text>
                    <Text style={styles.valueSub}>
                      P: {item.presentDays} | H: {item.halfDays} | L: {item.leaveDays} ({item.workingCredits}/{item.totalDaysInMonth} days)
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Gross Salary Earned</Text>
                    <Text style={styles.value}>₹{item.grossSalary.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Deduction (Staff Advances)</Text>
                    <Text style={[styles.value, item.totalAdvances > 0 && { color: '#c62828' }]}>
                      -₹{item.totalAdvances.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={styles.dottedDivider} />

                  <View style={styles.rowTotal}>
                    <Text style={styles.labelTotal}>Net Payable Salary</Text>
                    <Text style={styles.valueTotal}>₹{item.netSalary.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                {item.status !== 'PAID' && (
                  <TouchableOpacity
                    style={styles.payoutBtn}
                    activeOpacity={0.8}
                    onPress={() => handleRecordPayout(item)}
                  >
                    <Icon name="wallet" color="#fff" size={16} />
                    <Text style={styles.payoutBtnText}>Confirm Payout</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
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
  filterBar: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e6df',
  },
  monthScroll: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  monthBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5eeea',
    marginRight: 8,
  },
  monthBtnActive: {
    backgroundColor: '#146e4e',
  },
  monthBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8c6e65',
  },
  monthBtnTextActive: {
    color: '#fff',
  },
  yearRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  yearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f5eeea',
    marginRight: 8,
  },
  yearBtnActive: {
    backgroundColor: '#8c6e65',
  },
  yearBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8c6e65',
  },
  yearBtnTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d251e',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8c6e65',
    marginVertical: 40,
    fontSize: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0e6df',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d251e',
  },
  codeText: {
    fontSize: 12,
    color: '#8c6e65',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeCalculated: {
    backgroundColor: '#e0f2f1',
  },
  badgePaid: {
    backgroundColor: '#e8f5e9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  textCalculated: {
    color: '#00796b',
  },
  textPaid: {
    color: '#2e7d32',
  },
  divider: {
    height: 1,
    backgroundColor: '#f5eeea',
    marginVertical: 12,
  },
  breakdownContainer: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  rowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    color: '#8c6e65',
  },
  value: {
    fontSize: 14,
    color: '#3d251e',
    fontWeight: 'bold',
  },
  valueSub: {
    fontSize: 13,
    color: '#3d251e',
    fontWeight: '500',
  },
  dottedDivider: {
    borderWidth: 0.5,
    borderColor: '#ebdcd3',
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  labelTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3d251e',
  },
  valueTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#146e4e',
  },
  payoutBtn: {
    backgroundColor: '#146e4e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 6,
  },
  payoutBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
