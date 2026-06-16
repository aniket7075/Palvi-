import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
// @ts-ignore
import Icon from 'react-native-vector-icons/Feather';
import { stateService } from '../services/stateService';
import { useLanguage } from '../i18n/LanguageContext';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Godown Dispatch</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Icon name="log-out" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Select Outlet</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.outletScroll}>
          {outlets.map(o => (
            <TouchableOpacity 
              key={o.id} 
              style={[styles.outletChip, selectedOutlet === o.id && styles.outletChipSelected]}
              onPress={() => setSelectedOutlet(o.id)}
            >
              <Text style={[styles.outletChipText, selectedOutlet === o.id && styles.outletChipTextSelected]}>
                {o.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Add Items</Text>
        <View style={styles.addForm}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            placeholder="Item Name"
            value={newItemName}
            onChangeText={setNewItemName}
          />
          <TextInput
            style={[styles.input, { flex: 1, marginHorizontal: 8 }]}
            placeholder="Qty"
            keyboardType="numeric"
            value={newQuantity}
            onChangeText={setNewQuantity}
          />
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            placeholder="Unit"
            value={newUnit}
            onChangeText={setNewUnit}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Icon name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.listHeader}>Items to Dispatch</Text>
          {items.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.itemName}>{item.itemName}</Text>
              <Text style={styles.itemQty}>{item.quantity} {item.unit}</Text>
              <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                <Icon name="trash-2" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          ))}
          {items.length === 0 && (
            <Text style={styles.emptyText}>No items added yet</Text>
          )}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Send Dispatch</Text>
        </TouchableOpacity>

        {/* History Section */}
        <View style={styles.historyContainer}>
          <Text style={styles.listHeader}>Recent Dispatches Record</Text>
          {history.length > 0 ? (
            history.map((dispatch: any) => {
              const targetOutlet = outlets.find(o => o.id === dispatch.targetOutletId);
              return (
                <View key={dispatch.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyOutletName}>To: {targetOutlet ? targetOutlet.name : 'Unknown Outlet'}</Text>
                    <Text style={styles.historyDate}>{new Date(dispatch.dispatchDate).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.historyStatus}>Status: {dispatch.status}</Text>
                  
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf8f3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    marginTop: 16,
  },
  outletScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  outletChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  outletChipSelected: {
    backgroundColor: '#704235',
    borderColor: '#704235',
  },
  outletChipText: {
    color: '#666',
    fontWeight: '600',
  },
  outletChipTextSelected: {
    color: '#fff',
  },
  addForm: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  addButton: {
    backgroundColor: '#2ecc71',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
  },
  listHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    flex: 2,
    fontSize: 15,
    color: '#333',
  },
  itemQty: {
    flex: 1,
    fontSize: 15,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 16,
  },
  submitButton: {
    backgroundColor: '#704235',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyOutletName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  historyDate: {
    fontSize: 13,
    color: '#888',
  },
  historyStatus: {
    fontSize: 13,
    color: '#146e4e',
    fontWeight: '600',
    marginBottom: 12,
  },
  historyItemsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  historyItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  historyItemName: {
    fontSize: 14,
    color: '#444',
  },
  historyItemQty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
