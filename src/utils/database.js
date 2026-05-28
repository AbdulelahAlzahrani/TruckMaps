// LocalStorage-backed Mock Database with Riyadh pre-populated Food Trucks

const KEYS = {
  USERS: "truckmaps_users",
  TRUCKS: "truckmaps_trucks",
  INQUIRIES: "truckmaps_inquiries",
  CURRENT_USER: "truckmaps_current_user"
};

// High-fidelity pre-populated Food Trucks in Riyadh
const DEFAULT_TRUCKS = [
  {
    id: "truck-1",
    ownerId: "owner-1",
    nameEn: "Smoke & Fire Burger",
    nameAr: "سموك آند فاير برجر",
    cuisine: "cuisineBurger",
    lat: 24.7115,
    lng: 46.6744, // Olaya, near Kingdom Centre
    priceRange: "priceMedium",
    rating: 4.8,
    reviews: [
      { id: "rev-1-1", author: "Fahad M.", rating: 5, text: "Best brisket burgers in Olaya! Super juicy and smokey flavor.", date: "2026-05-20" },
      { id: "rev-1-2", author: "Sarah A.", rating: 4, text: "Excellent burgers, but the queue gets very long on weekends.", date: "2026-05-25" }
    ],
    menu: [
      { id: "menu-1-1", nameEn: "Smoked Brisket Burger", nameAr: "برجر بريسكت مدخن", price: 45 },
      { id: "menu-1-2", nameEn: "Truffle Beef Burger", nameAr: "برجر لحم بالترفل", price: 38 },
      { id: "menu-1-3", nameEn: "Loaded Cheese Fries", nameAr: "بطاطس بالجبنة والبهارات", price: 22 }
    ],
    phone: "+966 50 123 4567",
    hours: "4:00 PM - 2:00 AM",
    descriptionEn: "We bring authentic oakwood smoking techniques to the streets of Riyadh. Every brisket is smoked for 12 hours before serving.",
    descriptionAr: "نقدم تقنيات التدخين الأصلية بخشب البلوط إلى شوارع الرياض. يتم تدخين كل بريسكت لمدة 12 ساعة قبل التقديم.",
    isActive: true,
    isSubscribed: true,
    subTier: "premium" // standard / premium
  },
  {
    id: "truck-2",
    ownerId: "owner-2",
    nameEn: "V60 Riyadh Coffee",
    nameAr: "قهوة في 60 الرياض",
    cuisine: "cuisineCoffee",
    lat: 24.6974,
    lng: 46.6841, // Tahlia Street
    priceRange: "priceBudget",
    rating: 4.9,
    reviews: [
      { id: "rev-2-1", author: "Yousef K.", rating: 5, text: "Exceptional Ethiopia V60 drip. The barista knows his coffee! Highly recommended.", date: "2026-05-24" }
    ],
    menu: [
      { id: "menu-2-1", nameEn: "Ethiopia V60 Drip Coffee", nameAr: "قهوة تقطير إثيوبية V60", price: 18 },
      { id: "menu-2-2", nameEn: "Spanish Latte (Iced/Hot)", nameAr: "سبانش لاتيه (بارد/حار)", price: 21 },
      { id: "menu-2-3", nameEn: "Saffron Cardamom Cake", nameAr: "كيكة الزعفران والهيل", price: 15 }
    ],
    phone: "+966 54 987 6543",
    hours: "6:00 AM - 12:00 AM",
    descriptionEn: "Artisanal coffee brewed to perfection. Sourcing ethically grown beans from Colombia, Ethiopia, and El Salvador.",
    descriptionAr: "قهوة حرفية محضرة بإتقان. نوفر حبوب بن من مصادر أخلاقية من كولومبيا وإثيوبيا والسلفادور.",
    isActive: true,
    isSubscribed: true,
    subTier: "premium"
  },
  {
    id: "truck-3",
    ownerId: "owner-3",
    nameEn: "Waffle Dome Desserts",
    nameAr: "حلويات قبة الوافل",
    cuisine: "cuisineDesserts",
    lat: 24.7711,
    lng: 46.5982, // Boulevard Riyadh City
    priceRange: "priceMedium",
    rating: 4.5,
    reviews: [
      { id: "rev-3-1", author: "Mona S.", rating: 4, text: "Kids loved the waffle sticks with Belgian chocolate! A bit sweet but delicious.", date: "2026-05-27" }
    ],
    menu: [
      { id: "menu-3-1", nameEn: "Signature Triple Chocolate Waffle", nameAr: "وافل الشوكولاتة الثلاثية المميز", price: 28 },
      { id: "menu-3-2", nameEn: "Pistachio Crepe Roll", nameAr: "رول كريب الفستق", price: 32 },
      { id: "menu-3-3", nameEn: "Nutella Strawberry Pancakes", nameAr: "بان كيك بالنوتيلا والفراولة", price: 25 }
    ],
    phone: "+966 55 555 1122",
    hours: "5:00 PM - 3:00 AM",
    descriptionEn: "Decadent waffles and crepes layered with premium warm Belgian chocolate. Located in the heart of Riyadh's entertainment district.",
    descriptionAr: "وافل وكريب غني ومغطى بالشوكولاتة البلجيكية الدافئة الفاخرة. يقع في قلب المنطقة الترفيهية بالرياض.",
    isActive: true,
    isSubscribed: true,
    subTier: "standard"
  },
  {
    id: "truck-4",
    ownerId: "owner-4",
    nameEn: "Shawarma Al-Balad",
    nameAr: "شاورما البلد",
    cuisine: "cuisineShawarma",
    lat: 24.8105,
    lng: 46.6342, // Anas Ibn Malik Road
    priceRange: "priceBudget",
    rating: 4.7,
    reviews: [],
    menu: [
      { id: "menu-4-1", nameEn: "Traditional Saj Chicken Shawarma", nameAr: "شاورما دجاج صاج تقليدية", price: 9 },
      { id: "menu-4-2", nameEn: "Shawarma Platter with Garlic Dip", nameAr: "صحن شاورما مع ثومية وبطاطس", price: 24 },
      { id: "menu-4-3", nameEn: "Spicy Beef Shawarma", nameAr: "شاورما لحم حار بالدبس والرمان", price: 12 }
    ],
    phone: "+966 56 333 4455",
    hours: "12:00 PM - 4:00 AM",
    descriptionEn: "Authentic Levant style shawarma roasted over live charcoal. Famous for our house-made garlic dip and fresh saj bread.",
    descriptionAr: "شاورما شامية أصلية مشوية على الفحم الحي. مشهورون بالثومية المنزلية الصنع وخبز الصاج الطازج.",
    isActive: true,
    isSubscribed: true,
    subTier: "premium"
  },
  {
    id: "truck-5",
    ownerId: "owner-5",
    nameEn: "Pizza Stone Artisan",
    nameAr: "بيتزا ستون الحرفية",
    cuisine: "cuisinePizza",
    lat: 24.6901,
    lng: 46.6853, // King Fahd Road near Al Faisaliyah
    priceRange: "pricePremiumVal",
    rating: 4.6,
    reviews: [
      { id: "rev-5-1", author: "Ahmad R.", rating: 5, text: "True Neapolitan pizza! Leopard spotting on the crust was perfect.", date: "2026-05-18" }
    ],
    menu: [
      { id: "menu-5-1", nameEn: "Artisan Margherita Pizza", nameAr: "بيتزا مارغريتا كلاسيكية", price: 42 },
      { id: "menu-5-2", nameEn: "Truffle Mushroom White Pizza", nameAr: "بيتزا ترفل فطر بيضاء", price: 54 },
      { id: "menu-5-3", nameEn: "Spicy Pepperoni & Honey Pizza", nameAr: "بيتزا بيبروني حار بالعسل", price: 48 }
    ],
    phone: "+966 53 444 8899",
    hours: "4:00 PM - 1:00 AM",
    descriptionEn: "Wood-fired artisanal pizzas baked at 450 degrees in our custom clay oven. Double zero flour imported from Italy.",
    descriptionAr: "بيتزا حرفية مطبوخة على الحطب في درجة حرارة 450 درجة في فرننا الطيني المخصص. دقيق فاخر مستورد من إيطاليا.",
    isActive: true,
    isSubscribed: true,
    subTier: "standard"
  }
];

