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
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import Icon from '../components/Icon';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [outletId, setOutletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateAlerts = async () => {
      const storedOutletId = await AsyncStorage.getItem('outletId');
      setOutletId(storedOutletId);

      const list: any[] = [];
      
      // 1. Low stock alerts
      const inventory = stateService.getInventory(storedOutletId);
      inventory.forEach((item: any) => {
        if (item.quantity <= item.minStock) {
          list.push({
            id: `stock-${item.id}`,
            type: 'STOCK',
            title: 'Low Stock Alert',
            message: `The item "${item.name}" quantity (${item.quantity} ${item.unit}) is below safety threshold (${item.minStock} ${item.unit}). Please order stock.`,
            date: 'Just Now'
          });
        }
      });

      // 2. Checklist tasks (Admin gets for all, Manager gets for their outlet)
      const role = await AsyncStorage.getItem('role');
      const todayStr = new Date().toISOString().split('T')[0];
      const outletsToCheck = role === 'ADMIN' ? stateService.getOutlets() : [{ id: storedOutletId, name: 'Your Outlet' }];

      outletsToCheck.forEach((outlet: any) => {
        if (!outlet || !outlet.id) return;
        const checklists = stateService.getChecklist(outlet.id, todayStr);
        
        const openingTasks = checklists.filter((c: any) => c.timeRange === 'OPENING');
        const closingTasks = checklists.filter((c: any) => c.timeRange === 'CLOSING');

        const checkTasks = (tasks: any[], name: string) => {
          if (tasks.length === 0) return;
          const completedCount = tasks.filter((c: any) => c.status === 'COMPLETED').length;
          
          if (completedCount === tasks.length) {
            list.push({
              id: `checklist-done-${outlet.id}-${name}`,
              type: 'CHECKLIST',
              title: `${outlet.name || 'Your Branch'} - ${name} Checklist Completed`,
              message: `All ${name.toLowerCase()} operational tasks have been successfully completed for today.`,
              date: 'Today'
            });
          } else if (completedCount < tasks.length) {
            list.push({
              id: `checklist-pend-${outlet.id}-${name}`,
              type: 'CHECKLIST',
              title: `${outlet.name || 'Your Branch'} - ${name} Checklist Pending`,
              message: `${outlet.name || 'Your Branch'} has ${tasks.length - completedCount} pending ${name.toLowerCase()} operational tasks for today.`,
              date: 'Today'
            });
          }
        };

        checkTasks(openingTasks, 'Opening');
        checkTasks(closingTasks, 'Closing');
      });

      // 3. Fallback System welcome notification
      if (list.length === 0) {
        list.push({
          id: 'welcome-msg',
          type: 'SYSTEM',
          title: 'System Active',
          message: 'Welcome to Palvi Outlet Management System. Your client-side offline database is synchronized.',
          date: 'Today'
        });
      }

      setNotifications(list);
      setLoading(false);
    };

    generateAlerts();
  }, []);

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getAlertIconName = (type: string) => {
    if (type === 'STOCK') return 'alert';
    if (type === 'CHECKLIST') return 'checklist';
    return 'alert';
  };

  const getAlertBgColor = (type: string) => {
    if (type === 'STOCK') return '#f0fdf4';
    if (type === 'CHECKLIST') return '#fffbf0';
    return '#fdfbfa';
  };

  const getAlertBorderColor = (type: string) => {
    if (type === 'STOCK') return '#bbf7d0';
    if (type === 'CHECKLIST') return '#ffe3b3';
    return '#ebdcd3';
  };

  if (loading) {
    return (
      <LayoutWrapper title="System Alerts">
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper title="System Alerts">
      <View style={styles.mainContainer}>
        {/* Clear All button */}
        {notifications.length > 0 && (
          <View style={styles.topBar}>
            <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {/* Notifications List */}
          <View style={styles.card}>
            {notifications.map((n, index) => {
              const bg = getAlertBgColor(n.type);
              const border = getAlertBorderColor(n.type);
              return (
                <View
                  key={n.id}
                  style={[
                    styles.notificationItem,
                    { backgroundColor: bg, borderColor: border },
                    index !== notifications.length - 1 && styles.divider
                  ]}
                >
                  <View style={styles.alertLeft}>
                    <View style={styles.iconCircle}>
                      <Icon name={getAlertIconName(n.type)} color="#146e4e" size={20} />
                    </View>
                    <View style={styles.alertInfo}>
                      <Text style={styles.alertTitle}>{n.title}</Text>
                      <Text style={styles.alertMessage}>{n.message}</Text>
                      <Text style={styles.alertDate}>{n.date}</Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => handleDismiss(n.id)} style={styles.dismissBtn}>
                    <Text style={styles.dismissText}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {notifications.length === 0 && (
              <View style={styles.emptyContainer}>
              <View style={{ marginBottom: 8 }}>
                <Icon name="alert" color="#ebdcd3" size={40} />
              </View>
                <Text style={styles.emptyText}>No active notifications or alerts.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#146e4e',
  },
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    margin: 8,
  },
  divider: {
    marginBottom: 4,
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ebdcd3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3d251e',
  },
  alertMessage: {
    fontSize: 12,
    color: '#8c6e65',
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 16,
  },
  alertDate: {
    fontSize: 10,
    color: '#8c6e65',
    fontWeight: '600',
    marginTop: 8,
  },
  dismissBtn: {
    padding: 4,
  },
  dismissText: {
    fontSize: 14,
    color: '#8c6e65',
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    opacity: 0.3,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#8c6e65',
    fontWeight: '700',
  },
});
