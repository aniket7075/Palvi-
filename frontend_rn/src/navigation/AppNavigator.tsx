import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Splash from '../screens/Splash';
import Login from '../screens/Login';
import ForgotPassword from '../screens/ForgotPassword';
import OtpVerification from '../screens/OtpVerification';
import ResetPassword from '../screens/ResetPassword';
import AdminDashboard from '../screens/AdminDashboard';
import ManagerDashboard from '../screens/ManagerDashboard';
import Checklist from '../screens/Checklist';
import Attendance from '../screens/Attendance';
import Inventory from '../screens/Inventory';
import Outlets from '../screens/Outlets';
import Managers from '../screens/Managers';
import Staff from '../screens/Staff';
import Vendors from '../screens/Vendors';
import Purchases from '../screens/Purchases';
import Expenses from '../screens/Expenses';
import Sales from '../screens/Sales';
import VendorOrders from '../screens/VendorOrders';
import Reports from '../screens/Reports';
import Notifications from '../screens/Notifications';
import Profile from '../screens/Profile';
import GodownDispatchScreen from '../screens/GodownDispatchScreen';
import DailyReportScreen from '../screens/DailyReportScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  OtpVerification: undefined;
  ResetPassword: undefined;
  AdminDashboard: undefined;
  ManagerDashboard: undefined;
  Checklist: undefined;
  Attendance: undefined;
  Inventory: undefined;
  Outlets: undefined;
  Managers: undefined;
  Staff: undefined;
  Vendors: undefined;
  Purchases: undefined;
  Expenses: undefined;
  Sales: undefined;
  VendorOrders: undefined;
  Reports: undefined;
  Notifications: undefined;
  Profile: undefined;
  GodownDispatchScreen: { user?: any };
  DailyReportScreen: { outletId: number, date: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' }
      }}
    >
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="OtpVerification" component={OtpVerification} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="ManagerDashboard" component={ManagerDashboard} />
      <Stack.Screen name="Checklist" component={Checklist} />
      <Stack.Screen name="Attendance" component={Attendance} />
      <Stack.Screen name="Inventory" component={Inventory} />
      <Stack.Screen name="Outlets" component={Outlets} />
      <Stack.Screen name="Managers" component={Managers} />
      <Stack.Screen name="Staff" component={Staff} />
      <Stack.Screen name="Vendors" component={Vendors} />
      <Stack.Screen name="Purchases" component={Purchases} />
      <Stack.Screen name="Expenses" component={Expenses} />
      <Stack.Screen name="Sales" component={Sales} />
      <Stack.Screen name="VendorOrders" component={VendorOrders} />
      <Stack.Screen name="Reports" component={Reports} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="GodownDispatchScreen" component={GodownDispatchScreen} />
      <Stack.Screen name="DailyReportScreen" component={DailyReportScreen} />
    </Stack.Navigator>
  );
}

