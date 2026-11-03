// public/js/config.js - CampusCart Client Configuration & Data Definitions
window.CampusCartConfig = {
  appName: 'CampusCart',
  tagline: 'Your Campus. Your Marketplace.',
  apiBaseUrl: '/api',
  currencySymbol: '₹',
  
  categories: [
    {
      id: 'textbooks',
      name: 'Textbooks & Academics',
      icon: '📚',
      color: '#dbeafe',
      count: 42,
      description: 'Course textbooks, engineering guides & study notes'
    },
    {
      id: 'electronics',
      name: 'Electronics & Gadgets',
      icon: '💻',
      color: '#fef3c7',
      count: 28,
      description: 'Laptops, headphones, keyboards & chargers'
    },
    {
      id: 'stationery',
      name: 'Calculators & Stationery',
      icon: '📐',
      color: '#ecfdf5',
      count: 35,
      description: 'Scientific calculators, drafters & drawing instruments'
    },
    {
      id: 'hostel',
      name: 'Hostel & Dorm Essentials',
      icon: '🛏️',
      color: '#f3e8ff',
      count: 19,
      description: 'Bedside tables, study lamps, kettles & storage boxes'
    },
    {
      id: 'other',
      name: 'Other Student Essentials',
      icon: '🎒',
      color: '#ffe4e6',
      count: 14,
      description: 'Lab coats, cycles, sports gear & backpacks'
    }
  ],

  // Seed sample products showcasing realistic university marketplace listings
  seedProducts: [
    {
      id: 'prod-001',
      title: 'Higher Engineering Mathematics (44th Edition) – B.S. Grewal',
      category: 'textbooks',
      price: 450,
      originalPrice: 899,
      condition: 'Like New',
      location: 'Block A, Men\'s Hostel',
      postedAgo: '2 hours ago',
      seller: {
        name: 'Aarav Sharma',
        branch: 'CSE, 3rd Year',
        verified: true,
        avatar: 'AS'
      },
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80',
      description: 'Hardly used for 2 semesters. No markings or torn pages, almost brand new. Perfect for Semester 3 Engineering Mathematics syllabus.'
    },
    {
      id: 'prod-002',
      title: 'Casio fx-991EX ClassWiz Scientific Calculator',
      category: 'stationery',
      price: 850,
      originalPrice: 1595,
      condition: 'Excellent',
      location: 'Block C, Tech Hostel',
      postedAgo: '4 hours ago',
      seller: {
        name: 'Sneha Patel',
        branch: 'ECE, Final Year',
        verified: true,
        avatar: 'SP'
      },
      image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=700&q=80',
      description: 'Original Casio fx-991EX ClassWiz with natural textbook display and dual solar-battery power. Cleared all exams, passing it on!'
    },
    {
      id: 'prod-003',
      title: 'Sony WH-CH520 Wireless Bluetooth Headphones',
      category: 'electronics',
      price: 1800,
      originalPrice: 4490,
      condition: 'Gently Used',
      location: 'Day Scholar / Central Library',
      postedAgo: '1 day ago',
      seller: {
        name: 'Rohan Verma',
        branch: 'Mech, 2nd Year',
        verified: true,
        avatar: 'RV'
      },
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80',
      description: 'Up to 50 hours battery life with crystal clear sound and mic. Upgraded to ANC model so selling this. Box and Type-C cable included.'
    },
    {
      id: 'prod-004',
      title: 'Foldable Wooden Bedside Study Table with Tablet Slot',
      category: 'hostel',
      price: 399,
      originalPrice: 999,
      condition: 'Good',
      location: 'Block B, Women\'s Hostel',
      postedAgo: 'Yesterday',
      seller: {
        name: 'Pooja Reddy',
        branch: 'Biotech, 3rd Year',
        verified: true,
        avatar: 'PR'
      },
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=700&q=80',
      description: 'Sturdy foldable bed laptop table with cup holder and tablet grove. Essential for late-night exam prep in hostel rooms.'
    },
    {
      id: 'prod-005',
      title: 'White Lab Coat (Medium) + UV Chemistry Safety Goggles',
      category: 'other',
      price: 280,
      originalPrice: 650,
      condition: 'Like New',
      location: 'Science Block / Block D',
      postedAgo: '3 days ago',
      seller: {
        name: 'Vikram Singh',
        branch: 'Civil, 2nd Year',
        verified: true,
        avatar: 'VS'
      },
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80',
      description: 'Used only for 1 semester of basic chemistry lab. Fully washed, ironed, and 100% spotless. Goggles have zero scratches.'
    },
    {
      id: 'prod-006',
      title: 'Logitech K380 Multi-Device Wireless Bluetooth Keyboard',
      category: 'electronics',
      price: 1400,
      originalPrice: 2995,
      condition: 'Excellent',
      location: 'PG Hostel, 2nd Floor',
      postedAgo: 'Just now',
      seller: {
        name: 'Deep Ranjan',
        branch: 'CSE Tech Lead',
        verified: true,
        avatar: 'DR'
      },
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80',
      description: 'Pairs effortlessly with laptop, iPad and phone with dedicated easy-switch buttons. Quiet circular keys, great for library studying.'
    }
  ]
};

