// =============================================================
// SAMPLE DATA — AI for Business Leaders (Week 2: Frontend)
// =============================================================
// Paste this into your Next.js project (e.g., src/lib/data.ts)
// and import from your dashboard components.
// Business: Riyadh Roast — a specialty coffee shop in Riyadh
// =============================================================

// --- Metric Cards ---
export const metrics = [
  {
    title: "Total Revenue",
    value: "SAR 934,500",
    change: "+11.3%",
    trend: "up",
    period: "6-month total",
  },
  {
    title: "Drinks Sold",
    value: "38,420",
    change: "+8.7%",
    trend: "up",
    period: "vs last month",
  },
  {
    title: "Avg Ticket",
    value: "SAR 28",
    change: "+2.1%",
    trend: "up",
    period: "vs last month",
  },
  {
    title: "Customer Visits",
    value: "30,150",
    change: "+9.4%",
    trend: "up",
    period: "vs last month",
  },
];

// --- Monthly Revenue (Line/Bar Chart — past 12 months) ---
export const monthlyRevenue = [
  { month: "Mar 2025", revenue: 96500,  expenses: 71200 },
  { month: "Apr 2025", revenue: 101800, expenses: 73500 },
  { month: "May 2025", revenue: 105200, expenses: 75800 },
  { month: "Jun 2025", revenue: 108900, expenses: 77400 },
  { month: "Jul 2025", revenue: 112400, expenses: 79600 },
  { month: "Aug 2025", revenue: 115700, expenses: 82100 },
  { month: "Sep 2025", revenue: 118000, expenses: 84500 },
  { month: "Oct 2025", revenue: 127500, expenses: 87200 },
  { month: "Nov 2025", revenue: 135800, expenses: 95800 },
  { month: "Dec 2025", revenue: 149200, expenses: 98500 },
  { month: "Jan 2026", revenue: 155500, expenses: 97800 },
  { month: "Feb 2026", revenue: 161200, expenses: 99500 },
];

// --- Weekly Customers (Area Chart) ---
export const weeklyCustomers = [
  { week: "Week 1", customers: 3210 },
  { week: "Week 2", customers: 3340 },
  { week: "Week 3", customers: 3280 },
  { week: "Week 4", customers: 3460 },
  { week: "Week 5", customers: 3520 },
  { week: "Week 6", customers: 3610 },
  { week: "Week 7", customers: 3750 },
  { week: "Week 8", customers: 3690 },
  { week: "Week 9", customers: 3840 },
  { week: "Week 10", customers: 3920 },
  { week: "Week 11", customers: 4010 },
  { week: "Week 12", customers: 4100 },
];

// --- Sales by Category (Pie/Donut Chart) ---
export const salesByCategory = [
  { category: "Hot Drinks", value: 385000, color: "#10b981" },
  { category: "Cold Drinks", value: 198000, color: "#6366f1" },
  { category: "Pastries & Food", value: 152000, color: "#f59e0b" },
  { category: "Bottled/Packaged", value: 72000, color: "#ef4444" },
  { category: "Merchandise", value: 40200, color: "#8b5cf6" },
];

// --- Recent Orders (Table) ---
export const recentOrders = [
  {
    id: "ORD-1847",
    customer: "Faisal Al-Mutairi",
    product: "2x Spanish Latte, 1x Croissant",
    amount: "SAR 52",
    status: "Completed",
    date: "2026-02-28",
  },
  {
    id: "ORD-1846",
    customer: "Reem Al-Otaibi",
    product: "V60 Pour Over, Chocolate Cake",
    amount: "SAR 68",
    status: "Completed",
    date: "2026-02-28",
  },
  {
    id: "ORD-1845",
    customer: "Mansour Al-Fahad",
    product: "3x Iced Matcha, 2x Pistachio Croissant",
    amount: "SAR 85",
    status: "In Progress",
    date: "2026-02-27",
  },
  {
    id: "ORD-1844",
    customer: "Hana Al-Shammari",
    product: "Flat White, Banana Bread",
    amount: "SAR 34",
    status: "Completed",
    date: "2026-02-27",
  },
  {
    id: "ORD-1843",
    customer: "Yousef Badr",
    product: "Cappuccino, Almond Croissant",
    amount: "SAR 38",
    status: "Ready for Pickup",
    date: "2026-02-26",
  },
  {
    id: "ORD-1842",
    customer: "Dalal Ibrahim",
    product: "2x Cold Brew, Cheesecake Slice",
    amount: "SAR 56",
    status: "Completed",
    date: "2026-02-26",
  },
  {
    id: "ORD-1841",
    customer: "Tariq Al-Ghamdi",
    product: "Espresso, Saffron Cake",
    amount: "SAR 29",
    status: "In Progress",
    date: "2026-02-25",
  },
  {
    id: "ORD-1840",
    customer: "Amal Al-Harbi",
    product: "4x Spanish Latte (office order)",
    amount: "SAR 76",
    status: "Ready for Pickup",
    date: "2026-02-25",
  },
];

