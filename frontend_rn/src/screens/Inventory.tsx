import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import Icon from '../components/Icon';
import OutletSelector from '../components/OutletSelector';
import { useLanguage } from '../i18n/LanguageContext';

export default function Inventory() {
  const { t } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [outletId, setOutletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [itemCategory, setItemCategory] = useState('Vegetables');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('KG');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [minStock, setMinStock] = useState('');

  const fetchInventory = async () => {
    const storedRole = await AsyncStorage.getItem('role');
    setIsAdmin(storedRole === 'ADMIN');
    
    let activeOutletId = await AsyncStorage.getItem('outletId');
    if (!activeOutletId && storedRole === 'ADMIN') {
      const outlets = stateService.getOutlets();
      if (outlets.length > 0) {
        const firstId = outlets[0].id.toString();
        activeOutletId = firstId;
        await AsyncStorage.setItem('outletId', firstId);
        await AsyncStorage.setItem('outletName', outlets[0].name);
      }
    }
    
    if (!activeOutletId) {
      setLoading(false);
      return;
    }
    
    setOutletId(activeOutletId);
    const data = stateService.getInventory(activeOutletId);
    setItems(data);
    
    const catData = stateService.getCategories();
    setCategories(catData);
    
    setLoading(false);
  };

  const handleOutletChange = async (newOutletId: string) => {
    setLoading(true);
    await AsyncStorage.setItem('outletId', newOutletId);
    const outlets = stateService.getOutlets();
    const selectedOutlet = outlets.find((o: any) => o.id.toString() === newOutletId);
    if (selectedOutlet) {
      await AsyncStorage.setItem('outletName', selectedOutlet.name);
    }
    setOutletId(newOutletId);
    const data = stateService.getInventory(newOutletId);
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleIncrement = (itemId: number) => {
    stateService.updateInventoryQuantity(itemId, 1.0);
    // Refresh items locally
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: parseFloat((item.quantity + 1.0).toFixed(2)) } : item));
  };

  const openAdd = () => {
    setEditingId(null);
    const firstCat = categories.length > 0 ? categories[0].name : 'Vegetables';
    setName(''); setItemCategory(firstCat); setQuantity(''); setUnit('KG'); setPurchasePrice(''); setMinStock('');
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setItemCategory(item.category);
    setQuantity(String(item.quantity));
    setUnit(item.unit);
    setPurchasePrice(String(item.purchasePrice));
    setMinStock(String(item.minStock));
    setIsModalOpen(true);
  };

  const handleDelete = (item: any) => {
    Alert.alert(
      t('delete'),
      `${t('deleteConfirm')} "${item.name}"?`,
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => { stateService.deleteInventoryItem(item.id); fetchInventory(); } }
      ]
    );
  };

  const handleSave = () => {
    if (!name || !quantity || !unit || !purchasePrice || !minStock) {
      Alert.alert(t('requiredFields'), t('fillAllFields'));
      return;
    }

    if (editingId !== null) {
      stateService.updateInventoryItem(editingId, {
        name, category: itemCategory,
        quantity: parseFloat(quantity),
        unit, purchasePrice: parseFloat(purchasePrice),
        minStock: parseFloat(minStock)
      });
    } else {
      stateService.addInventoryItem(outletId, {
        name, category: itemCategory,
        quantity: parseFloat(quantity),
        unit, purchasePrice: parseFloat(purchasePrice),
        minStock: parseFloat(minStock)
      });
    }

    fetchInventory();
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <LayoutWrapper title={t('inventory')}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      </LayoutWrapper>
    );
  }

  if (!outletId) {
    return (
      <LayoutWrapper title={t('inventory')}>
        <View style={styles.centeredContainer}>
          <Text style={styles.noOutletText}>
            {t('noOutletAccess')}
          </Text>
        </View>
      </LayoutWrapper>
    );
  }

  const filterCategories = ['ALL', ...categories.map(c => c.name)];
  const formCategories = categories.map(c => c.name);
  const filteredItems = category === 'ALL' ? items : items.filter(i => i.category === category);

  return (
    <LayoutWrapper title={t('inventory')}>
      <OutletSelector selectedOutletId={outletId} onSelect={handleOutletChange} />
      <View style={styles.mainContainer}>
        {/* Category Filter Chips bar */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filterCategories.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.filterChip, isSelected && styles.activeFilterChip]}
                >
                  <Text style={[styles.filterChipText, isSelected && styles.activeFilterChipText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Scroll grid of inventory items */}
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.gridContainer}>
            {filteredItems.map((item) => {
              const isLow = item.quantity <= item.minStock;
              return (
                <View
                  key={item.id}
                  style={[styles.itemCard, isLow && styles.lowStockCard]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{item.category}</Text>
                    </View>
                    {isLow && <Icon name="alert" color="#0d4e37" size={16} />}
                  </View>

                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.minStockText}>{t('minStock')}: {item.minStock} {item.unit}</Text>

                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.qtyLabel}>{t('inStock')}</Text>
                      <Text style={[styles.qtyValue, isLow && styles.lowStockText]}>
                        {item.quantity} {item.unit}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {isAdmin && (
                        <>
                          <TouchableOpacity
                            onPress={() => openEdit(item)}
                            style={styles.iconBtn}
                          >
                            <Icon name="edit" color="#146e4e" size={13} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDelete(item)}
                            style={[styles.iconBtn, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}
                          >
                            <Icon name="delete" color="#0d4e37" size={13} />
                          </TouchableOpacity>
                        </>
                      )}
                      <TouchableOpacity
                        onPress={() => handleIncrement(item.id)}
                        style={[styles.plusButton, isLow && styles.lowStockPlusButton]}
                      >
                        <Text style={styles.plusButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}

            {filteredItems.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('noItemsFound')}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Action Buttons */}
        <View style={styles.floatingButtonsContainer}>
          {isAdmin && (
            <TouchableOpacity
              onPress={() => setIsCategoryModalOpen(true)}
              style={[styles.floatingButton, { backgroundColor: '#a67c6d', marginRight: 12 }]}
            >
              <Text style={styles.floatingButtonText}>{t('manageCategories')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={openAdd}
            style={styles.floatingButton}
          >
            <Text style={styles.floatingButtonText}>+ {t('addItem')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Item Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? t('editItem') : t('addItem')}</Text>
            <View style={styles.modalDivider} />

            <ScrollView contentContainerStyle={styles.modalFormScroll} keyboardShouldPersistTaps="handled">
              <Text style={styles.formLabel}>{t('itemName')}</Text>
              <TextInput
                style={styles.modalInput}
                value={name}
                onChangeText={setName}
                placeholder={t('egOnion')}
                placeholderTextColor="#8c6e65"
              />

              <Text style={styles.formLabel}>{t('category')}</Text>
              <View style={styles.categoryGrid}>
                {formCategories.map((cat) => {
                  const isSel = itemCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setItemCategory(cat)}
                      style={[styles.categoryChoice, isSel && styles.activeCategoryChoice]}
                    >
                      <Text style={[styles.categoryChoiceText, isSel && styles.activeCategoryChoiceText]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.formRow}>
                <View style={styles.rowItem}>
                  <Text style={styles.formLabel}>{t('currentQty')}</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="e.g. 10"
                    placeholderTextColor="#8c6e65"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.rowItem}>
                  <Text style={styles.formLabel}>{t('unit')}</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={unit}
                    onChangeText={setUnit}
                    placeholder="e.g. KG"
                    placeholderTextColor="#8c6e65"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.rowItem}>
                  <Text style={styles.formLabel}>{t('priceUnit')}</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={purchasePrice}
                    onChangeText={setPurchasePrice}
                    placeholder="e.g. 40"
                    placeholderTextColor="#8c6e65"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.rowItem}>
                  <Text style={styles.formLabel}>{t('minStock')}</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={minStock}
                    onChangeText={setMinStock}
                    placeholder="e.g. 5"
                    placeholderTextColor="#8c6e65"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>{editingId ? t('saveChanges') : t('addItem')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Manage Categories Modal */}
      <Modal
        visible={isCategoryModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCategoryModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Categories</Text>
            <View style={styles.modalDivider} />
            
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <TextInput
                style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="New Category Name"
                placeholderTextColor="#8c6e65"
              />
              <TouchableOpacity
                onPress={() => {
                  if (newCategoryName.trim()) {
                    stateService.addCategory(newCategoryName.trim());
                    setCategories(stateService.getCategories());
                    setNewCategoryName('');
                  }
                }}
                style={[styles.saveBtn, { flex: 0, paddingHorizontal: 16 }]}
              >
                <Text style={styles.saveBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 200, marginBottom: 16 }}>
              {categories.map((cat: any) => (
                <View key={cat.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ebdcd3' }}>
                  <Text style={{ fontSize: 14, color: '#3d251e', fontWeight: '700' }}>{cat.name}</Text>
                  <TouchableOpacity onPress={() => {
                    Alert.alert('Delete Category', `Are you sure you want to delete "${cat.name}"?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => {
                        stateService.deleteCategory(cat.id);
                        setCategories(stateService.getCategories());
                        if (category === cat.name) {
                          setCategory('ALL');
                        }
                      }}
                    ]);
                  }}>
                    <Icon name="trash" color="#d32f2f" size={16} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={() => setIsCategoryModalOpen(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#ebdcd3',
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#ffffff',
  },
  activeFilterChip: {
    backgroundColor: '#146e4e',
    borderColor: '#146e4e',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3d251e',
  },
  activeFilterChipText: {
    color: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  noOutletText: {
    fontSize: 14,
    color: '#8c6e65',
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ebdcd3',
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  lowStockCard: {
    borderColor: '#bbf7d0',
    backgroundColor: '#fffcfc',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#a67c6d',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  alertSymbol: {
    fontSize: 14,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3d251e',
    marginBottom: 4,
  },
  minStockText: {
    fontSize: 10,
    color: '#8c6e65',
    fontWeight: '600',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  qtyLabel: {
    fontSize: 9,
    color: '#8c6e65',
    fontWeight: '600',
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#3d251e',
  },
  lowStockText: {
    color: '#0d4e37',
  },
  plusButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#146e4e',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  lowStockPlusButton: {
    backgroundColor: '#0d4e37',
  },
  plusButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    marginTop: -1.5,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    width: '100%',
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#8c6e65',
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    flexDirection: 'row',
  },
  floatingButton: {
    backgroundColor: '#146e4e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  floatingButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(61, 37, 30, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3d251e',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#ebdcd3',
    marginBottom: 16,
  },
  modalFormScroll: {
    paddingBottom: 24,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3d251e',
    marginBottom: 6,
  },
  modalInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#3d251e',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChoice: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#ffffff',
  },
  activeCategoryChoice: {
    backgroundColor: '#a67c6d',
    borderColor: '#a67c6d',
  },
  categoryChoiceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3d251e',
  },
  activeCategoryChoiceText: {
    color: '#ffffff',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8c6e65',
  },
  saveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#146e4e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
