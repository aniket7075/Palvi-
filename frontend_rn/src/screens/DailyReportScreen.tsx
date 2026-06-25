import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
// @ts-ignore
import Icon from 'react-native-vector-icons/Feather';
import { stateService } from '../services/stateService';

export default function DailyReportScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { outletId, date } = route.params as { outletId: number, date: string };

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    // Gather all data for the specified outlet and date
    const allSales = stateService.getSales();
    const todaySales = allSales.find((s: any) => s.outletId === outletId && s.date === date) || {};

    const allExpenses = stateService.getExpenses();
    const todayExpenses = allExpenses.filter((e: any) => e.outletId === outletId && e.date === date);

    const allPurchases = stateService.getPurchases();
    const todayPurchases = allPurchases.filter((p: any) => p.outletId === outletId && p.purchaseDate === date);

    const allChecklists = stateService.getChecklist(outletId.toString(), date);
    
    const allDispatches = stateService.getGodownDispatches(outletId);
    const todayDispatches = allDispatches.filter((d: any) => d.dispatchDate && d.dispatchDate.startsWith(date));

    // Calculate totals
    const totalCash = todaySales.cash || 0;
    const totalUpi = todaySales.upi || 0;
    const totalCard = todaySales.card || 0;
    const totalDelivery = (todaySales.swiggy || 0) + (todaySales.zomato || 0);
    const totalOnline = todaySales.online || 0;
    
    const grandSalesTotal = totalCash + totalUpi + totalCard + totalDelivery + totalOnline;

    const totalExpenseAmount = todayExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    const totalPurchaseAmount = todayPurchases.reduce((sum: number, p: any) => sum + (p.totalAmount || 0), 0);

    // Assuming expenses are cash out, we can do Net Cash
    const netCash = totalCash - totalExpenseAmount;

    setReport({
      sales: {
        totalCash, totalUpi, totalCard, totalDelivery, totalOnline, grandSalesTotal
      },
      expenses: {
        list: todayExpenses,
        total: totalExpenseAmount
      },
      purchases: {
        list: todayPurchases,
        total: totalPurchaseAmount
      },
      netCash,
      checklists: {
        total: allChecklists.length,
        completed: allChecklists.filter((c: any) => c.status === 'COMPLETED').length
      },
      dispatches: todayDispatches
    });

    setLoading(false);
  }, [outletId, date]);

  if (loading || !report) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#146e4e" />
      </View>
    );
  }

  const outlets = stateService.getOutlets();
  const outletName = outlets.find((o: any) => o.id === outletId)?.name || `Outlet #${outletId}`;

  const handleShare = async () => {
    if (!report) return;
    try {
      const shareMessage = `*PALVI HOTEL - DAILY EOD REPORT*\n---------------------------------------\n*Outlet Name:* ${outletName}\n*Date:* ${date}\n\n*1. FINANCIAL SUMMARY*\n- *Net Cash in Hand:* ₹${report.netCash.toLocaleString('en-IN')}\n- *Grand Sales Total:* ₹${report.sales.grandSalesTotal.toLocaleString('en-IN')}\n- *Total Expenses:* ₹${report.expenses.total.toLocaleString('en-IN')}\n- *Total Purchases:* ₹${report.purchases.total.toLocaleString('en-IN')}\n\n*2. SALES BREAKDOWN*\n- Cash Counter: ₹${report.sales.totalCash.toLocaleString('en-IN')}\n- UPI / QR Payments: ₹${report.sales.totalUpi.toLocaleString('en-IN')}\n- Card Payments: ₹${report.sales.totalCard.toLocaleString('en-IN')}\n- Delivery Apps (Swiggy/Zomato): ₹${report.sales.totalDelivery.toLocaleString('en-IN')}\n- Other Online Orders: ₹${report.sales.totalOnline.toLocaleString('en-IN')}\n\n*3. OPERATIONS CHECKLIST*\n- Completed: ${report.checklists.completed} of ${report.checklists.total} Tasks\n\n*4. EXPENSE DETAILS*\n${report.expenses.list.length > 0 
  ? report.expenses.list.map((e: any) => `- ${e.name}: ₹${e.amount}`).join('\n')
  : 'No expenses recorded today.'}\n\n*5. PURCHASE DETAILS*\n${report.purchases.list.length > 0 
  ? report.purchases.list.map((p: any) => `- ${p.itemName} (${p.quantity}): ₹${p.totalAmount}`).join('\n')
  : 'No purchases recorded today.'}\n---------------------------------------\nGenerated via Palvi App.`;

      await Share.share({
        message: shareMessage,
      });
    } catch (error) {
      console.log('Error sharing EOD report:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Daily EOD Report</Text>
          <Text style={styles.headerSubtitle}>{outletName} • {date}</Text>
        </View>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Icon name="share-2" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Net Cash Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconBox}>
            <Icon name="dollar-sign" size={28} color="#146e4e" />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Net Cash In Hand</Text>
            <Text style={styles.summaryAmount} numberOfLines={1} adjustsFontSizeToFit>₹{report.netCash.toLocaleString('en-IN')}</Text>
            <Text style={styles.summaryDesc}>(Cash Sales - Cash Expenses)</Text>
          </View>
        </View>

        {/* Sales Breakdown */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="trending-up" size={18} color="#10b981" />
            <Text style={styles.cardTitle}>Sales Revenue</Text>
            <Text style={styles.cardTotal} numberOfLines={1} adjustsFontSizeToFit>₹{report.sales.grandSalesTotal.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Cash Counter</Text>
            <Text style={styles.rowValue}>₹{report.sales.totalCash.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>UPI Gateway</Text>
            <Text style={styles.rowValue}>₹{report.sales.totalUpi.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Card Machine</Text>
            <Text style={styles.rowValue}>₹{report.sales.totalCard.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Delivery (Swiggy/Zomato)</Text>
            <Text style={styles.rowValue}>₹{report.sales.totalDelivery.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Online Portals</Text>
            <Text style={styles.rowValue}>₹{report.sales.totalOnline.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Expenses & Purchases */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="trending-down" size={18} color="#e74c3c" />
            <Text style={styles.cardTitle}>Outflow (Expenses & Purchases)</Text>
          </View>
          <View style={styles.divider} />
          
          <Text style={styles.subHeading}>Daily Expenses (₹{report.expenses.total.toLocaleString('en-IN')})</Text>
          {report.expenses.list.length > 0 ? report.expenses.list.map((e: any, idx: number) => (
            <View key={`exp-${idx}`} style={styles.row}>
              <Text style={styles.rowLabel}>{e.name}</Text>
              <Text style={styles.rowValue}>₹{e.amount}</Text>
            </View>
          )) : <Text style={styles.emptyText}>No expenses recorded today.</Text>}

          <View style={[styles.divider, { marginVertical: 12 }]} />
          
          <Text style={styles.subHeading}>Stock Purchases (₹{report.purchases.total.toLocaleString('en-IN')})</Text>
          {report.purchases.list.length > 0 ? report.purchases.list.map((p: any, idx: number) => (
            <View key={`pur-${idx}`} style={styles.row}>
              <Text style={styles.rowLabel}>{p.itemName} ({p.quantity} {p.unit})</Text>
              <Text style={styles.rowValue}>₹{p.totalAmount}</Text>
            </View>
          )) : <Text style={styles.emptyText}>No purchases recorded today.</Text>}
        </View>

        {/* Operations */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="check-square" size={18} color="#3b82f6" />
            <Text style={styles.cardTitle}>Operations</Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Checklist Tasks</Text>
            <Text style={styles.rowValue}>{report.checklists.completed} / {report.checklists.total} Completed</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Godown Dispatches Received</Text>
            <Text style={styles.rowValue}>{report.dispatches.length}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#146e4e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#d1fae5',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    padding: 16,
    marginTop: -10,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  summaryIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8c6e65',
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#146e4e',
    marginVertical: 4,
  },
  summaryDesc: {
    fontSize: 11,
    color: '#9ca3af',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3d251e',
    marginLeft: 8,
    flex: 1,
  },
  cardTotal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10b981',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  },
  subHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  emptyText: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
    paddingVertical: 4,
  }
});
