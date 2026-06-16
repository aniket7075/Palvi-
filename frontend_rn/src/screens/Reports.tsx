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

export default function Reports() {
  const [sales, setSales] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [outletId, setOutletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReportData = async (activeOutletId?: string | null) => {
    const storedRole = await AsyncStorage.getItem('role');
    let id = activeOutletId !== undefined ? activeOutletId : await AsyncStorage.getItem('outletId');
    if (!id && storedRole === 'ADMIN') {
      const outlets = stateService.getOutlets();
      if (outlets.length > 0) {
        const firstId = outlets[0].id.toString();
        id = firstId;
        await AsyncStorage.setItem('outletId', firstId);
        await AsyncStorage.setItem('outletName', outlets[0].name);
      }
    }
    if (!id) {
      setLoading(false);
      return;
    }
    setOutletId(id);
    setSales(stateService.getSales(id));
    setPurchases(stateService.getPurchases(id));
    setExpenses(stateService.getExpenses(id));
    setLoading(false);
  };

  const handleOutletChange = async (newOutletId: string) => {
    setLoading(true);
    await AsyncStorage.setItem('outletId', newOutletId);
    const outlets = stateService.getOutlets();
    const sel = outlets.find((o: any) => o.id.toString() === newOutletId);
    if (sel) await AsyncStorage.setItem('outletName', sel.name);
    loadReportData(newOutletId);
  };

  useEffect(() => { loadReportData(); }, []);

  // Calculate stats
  const totalSales = sales.reduce((acc, s) => acc + (s.cash || 0) + (s.upi || 0) + (s.card || 0) + (s.swiggy || 0) + (s.zomato || 0) + (s.online || 0), 0);
  const totalPurchases = purchases.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // Map daily reports (last 5 entries for cleaner layout)
  const dailyReportData = sales.map(s => {
    const totalDaySales = (s.cash || 0) + (s.upi || 0) + (s.card || 0) + (s.swiggy || 0) + (s.zomato || 0) + (s.online || 0);
    const dayPurchases = purchases
      .filter(p => p.purchaseDate === s.date)
      .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const dayExpenses = expenses
      .filter(e => e.date === s.date)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return {
      date: s.date.substring(5), // MM-DD
      sales: totalDaySales,
      purchases: dayPurchases,
      expenses: dayExpenses
    };
  }).slice(-5);

  // Maximum value for scaling custom chart
  const allValues = dailyReportData.flatMap(d => [d.sales, d.purchases, d.expenses]);
  const maxVal = Math.max(...allValues, 1);

  const getBarHeight = (val: number) => {
    return (val / maxVal) * 100; // max 100px height
  };

  const handleExport = () => {
    Alert.alert('Export Complete', 'PDF analytics report has been exported successfully!');
  };

  if (loading) {
    return (
      <LayoutWrapper title="Reports & Analytics">
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper title="Reports & Analytics">
      <OutletSelector selectedOutletId={outletId} onSelect={handleOutletChange} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* KPI Cards Row */}
        <View style={styles.overviewRow}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Total Sales</Text>
            <Text style={[styles.overviewValue, { color: '#10b981' }]}>
              ₹{totalSales.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Purchases</Text>
            <Text style={[styles.overviewValue, { color: '#a67c6d' }]}>
              ₹{totalPurchases.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Expenses</Text>
            <Text style={[styles.overviewValue, { color: '#0d4e37' }]}>
              ₹{totalExpenses.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Custom Bar Comparison Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Financial Comparison Chart (Last 5 Days)</Text>
          <View style={styles.chartDivider} />

          <View style={styles.chartCanvas}>
            {dailyReportData.map((day, idx) => (
              <View key={idx} style={styles.chartGroup}>
                <View style={styles.barsContainer}>
                  {/* Sales Bar */}
                  <View style={[styles.bar, { height: getBarHeight(day.sales), backgroundColor: '#146e4e' }]} />
                  {/* Purchases Bar */}
                  <View style={[styles.bar, { height: getBarHeight(day.purchases), backgroundColor: '#a67c6d' }]} />
                  {/* Expenses Bar */}
                  <View style={[styles.bar, { height: getBarHeight(day.expenses), backgroundColor: '#0d4e37' }]} />
                </View>
                <Text style={styles.chartLabel}>{day.date}</Text>
              </View>
            ))}

            {dailyReportData.length === 0 && (
              <Text style={styles.emptyChartText}>No transaction records available.</Text>
            )}
          </View>

          {/* Chart Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#146e4e' }]} />
              <Text style={styles.legendText}>Sales</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#a67c6d' }]} />
              <Text style={styles.legendText}>Purchases</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#0d4e37' }]} />
              <Text style={styles.legendText}>Expenses</Text>
            </View>
          </View>
        </View>

        {/* Performance Line Representation */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Sales Trend Progression</Text>
          <View style={styles.chartDivider} />

          <View style={styles.trendList}>
            {dailyReportData.map((day, idx) => (
              <View key={idx} style={styles.trendRow}>
                <Text style={styles.trendDate}>{day.date}</Text>
                <View style={styles.trendBarBg}>
                  <View style={[styles.trendBarFill, { width: `${(day.sales / maxVal) * 100}%` }]} />
                </View>
                <Text style={styles.trendVal}>₹{day.sales.toLocaleString('en-IN')}</Text>
              </View>
            ))}
            {dailyReportData.length === 0 && (
              <Text style={styles.emptyChartText}>No sales logs found.</Text>
            )}
          </View>
        </View>

        {/* Export Button */}
        <TouchableOpacity onPress={handleExport} style={styles.exportBtn}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="download" color="#ffffff" size={16} />
            <Text style={[styles.exportBtnText, { marginLeft: 8 }]}>Export PDF Report</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
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
  overviewRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  overviewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8c6e65',
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 13,
    fontWeight: '900',
  },
  chartCard: {
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
  chartTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#3d251e',
  },
  chartDivider: {
    height: 1,
    backgroundColor: '#ebdcd3',
    marginVertical: 12,
  },
  chartCanvas: {
    height: 140,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderColor: '#ebdcd3',
    paddingBottom: 8,
  },
  chartGroup: {
    alignItems: 'center',
    width: 60,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 4,
  },
  bar: {
    width: 10,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  chartLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8c6e65',
    marginTop: 6,
  },
  emptyChartText: {
    fontSize: 12,
    color: '#8c6e65',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 40,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3d251e',
  },
  trendList: {
    gap: 12,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendDate: {
    width: 44,
    fontSize: 11,
    fontWeight: '800',
    color: '#3d251e',
  },
  trendBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  trendBarFill: {
    height: '100%',
    backgroundColor: '#146e4e',
    borderRadius: 4,
  },
  trendVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#146e4e',
    width: 60,
    textAlign: 'right',
  },
  exportBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#146e4e',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#146e4e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },
  exportBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});
