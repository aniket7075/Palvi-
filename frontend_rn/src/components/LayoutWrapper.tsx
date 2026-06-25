import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { stateService } from '../services/stateService';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import Icon from './Icon';

const { width, height } = Dimensions.get('window');

interface LayoutWrapperProps {
  children: React.ReactNode;
  title: string;
}

export default function LayoutWrapper({ children, title }: LayoutWrapperProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { language, setLanguage, t } = useLanguage();
  const { isDark, theme, toggleTheme } = useTheme();

  const [role, setRole] = useState('MANAGER');
  const [outletName, setOutletName] = useState('');
  const [fullName, setFullName] = useState('');
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(-width * 0.8));
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const storedRole = await AsyncStorage.getItem('role');
      const storedOutletName = await AsyncStorage.getItem('outletName');
      const storedFullName = await AsyncStorage.getItem('fullName');
      const storedOutletId = await AsyncStorage.getItem('outletId');

      if (storedRole) setRole(storedRole);
      if (storedOutletName) setOutletName(storedOutletName);
      if (storedFullName) setFullName(storedFullName);

      // Load stock alerts
      const items = stateService.getInventory(storedOutletId);
      const lowStockCount = items.filter((i: any) => i.quantity <= i.minStock).length;
      setUnreadAlerts(lowStockCount);
    };

    loadSession();
  }, [route.name]);

  // Hide bottom nav when keyboard is open
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      // Close
      Animated.timing(drawerAnim, {
        toValue: -width * 0.8,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setIsDrawerOpen(false));
    } else {
      // Open
      setIsDrawerOpen(true);
      Animated.timing(drawerAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    toggleDrawer();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const navigateTo = (screenName: string) => {
    toggleDrawer();
    navigation.navigate(screenName);
  };

  // Show bottom nav only on primary tab screens AND when keyboard is hidden
  const primaryTabs = ['AdminDashboard', 'ManagerDashboard', 'Checklist', 'Attendance', 'Inventory'];
  const showBottomNav = primaryTabs.includes(route.name) && !keyboardVisible;

  // Bottom Navigation helper to get active tab index
  const getActiveTabIndex = () => {
    if (route.name === 'AdminDashboard' || route.name === 'ManagerDashboard') return 0;
    if (route.name === 'Checklist') return 1;
    if (route.name === 'Attendance') return 2;
    if (route.name === 'Inventory') return 3;
    return -1;
  };

  const activeTabIdx = getActiveTabIndex();

  const handleBottomTabPress = (idx: number) => {
    if (idx === 0) {
      navigation.navigate(role === 'ADMIN' ? 'AdminDashboard' : 'ManagerDashboard');
    } else if (idx === 1) {
      navigation.navigate('Checklist');
    } else if (idx === 2) {
      navigation.navigate('Attendance');
    } else if (idx === 3) {
      navigation.navigate('Inventory');
    }
  };

  const getDashboardScreen = () => {
    if (role === 'ADMIN') return 'AdminDashboard';
    if (role === 'INVENTORY_MANAGER') return 'GodownDispatchScreen';
    return 'ManagerDashboard'; // Manager & Franchisee
  };

  const menuItems = [
    { text: t('menuDashboard'), screen: getDashboardScreen(), icon: 'dashboard', allowedRoles: ['ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER'] },
    { text: t('menuOutlets'), screen: 'Outlets', icon: 'outlet', allowedRoles: ['ADMIN'] },
    { text: t('menuManagers'), screen: 'Managers', icon: 'manager', allowedRoles: ['ADMIN'] },
    { text: t('menuStaff'), screen: 'Staff', icon: 'staff', allowedRoles: ['ADMIN', 'MANAGER', 'FRANCHISEE'] },
    { text: t('menuVendors'), screen: 'Vendors', icon: 'supplier', allowedRoles: ['ADMIN', 'MANAGER', 'FRANCHISEE'] },
    { text: t('menuPurchases'), screen: 'Purchases', icon: 'purchase', allowedRoles: ['ADMIN', 'MANAGER', 'FRANCHISEE'] },
    { text: t('menuExpenses'), screen: 'Expenses', icon: 'expense', allowedRoles: ['ADMIN', 'MANAGER', 'FRANCHISEE'] },
    { text: t('menuSales'), screen: 'Sales', icon: 'sales', allowedRoles: ['ADMIN', 'MANAGER', 'FRANCHISEE'] },
    { text: t('menuOrders'), screen: 'VendorOrders', icon: 'clipboard', allowedRoles: ['ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER'] },
    { text: 'Inventory Stock', screen: 'Inventory', icon: 'inventory', allowedRoles: ['ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER'] },
    { text: t('menuReports'), screen: 'Reports', icon: 'reports', allowedRoles: ['ADMIN', 'MANAGER', 'FRANCHISEE'] },
    { text: t('menuNotifications'), screen: 'Notifications', icon: 'alert', badge: unreadAlerts, allowedRoles: ['ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER'] },
    { text: t('menuProfile'), screen: 'Profile', icon: 'profile', allowedRoles: ['ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER'] },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.card} />
      
      {/* 1. Header Bar */}
      <View style={[styles.header, { height: (Platform.OS === 'ios' ? 44 : 56) + insets.top, paddingTop: insets.top, backgroundColor: theme.card, borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
            <Icon name="menu" color={theme.primary} size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.langToggleBtn, { backgroundColor: theme.surface, borderColor: theme.border, marginRight: 8 }]} 
            onPress={toggleTheme}
          >
            <Text style={[styles.langToggleText, { color: theme.primary }]}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.langToggleBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} 
            onPress={() => setLanguage(language === 'en' ? 'mr' : 'en')}
          >
            <Text style={[styles.langToggleText, { color: theme.primary }]}>{language === 'en' ? 'अ' : 'A'}</Text>
          </TouchableOpacity>
          <View style={[styles.roleBadge, { backgroundColor: isDark ? theme.border : '#ebdcd3' }]}>
            <Text style={[styles.roleBadgeText, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">
              {role === 'ADMIN' ? 'Admin HQ' : (outletName || 'Manager')}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Main Content */}
      <View style={[styles.content, { paddingBottom: showBottomNav ? 56 + insets.bottom : 0, backgroundColor: theme.background }]}>
        {children}
      </View>

      {/* 3. Bottom Navigation Tab Bar */}
      {showBottomNav && (
        <View style={[
          styles.bottomNav,
          { height: 60 + insets.bottom, paddingBottom: insets.bottom, backgroundColor: theme.card, borderTopColor: theme.border }
        ]}>
          {[
            { label: 'Home', icon: 'home' },
            { label: 'Checklist', icon: 'checklist' },
            { label: 'Attendance', icon: 'users' },
            { label: 'Inventory', icon: 'inventory' },
          ].map((tab, idx) => {
            const isSelected = activeTabIdx === idx;
            const tabColor = isSelected ? theme.primary : theme.textSecondary;
            return (
              <TouchableOpacity
                key={tab.label}
                onPress={() => handleBottomTabPress(idx)}
                style={styles.bottomTab}
                activeOpacity={0.7}
              >
                {isSelected && <View style={[styles.activeTabIndicator, { backgroundColor: theme.primary }]} />}
                <View style={{ marginBottom: 3 }}>
                  <Icon name={tab.icon} color={tabColor} size={22} />
                </View>
                <Text style={[styles.bottomTabLabel, { color: tabColor }, isSelected && { fontWeight: '900' }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* 4. Side Menu Drawer Overlay */}
      {isDrawerOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleDrawer}
          style={styles.drawerBackdrop}
        >
          <Animated.View
            style={[
              styles.drawerContainer,
              { transform: [{ translateX: drawerAnim }], paddingTop: insets.top + 16, backgroundColor: theme.card, borderRightColor: theme.border, borderRightWidth: 1 }
            ]}
          >
            {/* Drawer Header Info */}
            <View style={[styles.drawerHeader, { borderBottomColor: theme.border }]}>
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <Text style={styles.avatarText}>P</Text>
              </View>
              <View style={styles.drawerUserInfo}>
                <Text style={[styles.drawerName, { color: theme.text }]}>{fullName || 'Palvi User'}</Text>
                <Text style={[styles.drawerRole, { color: theme.textSecondary }]}>
                  {role === 'ADMIN' ? 'Administrator' : (outletName || 'Outlet Manager')}
                </Text>
              </View>
            </View>

            <View style={[styles.drawerDivider, { backgroundColor: theme.border }]} />

            {/* Menu List */}
            <ScrollView style={styles.drawerScrollView} contentContainerStyle={styles.drawerScrollContent}>
              {menuItems.map((item) => {
                if (!item.allowedRoles.includes(role)) return null;
                const isActive = route.name === item.screen;
                return (
                  <TouchableOpacity
                    key={item.text}
                    onPress={() => navigateTo(item.screen)}
                    style={[
                      styles.drawerItem,
                      isActive && { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.08)' : 'rgba(20, 110, 78, 0.08)' }
                    ]}
                  >
                    <View style={styles.drawerItemIconContainer}>
                      <Icon name={item.icon} color={isActive ? theme.primary : theme.text} size={18} />
                    </View>
                    <Text style={[styles.drawerItemText, { color: isActive ? theme.primary : theme.text }]}>
                      {item.text}
                    </Text>
                    {item.badge !== undefined && item.badge > 0 ? (
                      <View style={[styles.badge, { backgroundColor: theme.error }]}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}

              <View style={[styles.drawerDivider, { backgroundColor: theme.border }]} />

              {/* Drawer Logout */}
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <View style={styles.drawerItemIconContainer}>
                  <Icon name="logout" color={theme.error} size={18} />
                </View>
                <Text style={[styles.logoutText, { color: theme.error }]}>{t('logout')}</Text>
              </TouchableOpacity>

              <View style={styles.versionContainer}>
                <Text style={[styles.versionText, { color: theme.textSecondary }]}>{t('version')} 1.0.0</Text>
              </View>
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#ebdcd3',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  menuButtonText: {
    fontSize: 22,
    color: '#146e4e',
    fontWeight: '900',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3d251e',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    backgroundColor: '#fdfbfa',
    borderWidth: 1,
    borderColor: '#ebdcd3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 130,
    justifyContent: 'center',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#146e4e',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#f0e8e3',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 99,
    // Strong shadow so it stands out clearly
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingTop: 6,
  },
  activeTabIndicator: {
    position: 'absolute',
    top: 0,
    width: 36,
    height: 3,
    backgroundColor: '#146e4e',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  bottomTabIcon: {
    fontSize: 20,
    color: '#8c6e65',
    marginBottom: 2,
  },
  bottomTabLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8c6e65',
  },
  activeTabColor: {
    color: '#146e4e',
  },
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(61, 37, 30, 0.4)',
    zIndex: 999,
  },
  drawerContainer: {
    width: width * 0.8,
    height: height,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderColor: '#ebdcd3',
    elevation: 16,
    shadowColor: '#3d251e',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#146e4e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  drawerUserInfo: {
    flex: 1,
  },
  drawerName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#3d251e',
  },
  drawerRole: {
    fontSize: 11,
    color: '#8c6e65',
    fontWeight: '600',
    marginTop: 2,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#ebdcd3',
    marginHorizontal: 16,
  },
  drawerScrollView: {
    flex: 1,
  },
  drawerScrollContent: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  activeDrawerItem: {
    backgroundColor: 'rgba(20, 110, 78, 0.08)',
  },
  drawerItemIconContainer: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerItemIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  drawerItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3d251e',
    flex: 1,
  },
  activeDrawerItemText: {
    color: '#146e4e',
    fontWeight: '900',
  },
  badge: {
    backgroundColor: '#0d4e37',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  logoutIcon: {
    fontSize: 18,
    color: '#0d4e37',
    marginRight: 12,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0d4e37',
  },
  langToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    borderRadius: 6,
    backgroundColor: '#fdfbfa',
  },
  langToggleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#146e4e',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  versionText: {
    fontSize: 11,
    color: '#8c6e65',
    fontWeight: '600',
  },
});
