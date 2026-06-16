import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Icon from '../components/Icon';
import { stateService } from '../services/stateService';
import { useLanguage } from '../i18n/LanguageContext';
import LayoutWrapper from '../components/LayoutWrapper';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function GodownDispatchScreen({ route }: any) {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLanguage();
  const [outlets, setOutlets] = useState<any[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<number | null>(null);
  
  const [items, setItems] = useState<{ itemName: string, quantity: string, unit: string }[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newUnit, setNewUnit] = useState('Kg');
  const [history, setHistory] = useState<any[]>([]);

  const { user } = route?.params || {};

  useEffect(() => {
    const fetchedOutlets = stateService.getOutlets();
    setOutlets(fetchedOutlets);
    loadHistory();
  }, []);

  const loadHistory = () => {
    const dispatches = stateService.getGodownDispatches();
    // sort descending by date
    dispatches.sort((a: any, b: any) => new Date(b.dispatchDate).getTime() - new Date(a.dispatchDate).getTime());
    setHistory(dispatches);
  };

  const handleAddItem = () => {
    if (!newItemName || !newQuantity) {
      Alert.alert('Error', 'Please enter item name and quantity');
      return;
    }
    setItems([...items, { itemName: newItemName, quantity: newQuantity, unit: newUnit }]);
    setNewItemName('');
    setNewQuantity('');
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleSubmit = () => {
    if (!selectedOutlet) {
      Alert.alert('Error', 'Please select an outlet');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    const payload = {
      sentById: user?.id || 1, // Fallback if user ID is missing
      targetOutletId: selectedOutlet,
      items: items.map(i => ({
        itemName: i.itemName,
        quantity: parseFloat(i.quantity),
        unit: i.unit
      }))
    };

    stateService.addGodownDispatch(payload);
    Alert.alert('Success', 'Dispatch sent successfully');
    setItems([]);
    setSelectedOutlet(null);
    setTimeout(() => {
      loadHistory();
    }, 500);
  };

  return (
    <LayoutWrapper title="Godown Inventory">
      {/* Premium Godown Header */}
      <View style={styles.branchHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.branchTitle}>Central Godown</Text>
          <Text style={styles.branchSubtitle}>Manage dispatches and distribute inventory securely.</Text>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Step 1: Select Outlet */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Icon name="outlet" color="#146e4e" size={20} />
            <Text style={styles.cardTitle}>1. Select Target Outlet</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.outletScroll}>
            {outlets.map(o => (
              <TouchableOpacity 
                key={o.id} 
                style={[styles.outletChip, selectedOutlet === o.id && styles.outletChipSelected]}
                onPress={() => setSelectedOutlet(o.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.outletChipText, selectedOutlet === o.id && styles.outletChipTextSelected]}>
                  {o.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Step 2: Add Items */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Icon name="inventory" color="#146e4e" size={20} />
            <Text style={styles.cardTitle}>2. Add Items to Dispatch</Text>
          </View>
          <View style={styles.addForm}>
            <TextInput
              style={[styles.input, { flex: 2 }]}
              placeholder="Item Name (e.g. Sugar)"
              placeholderTextColor="#8c6e65"
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginHorizontal: 8 }]}
              placeholder="Qty"
              placeholderTextColor="#8c6e65"
              keyboardType="numeric"
              value={newQuantity}
              onChangeText={setNewQuantity}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Unit"
              placeholderTextColor="#8c6e65"
              value={newUnit}
              onChangeText={setNewUnit}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddItem} activeOpacity={0.8}>
              <Icon name="plus" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Current Cart */}
          <View style={styles.listContainer}>
            <Text style={styles.listHeader}>Current Dispatch Cart</Text>
            {items.length === 0 ? (
              <View style={styles.emptyCartContainer}>
                <Icon name="inventory" size={30} color="#ebdcd3" />
                <Text style={styles.emptyText}>No items added yet</Text>
              </View>
            ) : (
              items.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    <Text style={styles.itemQty}>{item.quantity} {item.unit}</Text>
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemoveItem(index)}>
                    <Icon name="trash-2" size={18} color="#d32f2f" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, (!selectedOutlet || items.length === 0) && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={!selectedOutlet || items.length === 0}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="reports" color="#fff" size={20} />
              <Text style={styles.submitButtonText}>Send Dispatch</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* History Section */}
        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>Recent Dispatches Record</Text>
          {history.length > 0 ? (
            history.map((dispatch: any) => {
              const targetOutlet = outlets.find(o => o.id === dispatch.targetOutletId);
              const isDispatched = dispatch.status === 'DISPATCHED';
              
              return (
                <View key={dispatch.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={styles.historyIconWrapper}>
                        <Icon name="outlet" size={16} color="#146e4e" />
                      </View>
                      <Text style={styles.historyOutletName}>{targetOutlet ? targetOutlet.name : 'Unknown Outlet'}</Text>
                    </View>
                    <Text style={styles.historyDate}>{new Date(dispatch.dispatchDate).toLocaleDateString()}</Text>
                  </View>
                  
                  <View style={styles.historyStatusRow}>
                    <Text style={styles.historyStatusLabel}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: isDispatched ? '#fff3e0' : '#e8f5e9' }]}>
                      <Text style={[styles.statusBadgeText, { color: isDispatched ? '#e65100' : '#2e7d32' }]}>
                        {dispatch.status}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.historyItemsContainer}>
                    {dispatch.items && dispatch.items.map((item: any, i: number) => (
                      <View key={i} style={styles.historyItemRow}>
                        <Text style={styles.historyItemName}>• {item.itemName}</Text>
                        <Text style={styles.historyItemQty}>{item.quantity} {item.unit}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No previous dispatches found.</Text>
          )}
        </View>
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
  branchHeader: {
    backgroundColor: '#146e4e',
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: -10,
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
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  outletScroll: {
    flexDirection: 'row',
  },
  outletChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  outletChipSelected: {
    backgroundColor: '#146e4e',
    borderColor: '#146e4e',
  },
  outletChipText: {
    color: '#757575',
    fontWeight: '700',
    fontSize: 13,
  },
  outletChipTextSelected: {
    color: '#ffffff',
  },
  addForm: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#10b981',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  listContainer: {
    backgroundColor: '#fcfcfc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  listHeader: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
    color: '#333',
  },
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  itemQty: {
    fontSize: 13,
    color: '#8c6e65',
    fontWeight: '600',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    paddingTop: 8,
  },
  submitButton: {
    backgroundColor: '#146e4e',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#146e4e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#a5d6a7',
    elevation: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  historyContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  historyOutletName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  historyDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8c6e65',
  },
  historyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyStatusLabel: {
    fontSize: 13,
    color: '#757575',
    marginRight: 8,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  historyItemsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  historyItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  historyItemName: {
    fontSize: 13,
    color: '#424242',
    fontWeight: '500',
  },
  historyItemQty: {
    fontSize: 13,
    fontWeight: '700',
    color: '#146e4e',
  },
});