export const initDB = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([
      { id: "owner-1", email: "owner1@truckmaps.sa", password: "password", name: "Ahmed Al-Harbi", role: "owner", truckId: "truck-1" },
      { id: "owner-2", email: "owner2@truckmaps.sa", password: "password", name: "Khalid Al-Otaibi", role: "owner", truckId: "truck-2" },
      { id: "owner-3", email: "owner3@truckmaps.sa", password: "password", name: "Sara Al-Dosari", role: "owner", truckId: "truck-3" },
      { id: "owner-4", email: "owner4@truckmaps.sa", password: "password", name: "Mohammad bin Ali", role: "owner", truckId: "truck-4" },
      { id: "owner-5", email: "owner5@truckmaps.sa", password: "password", name: "Reem Al-Sudairi", role: "owner", truckId: "truck-5" },
      { id: "cust-1", email: "customer@truckmaps.sa", password: "password", name: "Turki Al-Shehri", role: "customer" }
    ]));
  }
  if (!localStorage.getItem(KEYS.TRUCKS)) {
    localStorage.setItem(KEYS.TRUCKS, JSON.stringify(DEFAULT_TRUCKS));
  }
  if (!localStorage.getItem(KEYS.INQUIRIES)) {
    localStorage.setItem(KEYS.INQUIRIES, JSON.stringify([]));
  }
};

