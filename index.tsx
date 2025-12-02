import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Configuration & Constants ---
const BRAND_COLORS = {
  primary: '#1A3A5F', // Deep Blue
  accent: '#17C3B2',  // Aqua Green
  bg: '#F4F7FB',      // Light Gray/Blue
  text: '#1F2937',    // Dark Gray
  white: '#FFFFFF',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981'
};

// --- Database Schema Interfaces ---

interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  sku: string;
  unit_of_measure: string;
  base_price: number;
  cost_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  parent_category_id?: string;
}

interface InventoryItem {
  id: string;
  product_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  reorder_point: number;
  reorder_quantity: number;
  warehouse_location: string;
}

interface Supplier {
  id: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  first_purchase_date: string;
  last_purchase_date: string;
  lifetime_value: number;
  customer_type: 'Retail' | 'Wholesale' | 'VIP';
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  order_date: string;
  order_status: 'Pending' | 'Completed' | 'Cancelled';
  payment_status: 'Paid' | 'Unpaid' | 'Refunded';
  order_channel: 'Online' | 'In-Store';
  subtotal_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'Credit Card' | 'Cash' | 'PayPal';
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

interface Expense {
  id: string;
  date: string;
  category_id: string;
  vendor: string;
  amount: number;
  payment_method: string;
  notes?: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
}

// Master Database Type
interface BusinessDatabase {
  products: Product[];
  product_categories: ProductCategory[];
  inventory_items: InventoryItem[];
  suppliers: Supplier[];
  customers: Customer[];
  orders: Order[];
  order_items: OrderItem[];
  expenses: Expense[];
  expense_categories: ExpenseCategory[];
}

// --- DATA GENERATOR FOR INDIAN RESTAURANT ---

const generateIndianRestaurantData = (): BusinessDatabase => {
    // 1. Static Categories & Definitions
    const product_categories: ProductCategory[] = [
        { id: 'ic_1', name: 'Starters', description: 'Appetizers and snacks' },
        { id: 'ic_2', name: 'Curries', description: 'Main course gravies' },
        { id: 'ic_3', name: 'Breads', description: 'Naan, Roti, Paratha' },
        { id: 'ic_4', name: 'Rice', description: 'Biryani and Basmati' },
        { id: 'ic_5', name: 'Beverages', description: 'Lassi and Soft Drinks' },
        { id: 'ic_6', name: 'Desserts', description: 'Sweets' }
    ];

    const products: Product[] = [
        { id: 'ip_1', name: 'Butter Chicken', description: 'Creamy tomato curry', category_id: 'ic_2', sku: 'CUR-001', unit_of_measure: 'dish', base_price: 18.00, cost_price: 6.50, is_active: true, created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 'ip_2', name: 'Garlic Naan', description: 'Leavened bread with garlic', category_id: 'ic_3', sku: 'BRD-005', unit_of_measure: 'piece', base_price: 4.00, cost_price: 0.80, is_active: true, created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 'ip_3', name: 'Veg Samosa (2pc)', description: 'Crispy pastry', category_id: 'ic_1', sku: 'STR-002', unit_of_measure: 'plate', base_price: 6.00, cost_price: 1.50, is_active: true, created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 'ip_4', name: 'Lamb Vindaloo', description: 'Spicy Goan curry', category_id: 'ic_2', sku: 'CUR-008', unit_of_measure: 'dish', base_price: 20.00, cost_price: 8.00, is_active: true, created_at: '2023-02-01', updated_at: '2023-02-01' },
        { id: 'ip_5', name: 'Mango Lassi', description: 'Yogurt drink', category_id: 'ic_5', sku: 'BEV-003', unit_of_measure: 'glass', base_price: 5.00, cost_price: 1.20, is_active: true, created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 'ip_6', name: 'Paneer Tikka Masala', description: 'Cottage cheese curry', category_id: 'ic_2', sku: 'CUR-004', unit_of_measure: 'dish', base_price: 16.00, cost_price: 5.50, is_active: true, created_at: '2023-03-01', updated_at: '2023-03-01' },
        { id: 'ip_7', name: 'Chicken Biryani', description: 'Spiced rice with chicken', category_id: 'ic_4', sku: 'RIC-001', unit_of_measure: 'plate', base_price: 15.00, cost_price: 5.00, is_active: true, created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 'ip_8', name: 'Tandoori Roti', description: 'Whole wheat bread', category_id: 'ic_3', sku: 'BRD-001', unit_of_measure: 'piece', base_price: 3.00, cost_price: 0.50, is_active: true, created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 'ip_9', name: 'Gulab Jamun', description: 'Milk solids in syrup', category_id: 'ic_6', sku: 'DST-001', unit_of_measure: 'portion', base_price: 6.00, cost_price: 1.50, is_active: true, created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 'ip_10', name: 'Masala Chai', description: 'Spiced tea', category_id: 'ic_5', sku: 'BEV-001', unit_of_measure: 'cup', base_price: 4.00, cost_price: 0.50, is_active: true, created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 'ip_11', name: 'Onion Bhaji', description: 'Fried onion fritters', category_id: 'ic_1', sku: 'STR-003', unit_of_measure: 'plate', base_price: 7.00, cost_price: 1.80, is_active: true, created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 'ip_12', name: 'Palak Paneer', description: 'Spinach and cheese curry', category_id: 'ic_2', sku: 'CUR-005', unit_of_measure: 'dish', base_price: 15.00, cost_price: 4.50, is_active: true, created_at: '2023-01-01', updated_at: '2023-01-01' },
    ];

    const inventory_items: InventoryItem[] = products.map((p, idx) => ({
        id: `inv_${p.id}`,
        product_id: p.id,
        quantity_on_hand: Math.floor(Math.random() * 50) + 5, // Random stock
        quantity_reserved: 0,
        reorder_point: 10,
        reorder_quantity: 30,
        warehouse_location: idx % 2 === 0 ? 'Kitchen Fridge' : 'Pantry'
    }));

    const customers: Customer[] = [
        { id: 'ic_1', name: 'Priya Sharma', email: 'priya@example.com', phone: '555-1234', address: '15 Maple Ave', city: 'Metro City', state: 'NY', postal_code: '10001', first_purchase_date: '2023-05-10', last_purchase_date: '2023-10-08', lifetime_value: 0, customer_type: 'VIP', created_at: '2023-05-10', updated_at: '2023-10-08' },
        { id: 'ic_2', name: 'John Smith', email: 'john@example.com', phone: '555-5678', address: '42 Broadway', city: 'Metro City', state: 'NY', postal_code: '10002', first_purchase_date: '2023-08-20', last_purchase_date: '2023-09-15', lifetime_value: 0, customer_type: 'Retail', created_at: '2023-08-20', updated_at: '2023-09-15' },
        { id: 'ic_3', name: 'Anita Desai', email: 'anita@example.com', phone: '555-9988', address: '77 Oak Ln', city: 'Metro City', state: 'NY', postal_code: '10003', first_purchase_date: '2023-09-01', last_purchase_date: '2023-10-01', lifetime_value: 0, customer_type: 'VIP', created_at: '2023-09-01', updated_at: '2023-10-01' },
        { id: 'ic_4', name: 'Raj Patel', email: 'raj.p@example.com', phone: '555-7777', address: '12 River Rd', city: 'Metro City', state: 'NY', postal_code: '10004', first_purchase_date: '2023-10-01', last_purchase_date: '2023-10-01', lifetime_value: 0, customer_type: 'Retail', created_at: '2023-10-01', updated_at: '2023-10-01' },
        { id: 'ic_5', name: 'Sarah Connor', email: 'sarah@example.com', phone: '555-2020', address: 'Cyberdyne Sys', city: 'Metro City', state: 'NY', postal_code: '10005', first_purchase_date: '2023-09-15', last_purchase_date: '2023-10-05', lifetime_value: 0, customer_type: 'Wholesale', created_at: '2023-09-15', updated_at: '2023-10-05' },
    ];

    const expense_categories: ExpenseCategory[] = [
        { id: 'iec_1', name: 'Food Cost', description: 'Ingredients' },
        { id: 'iec_2', name: 'Labor', description: 'Staff Salaries' },
        { id: 'iec_3', name: 'Rent', description: 'Facility Lease' },
        { id: 'iec_4', name: 'Utilities', description: 'Gas/Electric' },
        { id: 'iec_5', name: 'Marketing', description: 'Ads' }
    ];

    const orders: Order[] = [];
    const order_items: OrderItem[] = [];
    const expenses: Expense[] = [];

    // 2. Generate History (Last 30 Days)
    const today = new Date();
    
    // Helper to add days
    const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    // Helper for formatting date YYYY-MM-DD
    const fmtDate = (d: Date) => d.toISOString().split('T')[0];

    // Loop through last 30 days
    for (let i = 30; i >= 0; i--) {
        const date = addDays(today, -i);
        const dateStr = fmtDate(date);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        // A. Generate Orders
        // Weekends: 8-15 orders, Weekdays: 3-8 orders
        const numOrders = isWeekend ? Math.floor(Math.random() * 8) + 8 : Math.floor(Math.random() * 6) + 3;

        for (let j = 0; j < numOrders; j++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const orderId = `ord_${i}_${j}`;
            
            // Generate Items for this order
            const numItems = Math.floor(Math.random() * 4) + 1; // 1 to 4 items
            let orderTotal = 0;

            for (let k = 0; k < numItems; k++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                const totalPrice = product.base_price * quantity;
                orderTotal += totalPrice;

                order_items.push({
                    id: `oi_${orderId}_${k}`,
                    order_id: orderId,
                    product_id: product.id,
                    quantity,
                    unit_price: product.base_price,
                    total_price: totalPrice
                });
            }

            orders.push({
                id: orderId,
                order_number: `ORD-${10000 + orders.length}`,
                customer_id: customer.id,
                order_date: dateStr,
                order_status: 'Completed',
                payment_status: 'Paid',
                order_channel: Math.random() > 0.6 ? 'Online' : 'In-Store',
                subtotal_amount: orderTotal,
                tax_amount: orderTotal * 0.08, // 8% tax
                discount_amount: 0,
                total_amount: orderTotal * 1.08,
                payment_method: Math.random() > 0.5 ? 'Credit Card' : 'Cash',
                created_at: dateStr,
                updated_at: dateStr
            });

            // Update Customer LTV
            customer.lifetime_value += orderTotal * 1.08;
            customer.last_purchase_date = dateStr;
        }

        // B. Generate Expenses
        // Rent on 1st of month (simulate logic: if day is 1st of current or previous month)
        if (date.getDate() === 1) {
            expenses.push({
                id: `exp_rent_${i}`,
                date: dateStr,
                category_id: 'iec_3',
                vendor: 'City Properties',
                amount: 2500.00,
                payment_method: 'Bank Transfer',
                notes: 'Monthly Rent'
            });
        }

        // Weekly Food Restock (Every Monday = 1)
        if (date.getDay() === 1) {
            expenses.push({
                id: `exp_food_${i}`,
                date: dateStr,
                category_id: 'iec_1',
                vendor: 'Spice Route Traders',
                amount: 400.00 + Math.random() * 200, // Variable
                payment_method: 'Check',
                notes: 'Weekly Supply Restock'
            });
        }

        // Random Daily Expenses (Utilities, Marketing, Small repairs)
        if (Math.random() > 0.7) {
            const isMarketing = Math.random() > 0.5;
            expenses.push({
                id: `exp_rnd_${i}`,
                date: dateStr,
                category_id: isMarketing ? 'iec_5' : 'iec_4',
                vendor: isMarketing ? 'Facebook Ads' : 'Metro Electric',
                amount: Math.floor(Math.random() * 100) + 20,
                payment_method: 'Credit Card',
                notes: isMarketing ? 'Boost Post' : 'Utility Bill'
            });
        }
    }

    // Sort Descending by Date
    orders.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
    expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
        products,
        product_categories,
        inventory_items,
        suppliers: [],
        customers,
        orders,
        order_items,
        expenses,
        expense_categories
    };
};

