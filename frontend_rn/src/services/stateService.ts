import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import {
  INITIAL_OUTLETS,
  INITIAL_USERS,
  INITIAL_STAFF,
  INITIAL_INVENTORY,
  INITIAL_VENDORS,
  INITIAL_CHECKLISTS,
  INITIAL_PURCHASES,
  INITIAL_EXPENSES,
  INITIAL_SALES,
  INITIAL_REQUIREMENTS,
  INITIAL_CATEGORIES
} from '../constants/mockData';

// Memory cache for state
let memoryState: Record<string, any> = {};
let isInitialized = false;

// Async initializer to load state from disk and sync from backend on startup
export const initializeState = async () => {
  if (isInitialized) return;

  const fallbacks: Record<string, any> = {
    palvi_outlets: INITIAL_OUTLETS,
    palvi_users: INITIAL_USERS,
    palvi_staff: INITIAL_STAFF,
    palvi_inventory: INITIAL_INVENTORY,
    palvi_vendors: INITIAL_VENDORS,
    palvi_checklists: INITIAL_CHECKLISTS,
    palvi_purchases: INITIAL_PURCHASES,
    palvi_expenses: INITIAL_EXPENSES,
    palvi_sales: INITIAL_SALES,
    palvi_requirements: INITIAL_REQUIREMENTS,
    palvi_categories: INITIAL_CATEGORIES,
    palvi_attendance: [],
    palvi_vendor_bills: [],
    palvi_godown_dispatches: [],
    palvi_vendor_groups: [
      { id: 1, name: "Morning", vendorIds: [] },
      { id: 2, name: "Evening", vendorIds: [] }
    ]
  };

  // Load from cache first
  for (const key of Object.keys(fallbacks)) {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val) {
        memoryState[key] = JSON.parse(val);
      } else {
        memoryState[key] = fallbacks[key];
        await AsyncStorage.setItem(key, JSON.stringify(fallbacks[key]));
      }
    } catch (e) {
      memoryState[key] = fallbacks[key];
    }
  }

  isInitialized = true;

  // Run background sync without blocking app load
  syncFromBackendAsync();
};

const syncFromBackendAsync = async () => {
  // Fetch fresh data from backend
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      console.log('Fetching fresh data from Spring Boot backend...');
      
      const [
        outletsRes,
        usersRes,
        staffRes,
        inventoryRes,
        vendorsRes,
        checklistsRes,
        purchasesRes,
        expensesRes,
        salesRes,
        requirementsRes,
        categoriesRes,
        vendorBillsRes,
        godownDispatchRes,
      ] = await Promise.all([
        api.get('/outlets').catch(() => null),
        api.get('/users').catch(() => null),
        api.get('/staff').catch(() => null),
        api.get('/inventory').catch(() => null),
        api.get('/vendors').catch(() => null),
        api.get('/checklists').catch(() => null),
        api.get('/purchases').catch(() => null),
        api.get('/expenses').catch(() => null),
        api.get('/sales').catch(() => null),
        api.get('/requirements').catch(() => null),
        api.get('/categories').catch(() => null),
        api.get('/vendor-bills').catch(() => null),
        api.get('/godown-dispatch').catch(() => null),
      ]);

      if (vendorBillsRes && vendorBillsRes.data) {
        memoryState.palvi_vendor_bills = vendorBillsRes.data;
        await AsyncStorage.setItem('palvi_vendor_bills', JSON.stringify(vendorBillsRes.data));
      }

      if (godownDispatchRes && godownDispatchRes.data) {
        memoryState.palvi_godown_dispatches = godownDispatchRes.data;
        await AsyncStorage.setItem('palvi_godown_dispatches', JSON.stringify(godownDispatchRes.data));
      }

      const vendorGroupRes = await api.get('/vendor-groups').catch(() => null);
      if (vendorGroupRes && vendorGroupRes.data) {
        memoryState.palvi_vendor_groups = vendorGroupRes.data;
        await AsyncStorage.setItem('palvi_vendor_groups', JSON.stringify(vendorGroupRes.data));
      }

      if (categoriesRes && categoriesRes.data) {
        const mapped = categoriesRes.data.map((c: any) => ({
          id: c.id,
          name: c.name
        }));
        memoryState.palvi_categories = mapped;
        await AsyncStorage.setItem('palvi_categories', JSON.stringify(mapped));
      }

      if (outletsRes && outletsRes.data) {
        const mapped = outletsRes.data.map((o: any) => ({
          id: o.id,
          name: o.outletName,
          address: o.address,
          city: o.city,
          mobileNumber: o.mobileNumber,
          gstNumber: o.gstNumber
        }));
        memoryState.palvi_outlets = mapped;
        await AsyncStorage.setItem('palvi_outlets', JSON.stringify(mapped));
      }

      if (usersRes && usersRes.data) {
        const mapped = usersRes.data.map((u: any) => ({
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          mobileNumber: u.mobileNumber,
          role: u.role,
          outletId: u.outletId
        }));
        memoryState.palvi_users = mapped;
        await AsyncStorage.setItem('palvi_users', JSON.stringify(mapped));
      }

      if (staffRes && staffRes.data) {
        const mapped = staffRes.data.map((s: any) => ({
          id: s.id,
          employeeId: s.employeeId,
          fullName: s.fullName,
          mobileNumber: s.mobileNumber,
          role: s.role,
          salary: s.salary,
          joiningDate: s.joiningDate,
          status: s.status,
          outletId: s.outletId
        }));
        memoryState.palvi_staff = mapped;
        await AsyncStorage.setItem('palvi_staff', JSON.stringify(mapped));
      }

      if (inventoryRes && inventoryRes.data) {
        const mapped = inventoryRes.data.map((i: any) => ({
          id: i.id,
          name: i.itemName,
          category: i.category,
          quantity: i.currentStock,
          unit: i.unit,
          purchasePrice: i.purchasePrice,
          minStock: i.minimumStock,
          outletId: 1
        }));
        memoryState.palvi_inventory = mapped;
        await AsyncStorage.setItem('palvi_inventory', JSON.stringify(mapped));
      }

      if (vendorsRes && vendorsRes.data) {
        const mapped = vendorsRes.data.map((v: any) => ({
          id: v.id,
          name: v.vendorName,
          mobileNumber: v.mobileNumber,
          whatsappNumber: v.whatsappNumber,
          address: v.address,
          productCategory: v.category,
          billingCycleDays: v.billingCycleDays
        }));
        memoryState.palvi_vendors = mapped;
        await AsyncStorage.setItem('palvi_vendors', JSON.stringify(mapped));
      }

      if (checklistsRes && checklistsRes.data) {
        const mapped = checklistsRes.data.map((c: any) => ({
          id: c.id,
          taskName: c.checklistName,
          status: c.completed ? 'COMPLETED' : 'PENDING',
          date: c.checklistDate,
          outletId: c.outletId
        }));
        memoryState.palvi_checklists = mapped;
        await AsyncStorage.setItem('palvi_checklists', JSON.stringify(mapped));
      }

      if (purchasesRes && purchasesRes.data) {
        const mapped = purchasesRes.data.map((p: any) => ({
          id: p.id,
          vendorName: p.vendorName,
          itemName: p.inventoryItemName,
          quantity: p.quantity,
          price: p.unitPrice,
          totalAmount: p.totalAmount,
          purchaseDate: p.purchaseDate ? p.purchaseDate.split('T')[0] : '',
          outletId: 1
        }));
        memoryState.palvi_purchases = mapped;
        await AsyncStorage.setItem('palvi_purchases', JSON.stringify(mapped));
      }

      if (expensesRes && expensesRes.data) {
        const mapped = expensesRes.data.map((e: any) => ({
          id: e.id,
          name: e.expenseName,
          amount: e.amount,
          description: e.description,
          date: e.expenseDate ? e.expenseDate.split('T')[0] : '',
          outletId: 1
        }));
        memoryState.palvi_expenses = mapped;
        await AsyncStorage.setItem('palvi_expenses', JSON.stringify(mapped));
      }

      if (salesRes && salesRes.data) {
        const mapped = salesRes.data.map((s: any) => ({
          id: s.id,
          cash: s.cashSale,
          upi: s.upiSale,
          card: s.cardSale,
          swiggy: s.swiggySale,
          zomato: s.zomatoSale,
          online: s.otherOnlineSale,
          date: s.saleDate,
          outletId: s.outletId
        }));
        memoryState.palvi_sales = mapped;
        await AsyncStorage.setItem('palvi_sales', JSON.stringify(mapped));
      }

      if (requirementsRes && requirementsRes.data) {
        const mapped = requirementsRes.data.map((r: any) => ({
          id: r.id,
          itemName: r.inventoryItemName,
          quantity: r.requiredQuantity,
          unit: r.inventoryUnit,
          date: r.requiredDate,
          outletId: 1
        }));
        memoryState.palvi_requirements = mapped;
        await AsyncStorage.setItem('palvi_requirements', JSON.stringify(mapped));
      }
    }
  } catch (err) {
    console.error('Failed to sync state from Spring Boot backend:', err);
  }
};

