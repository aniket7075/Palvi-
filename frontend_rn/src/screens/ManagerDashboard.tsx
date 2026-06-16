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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      const storedOutletId = await AsyncStorage.getItem('outletId');
      const storedOutletName = await AsyncStorage.getItem('outletName');
      
      if (!storedOutletId) {
        setLoading(false);
        return;
      }

      setOutletId(storedOutletId);
      if (storedOutletName) setOutletName(storedOutletName);

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
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Branch Banner */}
        <View style={styles.branchHeader}>
          <Text style={styles.branchTitle}>{outletName}</Text>
          <Text style={styles.branchSubtitle}>Daily operations and audits registry overview.</Text>
        </View>

        {/* KPI Row */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={{ marginBottom: 8 }}>
              <Icon name="sales" color="#146e4e" size={22} />
            </View>
            <Text style={styles.kpiLabel}>Today's Sales</Text>
            <Text style={styles.kpiValue}>₹{metrics?.todaySales?.toLocaleString('en-IN') || 0}</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={{ marginBottom: 8 }}>
              <Icon name="checklist" color="#146e4e" size={22} />
            </View>
            <Text style={styles.kpiLabel}>Checklist Tasks</Text>
            <Text style={styles.kpiValue}>{completedChecklist}/{totalChecklist}</Text>
          </View>
        </View>

        {/* EOD Report Action */}
        <TouchableOpacity 
          style={styles.eodButton}
          onPress={() => {
            const todayStr = new Date().toISOString().split('T')[0];
            navigation.navigate('DailyReportScreen', { outletId: parseInt(outletId), date: todayStr });
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="reports" color="#fff" size={20} />
            <Text style={styles.eodButtonText}>Generate Daily Report</Text>
          </View>
        </TouchableOpacity>

        {/* Progress Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Checklist Progress</Text>
            <Text style={styles.cardTitleVal}>{checklistProgress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${checklistProgress}%` }]} />
          </View>
          <TouchableOpacity
            style={styles.actionLink}
            onPress={() => navigation.navigate('Checklist')}
          >
            <Text style={styles.actionLinkText}>Verify Checklist Items →</Text>
          </TouchableOpacity>
        </View>

        {/* Low Stock Warning Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.rowAlign}>
              <Icon name="alert" color="#0d4e37" size={18} />
              <Text style={styles.cardTitle}>Low Stock Warnings</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: lowStock.length > 0 ? '#f0fdf4' : '#f0fdf4', borderColor: lowStock.length > 0 ? '#bbf7d0' : '#bbf7d0', borderWidth: 1 }]}>
              <Text style={[styles.badgeText, { color: lowStock.length > 0 ? '#0d4e37' : '#146e4e' }]}>
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
              All kitchen and storage inventory raw ingredients are above minimum thresholds.
            </Text>
          )}

          <TouchableOpacity
            style={styles.actionLink}
            onPress={() => navigation.navigate('Inventory')}
          >
            <Text style={styles.actionLinkText}>Update Storage Stock →</Text>
          </TouchableOpacity>
        </View>

        {/* Incoming Dispatches Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.rowAlign}>
              <Icon name="inventory" color="#0d4e37" size={18} />
              <Text style={styles.cardTitle}>Incoming Dispatches</Text>
            </View>
          </View>
          
          {incomingDispatches.length > 0 ? (
            <View style={styles.listContainer}>
              {incomingDispatches.map((dispatch: any) => (
                <View key={dispatch.id} style={styles.dispatchItem}>
                  <Text style={styles.listItemTitle}>From Godown ({new Date(dispatch.dispatchDate).toLocaleDateString()})</Text>
                  <Text style={styles.listItemDesc}>Items: {dispatch.items?.length || 0}</Text>
                  <TouchableOpacity 
                    style={styles.receiveButton}
                    onPress={() => handleMarkReceived(dispatch.id)}
                  >
                    <Text style={styles.receiveButtonText}>Mark Received</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No incoming inventory transfers at this time.</Text>
          )}
        </View>
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
    paddingBottom: 30,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  noOutletText: {
    fontSize: 16,
    color: '#8c6e65',
    fontWeight: '700',
    textAlign: 'center',
  },
  branchHeader: {
    marginBottom: 20,
  },
  branchTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#3d251e',
    marginBottom: 4,
  },
  branchSubtitle: {
    fontSize: 13,
    color: '#8c6e65',
    fontWeight: '600',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 110, 78, 0.12)',
    padding: 16,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  kpiEmoji: {
    fontSize: 22,
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8c6e65',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3d251e',
  },
  eodButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  eodButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
    marginLeft: 8,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    gap: 8,
  },
  warningIcon: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3d251e',
  },
  cardTitleVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#146e4e',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#ebdcd3',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#146e4e',
    borderRadius: 4,
  },
  actionLink: {
    alignSelf: 'flex-start',
  },
  actionLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#146e4e',
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
  listContainer: {
    borderTopWidth: 1,
    borderColor: '#ebdcd3',
    paddingTop: 8,
    marginBottom: 12,
  },
  listItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#ebdcd3',
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
  moreText: {
    fontSize: 11,
    color: '#8c6e65',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#8c6e65',
    marginBottom: 16,
  },
  dispatchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ebdcd3',
  },
  receiveButton: {
    backgroundColor: '#146e4e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  receiveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
