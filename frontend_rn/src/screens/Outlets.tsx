import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import Icon from '../components/Icon';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';

export default function Outlets() {
  const [outlets, setOutlets] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const fetchOutlets = () => {
    const list = stateService.getOutlets();
    setOutlets(list);
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setAddress('');
    setCity('');
    setMobileNumber('');
    setGstNumber('');
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const openEdit = (o: any) => {
    setEditingId(o.id);
    setName(o.name);
    setAddress(o.address);
    setCity(o.city);
    setMobileNumber(o.mobileNumber);
    setGstNumber(o.gstNumber || '');
    setStatus(o.status || 'ACTIVE');
    setIsModalOpen(true);
  };

  const handleDelete = (o: any) => {
    Alert.alert(
      'Delete Outlet',
      `"${o.name}" ही branch delete करायची आहे का? हे operation permanent आहे.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            stateService.deleteOutlet(o.id);
            fetchOutlets();
          }
        }
      ]
    );
  };

  const handleSave = () => {
    if (!name || !address || !city || !mobileNumber) {
      Alert.alert('Required Fields', 'Please fill out all required fields.');
      return;
    }

    if (editingId !== null) {
      stateService.updateOutlet(editingId, {
        name,
        address,
        city,
        mobileNumber,
        gstNumber,
        status,
      });
    } else {
      stateService.addOutlet({
        name,
        address,
        city,
        mobileNumber,
        gstNumber,
        status: 'ACTIVE',
      });
    }

    fetchOutlets();
    setIsModalOpen(false);
  };

  const filteredOutlets = outlets.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <LayoutWrapper title="Outlet Branches">
      <View style={styles.mainContainer}>
        {/* Search Input */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBarWrapper}>
            <Icon name="search" color="#8c6e65" size={16} />
            <TextInput
              style={styles.searchBarInput}
              placeholder="Search outlets or cities..."
              placeholderTextColor="#8c6e65"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {/* Summary Bar */}
          <View style={styles.summaryBar}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{outlets.length}</Text>
              <Text style={styles.summaryLabel}>Total Branches</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#10b981' }]}>
                {outlets.filter(o => o.status !== 'INACTIVE').length}
              </Text>
              <Text style={styles.summaryLabel}>Active</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#9e8a84' }]}>
                {outlets.filter(o => o.status === 'INACTIVE').length}
              </Text>
              <Text style={styles.summaryLabel}>Inactive</Text>
            </View>
          </View>

          {/* Mock Map Card */}
          <View style={styles.mapCard}>
            <View style={styles.mapCanvas}>
              <View style={[styles.mapRoad, { transform: [{ rotate: '20deg' }], top: 40 }]} />
              <View style={[styles.mapRoad, { transform: [{ rotate: '-40deg' }], top: 100 }]} />
              <View style={[styles.mapRoadVertical, { transform: [{ rotate: '10deg' }], left: '30%' }]} />
              <View style={[styles.mapRoadVertical, { transform: [{ rotate: '70deg' }], left: '65%' }]} />

              {outlets.slice(0, 4).map((o, idx) => {
                const positions: any[] = [
                  { top: 25, left: '15%' },
                  { top: 75, left: '55%' },
                  { top: 110, left: '25%' },
                  { top: 50, left: '72%' },
                ];
                const pos = positions[idx] || { top: 60, left: '40%' };
                return (
                  <View key={o.id} style={[styles.mapPin, pos]}>
                    <Icon name="pin" color="#146e4e" size={18} />
                    <View style={styles.pinLabelBox}>
                      <Text style={styles.pinLabelText} numberOfLines={1}>{o.city}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Outlets Listing */}
          <View style={styles.listContainer}>
            {filteredOutlets.map((o) => (
              <View key={o.id} style={[styles.outletCard, o.status === 'INACTIVE' && styles.inactiveCard]}>
                {/* Card Top */}
                <View style={styles.cardTop}>
                  <View style={styles.cardIconWrap}>
                    <Icon name="outlet" color="#146e4e" size={22} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardTitle}>{o.name}</Text>
                      <View style={[
                        styles.statusBadge,
                        o.status === 'INACTIVE' ? styles.inactiveBadge : styles.activeBadge
                      ]}>
                        <Text style={[
                          styles.statusText,
                          o.status === 'INACTIVE' ? styles.inactiveText : styles.activeText
                        ]}>
                          {o.status === 'INACTIVE' ? 'Inactive' : 'Active'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.cardAddress}>{o.address}, {o.city}</Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                {/* Card Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.cardInfoRow}>
                    <View style={styles.cardInfoItem}>
                      <Icon name="phone" color="#8c6e65" size={12} />
                      <Text style={styles.cardPhone}>{o.mobileNumber}</Text>
                    </View>
                    {o.gstNumber ? (
                      <View style={styles.gstBadge}>
                        <Text style={styles.gstText}>GST: {o.gstNumber}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => openEdit(o)}
                    >
                      <Icon name="edit" color="#146e4e" size={13} />
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(o)}
                    >
                      <Icon name="delete" color="#0d4e37" size={13} />
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {filteredOutlets.length === 0 && (
              <View style={styles.emptyContainer}>
                <Icon name="outlet" color="#ebdcd3" size={48} />
                <Text style={styles.emptyText}>No outlets found.</Text>
                <Text style={styles.emptySubText}>Tap "+ Add Branch" to create your first outlet.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Add button */}
        <TouchableOpacity onPress={openAdd} style={styles.floatingButton}>
          <Text style={styles.floatingButtonText}>+ Add Branch</Text>
        </TouchableOpacity>
      </View>

      {/* Add / Edit Branch Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Edit Outlet Branch' : 'Add New Branch'}
            </Text>
            <View style={styles.modalDivider} />

            <ScrollView
              contentContainerStyle={styles.modalFormScroll}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.formLabel}>Outlet Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Palvi Hotel - Chennai"
                placeholderTextColor="#8c6e65"
              />

              <Text style={styles.formLabel}>Address *</Text>
              <TextInput
                style={styles.modalInput}
                value={address}
                onChangeText={setAddress}
                placeholder="e.g. T. Nagar"
                placeholderTextColor="#8c6e65"
              />

              <Text style={styles.formLabel}>City *</Text>
              <TextInput
                style={styles.modalInput}
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Chennai"
                placeholderTextColor="#8c6e65"
              />

              <Text style={styles.formLabel}>Contact Mobile *</Text>
              <TextInput
                style={styles.modalInput}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="e.g. +91 9999999999"
                placeholderTextColor="#8c6e65"
                keyboardType="phone-pad"
              />

              <Text style={styles.formLabel}>GST Number</Text>
              <TextInput
                style={styles.modalInput}
                value={gstNumber}
                onChangeText={setGstNumber}
                placeholder="e.g. GST27XXXXX1234A"
                placeholderTextColor="#8c6e65"
                autoCapitalize="characters"
              />

              {/* Status Toggle — only in edit mode */}
              {editingId !== null && (
                <>
                  <Text style={styles.formLabel}>Branch Status</Text>
                  <View style={styles.statusToggleRow}>
                    <TouchableOpacity
                      style={[styles.statusToggleBtn, status === 'ACTIVE' && styles.statusToggleActive]}
                      onPress={() => setStatus('ACTIVE')}
                    >
                      <Text style={[styles.statusToggleText, status === 'ACTIVE' && styles.statusToggleTextActive]}>
                        ✓ Active
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.statusToggleBtn, status === 'INACTIVE' && styles.statusToggleInactive]}
                      onPress={() => setStatus('INACTIVE')}
                    >
                      <Text style={[styles.statusToggleText, status === 'INACTIVE' && styles.statusToggleTextInactive]}>
                        ✕ Inactive
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>{editingId ? 'Save Changes' : 'Add Branch'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  searchBarContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#ebdcd3',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    height: 44,
  },
  searchBarInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 14,
    color: '#3d251e',
    paddingVertical: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },

  // Summary bar
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#ebdcd3',
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#146e4e',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8c6e65',
  },

  // Map
  mapCard: {
    height: 160,
    backgroundColor: '#eaf4ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
  },
  mapRoad: {
    position: 'absolute',
    width: '120%',
    height: 4,
    backgroundColor: '#ffffff',
    left: -20,
  },
  mapRoadVertical: {
    position: 'absolute',
    height: '120%',
    width: 4,
    backgroundColor: '#ffffff',
    top: -20,
  },
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinLabelBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#146e4e',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: -2,
    maxWidth: 80,
  },
  pinLabelText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#3d251e',
  },

  // Outlet cards
  listContainer: {
    gap: 14,
  },
  outletCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  inactiveCard: {
    opacity: 0.72,
    borderColor: '#d8d0cc',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3d251e',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#6ee7b7',
  },
  inactiveBadge: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  activeText: {
    color: '#059669',
  },
  inactiveText: {
    color: '#6b7280',
  },
  cardAddress: {
    fontSize: 12,
    color: '#8c6e65',
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
  },
  cardFooter: {
    padding: 14,
    paddingTop: 12,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardPhone: {
    fontSize: 12,
    color: '#8c6e65',
    fontWeight: '700',
  },
  gstBadge: {
    backgroundColor: '#a67c6d',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  gstText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Edit / Delete action row
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  editBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#146e4e',
  },
  deleteBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0d4e37',
  },

  // Empty state
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3d251e',
    marginTop: 8,
  },
  emptySubText: {
    fontSize: 12,
    color: '#8c6e65',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // FAB
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: '#146e4e',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#146e4e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  floatingButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(61, 37, 30, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    maxHeight: '92%',
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
    marginBottom: 20,
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
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#3d251e',
    marginBottom: 16,
  },

  // Status toggle
  statusToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statusToggleBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusToggleActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#6ee7b7',
  },
  statusToggleInactive: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
  },
  statusToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8c6e65',
  },
  statusToggleTextActive: {
    color: '#059669',
  },
  statusToggleTextInactive: {
    color: '#6b7280',
  },

  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
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
    height: 48,
    borderRadius: 24,
    backgroundColor: '#146e4e',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#146e4e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