// Synchronous memory operations
const getStorageItem = (key: string, fallback: any) => {
  if (memoryState[key] !== undefined) {
    return memoryState[key];
  }
  return fallback;
};

const setStorageItem = (key: string, data: any) => {
  memoryState[key] = data;
  AsyncStorage.setItem(key, JSON.stringify(data)).catch(err => {
    console.error(`Failed to persist key ${key} to disk:`, err);
  });
};

const getPurchasesFromStorage = () => {
  const purchases = getStorageItem('palvi_purchases', INITIAL_PURCHASES);
  return purchases.map((p: any) => ({
    ...p,
    totalAmount: p.totalAmount !== undefined ? p.totalAmount : (p.quantity * p.price)
  }));
};

export const stateService = {
  // --- AUTH SERVICES ---
  login: (email: string, password: string) => {
    const users = getStorageItem('palvi_users', INITIAL_USERS);
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password.');
    }
    
    if (user.status && user.status !== 'ACTIVE') {
      throw new Error('User account is inactive.');
    }

    let outletName = '';
    if (user.outletId) {
      const outlets = getStorageItem('palvi_outlets', INITIAL_OUTLETS);
      const outlet = outlets.find((o: any) => o.id === user.outletId);
      if (outlet) outletName = outlet.name;
    }

    return {
      token: `mock-jwt-token-for-${user.id}-${Date.now()}`,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      outletId: user.outletId,
      outletName: outletName
    };
  },

  getCurrentUser: (email: string) => {
    const users = getStorageItem('palvi_users', INITIAL_USERS);
    return users.find((u: any) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  updateProfileMobile: (email: string, mobileNumber: string) => {
    const users = getStorageItem('palvi_users', INITIAL_USERS);
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    const updatedUsers = users.map((u: any) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, mobileNumber };
      }
      return u;
    });
    setStorageItem('palvi_users', updatedUsers);

    if (user && user.id) {
      api.put(`/users/${user.id}`, {
        fullName: user.fullName,
        email: user.email,
        mobileNumber: mobileNumber,
        role: user.role,
        outletId: user.outletId
      }).catch(err => console.error('Failed to update mobile on backend:', err));
    }
    return true;
  },

  changePassword: (email: string, oldPassword: string, newPassword: string) => {
    const users = getStorageItem('palvi_users', INITIAL_USERS);
    let matched = false;
    const updatedUsers = users.map((u: any) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        matched = true;
        return { ...u, password: newPassword };
      }
      return u;
    });
    if (!matched) throw new Error('User not found.');
    setStorageItem('palvi_users', updatedUsers);

    api.post('/auth/change-password', {
      oldPassword,
      newPassword
    }).catch(err => console.error('Failed to change password on backend:', err));

    return true;
  },

  // --- CATEGORY SERVICES ---
  getCategories: () => {
    return getStorageItem('palvi_categories', INITIAL_CATEGORIES);
  },

  addCategory: (name: string) => {
    const cats = getStorageItem('palvi_categories', INITIAL_CATEGORIES);
    const newCat = {
      id: Date.now(), // Temporary until backend syncs
      name
    };
    cats.push(newCat);
    setStorageItem('palvi_categories', cats);
    
    api.post('/categories', { name })
       .catch(err => console.error('Failed to create category on backend:', err));
    
    return newCat;
  },

  deleteCategory: (id: number) => {
    const cats = getStorageItem('palvi_categories', INITIAL_CATEGORIES);
    setStorageItem('palvi_categories', cats.filter((c: any) => c.id !== id));
    api.delete(`/categories/${id}`).catch(err => console.error('Failed to delete category on backend:', err));
    return true;
  },

  // --- VENDOR BILL SERVICES ---
  getVendorBills: () => {
    return getStorageItem('palvi_vendor_bills', []);
  },

  // --- OUTLET SERVICES ---
  getOutlets: () => {
    return getStorageItem('palvi_outlets', INITIAL_OUTLETS);
  },

  addOutlet: (outlet: any) => {
    const outlets = getStorageItem('palvi_outlets', INITIAL_OUTLETS);
    const newId = outlets.length > 0 ? Math.max(...outlets.map((o: any) => o.id)) + 1 : 1;
    const newOutlet = { ...outlet, id: newId };
    outlets.push(newOutlet);
    setStorageItem('palvi_outlets', outlets);

    api.post('/outlets', {
      outletName: outlet.name,
      address: outlet.address,
      city: outlet.city,
      mobileNumber: outlet.mobileNumber,
      gstNumber: outlet.gstNumber,
      status: 'ACTIVE'
    }).catch(err => console.error('Failed to create outlet on backend:', err));

    return newOutlet;
  },

  updateOutlet: (id: number, updates: any) => {
    const outlets = getStorageItem('palvi_outlets', INITIAL_OUTLETS);
    const updated = outlets.map((o: any) => o.id === id ? { ...o, ...updates } : o);
    setStorageItem('palvi_outlets', updated);
    const outlet = updated.find((o: any) => o.id === id);
    if (outlet) {
      api.put(`/outlets/${id}`, {
        outletName: outlet.name,
        address: outlet.address,
        city: outlet.city,
        mobileNumber: outlet.mobileNumber,
        gstNumber: outlet.gstNumber,
        status: outlet.status || 'ACTIVE'
      }).catch(err => console.error('Failed to update outlet on backend:', err));
    }
    return true;
  },

  deleteOutlet: (id: number) => {
    const outlets = getStorageItem('palvi_outlets', INITIAL_OUTLETS);
    setStorageItem('palvi_outlets', outlets.filter((o: any) => o.id !== id));
    api.delete(`/outlets/${id}`).catch(err => console.error('Failed to delete outlet on backend:', err));
    return true;
  },

  // --- MANAGER SERVICES ---
  getManagers: () => {
    const users = getStorageItem('palvi_users', INITIAL_USERS);
    const outlets = getStorageItem('palvi_outlets', INITIAL_OUTLETS);
    
    return users
      .filter((u: any) => u.role === 'MANAGER' || u.role === 'ADMIN')
      .map((m: any) => ({
        ...m,
        outlet: m.outletId ? outlets.find((o: any) => o.id === m.outletId) : null
      }));
  },

  addManager: (manager: any) => {
    const users = getStorageItem('palvi_users', INITIAL_USERS);
    const newId = users.length > 0 ? Math.max(...users.map((u: any) => u.id)) + 1 : 1;
    const newManager = {
      ...manager,
      id: newId,
      role: manager.role || 'MANAGER',
      status: 'ACTIVE'
    };
    users.push(newManager);
    setStorageItem('palvi_users', users);

    api.post('/users/register', {
      fullName: manager.fullName,
      email: manager.email,
      mobileNumber: manager.mobileNumber,
      password: manager.password,
      role: newManager.role,
      outletId: manager.outletId || null
    }).catch(err => console.error('Failed to create user on backend:', err));

    return newManager;
  },

  updateManager: (id: number, updates: any) => {
    const users = getStorageItem('palvi_users', INITIAL_USERS);
    const updated = users.map((u: any) => u.id === id ? { ...u, ...updates } : u);
    setStorageItem('palvi_users', updated);
    
    const user = updated.find((u: any) => u.id === id);
    if (user) {
      api.put(`/users/${id}`, {
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        outletId: user.outletId || null
      }).catch(err => console.error('Failed to update user on backend:', err));
    }
    return true;
  },

  deleteManager: (id: number) => {
    const users = getStorageItem('palvi_users', INITIAL_USERS);
    setStorageItem('palvi_users', users.filter((u: any) => u.id !== id));
    api.delete(`/users/${id}`).catch(err => console.error('Failed to delete manager on backend:', err));
    return true;
  },

  // --- STAFF SERVICES ---
  getStaff: (outletId?: any) => {
    const staff = getStorageItem('palvi_staff', INITIAL_STAFF);
    if (!outletId) return staff;
    return staff.filter((s: any) => s.outletId === parseInt(outletId));
  },

  addStaff: (employee: any) => {
    const staff = getStorageItem('palvi_staff', INITIAL_STAFF);
    const newId = staff.length > 0 ? Math.max(...staff.map((s: any) => s.id)) + 1 : 1;
    const newEmployee = {
      ...employee,
      id: newId,
      status: 'ACTIVE',
      joiningDate: new Date().toISOString().split('T')[0]
    };
    staff.push(newEmployee);
    setStorageItem('palvi_staff', staff);

    api.post('/staff', {
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      mobileNumber: employee.mobileNumber,
      role: employee.role,
      salary: employee.salary,
      joiningDate: newEmployee.joiningDate,
      status: 'ACTIVE',
      outletId: employee.outletId
    }).catch(err => console.error('Failed to create staff on backend:', err));

    return newEmployee;
  },

  updateStaff: (id: number, updates: any) => {
    const staff = getStorageItem('palvi_staff', INITIAL_STAFF);
    const updated = staff.map((s: any) => s.id === id ? { ...s, ...updates } : s);
    setStorageItem('palvi_staff', updated);
    const emp = updated.find((s: any) => s.id === id);
    if (emp) {
      api.put(`/staff/${id}`, {
        employeeId: emp.employeeId,
        fullName: emp.fullName,
        mobileNumber: emp.mobileNumber,
        role: emp.role,
        salary: emp.salary,
        joiningDate: emp.joiningDate,
        status: emp.status,
        outletId: emp.outletId
      }).catch(err => console.error('Failed to update staff on backend:', err));
    }
    return true;
  },

  deleteStaff: (id: number) => {
    const staff = getStorageItem('palvi_staff', INITIAL_STAFF);
    setStorageItem('palvi_staff', staff.filter((s: any) => s.id !== id));
    api.delete(`/staff/${id}`).catch(err => console.error('Failed to delete staff on backend:', err));
    return true;
  },

  // --- STAFF ADVANCE SERVICES ---
  getStaffAdvances: (staffId: number, currentMonthPrefix?: string) => {
    const advances = getStorageItem('palvi_staff_advances', []);
    return advances.filter((a: any) => {
      if (a.staffId !== staffId) return false;
      if (currentMonthPrefix && a.advanceDate && !a.advanceDate.startsWith(currentMonthPrefix)) return false;
      return true;
    });
  },

  addStaffAdvance: (advance: any) => {
    const advances = getStorageItem('palvi_staff_advances', []);
    const newAdvance = {
      id: Date.now(),
      staffId: advance.staffId,
      amount: advance.amount,
      advanceDate: advance.advanceDate || new Date().toISOString().split('T')[0],
      reason: advance.reason
    };
    advances.push(newAdvance);
    setStorageItem('palvi_staff_advances', advances);
    
    api.post('/staff-advances', newAdvance)
      .catch(err => console.error('Failed to create staff advance on backend:', err));
    
    return newAdvance;
  },

  // --- ATTENDANCE SERVICES ---
  getAttendance: (outletId: any, date: string) => {
    const attendanceLogs = getStorageItem('palvi_attendance', []);
    const staffList = getStorageItem('palvi_staff', INITIAL_STAFF).filter((s: any) => s.outletId === parseInt(outletId));
    
    return staffList.map((s: any) => {
      const log = attendanceLogs.find((a: any) => a.staffId === s.id && a.date === date);
      return {
        staffId: s.id,
        fullName: s.fullName,
        role: s.role,
        status: log ? log.status : 'NOT_MARKED'
      };
    });
  },

  saveAttendance: (attendanceRecords: any[]) => {
    let attendanceLogs = getStorageItem('palvi_attendance', []);
    
    attendanceRecords.forEach(record => {
      const existingIdx = attendanceLogs.findIndex(
        (a: any) => a.staffId === record.staffId && a.date === record.date
      );
      if (existingIdx > -1) {
        attendanceLogs[existingIdx].status = record.status;
      } else {
        attendanceLogs.push({
          id: attendanceLogs.length + 1,
          staffId: record.staffId,
          status: record.status,
          date: record.date
        });
      }

      api.post('/attendance', {
        staffId: record.staffId,
        date: record.date,
        attendanceStatus: record.status
      }).catch(err => console.error('Failed to save attendance record on backend:', err));
    });

    setStorageItem('palvi_attendance', attendanceLogs);
    return true;
  },

  // VENDOR GROUPS
  getVendorGroups: () => {
    return memoryState.palvi_vendor_groups || [];
  },

  addVendorGroup: (group: any) => {
    const newGroup = { ...group, id: Date.now() };
    const groups = stateService.getVendorGroups();
    const updated = [...groups, newGroup];
    memoryState.palvi_vendor_groups = updated;
    AsyncStorage.setItem('palvi_vendor_groups', JSON.stringify(updated));
    return newGroup;
  },

  updateVendorGroup: (id: number, updates: any) => {
    const groups = stateService.getVendorGroups();
    const updated = groups.map((g: any) => g.id === id ? { ...g, ...updates } : g);
    memoryState.palvi_vendor_groups = updated;
    AsyncStorage.setItem('palvi_vendor_groups', JSON.stringify(updated));
  },

  deleteVendorGroup: (id: number) => {
    const groups = stateService.getVendorGroups();
    const updated = groups.filter((g: any) => g.id !== id);
    memoryState.palvi_vendor_groups = updated;
    AsyncStorage.setItem('palvi_vendor_groups', JSON.stringify(updated));
  },

  assignVendorToGroups: (vendorId: number, groupIds: number[]) => {
    const groups = stateService.getVendorGroups();
    const updatedGroups = groups.map((g: any) => {
      let vIds = g.vendorIds || [];
      // Remove vendor from group if not in groupIds, add if in groupIds
      if (groupIds.includes(g.id)) {
        if (!vIds.includes(vendorId)) vIds.push(vendorId);
      } else {
        vIds = vIds.filter((id: number) => id !== vendorId);
      }
      return { ...g, vendorIds: vIds };
    });
    memoryState.palvi_vendor_groups = updatedGroups;
    AsyncStorage.setItem('palvi_vendor_groups', JSON.stringify(updatedGroups));
  },

  // ----------------------------------------------------
  // --- DAILY CHECKLIST SERVICES ---
  getChecklist: (outletId: any, date: string) => {
    const checklists = getStorageItem('palvi_checklists', INITIAL_CHECKLISTS);
    let filtered = checklists.filter((c: any) => c.outletId === parseInt(outletId) && c.date === date);
    
    if (filtered.length === 0) {
      const outletChecklists = checklists.filter((c: any) => c.outletId === parseInt(outletId) && c.date < date);
      let templateTasks = [
        { taskName: "Restaurant Opened", timeRange: "OPENING" },
        { taskName: "Cleaning Completed", timeRange: "OPENING" },
        { taskName: "Kitchen Checked", timeRange: "OPENING" },
        { taskName: "Cash Counter Verified", timeRange: "OPENING" },
        { taskName: "Day Summary Report", timeRange: "CLOSING" },
        { taskName: "Kitchen Cleaned", timeRange: "CLOSING" },
        { taskName: "Lights Off", timeRange: "CLOSING" },
        { taskName: "Doors Locked", timeRange: "CLOSING" }
      ];
      
      if (outletChecklists.length > 0) {
        outletChecklists.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const mostRecentDate = outletChecklists[0].date;
        const recentTasks = outletChecklists.filter((c: any) => c.date === mostRecentDate);
        if (recentTasks.length > 0) {
          templateTasks = recentTasks.map((c: any) => ({
            taskName: c.taskName,
            timeRange: c.timeRange || 'OPENING'
          }));
        }
      }
      
      const newChecklists = templateTasks.map((task, idx) => {
        const item = {
          id: checklists.length + idx + 1,
          taskName: task.taskName,
          timeRange: task.timeRange,
          status: 'PENDING',
          date,
          outletId: parseInt(outletId)
        };
        
        api.post('/checklists', {
          checklistName: task.taskName,
          completed: false,
          checklistDate: date,
          timeRange: task.timeRange,
          outletId: parseInt(outletId)
        }).catch(err => console.error('Failed to seed checklist item on backend:', err));

        return item;
      });

      const updatedChecklists = [...checklists, ...newChecklists];
      setStorageItem('palvi_checklists', updatedChecklists);
      return newChecklists;
    }
    
    return filtered.map((c: any) => ({ ...c, timeRange: c.timeRange || 'OPENING' }));
  },

  toggleChecklistItem: (id: number, status: string) => {
    const checklists = getStorageItem('palvi_checklists', INITIAL_CHECKLISTS);
    const updated = checklists.map((c: any) => {
      if (c.id === id) {
        return { ...c, status };
      }
      return c;
    });
    setStorageItem('palvi_checklists', updated);

    api.put(`/checklists/${id}/toggle`).catch(() => {
      const item = checklists.find((c: any) => c.id === id);
      if (item) {
        api.put(`/checklists/${id}`, {
          checklistName: item.taskName,
          completed: status === 'COMPLETED',
          checklistDate: item.date,
          timeRange: item.timeRange,
          outletId: item.outletId
        }).catch(e => console.error('Failed to update checklist item status on backend:', e));
      }
    });

    return true;
  },

  addChecklistItem: (outletId: any, date: string, taskName: string, timeRange: string) => {
    const checklists = getStorageItem('palvi_checklists', INITIAL_CHECKLISTS);
    const newId = checklists.length > 0 ? Math.max(...checklists.map((c: any) => c.id)) + 1 : 1;
    const newItem = {
      id: newId,
      taskName,
      status: 'PENDING',
      date,
      timeRange,
      outletId: parseInt(outletId)
    };
    checklists.push(newItem);
    setStorageItem('palvi_checklists', checklists);

    api.post('/checklists', {
      checklistName: taskName,
      completed: false,
      checklistDate: date,
      timeRange,
      outletId: parseInt(outletId)
    }).catch(err => console.error('Failed to add checklist item on backend:', err));

    return newItem;
  },

  deleteChecklistItem: (id: number) => {
    const checklists = getStorageItem('palvi_checklists', INITIAL_CHECKLISTS);
    setStorageItem('palvi_checklists', checklists.filter((c: any) => c.id !== id));
    api.delete(`/checklists/${id}`).catch(err => console.error('Failed to delete checklist item on backend:', err));
    return true;
  },

  // --- INVENTORY SERVICES ---
  getInventory: (outletId?: any) => {
    const inventory = getStorageItem('palvi_inventory', INITIAL_INVENTORY);
    if (!outletId) return inventory;
    return inventory.filter((i: any) => i.outletId === parseInt(outletId));
  },

  addInventoryItem: (outletId: any, item: any) => {
    const inventory = getStorageItem('palvi_inventory', INITIAL_INVENTORY);
    const newId = inventory.length > 0 ? Math.max(...inventory.map((i: any) => i.id)) + 1 : 1;
    const newItem = { ...item, id: newId, outletId: parseInt(outletId) };
    inventory.push(newItem);
    setStorageItem('palvi_inventory', inventory);

    api.post('/inventory', {
      itemName: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      purchasePrice: item.purchasePrice,
      currentStock: item.quantity,
      minimumStock: item.minStock
    }).catch(err => console.error('Failed to create inventory item on backend:', err));

    return newItem;
  },

  updateInventoryItem: (id: number, updates: any) => {
    const inventory = getStorageItem('palvi_inventory', INITIAL_INVENTORY);
    const updated = inventory.map((i: any) => i.id === id ? { ...i, ...updates } : i);
    setStorageItem('palvi_inventory', updated);
    const item = updated.find((i: any) => i.id === id);
    if (item) {
      api.put(`/inventory/${id}`, {
        itemName: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        purchasePrice: item.purchasePrice,
        currentStock: item.quantity,
        minimumStock: item.minStock
      }).catch(err => console.error('Failed to update inventory item on backend:', err));
    }
    return true;
  },

  deleteInventoryItem: (id: number) => {
    const inventory = getStorageItem('palvi_inventory', INITIAL_INVENTORY);
    setStorageItem('palvi_inventory', inventory.filter((i: any) => i.id !== id));
    api.delete(`/inventory/${id}`).catch(err => console.error('Failed to delete inventory item on backend:', err));
    return true;
  },

  updateInventoryQuantity: (itemId: number, quantityChange: number) => {
    const inventory = getStorageItem('palvi_inventory', INITIAL_INVENTORY);
    let updatedItem: any = null;
    const updated = inventory.map((item: any) => {
      if (item.id === itemId) {
        const nextQty = Math.max(0, item.quantity + quantityChange);
        updatedItem = { ...item, quantity: parseFloat(nextQty.toFixed(2)) };
        return updatedItem;
      }
      return item;
    });
    setStorageItem('palvi_inventory', updated);

    if (updatedItem) {
      api.put(`/inventory/${itemId}`, {
        itemName: updatedItem.name,
        category: updatedItem.category,
        quantity: updatedItem.quantity,
        unit: updatedItem.unit,
        purchasePrice: updatedItem.purchasePrice,
        currentStock: updatedItem.quantity,
        minimumStock: updatedItem.minStock
      }).catch(err => console.error('Failed to update inventory quantity on backend:', err));
    }
  },

  // --- VENDORS SERVICES ---
  getVendors: () => {
    return getStorageItem('palvi_vendors', INITIAL_VENDORS);
  },

  addVendor: (vendor: any) => {
    const vendors = getStorageItem('palvi_vendors', INITIAL_VENDORS);
    const newId = vendors.length > 0 ? Math.max(...vendors.map((v: any) => v.id)) + 1 : 1;
    const newVendor = { ...vendor, id: newId };
    vendors.push(newVendor);
    setStorageItem('palvi_vendors', vendors);

    const apiPayload = {
      vendorName: vendor.name,
      mobileNumber: vendor.mobileNumber,
      whatsappNumber: vendor.whatsappNumber,
      address: vendor.address,
      category: vendor.productCategory,
      billingCycleDays: vendor.billingCycleDays || 10
    };
    api.post('/vendors', apiPayload).catch(err => console.error('Failed to create vendor on backend:', err));
    return newVendor;
  },

  // --- PURCHASES SERVICES ---
  getPurchases: (outletId?: any) => {
    const purchases = getPurchasesFromStorage();
    if (!outletId) return purchases;
    return purchases.filter((p: any) => p.outletId === parseInt(outletId));
  },

  addPurchase: (outletId: any, purchase: any) => {
    const purchases = getStorageItem('palvi_purchases', INITIAL_PURCHASES);
    const vendors = getStorageItem('palvi_vendors', INITIAL_VENDORS);
    
    const vendor = vendors.find((v: any) => v.id === parseInt(purchase.vendorId));
    const vendorName = vendor ? vendor.name : 'Unknown Vendor';

    const newId = purchases.length > 0 ? Math.max(...purchases.map((p: any) => p.id)) + 1 : 1;
    const totalAmount = parseFloat((purchase.quantity * purchase.price).toFixed(2));

    const newPurchase = {
      id: newId,
      vendorName,
      itemName: purchase.itemName,
      quantity: purchase.quantity,
      price: purchase.price,
      totalAmount,
      invoiceNumber: purchase.invoiceNumber,
      purchaseDate: new Date().toISOString().split('T')[0],
      outletId: parseInt(outletId)
    };

    purchases.push(newPurchase);
    setStorageItem('palvi_purchases', purchases);

    // Update inventory quantity
    const inventory = getStorageItem('palvi_inventory', INITIAL_INVENTORY);
    const matchedItem = inventory.find((i: any) => 
      i.name.toLowerCase() === purchase.itemName.toLowerCase()
    );

    let inventoryItemId = matchedItem ? matchedItem.id : 1;

    if (matchedItem) {
      stateService.updateInventoryQuantity(matchedItem.id, purchase.quantity);
    } else {
      const newItem = stateService.addInventoryItem(outletId, {
        name: purchase.itemName,
        category: 'Groceries',
        quantity: purchase.quantity,
        unit: 'Units',
        purchasePrice: purchase.price,
        minStock: 5.0
      });
      inventoryItemId = newItem.id;
    }

    api.post('/purchases', {
      vendorId: parseInt(purchase.vendorId),
      inventoryItemId,
      quantity: purchase.quantity,
      unitPrice: purchase.price,
      totalAmount
    }).catch(err => console.error('Failed to create purchase record on backend:', err));

    return newPurchase;
  },

  updatePurchase: (id: number, updates: any) => {
    const purchases = getStorageItem('palvi_purchases', INITIAL_PURCHASES);
    const updated = purchases.map((p: any) => p.id === id ? { ...p, ...updates } : p);
    setStorageItem('palvi_purchases', updated);
    
    const purchase = updated.find((p: any) => p.id === id);
    if (purchase) {
      // Recalculate total amount if quantity or price changed
      if (updates.quantity !== undefined || updates.price !== undefined) {
        purchase.totalAmount = parseFloat((purchase.quantity * purchase.price).toFixed(2));
      }
      
      const vendors = getStorageItem('palvi_vendors', INITIAL_VENDORS);
      const vendor = vendors.find((v: any) => v.name === purchase.vendorName);
      
      const inventory = getStorageItem('palvi_inventory', INITIAL_INVENTORY);
      const matchedItem = inventory.find((i: any) => i.name.toLowerCase() === purchase.itemName.toLowerCase());
      
      api.put(`/purchases/${id}`, {
        vendorId: vendor ? vendor.id : 1,
        inventoryItemId: matchedItem ? matchedItem.id : 1,
        quantity: purchase.quantity,
        unitPrice: purchase.price,
        totalAmount: purchase.totalAmount
      }).catch(err => console.error('Failed to update purchase on backend:', err));
    }
    return true;
  },

  deletePurchase: (id: number) => {
    const purchases = getStorageItem('palvi_purchases', INITIAL_PURCHASES);
    setStorageItem('palvi_purchases', purchases.filter((p: any) => p.id !== id));
    api.delete(`/purchases/${id}`).catch(err => console.error('Failed to delete purchase on backend:', err));
    return true;
  },

  // --- EXPENSES SERVICES ---
  getExpenses: (outletId?: any) => {
    const expenses = getStorageItem('palvi_expenses', INITIAL_EXPENSES);
    if (!outletId) return expenses;
    return expenses.filter((e: any) => e.outletId === parseInt(outletId));
  },

  addExpense: (outletId: any, expense: any) => {
    const expenses = getStorageItem('palvi_expenses', INITIAL_EXPENSES);
    const newId = expenses.length > 0 ? Math.max(...expenses.map((e: any) => e.id)) + 1 : 1;
    
    const newExpense = {
      ...expense,
      id: newId,
      date: new Date().toISOString().split('T')[0],
      outletId: parseInt(outletId)
    };
    
    expenses.push(newExpense);
    setStorageItem('palvi_expenses', expenses);

    api.post('/expenses', {
      expenseName: expense.name,
      amount: expense.amount,
      description: expense.description
    }).catch(err => console.error('Failed to create expense record on backend:', err));

    return newExpense;
  },

  // --- SALES SERVICES ---
  getSales: (outletId?: any) => {
    const sales = getStorageItem('palvi_sales', INITIAL_SALES);
    if (!outletId) return sales;
    return sales.filter((s: any) => s.outletId === parseInt(outletId));
  },

  addSale: (outletId: any, sale: any) => {
    const sales = getStorageItem('palvi_sales', INITIAL_SALES);
    const dateToday = new Date().toISOString().split('T')[0];

    const existingIdx = sales.findIndex((s: any) => s.outletId === parseInt(outletId) && s.date === dateToday);
    
    const newSale = {
      ...sale,
      date: dateToday,
      outletId: parseInt(outletId)
    };

    if (existingIdx > -1) {
      sales[existingIdx] = { ...sales[existingIdx], ...newSale };
      newSale.id = sales[existingIdx].id;
    } else {
      newSale.id = sales.length > 0 ? Math.max(...sales.map((s: any) => s.id)) + 1 : 1;
      sales.unshift(newSale);
    }

    setStorageItem('palvi_sales', sales);

    const totalSale = (sale.cash || 0) + (sale.upi || 0) + (sale.card || 0) + (sale.swiggy || 0) + (sale.zomato || 0) + (sale.online || 0) - (sale.complimentary || 0);

    api.post('/sales', {
      outletId: parseInt(outletId),
      saleDate: newSale.date,
      cashSale: sale.cash,
      upiSale: sale.upi,
      cardSale: sale.card,
      swiggySale: sale.swiggy,
      zomatoSale: sale.zomato,
      otherOnlineSale: sale.online,
      complimentarySale: sale.complimentary,
      totalSale
    }).catch(err => console.error('Failed to create sales record on backend:', err));

    return newSale;
  },

  // --- REQUIREMENTS SERVICES ---
  getRequirements: (outletId?: any) => {
    const requirements = getStorageItem('palvi_requirements', INITIAL_REQUIREMENTS);
    if (!outletId) return requirements;
    return requirements.filter((r: any) => r.outletId === parseInt(outletId));
  },

  addRequirement: (outletId: any, requirement: any) => {
    const reqs = getStorageItem('palvi_requirements', INITIAL_REQUIREMENTS);
    const newId = reqs.length > 0 ? Math.max(...reqs.map((r: any) => r.id)) + 1 : 1;
    
    const newReq = {
      id: newId,
      itemName: requirement.itemName,
      quantity: requirement.quantity,
      unit: requirement.unit,
      date: new Date().toISOString().split('T')[0],
      outletId: parseInt(outletId)
    };

    reqs.push(newReq);
    setStorageItem('palvi_requirements', reqs);

    const inventory = getStorageItem('palvi_inventory', INITIAL_INVENTORY);
    const matchedItem = inventory.find((i: any) => i.name.toLowerCase() === requirement.itemName.toLowerCase());
    const inventoryItemId = matchedItem ? matchedItem.id : 1;

    api.post('/requirements', {
      inventoryItemId,
      requiredQuantity: requirement.quantity,
      requiredDate: newReq.date
    }).catch(err => console.error('Failed to create daily requirement record on backend:', err));

    return newReq;
  },

  updateRequirement: (id: number, updates: any) => {
    const reqs = getStorageItem('palvi_requirements', INITIAL_REQUIREMENTS);
    const updated = reqs.map((r: any) => r.id === id ? { ...r, ...updates } : r);
    setStorageItem('palvi_requirements', updated);
    
    const req = updated.find((r: any) => r.id === id);
    if (req) {
      const inventory = getStorageItem('palvi_inventory', INITIAL_INVENTORY);
      const matchedItem = inventory.find((i: any) => i.name.toLowerCase() === req.itemName.toLowerCase());
      const inventoryItemId = matchedItem ? matchedItem.id : 1;
      
      api.put(`/requirements/${id}`, {
        inventoryItemId,
        requiredQuantity: req.quantity,
        requiredDate: req.date
      }).catch(err => console.error('Failed to update requirement on backend:', err));
    }
    return true;
  },

  deleteRequirement: (id: number) => {
    const reqs = getStorageItem('palvi_requirements', INITIAL_REQUIREMENTS);
    setStorageItem('palvi_requirements', reqs.filter((r: any) => r.id !== id));
    api.delete(`/requirements/${id}`).catch(err => console.error('Failed to delete requirement on backend:', err));
    return true;
  },

  clearRequirements: (outletId: any) => {
    const reqs = getStorageItem('palvi_requirements', INITIAL_REQUIREMENTS);
    const updated = reqs.filter((r: any) => r.outletId !== parseInt(outletId));
    setStorageItem('palvi_requirements', updated);

    api.delete('/requirements').catch(err => console.error('Failed to clear requirements on backend:', err));
    return true;
  },

  // --- INTEGRATED METRICS SERVICES FOR DASHBOARD ---
  getAdminDashboardMetrics: () => {
    const outlets = getStorageItem('palvi_outlets', INITIAL_OUTLETS);
    const users = getStorageItem('palvi_users', INITIAL_USERS);
    const staff = getStorageItem('palvi_staff', INITIAL_STAFF);
    const sales = getStorageItem('palvi_sales', INITIAL_SALES);
    const purchases = getPurchasesFromStorage();
    const expenses = getStorageItem('palvi_expenses', INITIAL_EXPENSES);
    const inventory = getStorageItem('palvi_inventory', INITIAL_INVENTORY);

    const totalSales = sales.reduce((acc: number, curr: any) => 
      acc + (curr.cash || 0) + (curr.upi || 0) + (curr.card || 0) + (curr.swiggy || 0) + (curr.zomato || 0) + (curr.online || 0), 0
    );

    const totalPurchases = purchases.reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0);
    const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
    
    const totalInventoryValue = inventory.reduce((acc: number, curr: any) => acc + ((curr.quantity || 0) * (curr.purchasePrice || 0)), 0);
    const lowStockAlerts = inventory.filter((item: any) => item.quantity <= item.minStock).length;

    return {
      totalOutlets: outlets.length,
      totalManagers: users.filter((u: any) => u.role === 'MANAGER').length,
      totalStaff: staff.length,
      totalSales,
      totalPurchases,
      totalExpenses,
      totalInventoryValue,
      lowStockAlerts
    };
  },

  getOutletDashboardMetrics: (outletId: any) => {
    const sales = getStorageItem('palvi_sales', INITIAL_SALES).filter((s: any) => s.outletId === parseInt(outletId));
    const purchases = getPurchasesFromStorage().filter((p: any) => p.outletId === parseInt(outletId));
    const expenses = getStorageItem('palvi_expenses', INITIAL_EXPENSES).filter((e: any) => e.outletId === parseInt(outletId));
    const inventory = getStorageItem('palvi_inventory', INITIAL_INVENTORY).filter((i: any) => i.outletId === parseInt(outletId));
    const checklists = getStorageItem('palvi_checklists', INITIAL_CHECKLISTS).filter((c: any) => c.outletId === parseInt(outletId));

    const dateToday = new Date().toISOString().split('T')[0];
    
    const todaySalesData = sales.find((s: any) => s.date === dateToday);
    const todaySales = todaySalesData ? 
      ((todaySalesData.cash || 0) + (todaySalesData.upi || 0) + (todaySalesData.card || 0) + (todaySalesData.swiggy || 0) + (todaySalesData.zomato || 0) + (todaySalesData.online || 0)) 
      : 0;

    const pendingChecklist = checklists.filter((c: any) => c.date === dateToday && c.status === 'PENDING').length;
    
    const totalPurchases = purchases.reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0);
    const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
    const lowStockAlerts = inventory.filter((item: any) => item.quantity <= item.minStock).length;

    return {
      todaySales,
      pendingChecklist,
      totalPurchases,
      totalExpenses,
      lowStockAlerts
    };
  },

  // --- GODOWN DISPATCH SERVICES ---
  getGodownDispatches: (outletId?: any) => {
    const dispatches = getStorageItem('palvi_godown_dispatches', []);
    if (!outletId) return dispatches;
    return dispatches.filter((d: any) => d.targetOutletId === parseInt(outletId));
  },

  addGodownDispatch: (dispatchReq: any) => {
    const dispatches = getStorageItem('palvi_godown_dispatches', []);
    
    // Attempt backend first to get proper response
    api.post('/godown-dispatch', dispatchReq)
      .then(res => {
        const newDispatch = res.data;
        dispatches.push(newDispatch);
        setStorageItem('palvi_godown_dispatches', dispatches);
      })
      .catch(err => {
        console.error('Failed to create dispatch on backend, saving locally fallback', err);
        const newId = dispatches.length > 0 ? Math.max(...dispatches.map((d: any) => d.id)) + 1 : 1;
        const newDispatch = {
          id: newId,
          ...dispatchReq,
          status: 'DISPATCHED',
          dispatchDate: new Date().toISOString()
        };
        dispatches.push(newDispatch);
        setStorageItem('palvi_godown_dispatches', dispatches);
      });
  },

  markDispatchReceived: (dispatchId: number) => {
    const dispatches = getStorageItem('palvi_godown_dispatches', []);
    const updated = dispatches.map((d: any) => {
      if (d.id === dispatchId) {
        return { ...d, status: 'RECEIVED', receivedDate: new Date().toISOString() };
      }
      return d;
    });
    setStorageItem('palvi_godown_dispatches', updated);

    api.put(`/godown-dispatch/${dispatchId}/received`)
       .catch(err => console.error('Failed to update dispatch status on backend', err));
  }
};