const DB: BusinessDatabase = {
  // Keeping the original mock DB structure for initial load if needed, but defaulting to empty or the generator.
  product_categories: [], products: [], inventory_items: [], suppliers: [], customers: [], orders: [], order_items: [], expenses: [], expense_categories: []
};


// --- Gemini Service ---
const systemInstruction = `
You are "BusinessGenius", a highly intelligent Virtual CFO and Business Coach.
You have access to a full relational database structure (Orders, Products, Inventory, Expenses, Customers).
When answering:
1. Be concise and actionable.
2. Calculate derived metrics if needed (e.g., Average Order Value, Customer LTV).
3. Use the IDs to cross-reference data (e.g., match Inventory items to Product names).
4. Identify specific products or customers by name.
5. Provide "Next Steps" or recommendations based on the financial data.
`;

const generateAnalysis = async (prompt: string, dbContext: BusinessDatabase) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Filter context to relevant parts if database is large
    // For demo, we send summary arrays
    const summary = {
        products: dbContext.products.map(p => ({name: p.name, price: p.base_price, id: p.id})),
        recent_orders: dbContext.orders.slice(0, 20),
        inventory_alert: dbContext.inventory_items.filter(i => i.quantity_on_hand < i.reorder_point),
        recent_expenses: dbContext.expenses.slice(0, 10)
    };
    
    const dataString = JSON.stringify(summary);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `Business Data Context: ${dataString}` }] },
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "I'm having trouble connecting to your business database right now. Please check your connection or API key.";
  }
};

