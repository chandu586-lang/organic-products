/**
 * Initial Clean Data for NatureNest Admin & Store
 * Initialized fresh to 0 orders, 0 revenue, 0 active products, and 0 registered customers.
 */

export const initialOrders = [];

export const initialCustomers = [];

export const initialSettings = {
  storeName: "NatureNest",
  tagline: "Pure Traditional Wood-Pressed Oils, Raw Forest Honey & Heritage Grains",
  supportPhone: "+91 94440 98765",
  supportEmail: "care@naturenest.com",
  storeAddress: "NatureNest Organic Farm Hub, Cauvery Basin, Salem, Tamil Nadu - 636001",
  freeShippingThreshold: 500,
  standardShippingFee: 50,
  expressShippingFee: 99,
  gstRate: 5,
  razorpayKey: "rzp_test_NatureNestKey",
  razorpaySecret: "test_secret_naturenest_982",
  simulateRazorpayModal: true,
  emailNotifications: true,
  smsNotifications: true,
  lowStockThreshold: 20
};