// --- Reports (for Reports page) ---
export const reports = [
  {
    id: 1,
    title: "February Sales Analysis",
    category: "Finance",
    date: "2026-02-28",
    summary:
      "Revenue up 11.3% over 6 months. Spanish Latte remains the top seller at 22% of all drink orders.",
  },
  {
    id: 2,
    title: "Spanish Latte Growth Report",
    category: "Products",
    date: "2026-02-25",
    summary:
      "Spanish Latte sales grew 34% since launch. Now accounts for 1 in 5 drinks sold. Recommend seasonal variations.",
  },
  {
    id: 3,
    title: "Staff Schedule Optimization",
    category: "Operations",
    date: "2026-02-22",
    summary:
      "Morning rush (7-9 AM) needs 4 baristas minimum. Current 3-person shifts causing 8-min average wait times.",
  },
  {
    id: 4,
    title: "Weekend vs Weekday Traffic",
    category: "Analytics",
    date: "2026-02-18",
    summary:
      "Weekend traffic 40% higher than weekdays. Thursday evenings trending up — consider extended hours.",
  },
  {
    id: 5,
    title: "Bean Supplier Cost Review",
    category: "Procurement",
    date: "2026-02-15",
    summary:
      "Ethiopian Yirgacheffe costs up 12%. Colombian Supremo stable. Recommend locking in 6-month contract.",
  },
  {
    id: 6,
    title: "Customer Satisfaction Pulse",
    category: "Customer Service",
    date: "2026-02-10",
    summary:
      "Google rating steady at 4.7 stars. Top praise: drink quality and ambiance. Top complaint: parking availability.",
  },
];

// --- Team Members (for Team page) ---
export const teamMembers = [
  {
    name: "Khalid Al-Rashid",
    role: "Owner & Manager",
    department: "Management",
    avatar: "KR",
  },
  {
    name: "Noura Hassan",
    role: "Head Barista",
    department: "Coffee Bar",
    avatar: "NH",
  },
  {
    name: "Ahmed Tariq",
    role: "Barista",
    department: "Coffee Bar",
    avatar: "AT",
  },
  {
    name: "Sara Al-Dosari",
    role: "Pastry Chef",
    department: "Kitchen",
    avatar: "SD",
  },
  {
    name: "Omar Ibrahim",
    role: "Evening Shift Lead",
    department: "Coffee Bar",
    avatar: "OI",
  },
  {
    name: "Lina Al-Qahtani",
    role: "Social Media & Marketing",
    department: "Marketing",
    avatar: "LQ",
  },
];

// --- Daily Data (last 7 days · Apr 17–23, 2026) ---
export const dailyData = [
  { day: "Thu Apr 17", revenue: 5340, orders: 189, customers: 171 },
  { day: "Fri Apr 18", revenue: 7210, orders: 251, customers: 234 },
  { day: "Sat Apr 19", revenue: 8640, orders: 298, customers: 276 },
  { day: "Sun Apr 20", revenue: 7890, orders: 272, customers: 250 },
  { day: "Mon Apr 21", revenue: 5020, orders: 174, customers: 158 },
  { day: "Tue Apr 22", revenue: 4760, orders: 162, customers: 148 },
  { day: "Wed Apr 23", revenue: 4820, orders: 163, customers: 145 },
];

// --- Weekly Report Data (last 8 weeks) ---
export const weeklyReportData = [
  { week: "Feb 24", revenue: 33600, orders: 1150, customers: 3210 },
  { week: "Mar 3",  revenue: 34800, orders: 1190, customers: 3340 },
  { week: "Mar 10", revenue: 34100, orders: 1165, customers: 3280 },
  { week: "Mar 17", revenue: 35900, orders: 1230, customers: 3460 },
  { week: "Mar 24", revenue: 36500, orders: 1250, customers: 3520 },
  { week: "Mar 31", revenue: 37400, orders: 1280, customers: 3610 },
  { week: "Apr 7",  revenue: 38900, orders: 1330, customers: 3750 },
  { week: "Apr 14", revenue: 39200, orders: 1345, customers: 3840 },
];

// --- Quarterly Data (FY2025) ---
export const quarterlyData = [
  { quarter: "Q1 FY2025", revenue: 303500, expenses: 220500, orders: 10820, customers: 29400 },
  { quarter: "Q2 FY2025", revenue: 337000, expenses: 239100, orders: 12030, customers: 32800 },
  { quarter: "Q3 FY2025", revenue: 381300, expenses: 267500, orders: 13620, customers: 37100 },
  { quarter: "Q4 FY2025", revenue: 465900, expenses: 295800, orders: 16640, customers: 42700 },
];

// --- Annual Data ---
export const annualData = [
  { year: "FY2023", revenue: 1050000, expenses:  790000, orders: 37500, customers:  98200 },
  { year: "FY2024", revenue: 1240000, expenses:  895000, orders: 44300, customers: 115600 },
  { year: "FY2025", revenue: 1487700, expenses: 1022900, orders: 53110, customers: 142000 },
];

// --- Notifications / Activity Feed ---
export const recentActivity = [
  {
    action: "Large order completed",
    detail: "12x Spanish Latte for office delivery",
    time: "5 minutes ago",
  },
  {
    action: "Low stock alert",
    detail: "Ethiopian Yirgacheffe beans — 2 bags remaining",
    time: "2 hours ago",
  },
  {
    action: "New 5-star review",
    detail: "\"Best Spanish Latte in Riyadh!\" — Google Reviews",
    time: "4 hours ago",
  },
  {
    action: "Equipment maintenance",
    detail: "La Marzocca espresso machine — monthly cleaning completed",
    time: "6 hours ago",
  },
  {
    action: "Catering inquiry",
    detail: "Request for 50 drinks — corporate event on March 8",
    time: "Yesterday",
  },
];
