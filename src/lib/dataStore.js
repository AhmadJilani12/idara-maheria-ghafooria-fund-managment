// In-memory data store for the application
// In production, this would connect to a database

let donors = [
  {
    id: 1,
    name: "Ahmad Ali",
    email: "ahmad@example.com",
    phone: "03001234567",
    type: "monthly",
    monthlyAmount: 5000,
    status: "active",
    joinDate: "2024-01-01"
  },
  {
    id: 2,
    name: "Fatima Khan",
    email: "fatima@example.com",
    phone: "03009876543",
    type: "onetime",
    status: "active",
    joinDate: "2024-02-15"
  }
];

let payments = [
  {
    id: 1,
    donorId: 1,
    amount: 5000,
    month: "April 2026",
    date: "2026-04-01",
    status: "paid",
    receiptId: "RCP-2026-0001",
    paymentMethod: "cash",
    notes: "Paid in person"
  },
  {
    id: 2,
    donorId: 2,
    amount: 10000,
    month: "April 2026",
    date: "2026-04-05",
    status: "pending",
    receiptId: null,
    paymentMethod: "cash",
    notes: ""
  }
];

let monthlySchedule = [];

// Initialize monthly schedule
function initializeMonthlySchedule() {
  const months = [
    "January 2026", "February 2026", "March 2026", "April 2026", 
    "May 2026", "June 2026", "July 2026", "August 2026",
    "September 2026", "October 2026", "November 2026", "December 2026"
  ];
  
  monthlySchedule = months.map(month => ({
    month,
    donors: donors
      .filter(d => d.type === "monthly")
      .map(d => ({
        donorId: d.id,
        donorName: d.name,
        expectedAmount: d.monthlyAmount,
        status: "pending",
        paidDate: null
      }))
  }));
}

initializeMonthlySchedule();

// Donor functions
export const getDonors = () => donors;

export const addDonor = (donorData) => {
  const newDonor = {
    id: Math.max(...donors.map(d => d.id), 0) + 1,
    ...donorData,
    joinDate: new Date().toISOString().split('T')[0]
  };
  donors.push(newDonor);
  if (donorData.type === "monthly") {
    initializeMonthlySchedule();
  }
  return newDonor;
};

export const updateDonor = (id, updates) => {
  donors = donors.map(d => d.id === id ? { ...d, ...updates } : d);
  return donors.find(d => d.id === id);
};

export const deleteDonor = (id) => {
  donors = donors.filter(d => d.id !== id);
  return true;
};

export const getDonorById = (id) => donors.find(d => d.id === id);

// Payment functions
export const getPayments = () => payments;

export const addPayment = (paymentData) => {
  const receiptId = `RCP-${new Date().getFullYear()}-${String(Math.max(...payments.map(p => p.id), 0) + 1).padStart(4, '0')}`;
  
  const newPayment = {
    id: Math.max(...payments.map(p => p.id), 0) + 1,
    ...paymentData,
    date: new Date().toISOString().split('T')[0],
    status: "paid",
    receiptId: receiptId,
    paymentMethod: "cash"
  };
  payments.push(newPayment);
  
  // Update monthly schedule
  const schedule = monthlySchedule.find(s => s.month === paymentData.month);
  if (schedule) {
    const donor = schedule.donors.find(d => d.donorId === paymentData.donorId);
    if (donor) {
      donor.status = "paid";
      donor.paidDate = newPayment.date;
    }
  }
  
  return newPayment;
};

export const revertPayment = (paymentId) => {
  const payment = payments.find(p => p.id === paymentId);
  if (payment) {
    payment.status = "pending";
    payment.receiptId = null;
    
    const schedule = monthlySchedule.find(s => s.month === payment.month);
    if (schedule) {
      const donor = schedule.donors.find(d => d.donorId === payment.donorId);
      if (donor) {
        donor.status = "pending";
        donor.paidDate = null;
      }
    }
  }
  return payment;
};

export const getPaymentsByMonth = (month) => {
  return payments.filter(p => p.month === month);
};

export const getPaymentsByDonor = (donorId) => {
  return payments.filter(p => p.donorId === donorId);
};

// Monthly tracking functions
export const getMonthlySchedule = () => monthlySchedule;

export const getMonthlyStatus = (month) => {
  return monthlySchedule.find(s => s.month === month);
};

// Statistics functions
export const getDashboardStats = () => {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthlyDonors = donors.filter(d => d.type === "monthly").length;
  const totalMonthlyAmount = donors
    .filter(d => d.type === "monthly")
    .reduce((sum, d) => sum + (d.monthlyAmount || 0), 0);
  
  const monthPayments = payments.filter(p => p.status === "paid");
  const totalCollected = monthPayments.reduce((sum, p) => sum + p.amount, 0);
  
  return {
    totalDonors: donors.length,
    monthlyDonors,
    oneTimeDonors: donors.filter(d => d.type === "onetime").length,
    totalMonthlyAmount,
    totalCollected,
    pendingPayments: payments.filter(p => p.status === "pending").length,
    paidPayments: payments.filter(p => p.status === "paid").length
  };
};

export const generateReceipt = (paymentId) => {
  const payment = payments.find(p => p.id === paymentId);
  if (!payment) return null;
  
  const donor = donors.find(d => d.id === payment.donorId);
  
  return {
    receiptId: payment.receiptId,
    donorName: donor.name,
    donorPhone: donor.phone,
    amount: payment.amount,
    month: payment.month,
    date: payment.date,
    type: "Donation Receipt",
    madrasaName: "Project Fund Management System",
    paymentMethod: "Cash"
  };
};
