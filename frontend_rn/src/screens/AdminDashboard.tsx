import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import Icon from '../components/Icon';
import { useLanguage } from '../i18n/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type AdminNavProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const { t } = useLanguage();
  const navigation = useNavigation<AdminNavProp>();
  const [metrics, setMetrics] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    const data = stateService.getAdminDashboardMetrics();
    setMetrics(data);
  }, []);

  if (!metrics) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#146e4e" />
      </View>
    );
  }

  // Retrieve current logs from storage
  const salesLogs = stateService.getSales();
  const purchaseLogs = stateService.getPurchases();
  const expenseLogs = stateService.getExpenses();

  // Channel splitting calculations
  const cashTotal = salesLogs.reduce((acc: number, s: any) => acc + (s.cash || 0), 0);
  const upiTotal = salesLogs.reduce((acc: number, s: any) => acc + (s.upi || 0), 0);
  const cardTotal = salesLogs.reduce((acc: number, s: any) => acc + (s.card || 0), 0);
  const deliveryTotal = salesLogs.reduce((acc: number, s: any) => acc + (s.swiggy || 0) + (s.zomato || 0), 0);
  const onlineTotal = salesLogs.reduce((acc: number, s: any) => acc + (s.online || 0), 0);
  const totalSplits = cashTotal + upiTotal + cardTotal + deliveryTotal + onlineTotal;

  // Financial percentages
  const purchaseRate = metrics.totalSales > 0 ? Math.round((metrics.totalPurchases / metrics.totalSales) * 100) : 0;
  const expenseRate = metrics.totalSales > 0 ? Math.round((metrics.totalExpenses / metrics.totalSales) * 100) : 0;

  // Outlets with sales calculations
  const outlets = stateService.getOutlets();
  const outletStats = outlets.map((outlet: any) => {
    const outletSales = salesLogs
      .filter((s: any) => s.outletId === outlet.id)
      .reduce((acc: number, s: any) => acc + (s.cash || 0) + (s.upi || 0) + (s.card || 0) + (s.swiggy || 0) + (s.zomato || 0) + (s.online || 0), 0);
    const staffList = stateService.getStaff(outlet.id);
    const managers = stateService.getManagers();
    const outletManager = managers.find((m: any) => m.outletId === outlet.id);

    return {
      ...outlet,
      sales: outletSales,
      staffCount: staffList.length,
      managerName: outletManager ? outletManager.fullName : 'No Manager Assigned',
      managerMobile: outletManager ? outletManager.mobileNumber : ''
    };
  });

  // Low stock warnings across all outlets
  const lowStockItems = stateService.getInventory(null).filter((item: any) => item.quantity <= item.minStock);
  const lowStockWithOutlet = lowStockItems.map((item: any) => {
    const o = outlets.find((out: any) => out.id === item.outletId);
    return {
      ...item,
      outletName: o ? o.name : `Outlet #${item.outletId}`
    };
  });

  // Recent Activity Feed
  const recentActivities: any[] = [];
  salesLogs.slice(-3).forEach((s: any) => {
    const total = (s.cash || 0) + (s.upi || 0) + (s.card || 0) + (s.swiggy || 0) + (s.zomato || 0) + (s.online || 0);
    recentActivities.push({
      id: `sale-${s.id}`,
      title: `Daily Sales Logged`,
      subtitle: `Outlet #${s.outletId}`,
      amount: `+₹${total.toLocaleString('en-IN')}`,
      color: '#10b981',
      date: s.date
    });
  });

  purchaseLogs.slice(-3).forEach((p: any) => {
    recentActivities.push({
      id: `purchase-${p.id}`,
      title: `${p.itemName} Stock Order`,
      subtitle: p.vendorName || 'Supplier order',
      amount: `-₹${p.totalAmount.toLocaleString('en-IN')}`,
      color: '#a67c6d',
      date: p.purchaseDate
    });
  });

  expenseLogs.slice(-3).forEach((e: any) => {
    recentActivities.push({
      id: `expense-${e.id}`,
      title: `${e.name}`,
      subtitle: e.description || 'Utility expense',
      amount: `-₹${e.amount.toLocaleString('en-IN')}`,
      color: '#0d4e37',
      date: e.date
    });
  });

  recentActivities.sort((a, b) => b.date.localeCompare(a.date));

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Custom Chart calculations
  const maxVal = Math.max(metrics.totalSales, metrics.totalPurchases, metrics.totalExpenses, 1);
  const getBarHeight = (val: number) => {
    return (val / maxVal) * 120; // Scale to max 120px height
  };

  return (
    <LayoutWrapper title={t('menuDashboard')}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. Header Banner */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.syncContainer}>
            <View style={styles.pulseDot} />
            <Text style={styles.syncText}>LIVE SYNC ACTIVE</Text>
          </View>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <Text style={styles.headerTitle}>{t('welcome')}, Palvi Admin</Text>
        <Text style={styles.headerSubtitle}>
          Here is the live operational health and business reports for Pune & Mumbai hotel branches.
        </Text>
      </View>

      {/* 2. Custom Tabs */}
      <View style={styles.tabContainer}>
        {['Overview', 'Outlets', `Alerts (${lowStockItems.length})`, 'Dispatches'].map((label, index) => {
          const isActive = currentTab === index;
          const isAlert = index === 2 && lowStockItems.length > 0;
          return (
            <TouchableOpacity 
              key={label}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => setCurrentTab(index)}
            >
              <Text style={[
                styles.tabButtonText, 
                isActive && styles.activeTabButtonText,
                isAlert && { color: '#0d4e37', fontWeight: '900' }
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Panels */}
      {currentTab === 0 && (
        <View style={styles.tabContent}>
          {/* Summary Row */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={{ marginBottom: 6 }}>
                <Icon name="outlet" color="#146e4e" size={24} />
              </View>
              <Text style={styles.summaryLabel}>Outlets</Text>
              <Text style={styles.summaryValue}>{metrics.totalOutlets}</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={{ marginBottom: 6 }}>
                <Icon name="users" color="#146e4e" size={24} />
              </View>
              <Text style={styles.summaryLabel}>Staff</Text>
              <Text style={styles.summaryValue}>{metrics.totalStaff}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.summaryCard, lowStockItems.length > 0 && styles.alertSummaryCard]}
              onPress={() => setCurrentTab(2)}
            >
              <View style={{ marginBottom: 6 }}>
                <Icon name="alert" color={lowStockItems.length > 0 ? '#0d4e37' : '#146e4e'} size={24} />
              </View>
              <Text style={[styles.summaryLabel, lowStockItems.length > 0 && { color: '#0d4e37' }]}>Stock Alerts</Text>
              <Text style={[styles.summaryValue, lowStockItems.length > 0 && { color: '#0d4e37' }]}>{lowStockItems.length}</Text>
            </TouchableOpacity>
          </View>

          {/* Grand Revenue Splits Card */}
          <View style={styles.ledgerCard}>
            <View style={styles.ledgerHeader}>
              <View>
                <Text style={styles.ledgerCaption}>AGGREGATE BUSINESS REVENUE</Text>
                <Text style={styles.ledgerAmount}>₹{metrics.totalSales.toLocaleString('en-IN')}</Text>
              </View>
              <Icon name="wallet" color="#146e4e" size={24} />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionSubtitle}>Revenue Channel Contributions</Text>

            {[
              { name: 'UPI Gateway', val: upiTotal, color: '#4f46e5', icon: 'upi' },
              { name: 'Cash Counter', val: cashTotal, color: '#10b981', icon: 'rupee' },
              { name: 'Card Machine', val: cardTotal, color: '#f59e0b', icon: 'creditcard' },
              { name: 'Delivery (Swiggy/Zomato)', val: deliveryTotal, color: '#ec4899', icon: 'delivery' },
              { name: 'Online Portal', val: onlineTotal, color: '#06b6d4', icon: 'web' }
            ].map(item => {
              const pct = totalSplits > 0 ? Math.round((item.val / totalSplits) * 100) : 0;
              return (
                <View key={item.name} style={styles.splitRow}>
                  {/* Top row: icon + name on left, amount + pct on right */}
                  <View style={styles.splitTopRow}>
                    <View style={styles.splitLeft}>
                      <Icon name={item.icon} color={item.color} size={15} />
                      <Text style={styles.splitIconName} numberOfLines={1}>{item.name}</Text>
                    </View>
                    <View style={styles.splitRight}>
                      <Text style={styles.splitAmt}>₹{item.val.toLocaleString('en-IN')}</Text>
                      <View style={[styles.pctBadge, { backgroundColor: `${item.color}18` }]}>
                        <Text style={[styles.pctBadgeText, { color: item.color }]}>{pct}%</Text>
                      </View>
                    </View>
                  </View>
                  {/* Progress bar */}
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Purchases & Expenses side-by-side Row */}
          <View style={styles.sideRow}>
            <View style={styles.sideCard}>
              <View style={styles.sideHeader}>
                <Text style={styles.sideLabel}>Total Purchases</Text>
                <Icon name="shopping" color="#a67c6d" size={20} />
              </View>
              <Text style={styles.sideValue}>₹{metrics.totalPurchases.toLocaleString('en-IN')}</Text>
              <Text style={styles.ratioText}>Ratio: {purchaseRate}% of sales</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min(purchaseRate, 100)}%`, backgroundColor: '#a67c6d' }]} />
              </View>
            </View>

            <View style={styles.sideCard}>
              <View style={styles.sideHeader}>
                <Text style={styles.sideLabel}>Total Expenses</Text>
                <Icon name="expense" color="#0d4e37" size={20} />
              </View>
              <Text style={[styles.sideValue, { color: '#0d4e37' }]}>₹{metrics.totalExpenses.toLocaleString('en-IN')}</Text>
              <Text style={styles.ratioText}>Ratio: {expenseRate}% of sales</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min(expenseRate, 100)}%`, backgroundColor: '#0d4e37' }]} />
              </View>
            </View>
          </View>

          {/* Custom Cash Flow Chart */}
          <View style={styles.chartContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Icon name="reports" color="#146e4e" size={18} />
              <Text style={[styles.chartTitle, { marginBottom: 0, marginLeft: 8 }]}>Cash Flow Analysis</Text>
            </View>
            <View style={styles.chartCanvas}>
              {/* Sales Bar */}
              <View style={styles.chartBarCol}>
                <Text style={styles.barValue}>₹{metrics.totalSales.toLocaleString('en-IN')}</Text>
                <View style={[styles.chartBar, { height: getBarHeight(metrics.totalSales), backgroundColor: '#146e4e' }]} />
                <Text style={styles.barLabel}>Sales</Text>
              </View>
              {/* Purchases Bar */}
              <View style={styles.chartBarCol}>
                <Text style={styles.barValue}>₹{metrics.totalPurchases.toLocaleString('en-IN')}</Text>
                <View style={[styles.chartBar, { height: getBarHeight(metrics.totalPurchases), backgroundColor: '#a67c6d' }]} />
                <Text style={styles.barLabel}>Purchases</Text>
              </View>
              {/* Expenses Bar */}
              <View style={styles.chartBarCol}>
                <Text style={styles.barValue}>₹{metrics.totalExpenses.toLocaleString('en-IN')}</Text>
                <View style={[styles.chartBar, { height: getBarHeight(metrics.totalExpenses), backgroundColor: '#0d4e37' }]} />
                <Text style={styles.barLabel}>Expenses</Text>
              </View>
            </View>
          </View>

          {/* Dynamic Recent Activities Timeline */}
          <View style={styles.timelineContainer}>
            <Text style={styles.chartTitle}>⏳ Live Operational Timeline</Text>
            
            <View style={styles.timelineList}>
              {recentActivities.slice(0, 5).map((act, index) => (
                <View key={act.id} style={styles.timelineItem}>
                  <View style={styles.timelineMarker}>
                    <View style={[styles.timelineDot, { borderColor: act.color }]} />
                    {index !== Math.min(recentActivities.length, 5) - 1 && (
                      <View style={styles.timelineConnector} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineRow}>
                      <Text style={styles.timelineTitle}>{act.title}</Text>
                      <Text style={[styles.timelineAmount, { color: act.color }]}>{act.amount}</Text>
                    </View>
                    <View style={styles.timelineRow}>
                      <Text style={styles.timelineSubtitle}>{act.subtitle}</Text>
                      <Text style={styles.timelineDate}>{act.date}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Tab 1: Outlets */}
      {currentTab === 1 && (
        <View style={styles.tabContent}>
          {outletStats.map((outlet: any) => {
            const share = metrics.totalSales > 0 ? Math.round((outlet.sales / metrics.totalSales) * 100) : 0;
            return (
              <View key={outlet.id} style={styles.outletCard}>
                <View style={styles.outletHeader}>
                  <Text style={styles.outletTitle}>{outlet.name}</Text>
                  <View style={styles.idBadge}>
                    <Text style={styles.idBadgeText}>ID #{outlet.id}</Text>
                  </View>
                </View>
                <Text style={styles.outletAddress}>{outlet.address}, {outlet.city}</Text>

                <View style={styles.divider} />

                <View style={styles.outletStatsGrid}>
                  <View style={styles.outletStatCol}>
                    <Text style={styles.statLabel}>Total Sales</Text>
                    <Text style={styles.statValue}>₹{outlet.sales.toLocaleString('en-IN')}</Text>
                    <View style={styles.outletShareContainer}>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${share}%`, backgroundColor: '#a67c6d' }]} />
                      </View>
                      <Text style={styles.shareText}>{share}% share</Text>
                    </View>
                  </View>

                  <View style={styles.outletStatCol}>
                    <Text style={styles.statLabel}>Active Staff</Text>
                    <Text style={styles.statValue}>{outlet.staffCount} Workers</Text>
                    <Text style={styles.managerText}>Mgr: {outlet.managerName}</Text>
                  </View>
                </View>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity 
                    style={styles.callButton}
                    onPress={() => outlet.managerMobile && Linking.openURL(`tel:${outlet.managerMobile}`)}
                    disabled={!outlet.managerMobile}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="phone" color="#146e4e" size={14} />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.whatsappButton}
                    onPress={() => outlet.managerMobile && Linking.openURL(`https://wa.me/91${outlet.managerMobile.replace(/\D/g, '')}`)}
                    disabled={!outlet.managerMobile}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="chat" color="#25d366" size={14} />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.whatsappButton, { backgroundColor: '#146e4e' }]}
                    onPress={() => {
                      const todayStr = new Date().toISOString().split('T')[0];
                      navigation.navigate('DailyReportScreen', { outletId: outlet.id, date: todayStr });
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="reports" color="#ffffff" size={14} />
                      <Text style={[styles.whatsappButtonText, { color: '#ffffff', marginLeft: 6 }]}>Report</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Tab 2: Stock Alerts */}
      {currentTab === 2 && (
        <View style={styles.tabContent}>
          {lowStockWithOutlet.length > 0 ? (
            <View>
              <View style={styles.alertHeaderBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Icon name="alert" color="#0d4e37" size={18} />
                  <Text style={[styles.alertHeaderTitle, { marginBottom: 0, marginLeft: 6 }]}>Action Required</Text>
                </View>
                <Text style={styles.alertHeaderSubtitle}>The following ingredients are below minimal stock limits across active outlets.</Text>
              </View>

              {lowStockWithOutlet.map((item: any) => {
                const pct = Math.round((item.quantity / item.minStock) * 100);
                return (
                  <View key={`${item.outletId}-${item.id}`} style={styles.alertCard}>
                    <View style={styles.alertCardHeader}>
                      <View>
                        <View style={styles.alertTitleRow}>
                          <Text style={styles.alertItemName}>{item.name}</Text>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{item.category}</Text>
                          </View>
                        </View>
                        <Text style={styles.alertOutletText}>Outlet: {item.outletName}</Text>
                      </View>
                      <View style={styles.alertValuesCol}>
                        <Text style={styles.alertQtyText}>{item.quantity} {item.unit}</Text>
                        <Text style={styles.alertMinText}>Min: {item.minStock} {item.unit}</Text>
                      </View>
                    </View>

                    <View style={styles.splitRow}>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: '#0d4e37' }]} />
                      </View>
                      <Text style={styles.alertPctText}>{pct}% left</Text>
                    </View>

                    <View style={styles.divider} />
                    
                    <View style={styles.alertFooter}>
                      <Text style={styles.priceText}>Est: ₹{item.purchasePrice}/{item.unit}</Text>
                      <TouchableOpacity style={styles.procureButton}>
                        <Text style={styles.procureButtonText}>Procure Stock</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.successContainer}>
              <View style={{ marginBottom: 12 }}>
                <Icon name="checklist" color="#146e4e" size={48} />
              </View>
              <Text style={styles.successTitle}>All Stock Levels Optimal</Text>
              <Text style={styles.successSubtitle}>
                All inventory items across Pune & Mumbai outlets are above their minimum thresholds.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Tab 3: Dispatches */}
      {currentTab === 3 && (
        <View style={styles.tabContent}>
          <View style={styles.alertHeaderBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Icon name="inventory" color="#0d4e37" size={18} />
              <Text style={[styles.alertHeaderTitle, { marginBottom: 0, marginLeft: 6 }]}>Godown Dispatches</Text>
            </View>
            <Text style={styles.alertHeaderSubtitle}>Track inventory movements from central godown to outlets.</Text>
          </View>
          
          {stateService.getGodownDispatches().map((dispatch: any) => (
            <View key={dispatch.id} style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>To: Outlet #{dispatch.targetOutletId}</Text>
                <View style={[styles.badge, { backgroundColor: dispatch.status === 'RECEIVED' ? '#f0fdf4' : '#fff7ed', borderColor: dispatch.status === 'RECEIVED' ? '#bbf7d0' : '#ffedd5', borderWidth: 1 }]}>
                  <Text style={[styles.badgeText, { color: dispatch.status === 'RECEIVED' ? '#10b981' : '#f97316' }]}>{dispatch.status}</Text>
                </View>
              </View>
              <Text style={styles.listItemDesc}>Sent By: ID #{dispatch.sentById}</Text>
              <Text style={styles.listItemDesc}>Date: {new Date(dispatch.dispatchDate).toLocaleString()}</Text>
              <View style={styles.divider} />
              <Text style={styles.sectionSubtitle}>Items</Text>
              {dispatch.items?.map((item: any, idx: number) => (
                <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={styles.listItemTitle}>{item.itemName}</Text>
                  <Text style={styles.listItemTitle}>{item.quantity} {item.unit}</Text>
                </View>
              ))}
            </View>
          ))}
          {stateService.getGodownDispatches().length === 0 && (
            <Text style={styles.emptyText}>No dispatches recorded.</Text>
          )}
        </View>
      )}
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
    backgroundColor: '#ffffff',
  },
  headerCard: {
    width: '100%',
    backgroundColor: '#146e4e',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#146e4e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  syncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  syncText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 1,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ebdcd3',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#146e4e',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8c6e65',
  },
  activeTabButtonText: {
    color: '#146e4e',
    fontWeight: '800',
  },
  tabContent: {
    width: '100%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 110, 78, 0.12)',
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  alertSummaryCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  summaryEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8c6e65',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3d251e',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 110, 78, 0.12)',
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3d251e',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  listItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3d251e',
  },
  listItemDesc: {
    fontSize: 11,
    color: '#8c6e65',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: '#8c6e65',
    marginBottom: 16,
  },
  ledgerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 110, 78, 0.12)',
    padding: 20,
    marginBottom: 20,
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ledgerCaption: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8c6e65',
    letterSpacing: 1,
  },
  ledgerAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#146e4e',
    marginTop: 4,
  },
  walletIcon: {
    fontSize: 28,
  },
  divider: {
    height: 1,
    backgroundColor: '#ebdcd3',
    marginVertical: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3d251e',
    marginBottom: 16,
  },
  splitRow: {
    marginBottom: 14,
  },
  splitTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  splitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    marginRight: 12,
  },
  splitRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  splitIconName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3d251e',
    flex: 1,
  },
  splitAmt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3d251e',
  },
  pctBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pctBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 5,
    backgroundColor: 'rgba(235, 220, 211, 0.5)',
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sideRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  sideCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 110, 78, 0.12)',
    padding: 16,
  },
  sideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sideLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8c6e65',
  },
  sideIcon: {
    fontSize: 16,
  },
  sideValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3d251e',
  },
  ratioText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8c6e65',
    marginTop: 8,
    marginBottom: 4,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 110, 78, 0.12)',
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3d251e',
    marginBottom: 16,
  },
  chartCanvas: {
    flexDirection: 'row',
    height: 160,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#ebdcd3',
    paddingBottom: 8,
  },
  chartBarCol: {
    alignItems: 'center',
    width: 60,
  },
  barValue: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8c6e65',
    marginBottom: 4,
  },
  chartBar: {
    width: 36,
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3d251e',
    marginTop: 6,
  },
  timelineContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 110, 78, 0.12)',
    padding: 20,
  },
  timelineList: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineMarker: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    zIndex: 2,
  },
  timelineConnector: {
    position: 'absolute',
    top: 12,
    bottom: -20,
    width: 2,
    backgroundColor: '#ebdcd3',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3d251e',
  },
  timelineAmount: {
    fontSize: 13,
    fontWeight: '900',
  },
  timelineSubtitle: {
    fontSize: 11,
    color: '#8c6e65',
    fontWeight: '600',
    marginTop: 2,
  },
  timelineDate: {
    fontSize: 10,
    color: '#8c6e65',
    fontWeight: '600',
  },
  outletCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 110, 78, 0.12)',
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
  },
  outletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outletTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3d251e',
  },
  idBadge: {
    backgroundColor: 'rgba(20, 110, 78, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  idBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#146e4e',
  },
  outletAddress: {
    fontSize: 12,
    color: '#8c6e65',
    marginTop: 2,
  },
  outletStatsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 8,
  },
  outletStatCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#8c6e65',
    fontWeight: '700',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3d251e',
    marginTop: 2,
  },
  outletShareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  shareText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#a67c6d',
  },
  managerText: {
    fontSize: 10,
    color: '#8c6e65',
    fontWeight: '600',
    marginTop: 6,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  callButton: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(20, 110, 78, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#146e4e',
  },
  whatsappButton: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#a67c6d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  alertHeaderBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  alertHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0d4e37',
    marginBottom: 4,
  },
  alertHeaderSubtitle: {
    fontSize: 12,
    color: '#0d4e37',
    lineHeight: 16,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    padding: 16,
    marginBottom: 16,
  },
  alertCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertItemName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3d251e',
  },
  categoryBadge: {
    backgroundColor: 'rgba(166, 124, 109, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#a67c6d',
  },
  alertOutletText: {
    fontSize: 12,
    color: '#8c6e65',
    marginTop: 4,
  },
  alertValuesCol: {
    alignItems: 'flex-end',
  },
  alertQtyText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0d4e37',
  },
  alertMinText: {
    fontSize: 11,
    color: '#8c6e65',
    marginTop: 2,
  },
  alertPctText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0d4e37',
    marginLeft: 8,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  priceText: {
    fontSize: 11,
    color: '#8c6e65',
    fontWeight: '600',
  },
  procureButton: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(20, 110, 78, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  procureButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#146e4e',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3d251e',
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 12,
    color: '#8c6e65',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
});