export const getUsers = () => {
  initDB();
  return JSON.parse(localStorage.getItem(KEYS.USERS));
};

export const getTrucks = () => {
  initDB();
  return JSON.parse(localStorage.getItem(KEYS.TRUCKS));
};

export const getInquiries = () => {
  initDB();
  return JSON.parse(localStorage.getItem(KEYS.INQUIRIES));
};

export const getCurrentUser = () => {
  const user = localStorage.getItem(KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const loginUser = (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    return { success: true, user };
  }
  return { success: false, message: "authErrorEmail" };
};

export const registerUser = (userData) => {
  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
    return { success: false, message: "Email already registered." };
  }
  
  const id = `user-${Date.now()}`;
  let truckId = null;
  
  if (userData.role === "owner") {
    truckId = `truck-${Date.now()}`;
    const trucks = getTrucks();
    const newTruck = {
      id: truckId,
      ownerId: id,
      nameEn: userData.truckName || "My Food Truck",
      nameAr: userData.truckName || "عربة طعامي",
      cuisine: "cuisineBurger",
      lat: 24.7136, // Center Riyadh by default
      lng: 46.6753,
      priceRange: "priceMedium",
      rating: 5.0,
      reviews: [],
      menu: [],
      phone: userData.phone || "+966 50 000 0000",
      hours: "4:00 PM - 12:00 AM",
      descriptionEn: "New registered food truck on TruckMaps!",
      descriptionAr: "عربة طعام جديدة مسجلة في خرائط فود تركس!",
      isActive: false,       // Offline by default
      isSubscribed: false,   // Unpaid by default
      subTier: null
    };
    trucks.push(newTruck);
    localStorage.setItem(KEYS.TRUCKS, JSON.stringify(trucks));
  }

  const newUser = {
    id,
    email: userData.email,
    password: userData.password,
    name: userData.name,
    role: userData.role,
    phone: userData.phone || "",
    truckId
  };

  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(newUser));
  return { success: true, user: newUser };
};

export const logoutUser = () => {
  localStorage.removeItem(KEYS.CURRENT_USER);
};

export const saveInquiry = (inquiry) => {
  const inquiries = getInquiries();
  const newInquiry = {
    id: `inq-${Date.now()}`,
    ...inquiry,
    date: new Date().toISOString()
  };
  inquiries.push(newInquiry);
  localStorage.setItem(KEYS.INQUIRIES, JSON.stringify(inquiries));
  return { success: true };
};

export const updateTruck = (truckId, updatedData) => {
  const trucks = getTrucks();
  const index = trucks.findIndex(t => t.id === truckId);
  if (index !== -1) {
    trucks[index] = { ...trucks[index], ...updatedData };
    localStorage.setItem(KEYS.TRUCKS, JSON.stringify(trucks));
    return { success: true, truck: trucks[index] };
  }
  return { success: false, message: "Truck not found." };
};

export const addReview = (truckId, review) => {
  const trucks = getTrucks();
  const index = trucks.findIndex(t => t.id === truckId);
  if (index !== -1) {
    const newReview = {
      id: `rev-${Date.now()}`,
      author: review.author,
      rating: parseInt(review.rating),
      text: review.text,
      date: new Date().toISOString().split("T")[0]
    };
    trucks[index].reviews.push(newReview);
    
    // Recalculate average rating
    const totalRating = trucks[index].reviews.reduce((sum, r) => sum + r.rating, 0);
    trucks[index].rating = parseFloat((totalRating / trucks[index].reviews.length).toFixed(1));
    
    localStorage.setItem(KEYS.TRUCKS, JSON.stringify(trucks));
    return { success: true, truck: trucks[index] };
  }
  return { success: false };
};

export const paySubscription = (truckId, tier) => {
  return updateTruck(truckId, {
    isSubscribed: true,
    subTier: tier,
    isActive: true // Turn on live map visibility instantly upon payment
  });
};