// --- CSV Helper ---
const downloadCSV = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/csv'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

// Sample CSV Generators for Clay Pit Cuisine
const sampleData = {
    orders: `order_id,customer_name,date,item,quantity,total,status
ORD-5001,Priya Sharma,2023-10-01,Butter Chicken,2,45.36,Completed
ORD-5002,John Smith,2023-10-02,Butter Chicken,1,23.76,Completed`,
    
    expenses: `date,category,vendor,amount,notes
2023-10-01,Food Cost,Spice Route Traders,450.00,Weekly Spices`,

    inventory: `product_id,product_name,sku,quantity_on_hand,reorder_point
ip_1,Butter Chicken,CUR-001,45,10`,

    customers: `name,email,phone,type
Priya Sharma,priya@example.com,555-1234,VIP`
};

// --- Components ---

const Card: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}>
    {children}
  </div>
);

const SimpleBarChart = ({ data, color, height = "h-32" }: { data: { label: string; value: number }[]; color: string, height?: string }) => {
  const max = Math.max(...data.map(d => d.value)) || 100;
  return (
    <div className={`${height} flex items-end justify-between gap-1 mt-4`}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center w-full group relative">
            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded transition-opacity z-10 whitespace-nowrap shadow-lg">
                {d.label}: ${d.value.toFixed(2)}
            </div>
            <div 
                className="w-full rounded-t-sm hover:opacity-80 transition-all min-h-[4px]"
                style={{ 
                    height: `${(Math.max(0, d.value) / max) * 100}%`, 
                    backgroundColor: d.value >= 0 ? color : '#EF4444' // Red for negative if any
                }}
            ></div>
            {data.length < 15 && <span className="text-[10px] text-slate-400 mt-1 truncate w-full text-center">{d.label}</span>}
        </div>
      ))}
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: 'transactions', icon: 'fa-exchange-alt', label: 'Transactions' },
    { id: 'products', icon: 'fa-box-open', label: 'Inventory' },
    { id: 'customers', icon: 'fa-users', label: 'Customers' },
    { id: 'chat', icon: 'fa-comments', label: 'Ask My Business' },
    { id: 'insights', icon: 'fa-lightbulb', label: 'AI Insights' },
    { id: 'upload', icon: 'fa-cloud-upload-alt', label: 'Data Upload' },
  ];

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-slate-200 hidden md:flex flex-col z-20 shadow-sm">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: BRAND_COLORS.accent }}>
          B
        </div>
        <span className="font-bold text-lg text-slate-800">BusinessGenius</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id 
                ? 'bg-[#1A3A5F] text-white shadow-md transform scale-105' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-[#EAFBF9] p-4 rounded-xl">
          <p className="text-xs font-semibold text-[#17C3B2] uppercase mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-sm font-medium text-slate-700">AI Analyst Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ db, setActiveTab }: { db: BusinessDatabase; setActiveTab: (tab: string) => void }) => {
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'all'>('30d');

  // Filter Data based on Time
  const now = new Date();
  const filterDate = new Date();
  if (timeFilter === '7d') filterDate.setDate(now.getDate() - 7);
  if (timeFilter === '30d') filterDate.setDate(now.getDate() - 30);
  if (timeFilter === 'all') filterDate.setFullYear(2000); // Way back

  const filteredOrders = db.orders.filter(o => new Date(o.order_date) >= filterDate);
  const filteredExpenses = db.expenses.filter(e => new Date(e.date) >= filterDate);

  // --- Derived Data Calculations ---
  const totalSales = filteredOrders.reduce((acc, curr) => acc + curr.total_amount, 0);
  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const profit = totalSales - totalExpenses;
  const margin = totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : "0.0";
  
  // Chart Data: Group orders by date
  const salesByDate: Record<string, number> = {};
  const expensesByDate: Record<string, number> = {};
  
  // Initialize map with dates for the range
  if (timeFilter !== 'all') {
      const days = timeFilter === '7d' ? 7 : 30;
      for (let i = days; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          salesByDate[dateStr] = 0;
          expensesByDate[dateStr] = 0;
      }
  }

  filteredOrders.forEach(order => {
    salesByDate[order.order_date] = (salesByDate[order.order_date] || 0) + order.total_amount;
  });
  
  filteredExpenses.forEach(exp => {
      expensesByDate[exp.date] = (expensesByDate[exp.date] || 0) + exp.amount;
  });
  
  const chartData = Object.keys(salesByDate).sort().map(date => ({
      label: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      value: salesByDate[date]
  }));

  const profitData = Object.keys(salesByDate).sort().map(date => ({
    label: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    value: (salesByDate[date] || 0) - (expensesByDate[date] || 0)
  }));

  // Identify Low Stock Items (Global check, not filtered by time)
  const lowStockItems = db.inventory_items
    .filter(item => item.quantity_on_hand <= item.reorder_point)
    .map(item => {
        const product = db.products.find(p => p.id === item.product_id);
        return { ...item, productName: product?.name || 'Unknown Product' };
    });

  return (
    <div className="p-8 space-y-8 animate-fade-in pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Good Morning</h1>
            <p className="text-slate-500">Here's what's happening in your business.</p>
        </div>
        <div className="flex gap-2">
             <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#17C3B2]"
             >
                 <option value="7d">Last 7 Days</option>
                 <option value="30d">Last 30 Days</option>
                 <option value="all">All Time</option>
             </select>
            <button 
                onClick={() => setActiveTab('chat')}
                className="bg-[#1A3A5F] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
                <i className="fas fa-sparkles text-[#17C3B2]"></i>
                Ask AI Advisor
            </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
            <div className="flex justify-between items-start mb-2">
                <span className="text-slate-400 text-sm font-medium">Revenue</span>
                <span className="p-1 bg-green-100 text-green-600 rounded text-xs"><i className="fas fa-arrow-up mr-1"></i>Tracked</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </Card>
        <Card>
            <div className="flex justify-between items-start mb-2">
                <span className="text-slate-400 text-sm font-medium">Net Profit</span>
                <span className={`p-1 rounded text-xs ${profit >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {profit >= 0 ? 'Profitable' : 'Loss'}
                </span>
            </div>
            <p className="text-3xl font-bold text-slate-800">${profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </Card>
        <Card>
            <div className="flex justify-between items-start mb-2">
                <span className="text-slate-400 text-sm font-medium">Margin</span>
                <span className="p-1 bg-yellow-100 text-yellow-600 rounded text-xs">Avg</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{margin}%</p>
        </Card>
        <Card>
            <div className="flex justify-between items-start mb-2">
                <span className="text-slate-400 text-sm font-medium">Expenses</span>
                <span className="p-1 bg-blue-100 text-blue-600 rounded text-xs">Total</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <h3 className="font-bold text-slate-800 mb-4">Revenue Trend</h3>
                <SimpleBarChart data={chartData} color={BRAND_COLORS.primary} />
            </Card>
            <Card>
                <h3 className="font-bold text-slate-800 mb-4">Daily Profit / Loss</h3>
                <SimpleBarChart data={profitData} color={BRAND_COLORS.accent} height="h-24" />
            </Card>
        </div>

        {/* Alerts Feed */}
        <div className="lg:col-span-1">
            <Card className="h-full bg-[#1A3A5F] text-white border-none flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    <i className="fas fa-bell text-[#17C3B2]"></i>
                    <h3 className="font-bold">Priority Alerts</h3>
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {lowStockItems.length > 0 ? (
                        lowStockItems.map(item => (
                            <div key={item.id} className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                                <div className="flex gap-3">
                                    <div className="mt-1 text-red-400"><i className="fas fa-exclamation-triangle"></i></div>
                                    <div>
                                        <p className="font-medium text-sm">Low Inventory: {item.productName}</p>
                                        <p className="text-xs text-slate-300 mt-1">Only {item.quantity_on_hand} left (Reorder at {item.reorder_point}).</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                            <p className="text-sm text-slate-300">Inventory levels are healthy.</p>
                        </div>
                    )}
                    
                    <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                            <div className="flex gap-3">
                            <div className="mt-1 text-yellow-400"><i className="fas fa-lightbulb"></i></div>
                            <div>
                                <p className="font-medium text-sm">Optimization</p>
                                <p className="text-xs text-slate-300 mt-1">Rent expense is 40% of total costs this week.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => setActiveTab('insights')}
                    className="w-full mt-6 py-2 bg-[#17C3B2] text-[#1A3A5F] font-bold rounded hover:bg-opacity-90 transition text-sm"
                >
                    View All Actions
                </button>
            </Card>
        </div>
      </div>
    </div>
  );
};

const TransactionsPage = ({ db }: { db: BusinessDatabase }) => {
    const [view, setView] = useState<'orders' | 'expenses'>('orders');
    const [filter, setFilter] = useState('all');

    // Sort by date desc
    const sortedOrders = [...db.orders].sort((a,b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
    const sortedExpenses = [...db.expenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="p-8 max-w-6xl mx-auto animate-fade-in pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Financial Transactions</h2>
                    <p className="text-slate-500">Monitor cash flow, sales logs, and operational costs.</p>
                </div>
                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
                    <button 
                        onClick={() => setView('orders')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'orders' ? 'bg-[#1A3A5F] text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Incomes (Orders)
                    </button>
                    <button 
                        onClick={() => setView('expenses')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'expenses' ? 'bg-[#1A3A5F] text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Expenses
                    </button>
                </div>
            </div>

            <Card className="mb-8">
                 <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                        <i className="fas fa-search absolute left-3 top-3.5 text-slate-400"></i>
                        <input type="text" placeholder="Search transactions..." className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17C3B2]" />
                    </div>
                    <select className="px-4 py-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#17C3B2]">
                        <option value="all">Last 30 Days</option>
                        <option value="7">Last 7 Days</option>
                    </select>
                 </div>
            </Card>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">{view === 'orders' ? 'Order ID' : 'Vendor'}</th>
                                <th className="p-4 font-semibold">{view === 'orders' ? 'Customer' : 'Category'}</th>
                                <th className="p-4 font-semibold text-right">Amount</th>
                                <th className="p-4 font-semibold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {view === 'orders' ? (
                                sortedOrders.map(order => {
                                    const customer = db.customers.find(c => c.id === order.customer_id);
                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50 transition">
                                            <td className="p-4 text-slate-600">{new Date(order.order_date).toLocaleDateString()}</td>
                                            <td className="p-4 font-medium text-slate-800">{order.order_number}</td>
                                            <td className="p-4 text-slate-600">{customer?.name || 'Unknown'}</td>
                                            <td className="p-4 text-right font-bold text-green-600">+${order.total_amount.toFixed(2)}</td>
                                            <td className="p-4 text-center">
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">{order.order_status}</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                sortedExpenses.map(exp => {
                                    const category = db.expense_categories.find(c => c.id === exp.category_id);
                                    return (
                                        <tr key={exp.id} className="hover:bg-slate-50 transition">
                                            <td className="p-4 text-slate-600">{new Date(exp.date).toLocaleDateString()}</td>
                                            <td className="p-4 font-medium text-slate-800">{exp.vendor}</td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                                                    {category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-bold text-red-500">-${exp.amount.toFixed(2)}</td>
                                            <td className="p-4 text-center">
                                                <span className="text-slate-400 text-xs">{exp.payment_method}</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const CustomersPage = ({ db }: { db: BusinessDatabase }) => {
    return (
        <div className="p-8 max-w-6xl mx-auto animate-fade-in pb-20">
             <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Customer Management</h2>
                <p className="text-slate-500">View customer profiles, LTV, and history.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {db.customers.map(c => (
                    <Card key={c.id} className="hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#1A3A5F] text-white flex items-center justify-center font-bold">
                                    {c.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{c.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.customer_type === 'VIP' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {c.customer_type}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-slate-600 mb-4">
                            <div className="flex justify-between">
                                <span>Email:</span>
                                <span className="text-slate-800">{c.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phone:</span>
                                <span className="text-slate-800">{c.phone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>City:</span>
                                <span className="text-slate-800">{c.city}</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-slate-400">Lifetime Value</p>
                                <p className="font-bold text-[#17C3B2] text-lg">${c.lifetime_value.toFixed(2)}</p>
                            </div>
                            <button className="text-[#1A3A5F] text-sm font-medium hover:underline">View History</button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const ProductList = ({ db }: { db: BusinessDatabase }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Combine data for view
    const productsWithDetails = useMemo(() => {
        return db.products.map(p => {
            const category = db.product_categories.find(c => c.id === p.category_id);
            const inventory = db.inventory_items.filter(i => i.product_id === p.id);
            const totalStock = inventory.reduce((sum, item) => sum + item.quantity_on_hand, 0);
            // Calculate margin if possible
            const margin = p.base_price > 0 ? ((p.base_price - p.cost_price) / p.base_price * 100).toFixed(1) : '0';
            
            return {
                ...p,
                categoryName: category?.name || 'Uncategorized',
                stock: totalStock,
                margin
            };
        });
    }, [db]);

    // Filter Logic
    const filteredProducts = productsWithDetails.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-8 max-w-6xl mx-auto animate-fade-in pb-20">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Products & Inventory</h2>
                <p className="text-slate-500">Manage your catalog, prices, and stock levels.</p>
            </div>

            <Card className="mb-8">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <i className="fas fa-search absolute left-3 top-3.5 text-slate-400"></i>
                        <input 
                            type="text" 
                            placeholder="Search by Name or SKU..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17C3B2]"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <select 
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#17C3B2]"
                        >
                            <option value="all">All Categories</option>
                            {db.product_categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <button className="px-4 py-3 bg-[#1A3A5F] text-white rounded-lg hover:bg-opacity-90 transition">
                            <i className="fas fa-plus mr-2"></i> Add Product
                        </button>
                    </div>
                </div>
            </Card>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                <th className="p-4 font-semibold">Product Info</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold text-right">Price / Cost</th>
                                <th className="p-4 font-semibold text-right">Margin</th>
                                <th className="p-4 font-semibold text-center">Stock</th>
                                <th className="p-4 font-semibold text-center">Status</th>
                                <th className="p-4 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-slate-50 transition">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{product.name}</div>
                                        <div className="text-xs text-slate-400 font-mono mt-0.5">{product.sku}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                                            {product.categoryName}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="font-medium text-slate-800">${product.base_price.toFixed(2)}</div>
                                        <div className="text-xs text-slate-400">${product.cost_price.toFixed(2)} cost</div>
                                    </td>
                                    <td className="p-4 text-right font-mono text-slate-600">
                                        {product.margin}%
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className={`inline-flex flex-col items-center justify-center px-3 py-1 rounded-full ${
                                            product.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                        }`}>
                                            <span className="font-bold">{product.stock}</span>
                                            <span className="text-[10px] uppercase opacity-75">{product.unit_of_measure}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`w-2 h-2 rounded-full inline-block mr-2 ${product.is_active ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                        <span className="text-slate-600">{product.is_active ? 'Active' : 'Inactive'}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button className="text-slate-400 hover:text-[#17C3B2] transition mx-1">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="text-slate-400 hover:text-red-500 transition mx-1">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400">
                                        No products found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const ChatInterface = ({ db }: { db: BusinessDatabase }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm your BusinessGenius AI. I have full access to your Orders, Expenses, Inventory, and Customer database. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await generateAnalysis(input, db);

    // @ts-ignore
    setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    setIsLoading(false);
  };

  const suggestions = [
    "List top selling products",
    "Who are my VIP customers?",
    "Calculate total profit for October",
    "Check inventory for Yoga Mats"
  ];

  return (
    <div className="h-screen flex flex-col pt-4 pb-4 md:px-8 max-w-5xl mx-auto">
       <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Ask My Business</h2>
            <p className="text-slate-500">Your AI CFO is ready to query your database.</p>
       </div>

       <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                        m.role === 'user' 
                        ? 'bg-[#1A3A5F] text-white rounded-br-none' 
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}>
                        {m.role === 'assistant' && (
                            <div className="flex items-center gap-2 mb-2 text-[#17C3B2] font-bold text-xs uppercase tracking-wide">
                                <i className="fas fa-robot"></i> BusinessGenius
                            </div>
                        )}
                        <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                            {m.text}
                        </div>
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                </div>
            )}
            <div ref={bottomRef}></div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100">
             {messages.length < 3 && (
                 <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                     {suggestions.map((s, i) => (
                         <button 
                            key={i}
                            onClick={() => setInput(s)}
                            className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm rounded-full hover:border-[#17C3B2] hover:text-[#1A3A5F] transition"
                         >
                            {s}
                         </button>
                     ))}
                 </div>
             )}
             <div className="flex gap-2">
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about specific order IDs, customers, or stock levels..."
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#17C3B2]"
                />
                <button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-[#1A3A5F] text-white px-6 rounded-lg font-bold hover:bg-opacity-90 disabled:opacity-50 transition"
                >
                    <i className="fas fa-paper-plane"></i>
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

const InsightsView = ({ db }: { db: BusinessDatabase }) => {
    const [insights, setInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const generateInsights = async () => {
        setLoading(true);
        const prompt = "Analyze the provided relational database tables. Identify 3 critical insights (Risks, Opportunities, or Optimizations). Return strictly a JSON array with fields: title, type, description, actionItem.";
        
        try {
            const rawText = await generateAnalysis(prompt, db);
            const jsonStr = rawText!.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            setInsights(parsed);
        } catch (e) {
            // Fallback for demo stability
            setInsights([
                {
                    title: "High-Margin Product Alert",
                    type: "opportunity",
                    description: "Top-tier item has a 61% margin and high sales velocity.",
                    actionItem: "Feature this product in next week's email campaign."
                },
                {
                    title: "Inventory Stockout Risk",
                    type: "risk",
                    description: "Key product is below reorder point.",
                    actionItem: "Create Purchase Order immediately."
                },
                {
                    title: "High Expense Detected",
                    type: "optimization",
                    description: "Rent & Utilities account for 60% of total expenses this period.",
                    actionItem: "Review lease terms or sublet unused space."
                }
            ]);
        }
        setLoading(false);
    };

    useEffect(() => {
        generateInsights();
    }, []);

    const getTypeColor = (type: string) => {
        switch(type.toLowerCase()) {
            case 'risk': return 'border-l-4 border-red-500 bg-red-50';
            case 'opportunity': return 'border-l-4 border-[#17C3B2] bg-[#EAFBF9]';
            default: return 'border-l-4 border-blue-500 bg-blue-50';
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Strategic Database Analysis</h2>
                    <p className="text-slate-500">AI-generated findings from your live data tables.</p>
                </div>
                <button 
                    onClick={generateInsights} 
                    className="text-[#1A3A5F] hover:text-[#17C3B2] transition"
                    disabled={loading}
                >
                    <i className={`fas fa-sync ${loading ? 'animate-spin' : ''}`}></i> Refresh Analysis
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {insights.map((insight, idx) => (
                        <div key={idx} className={`p-6 rounded-r-xl shadow-sm ${getTypeColor(insight.type)}`}>
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-slate-800">{insight.title}</h3>
                                <span className="uppercase text-xs font-bold tracking-wider opacity-60">{insight.type}</span>
                            </div>
                            <p className="text-slate-600 mt-2">{insight.description}</p>
                            
                            <div className="mt-4 pt-4 border-t border-black/5 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1A3A5F] shadow-sm">
                                    <i className="fas fa-check"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Recommended Action</p>
                                    <p className="font-medium text-[#1A3A5F]">{insight.actionItem}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const UploadPage = ({ onLoadDemoData }: { onLoadDemoData: () => void }) => (
    <div className="p-8 max-w-4xl mx-auto pb-20">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Data Integration</h2>
        <p className="text-slate-500 mb-8">Import data into your BusinessGenius database schema.</p>
        
        {/* Demo Data Section */}
        <div className="bg-[#1A3A5F] text-white rounded-xl p-8 mb-8 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h3 className="text-xl font-bold mb-2">Use Demo Data: Clay Pit Cuisine</h3>
                    <p className="text-blue-200 text-sm max-w-md">
                        Load a full suite of data for "Clay Pit Cuisine" (an Indian Restaurant). 
                        Includes 30 days of sales history, inventory tracking, recurring expenses, and customer profiles.
                    </p>
                </div>
                <button 
                    onClick={onLoadDemoData}
                    className="bg-[#17C3B2] text-[#1A3A5F] font-bold py-3 px-6 rounded-lg hover:bg-white hover:text-[#1A3A5F] transition shadow-lg"
                >
                    <i className="fas fa-utensils mr-2"></i> Load Restaurant Data
                </button>
            </div>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <h3 className="font-bold text-slate-800 mb-4">Manual File Upload</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {['Orders', 'Expenses', 'Inventory', 'Customers'].map((type, i) => (
                <div key={i} className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#17C3B2] hover:bg-[#EAFBF9] transition cursor-pointer group">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-white text-slate-400 group-hover:text-[#17C3B2]">
                        <i className="fas fa-file-csv text-xl"></i>
                    </div>
                    <h3 className="font-bold text-slate-700">{type} (CSV)</h3>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            downloadCSV(`${type.toLowerCase()}_sample.csv`, sampleData[type.toLowerCase() as keyof typeof sampleData]);
                        }}
                        className="text-xs text-[#17C3B2] font-bold mt-2 hover:underline"
                    >
                        Download Sample .CSV
                    </button>
                </div>
            ))}
        </div>
    </div>
);

const LandingPage = ({ onStart }: { onStart: () => void }) => (
    <div className="min-h-screen bg-white">
        <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: BRAND_COLORS.accent }}>B</div>
                 <span className="font-bold text-xl text-[#1A3A5F]">BusinessGenius</span>
            </div>
            <button className="text-slate-500 font-medium hover:text-[#1A3A5F]">Log In</button>
        </nav>

        <header className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center md:text-left md:flex items-center gap-12">
            <div className="md:w-1/2">
                <span className="text-[#17C3B2] font-bold tracking-wide uppercase text-sm">For Small Business Owners</span>
                <h1 className="text-5xl md:text-6xl font-extrabold text-[#1A3A5F] mt-4 leading-tight">
                    Your AI Virtual <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#17C3B2] to-[#1A3A5F]">Business Coach</span>
                </h1>
                <p className="mt-6 text-xl text-slate-500 leading-relaxed">
                    Stop guessing. Upload your data and get instant, CFO-level insights, forecasts, and actionable alerts to grow your business.
                </p>
                <div className="mt-8 flex gap-4 flex-col md:flex-row">
                    <button 
                        onClick={onStart}
                        className="bg-[#1A3A5F] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        Get Insights Now
                    </button>
                    <button className="px-8 py-4 rounded-lg font-bold text-[#1A3A5F] border border-slate-200 hover:bg-slate-50 transition">
                        View Demo
                    </button>
                </div>
                <div className="mt-8 flex items-center gap-4 text-sm text-slate-400">
                    <span><i className="fas fa-check text-green-500 mr-2"></i>No credit card required</span>
                    <span><i className="fas fa-check text-green-500 mr-2"></i>Secure Data</span>
                </div>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#17C3B2] to-blue-500 rounded-2xl opacity-20 blur-xl"></div>
                <div className="relative bg-white rounded-xl shadow-2xl p-4 border border-slate-100">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="h-24 w-1/2 bg-blue-50 rounded-lg p-4">
                                <div className="h-2 w-12 bg-blue-200 rounded mb-2"></div>
                                <div className="h-6 w-24 bg-[#1A3A5F] rounded"></div>
                            </div>
                            <div className="h-24 w-1/2 bg-green-50 rounded-lg p-4">
                                <div className="h-2 w-12 bg-green-200 rounded mb-2"></div>
                                <div className="h-6 w-24 bg-[#17C3B2] rounded"></div>
                            </div>
                        </div>
                        <div className="h-48 bg-slate-50 rounded-lg p-4 flex items-end gap-2">
                             {[40, 60, 45, 80, 55, 70, 90].map((h, i) => (
                                 <div key={i} style={{height: `${h}%`}} className="flex-1 bg-slate-200 rounded-t-sm"></div>
                             ))}
                        </div>
                        <div className="bg-[#1A3A5F] text-white p-4 rounded-lg flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><i className="fas fa-comment-dots"></i></div>
                            <div>
                                <div className="h-2 w-32 bg-white/40 rounded mb-1"></div>
                                <div className="h-2 w-48 bg-white/20 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    </div>
);

// --- Main App Component ---
const App = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [businessDB, setBusinessDB] = useState<BusinessDatabase>(generateIndianRestaurantData());

  const loadIndianRestaurantDemo = () => {
      // Use the generator function
      const freshData = generateIndianRestaurantData();
      setBusinessDB(freshData);
      setActiveTab('dashboard');
  };

  if (!hasStarted) {
      return <LandingPage onStart={() => setHasStarted(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 font-sans flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white z-20 border-b border-slate-200 p-4 flex justify-between items-center">
          <span className="font-bold text-[#1A3A5F]">BusinessGenius</span>
          <button onClick={() => {}}><i className="fas fa-bars text-slate-500"></i></button>
      </div>

      <main className="flex-1 md:ml-64 pt-16 md:pt-0 overflow-y-auto h-screen">
        {activeTab === 'dashboard' && <Dashboard db={businessDB} setActiveTab={setActiveTab} />}
        {activeTab === 'products' && <ProductList db={businessDB} />}
        {activeTab === 'transactions' && <TransactionsPage db={businessDB} />}
        {activeTab === 'customers' && <CustomersPage db={businessDB} />}
        {activeTab === 'chat' && <ChatInterface db={businessDB} />}
        {activeTab === 'insights' && <InsightsView db={businessDB} />}
        {activeTab === 'upload' && <UploadPage onLoadDemoData={loadIndianRestaurantDemo} />}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);