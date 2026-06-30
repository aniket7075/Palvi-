import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import { API_BASE_URL } from '../api';

const BASE_URL = API_BASE_URL.replace('/api', '');

export default function VendorBills() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    const role = await AsyncStorage.getItem('role');
    setIsAdmin(role === 'ADMIN');
    
    // Sync state to get latest bills
    // Sync state to get latest bills
    const fetchedBills = stateService.getVendorBills();
    setBills(fetchedBills);
    setLoading(false);
  };

  if (loading) {
    return (
      <LayoutWrapper title="Vendor Bills">
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper title="Vendor Uploaded Bills">
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {bills.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bills uploaded yet.</Text>
          </View>
        ) : (
          bills.map((bill, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.vendorName}>{bill.vendorName}</Text>
                <Text style={styles.dateText}>
                  {new Date(bill.uploadDate).toLocaleDateString()} {new Date(bill.uploadDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </View>
              
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: `${BASE_URL}${bill.imagePath}` }} 
                  style={styles.billImage} 
                  resizeMode="contain"
                />
              </View>
            </View>
          ))
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
  },
  noAccessText: {
    fontSize: 16,
    color: '#8c6e65',
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8c6e65',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ebdcd3',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ebdcd3',
    backgroundColor: '#f9f5f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3d251e',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8c6e65',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  billImage: {
    width: '100%',
    height: '100%',
  }
});
