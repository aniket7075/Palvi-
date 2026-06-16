export const INITIAL_OUTLETS = [
  { id: 1, name: "Palvi Hotel - Pune", address: "Deccan Gymkhana", city: "Pune", mobileNumber: "+91 9876543210", gstNumber: "GST27AAAAA1111A1Z1" },
  { id: 2, name: "Palvi Hotel - Mumbai", address: "Andheri West", city: "Mumbai", mobileNumber: "+91 9876543211", gstNumber: "GST27BBBBB2222B2Z2" }
];

export const INITIAL_USERS = [
  { id: 1, email: "admin@gmail.com", fullName: "Palvi Admin", mobileNumber: "+91 9999999999", role: "ADMIN", password: "Admin@123", status: "ACTIVE", outletId: null },
  { id: 2, email: "manager@gmail.com", fullName: "Rahul Deshmukh", mobileNumber: "+91 8888888888", role: "MANAGER", password: "Manager@123", status: "ACTIVE", outletId: 1 }
];

export const INITIAL_STAFF = [
  { id: 1, employeeId: "EMP001", fullName: "Ramesh Kumar", mobileNumber: "+91 9111122222", role: "COOK", salary: 25000, joiningDate: "2026-01-10", status: "ACTIVE", outletId: 1 },
  { id: 2, employeeId: "EMP002", fullName: "Sunita Sharma", mobileNumber: "+91 9222233333", role: "WAITER", salary: 15000, joiningDate: "2026-02-15", status: "ACTIVE", outletId: 1 },
  { id: 3, employeeId: "EMP003", fullName: "Amit Patel", mobileNumber: "+91 9333344444", role: "CASHIER", salary: 18000, joiningDate: "2026-03-01", status: "ACTIVE", outletId: 1 },
  { id: 4, employeeId: "EMP004", fullName: "Vijay Yadav", mobileNumber: "+91 9444455555", role: "CLEANER", salary: 12000, joiningDate: "2026-03-12", status: "ACTIVE", outletId: 1 }
];

export const INITIAL_INVENTORY = [
  { id: 1, name: "Onion", quantity: 5.0, unit: "KG", purchasePrice: 30.0, minStock: 10.0, category: "Vegetables", outletId: 1 },
  { id: 2, name: "Tomato", quantity: 15.0, unit: "KG", purchasePrice: 40.0, minStock: 10.0, category: "Vegetables", outletId: 1 },
  { id: 3, name: "Potato", quantity: 30.0, unit: "KG", purchasePrice: 25.0, minStock: 15.0, category: "Vegetables", outletId: 1 },
  { id: 4, name: "Rice", quantity: 100.0, unit: "KG", purchasePrice: 50.0, minStock: 20.0, category: "Groceries", outletId: 1 },
  { id: 5, name: "Oil", quantity: 3.5, unit: "Liters", purchasePrice: 120.0, minStock: 5.0, category: "Groceries", outletId: 1 },
  { id: 6, name: "Milk", quantity: 25.0, unit: "Liters", purchasePrice: 60.0, minStock: 10.0, category: "Dairy", outletId: 1 },
  { id: 7, name: "Paneer", quantity: 8.0, unit: "KG", purchasePrice: 320.0, minStock: 5.0, category: "Dairy", outletId: 1 },
  { id: 8, name: "Butter", quantity: 12.0, unit: "KG", purchasePrice: 450.0, minStock: 10.0, category: "Dairy", outletId: 1 }
];

export const INITIAL_VENDORS = [
  { id: 1, name: "Fresh Veggies Wholesale", mobileNumber: "9876543210", whatsappNumber: "9876543210", address: "Market Yard, Pune" },
  { id: 2, name: "Standard Dairy Products", mobileNumber: "9999988888", whatsappNumber: "9999988888", address: "Kothrud, Pune" },
  { id: 3, name: "Laxmi Masala Bhandar", mobileNumber: "8888877777", whatsappNumber: "8888877777", address: "Camp, Pune" }
];

export const INITIAL_CHECKLISTS = [
  { id: 1, taskName: "Restaurant Opened", status: "PENDING", date: "2026-06-04", outletId: 1 },
  { id: 2, taskName: "Cleaning Completed", status: "PENDING", date: "2026-06-04", outletId: 1 },
  { id: 3, taskName: "Kitchen Checked", status: "PENDING", date: "2026-06-04", outletId: 1 },
  { id: 4, taskName: "Inventory Checked", status: "PENDING", date: "2026-06-04", outletId: 1 },
  { id: 5, taskName: "Cash Counter Verified", status: "PENDING", date: "2026-06-04", outletId: 1 },
  { id: 6, taskName: "Staff Attendance Verified", status: "PENDING", date: "2026-06-04", outletId: 1 },
  { id: 7, taskName: "Gas Checked", status: "PENDING", date: "2026-06-04", outletId: 1 }
];

export const INITIAL_PURCHASES = [
  { id: 1, vendorName: "Fresh Veggies Wholesale", itemName: "Tomato", quantity: 20, price: 40, totalAmount: 800, purchaseDate: "2026-06-03", outletId: 1 },
  { id: 2, vendorName: "Standard Dairy Products", itemName: "Milk", quantity: 50, price: 60, totalAmount: 3000, purchaseDate: "2026-06-04", outletId: 1 }
];

export const INITIAL_EXPENSES = [
  { id: 1, name: "Gas Refill", amount: 1200, description: "Kitchen cylinder refill", date: "2026-06-03", outletId: 1 },
  { id: 2, name: "Transport", amount: 350, description: "Vegetable transport fare", date: "2026-06-04", outletId: 1 }
];

export const INITIAL_SALES = [
  { id: 1, cash: 12000, upi: 18500, card: 4200, swiggy: 6500, zomato: 8200, online: 1500, date: "2026-06-03", outletId: 1 },
  { id: 2, cash: 15000, upi: 22000, card: 5000, swiggy: 7200, zomato: 9000, online: 2000, date: "2026-06-04", outletId: 1 }
];

export const INITIAL_REQUIREMENTS = [
  { id: 1, itemName: "Onion", quantity: 20, unit: "KG", date: "2026-06-05", outletId: 1 },
  { id: 2, itemName: "Tomato", quantity: 15, unit: "KG", date: "2026-06-05", outletId: 1 },
  { id: 3, itemName: "Rice", quantity: 10, unit: "KG", date: "2026-06-05", outletId: 1 }
];

export const INITIAL_CATEGORIES = [
  { id: 1, name: "Vegetables" },
  { id: 2, name: "Dairy" },
  { id: 3, name: "Groceries" },
  { id: 4, name: "Spices" },
  { id: 5, name: "Meat" },
  { id: 6, name: "Cleaning" },
  { id: 7, name: "Other" }
];
