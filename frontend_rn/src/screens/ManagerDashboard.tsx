import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import Icon from '../components/Icon';

type ManagerDashboardProp = StackNavigationProp<RootStackParamList, 'ManagerDashboard'>;

interface Props {
  navigation: ManagerDashboardProp;
}

export default function ManagerDashboard({ navigation }: Props) {
  const [metrics, setMetrics] = useState<any>(null);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [incomingDispatches, setIncomingDispatches] = useState<any[]>([]);
  const [outletId, setOutletId] = useState<string | null>(null);
  const [outletName, setOutletName] = useState('My Outlet');
  const [role, setRole] = useState('MANAGER');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      const storedOutletId = await AsyncStorage.getItem('outletId');
      const storedOutletName = await AsyncStorage.getItem('outletName');
      const storedRole = await AsyncStorage.getItem('role');
      
      if (!storedOutletId) {
        setLoading(false);
        return;
      }

      setOutletId(storedOutletId);
      if (storedOutletName) setOutletName(storedOutletName);
      if (storedRole) setRole(storedRole);

      const data = stateService.getOutletDashboardMetrics(storedOutletId);
      setMetrics(data);

      const todayStr = new Date().toISOString().split('T')[0];
      const checklistItems = stateService.getChecklist(storedOutletId, todayStr);
      setChecklist(checklistItems);

      const inventory = stateService.getInventory(storedOutletId);
      const lowStockItems = inventory.filter((i: any) => i.quantity <= i.minStock);
      setLowStock(lowStockItems);

      const dispatches = stateService.getGodownDispatches(storedOutletId);
      setIncomingDispatches(dispatches.filter((d: any) => d.status === 'DISPATCHED'));

      setLoading(false);
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <LayoutWrapper title="Manager Dashboard">
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      </LayoutWrapper>
    );
  }

  if (!outletId) {
    return (
      <LayoutWrapper title="Manager Dashboard">
        <View style={styles.centeredContainer}>
          <Text style={styles.noOutletText}>
            No outlet assigned. Please contact the administrator.
          </Text>
        </View>
      </LayoutWrapper>
    );
  }

  const handleMarkReceived = (dispatchId: number) => {
    stateService.markDispatchReceived(dispatchId);
    if (outletId) {
      const dispatches = stateService.getGodownDispatches(outletId);
      setIncomingDispatches(dispatches.filter((d: any) => d.status === 'DISPATCHED'));
    }
  };

  const totalChecklist = checklist.length;
  const completedChecklist = checklist.filter((c: any) => c.status === 'COMPLETED').length;
  const checklistProgress = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  return (
    <LayoutWrapper title="Manager Dashboard">
      {/* Premium Branch Header */}
      <View style={styles.branchHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.branchTitle}>{outletName}</Text>
          <Text style={styles.branchSubtitle}>
            {role === 'FRANCHISEE' 
              ? 'Franchise Performance & Branch Overview'
              : 'Daily operations and audits overview'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* KPI Row */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiIconWrapper}>
              <Icon name="sales" color="#146e4e" size={20} />
            </View>
            <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>₹{metrics?.todaySales?.toLocaleString('en-IN') || 0}</Text>
            <Text style={styles.kpiLabel}>Today's Sales</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrapper, { backgroundColor: '#fff3e0' }]}>
              <Icon name="checklist" color="#e65100" size={20} />
            </View>
            <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>{completedChecklist}/{totalChecklist}</Text>
            <Text style={styles.kpiLabel}>Tasks Done</Text>
          </View>
        </View>

        {/* EOD Report Action */}
        <TouchableOpacity 
          style={styles.eodButton}
          activeOpacity={0.8}
          onPress={() => {
            const todayStr = new Date().toISOString().split('T')[0];
            navigation.navigate('DailyReportScreen', { outletId: parseInt(outletId), date: todayStr });
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="reports" color="#fff" size={22} />
            <Text style={styles.eodButtonText}>Generate Daily Report</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.actionItem} activeOpacity={0.8} onPress={() => navigation.navigate('Sales')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#e8f5e9' }]}>
              <Icon name="sales" color="#146e4e" size={24} />
            </View>
            <Text style={styles.actionText}>Sales</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} activeOpacity={0.8} onPress={() => navigation.navigate('Expenses')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#fcf4f0' }]}>
              <Icon name="cash" color="#8c6e65" size={24} />
            </View>
            <Text style={styles.actionText}>Expenses</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} activeOpacity={0.8} onPress={() => navigation.navigate('Staff')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#e8f5e9' }]}>
              <Icon name="staff" color="#146e4e" size={24} />
            </View>
            <Text style={styles.actionText}>Staff</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} activeOpacity={0.8} onPress={() => navigation.navigate('Checklist')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#fcf4f0' }]}>
              <Icon name="checklist" color="#8c6e65" size={24} />
            </View>
            <Text style={styles.actionText}>Checklist</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.rowAlign}>
              <Icon name="checklist" color="#146e4e" size={18} />
              <Text style={styles.cardTitle}>Checklist Progress</Text>
            </View>
            <Text style={styles.cardTitleVal}>{checklistProgress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${checklistProgress}%` }]} />
          </View>
        </View>

        {/* Low Stock Warning Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.rowAlign}>
              <Icon name="alert" color="#8c6e65" size={18} />
              <Text style={styles.cardTitle}>Low Stock Warnings</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: lowStock.length > 0 ? '#fcf4f0' : '#e8f5e9' }]}>
              <Text style={[styles.badgeText, { color: lowStock.length > 0 ? '#8c6e65' : '#146e4e' }]}>
                {lowStock.length > 0 ? `${lowStock.length} Items` : 'All Stock OK'}
              </Text>
            </View>
          </View>

          {lowStock.length > 0 ? (
            <View style={styles.listContainer}>
              {lowStock.slice(0, 3).map((item: any) => (
                <View key={item.id} style={styles.listItem}>
                  <Text style={styles.listItemTitle}>{item.name}</Text>
                  <Text style={styles.listItemDesc}>
                    Quantity: {item.quantity} {item.unit} (Min: {item.minStock} {item.unit})
                  </Text>
                </View>
              ))}
              {lowStock.length > 3 && (
                <Text style={styles.moreText}>+ {lowStock.length - 3} more items low on stock</Text>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              All inventory items are above minimum thresholds.
            </Text>
          )}

          <TouchableOpacity
            style={styles.actionLink}
            onPress={() => navigation.navigate('Inventory')}
          >
            <Text style={styles.actionLinkText}>Update Stock →</Text>
          </TouchableOpacity>
        </View>

        {/* Incoming Dispatches Card */}
        {incomingDispatches.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.rowAlign}>
                <Icon name="inventory" color="#146e4e" size={18} />
                <Text style={styles.cardTitle}>Incoming Godown Dispatches</Text>
              </View>
            </View>
            
            <View style={styles.listContainer}>
              {incomingDispatches.map((dispatch: any) => (
                <View key={dispatch.id} style={styles.dispatchItem}>
                  <View>
                    <Text style={styles.listItemTitle}>From Godown ({new Date(dispatch.dispatchDate).toLocaleDateString()})</Text>
                    <Text style={styles.listItemDesc}>Items: {dispatch.items?.length || 0}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.receiveButton}
                    activeOpacity={0.8}
                    onPress={() => handleMarkReceived(dispatch.id)}
                  >
                    <Text style={styles.receiveButtonText}>Receive</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOutletText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '700',
    textAlign: 'center',
  },
  branchHeader: {
    backgroundColor: '#146e4e',
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: -20,
    shadowColor: '#146e4e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  branchTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  branchSubtitle: {
    fontSize: 13,
    color: '#e8f5e9',
    fontWeight: '500',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    marginTop: 10,
    zIndex: 11,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  kpiIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575',
    marginTop: 4,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  eodButton: {
    backgroundColor: '#146e4e',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#146e4e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  eodButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  actionItem: {
    alignItems: 'center',
    width: '22%',
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#424242',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  cardTitleVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#146e4e',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#146e4e',
    borderRadius: 5,
  },
  actionLink: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  actionLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8c6e65',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  listContainer: {
    borderTopWidth: 1,
    borderColor: '#f0f0f0',
    paddingTop: 12,
  },
  listItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  listItemDesc: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  moreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#757575',
    fontStyle: 'italic',
  },
  dispatchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  receiveButton: {
    backgroundColor: '#146e4e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  receiveButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
