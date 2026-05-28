import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { 
  getTrucks, 
  updateTruck, 
  addReview, 
  paySubscription 
} from "../utils/database";

// Create markers — background flips with mapDarkMode so they stay visible on both light & dark tiles
const createCustomMarker = (color, isPremium = false, darkMode = false) => {
  const glowClass = isPremium ? "pulseGold" : "pulseGlow";
  const bg = darkMode ? "rgba(4,8,7,0.92)" : "#ffffff";
  const shadow = darkMode
    ? `0 0 12px ${isPremium ? "rgba(255,183,0,0.55)" : "rgba(0,255,170,0.55)"}`
    : "0 3px 10px rgba(0,0,0,0.22)";
  const pinSVG = `
    <div style="
      display:flex;align-items:center;justify-content:center;
      width:36px;height:36px;border-radius:50%;
      background:${bg};
      border:3px solid ${color};
      box-shadow:${shadow};
      position:relative;
    ">
      <span style="font-size:1.1rem;line-height:1;">📍</span>
      <div style="
        position:absolute;width:100%;height:100%;border-radius:50%;
        border:2px solid ${color};
        animation:${glowClass} 2s infinite;
        opacity:0;top:-3px;left:-3px;
      "></div>
    </div>`;
  return L.divIcon({
    html: pinSVG,
    className: "custom-leaflet-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

// Leaflet helper to handle clicks on the map for placing pins
function MapClickHandler({ onMapClick, enabled }) {
  useMapEvents({
    click(e) {
      if (enabled) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

// Custom trigger component to resolve the Leaflet container size invalidation issue on initial render in flex parent structures.
function MapResizeTrigger() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function Dashboard({ t, currentUser, onLogout, activeLanguage }) {
  const [trucks, setTrucks] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("any");
  const [priceFilter, setPriceFilter] = useState("any");
  const [statusFilter, setStatusFilter] = useState("any");
  const [activeTab, setActiveTab] = useState("menu"); // menu, reviews, about
  const [showCheckout, setShowCheckout] = useState(false);
  const [mapDarkMode, setMapDarkMode] = useState(false);
  
  // Review form states
  const [reviewName, setReviewName] = useState(currentUser ? currentUser.name : "");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  
  // Checkout states
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [payError, setPayError] = useState("");
  
  // Owner settings state
  const [myTruck, setMyTruck] = useState(null);
  const [ownerMode, setOwnerMode] = useState(false);
  
  // Editable fields for Owner
  const [editNameEn, setEditNameEn] = useState("");
  const [editNameAr, setEditNameAr] = useState("");
  const [editDescEn, setEditDescEn] = useState("");
  const [editDescAr, setEditDescAr] = useState("");
  const [editCuisine, setEditCuisine] = useState("cuisineBurger");
  const [editPrice, setEditPrice] = useState("priceMedium");
  const [editPhone, setEditPhone] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editIsActive, setEditIsActive] = useState(false);
  const [editLat, setEditLat] = useState(24.7136);
  const [editLng, setEditLng] = useState(46.6753);
  
  // Add menu item state
  const [newItemNameEn, setNewItemNameEn] = useState("");
  const [newItemNameAr, setNewItemNameAr] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [saveAlert, setSaveAlert] = useState("");

  // Compute markers dynamically based on dark/light mode
  const standardMarker = useMemo(() => createCustomMarker("#00ffaa", false, mapDarkMode), [mapDarkMode]);
  const premiumMarker  = useMemo(() => createCustomMarker("#ffb700", true,  mapDarkMode), [mapDarkMode]);
  const locatorMarker  = useMemo(() => createCustomMarker("#ffffff", false, mapDarkMode), [mapDarkMode]);

  // Load trucks from db
  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = () => {
    const list = getTrucks();
    setTrucks(list);

    // If current user is owner, load their specific truck
    if (currentUser?.role === "owner" && currentUser.truckId) {
      const truck = list.find(t => t.id === currentUser.truckId);
      if (truck) {
        setMyTruck(truck);
        // Pre-fill edit forms
        setEditNameEn(truck.nameEn);
        setEditNameAr(truck.nameAr);
        setEditDescEn(truck.descriptionEn || "");
        setEditDescAr(truck.descriptionAr || "");
        setEditCuisine(truck.cuisine);
        setEditPrice(truck.priceRange);
        setEditPhone(truck.phone);
        setEditHours(truck.hours);
        setEditIsActive(truck.isActive);
        setEditLat(truck.lat);
        setEditLng(truck.lng);
      }
    }
  };

  // Filter logic
  const filteredTrucks = trucks.filter(truck => {
    // Hidden trucks are only visible if they belong to the current owner (so they can place the pin)
    if (!truck.isActive || !truck.isSubscribed) {
      if (currentUser?.role === "owner" && currentUser.truckId === truck.id) {
        // Keep in filter so owner can see it
      } else {
        return false;
      }
    }

    const name = activeLanguage === "ar" ? truck.nameAr : truck.nameEn;
    const desc = activeLanguage === "ar" ? truck.descriptionAr : truck.descriptionEn;
    const searchMatch = 
      name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t(truck.cuisine).toLowerCase().includes(searchQuery.toLowerCase());
      
    const cuisineMatch = cuisineFilter === "all" || truck.cuisine === cuisineFilter;
    const ratingMatch = ratingFilter === "any" || truck.rating >= parseFloat(ratingFilter);
    const priceMatch = priceFilter === "any" || truck.priceRange === priceFilter;
    
    // Status match
    const statusMatch = statusFilter === "any" || 
      (statusFilter === "open" && truck.isActive) ||
      (statusFilter === "offline" && !truck.isActive);

    return searchMatch && cuisineMatch && ratingMatch && priceMatch && statusMatch;
  });

  // Handle owner changes saving
  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (!myTruck) return;

    const res = updateTruck(myTruck.id, {
      nameEn: editNameEn,
      nameAr: editNameAr,
      descriptionEn: editDescEn,
      descriptionAr: editDescAr,
      cuisine: editCuisine,
      priceRange: editPrice,
      phone: editPhone,
      hours: editHours,
      isActive: editIsActive,
      lat: editLat,
      lng: editLng
    });

    if (res.success) {
      setSaveAlert(t("saveSuccess"));
      loadData();
      setTimeout(() => setSaveAlert(""), 3000);
    }
  };

  // Handle adding menu item
  const handleAddMenuItem = (e) => {
    e.preventDefault();
    if (!newItemNameEn || !newItemNameAr || !newItemPrice || !myTruck) return;

    const newItem = {
      id: `menu-item-${Date.now()}`,
      nameEn: newItemNameEn,
      nameAr: newItemNameAr,
      price: parseFloat(newItemPrice)
    };

    const updatedMenu = [...(myTruck.menu || []), newItem];
    const res = updateTruck(myTruck.id, { menu: updatedMenu });
    
    if (res.success) {
      setNewItemNameEn("");
      setNewItemNameAr("");
      setNewItemPrice("");
      loadData();
    }
  };

  // Handle deleting menu item
  const handleDeleteMenuItem = (itemId) => {
    if (!myTruck) return;
    const updatedMenu = myTruck.menu.filter(item => item.id !== itemId);
    const res = updateTruck(myTruck.id, { menu: updatedMenu });
    if (res.success) {
      loadData();
    }
  };

  // Handle posting a review
  const handlePostReview = (e) => {
    e.preventDefault();
    if (!selectedTruck || !reviewText) return;

    const res = addReview(selectedTruck.id, {
      author: reviewName || "Anonymous",
      rating: reviewRating,
      text: reviewText
    });

    if (res.success) {
      setReviewText("");
      // Refresh the selected truck details
      setSelectedTruck(res.truck);
      loadData();
    }
  };

  // Complete payment simulation
  const handleCompletePayment = (e) => {
    e.preventDefault();
    setPayError("");

    if (!cardName || !cardNumber || !cardExpiry || !cardCVC) {
      setPayError(t("payErrorMsg"));
      return;
    }

    if (myTruck) {
      const res = paySubscription(myTruck.id, "standard");
      if (res.success) {
        setShowCheckout(false);
        loadData();
        alert(t("paySuccessMsg"));
      }
    }
  };

  // Map pin locator update click
  const handleMapPinLocate = (lat, lng) => {
    setEditLat(parseFloat(lat.toFixed(6)));
    setEditLng(parseFloat(lng.toFixed(6)));
  };

  return (
    <div className="dashboard-container">
      
      {/* 1. SIDEBAR FOR TRUCK LISTING / OWNER BOARD */}
      {currentUser?.role === "owner" && ownerMode ? (
        
        // --- OWNER CONTROL BOARD ---
        <div className="owner-portal-panel animate-fade" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div className="sidebar-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.3rem" }}>{t("ownerPanelTitle")}</h2>
            <button className="lang-btn" onClick={() => setOwnerMode(false)}>
              🔍 {t("navMap")}
            </button>
          </div>

          <div className="sidebar-filters-wrapper" style={{ flex: 1, padding: "20px" }}>
            
            {/* Save Status Alert */}
            {saveAlert && <div className="status-alert" style={{ marginBottom: "16px" }}>{saveAlert}</div>}

            {/* Subscription tracker */}
            {myTruck?.isSubscribed ? (
              <div className="subscription-info-card">
                <span className="subscription-title">{t("ownerSubStatus")}</span>
                <span className="subscription-value">👑 {t("subStatusActive")}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t("planStandard")} - Riyadh GPS Enabled</span>
              </div>
            ) : (
              <div className="subscription-info-card inactive">
                <span className="subscription-title">{t("ownerSubStatus")}</span>
                <span className="subscription-value">⚠️ {t("subStatusInactive")}</span>
                <button 
                  className="glass-button" 
                  style={{ marginTop: "12px", width: "100%", justifyContent: "center" }}
                  onClick={() => setShowCheckout(true)}
                >
                  💳 {t("btnActivateSub")}
                </button>
              </div>
            )}

            {/* GPS Marker setup */}
            <div className="form-group">
              <label style={{ color: "var(--accent-primary)", fontWeight: "700" }}>{t("ownerMapSetupTitle")}</label>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                {t("ownerMapSetupHelp")}
              </p>
              
              <div className="checkout-grid" style={{ gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Latitude</span>
                  <input type="text" className="glass-input" value={editLat} disabled style={{ background: "rgba(0,0,0,0.2)", fontSize: "0.8rem" }} />
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Longitude</span>
                  <input type="text" className="glass-input" value={editLng} disabled style={{ background: "rgba(0,0,0,0.2)", fontSize: "0.8rem" }} />
                </div>
              </div>
            </div>

            <hr style={{ border: "0", borderTop: "1px solid var(--border-glass-subtle)", margin: "16px 0" }} />

            {/* Truck Profile details form */}
            <form onSubmit={handleSaveSettings} className="auth-form" style={{ gap: "12px" }}>
              <h3 style={{ fontSize: "1rem", color: "var(--accent-primary)" }}>{t("truckSettingsTitle")}</h3>
              
              <div className="form-group">
                <label>Truck Name (English)</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={editNameEn} 
                  onChange={(e) => setEditNameEn(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>اسم العربة (عربي)</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={editNameAr} 
                  onChange={(e) => setEditNameAr(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Description (English)</label>
                <textarea 
                  className="glass-input" 
                  rows="2" 
                  value={editDescEn} 
                  onChange={(e) => setEditDescEn(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>الوصف (عربي)</label>
                <textarea 
                  className="glass-input" 
                  rows="2" 
                  value={editDescAr} 
                  onChange={(e) => setEditDescAr(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t("cuisineLabel")}</label>
                <select className="glass-input" value={editCuisine} onChange={(e) => setEditCuisine(e.target.value)}>
                  <option value="cuisineBurger">{t("cuisineBurger")}</option>
                  <option value="cuisineCoffee">{t("cuisineCoffee")}</option>
                  <option value="cuisineDesserts">{t("cuisineDesserts")}</option>
                  <option value="cuisineShawarma">{t("cuisineShawarma")}</option>
                  <option value="cuisinePizza">{t("cuisinePizza")}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t("priceLabel")}</label>
                <select className="glass-input" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}>
                  <option value="priceBudget">{t("priceBudget")}</option>
                  <option value="priceMedium">{t("priceMedium")}</option>
                  <option value="pricePremiumVal">{t("pricePremiumVal")}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t("phoneLabel")}</label>
                <input type="text" className="glass-input" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>

              <div className="form-group">
                <label>{t("hoursLabel")}</label>
                <input type="text" className="glass-input" value={editHours} onChange={(e) => setEditHours(e.target.value)} />
              </div>

              {/* Live map toggle status */}
              <div className="form-group" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass-subtle)" }}>
                <div>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>{t("liveToggleLabel")}</span>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {editIsActive ? t("liveToggleActive") : t("liveToggleOffline")}
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={editIsActive} 
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  disabled={!myTruck?.isSubscribed}
                  style={{ width: "20px", height: "20px", accentColor: "var(--accent-primary)", cursor: "pointer" }}
                />
              </div>

              <button type="submit" className="glass-button-primary" style={{ width: "100%", justifyContent: "center" }}>
                💾 {t("btnSaveSettings")}
              </button>
            </form>

            <hr style={{ border: "0", borderTop: "1px solid var(--border-glass-subtle)", margin: "24px 0" }} />

            {/* Menu Editor */}
            <div className="form-group">
              <h3 style={{ fontSize: "1rem", color: "var(--accent-primary)", marginBottom: "12px" }}>{t("manageMenuTitle")}</h3>
              
              {/* Existing menu items listing */}
              <div className="menu-list" style={{ marginBottom: "16px" }}>
                {myTruck?.menu?.map((item) => (
                  <div key={item.id} className="menu-item-row" style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.9rem" }}>{activeLanguage === "ar" ? item.nameAr : item.nameEn}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)" }}>{item.price} SAR</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteMenuItem(item.id)}
                      style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "1rem" }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              {/* Add menu item form */}
              <form onSubmit={handleAddMenuItem} className="auth-form" style={{ gap: "10px" }}>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="Item Name (English)" 
                  value={newItemNameEn}
                  onChange={(e) => setNewItemNameEn(e.target.value)}
                  required 
                />
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="اسم الصنف (عربي)" 
                  value={newItemNameAr}
                  onChange={(e) => setNewItemNameAr(e.target.value)}
                  required 
                />
                <input 
                  type="number" 
                  className="glass-input" 
                  placeholder={t("newItemPrice")} 
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  required 
                />
                <button type="submit" className="glass-button" style={{ width: "100%", justifyContent: "center" }}>
                  ＋ {t("btnAddItem")}
                </button>
              </form>
            </div>

          </div>
        </div>

      ) : (

        // --- CUSTOMER SEARCH / MAP VIEW SIDEBAR ---
        <div className="dashboard-sidebar">
          <div className="sidebar-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1.2rem" }}>{t("filterTitle")}</h2>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t("slogan")}</p>
            </div>
            
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {/* Dark Mode Map Toggle */}
              <button
                className="lang-btn"
                onClick={() => setMapDarkMode(prev => !prev)}
                title={mapDarkMode ? "Switch to Light Map" : "Switch to Dark Map"}
                style={{
                  background: mapDarkMode ? "rgba(0,255,170,0.1)" : "rgba(255,255,255,0.08)",
                  borderColor: mapDarkMode ? "var(--accent-primary)" : "var(--border-glass-subtle)",
                  color: mapDarkMode ? "var(--accent-primary)" : "var(--text-muted)",
                  fontSize: "1rem",
                  padding: "6px 10px"
                }}
              >
                {mapDarkMode ? "☀️" : "🌙"}
              </button>

              {/* Switch to Owner panel if owner logged in */}
              {currentUser?.role === "owner" && (
                <button className="lang-btn" onClick={() => setOwnerMode(true)} style={{ color: "var(--gold-premium)", borderColor: "var(--gold-premium)" }}>
                  👑 {t("navDashboard")}
                </button>
              )}
            </div>
          </div>

          <div className="sidebar-filters-wrapper">
            
            {/* 1. SEARCH INPUT */}
            <div className="search-box-wrapper">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                className="glass-input" 
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* 2. CUISINE SELECTION */}
            <div className="form-group">
              <label>{t("cuisineLabel")}</label>
              <select className="glass-input" value={cuisineFilter} onChange={(e) => setCuisineFilter(e.target.value)}>
                <option value="all">{t("allCuisines")}</option>
                <option value="cuisineBurger">{t("cuisineBurger")}</option>
                <option value="cuisineCoffee">{t("cuisineCoffee")}</option>
                <option value="cuisineDesserts">{t("cuisineDesserts")}</option>
                <option value="cuisineShawarma">{t("cuisineShawarma")}</option>
                <option value="cuisinePizza">{t("cuisinePizza")}</option>
              </select>
            </div>

            {/* 3. MINIMUM RATING */}
            <div className="form-group">
              <label>{t("ratingLabel")}</label>
              <select className="glass-input" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                <option value="any">{t("minRatingAny")}</option>
                <option value="4.5">★ 4.5+</option>
                <option value="4.0">★ 4.0+</option>
                <option value="3.0">★ 3.0+</option>
              </select>
            </div>

            {/* 4. PRICE RANGE */}
            <div className="form-group">
              <label>{t("priceLabel")}</label>
              <select className="glass-input" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                <option value="any">{t("priceAny")}</option>
                <option value="priceBudget">{t("priceBudget")}</option>
                <option value="priceMedium">{t("priceMedium")}</option>
                <option value="pricePremiumVal">{t("pricePremiumVal")}</option>
              </select>
            </div>

            {/* 5. OPERATING STATUS */}
            <div className="form-group">
              <label>{t("statusLabel")}</label>
              <select className="glass-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="any">{t("statusAny")}</option>
                <option value="open">{t("statusOpen")}</option>
                <option value="offline">{t("statusOffline")}</option>
              </select>
            </div>

            <hr style={{ border: "0", borderTop: "1px solid var(--border-glass-subtle)", margin: "10px 0" }} />

            {/* List of matching food trucks */}
            <div className="sidebar-truck-cards">
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontWeight: "600" }}>
                {filteredTrucks.length} TRUCKS FOUND IN RIYADH
              </span>
              
              {filteredTrucks.map((truck) => {
                const name = activeLanguage === "ar" ? truck.nameAr : truck.nameEn;
                const isSelected = selectedTruck?.id === truck.id;
                
                return (
                  <div 
                    key={truck.id} 
                    className={`truck-summary-card ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      setSelectedTruck(truck);
                      setActiveTab("menu");
                    }}
                  >
                    <div className="truck-summary-info">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="truck-summary-title">{name}</span>
                        {truck.subTier === "premium" && (
                          <span style={{ fontSize: "0.75rem", color: "var(--gold-premium)" }}>👑</span>
                        )}
                      </div>
                      <span className="truck-summary-cuisine">{t(truck.cuisine)}</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                      <span className="truck-summary-rating">★ {truck.rating}</span>
                      {truck.isActive && truck.isSubscribed ? (
                        <span className="drawer-badge" style={{ fontSize: "0.6rem", padding: "2px 6px" }}>{t("statusOpen")}</span>
                      ) : (
                        <span className="drawer-badge offline" style={{ fontSize: "0.6rem", padding: "2px 6px" }}>{t("statusOffline")}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* 2. MAP COMPONENT PANE */}
      <div className="map-pane">
        <MapContainer
          key={mapDarkMode ? "dark" : "light"}
          center={[24.7136, 46.6753]}
          zoom={12}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "100%", minHeight: "400px" }}
        >
          <MapResizeTrigger />
          {mapDarkMode ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
          )}

          {/* Place marker for all filtered food trucks in Riyadh */}
          {filteredTrucks.filter(truck => truck && typeof truck.lat === 'number' && typeof truck.lng === 'number' && !isNaN(truck.lat) && !isNaN(truck.lng)).map((truck) => {
            const markerIcon = standardMarker; // Standard Plan uses the beautiful green glowing pin
            
            return (
              <Marker 
                key={truck.id} 
                position={[truck.lat, truck.lng]} 
                icon={markerIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedTruck(truck);
                    setActiveTab("menu");
                  }
                }}
              >
                <Popup>
                  <div style={{ padding: "4px", minWidth: "120px" }}>
                    <h4 style={{ color: "var(--accent-primary)", marginBottom: "4px" }}>
                      {activeLanguage === "ar" ? truck.nameAr : truck.nameEn}
                    </h4>
                    <span style={{ fontSize: "0.75rem", display: "block", color: "var(--text-muted)" }}>
                      {t(truck.cuisine)}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--gold-premium)" }}>
                      ★ {truck.rating}
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Locator pin specifically for the owner when placing/dragging their truck pin */}
          {currentUser?.role === "owner" && ownerMode && (
            <>
              <Marker 
                position={[editLat, editLng]} 
                icon={locatorMarker}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    handleMapPinLocate(position.lat, position.lng);
                  }
                }}
              />
              <MapClickHandler 
                enabled={true} 
                onMapClick={handleMapPinLocate} 
              />
            </>
          )}
        </MapContainer>

        {/* 3. TRUCK INFORMATION DRAWER SLIDE-OUT */}
        {selectedTruck && (
          <div className="truck-drawer glass-panel">
            {/* Header image cover with dynamic colors */}
            <div className="drawer-header-image">
              <div className="drawer-header-overlay"></div>
              
              <button className="drawer-close-btn" onClick={() => setSelectedTruck(null)}>&times;</button>
              
              <div className="drawer-title-block">
                {selectedTruck.subTier === "premium" ? (
                  <span className="drawer-badge gold">👑 Premium Gold</span>
                ) : (
                  <span className="drawer-badge">Standard Tier</span>
                )}
                <h2 style={{ fontSize: "1.4rem", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                  {activeLanguage === "ar" ? selectedTruck.nameAr : selectedTruck.nameEn}
                </h2>
                <span style={{ fontSize: "0.85rem", color: "var(--accent-primary)" }}>
                  {t(selectedTruck.cuisine)}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="drawer-tabs">
              <div className={`drawer-tab ${activeTab === "menu" ? "active" : ""}`} onClick={() => setActiveTab("menu")}>
                {t("truckMenuTab")}
              </div>
              <div className={`drawer-tab ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>
                {t("truckReviewsTab")}
              </div>
              <div className={`drawer-tab ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}>
                {t("truckAboutTab")}
              </div>
            </div>

            {/* Tab contents */}
            <div className="drawer-content">
              {activeTab === "menu" && (
                <div className="menu-list">
                  {selectedTruck.menu && selectedTruck.menu.length > 0 ? (
                    selectedTruck.menu.map((item) => (
                      <div key={item.id} className="menu-item-row animate-slide-up">
                        <span className="menu-item-name">{activeLanguage === "ar" ? item.nameAr : item.nameEn}</span>
                        <span className="menu-item-price">{item.price} SAR</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px", color: "var(--text-dim)" }}>
                      No menu items listed.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="review-stats-card">
                    <span className="review-avg-num">{selectedTruck.rating}</span>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "700" }}>{t("ratingAverage")}</span>
                      <span className="review-stars">{"★".repeat(Math.round(selectedTruck.rating)) + "☆".repeat(5 - Math.round(selectedTruck.rating))}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{selectedTruck.reviews?.length || 0} reviews</span>
                    </div>
                  </div>

                  <div className="reviews-list-wrapper">
                    {selectedTruck.reviews && selectedTruck.reviews.length > 0 ? (
                      selectedTruck.reviews.map((rev) => (
                        <div key={rev.id} className="review-bubble animate-slide-up">
                          <div className="review-bubble-header">
                            <span className="review-author">{rev.author}</span>
                            <span className="review-stars">{"★".repeat(rev.rating) + "☆".repeat(5 - rev.rating)}</span>
                          </div>
                          <p className="review-bubble-text">{rev.text}</p>
                          <span className="review-date" style={{ display: "block", textAlign: "right", marginTop: "8px" }}>{rev.date}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: "center", padding: "20px", color: "var(--text-dim)" }}>
                        {t("noReviews")}
                      </div>
                    )}
                  </div>

                  {/* Add review form */}
                  <form onSubmit={handlePostReview} className="write-review-box">
                    <h4 style={{ fontSize: "0.95rem" }}>{t("writeReviewTitle")}</h4>
                    
                    <div className="role-selector" style={{ gap: "6px" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div 
                          key={star} 
                          className={`role-option ${reviewRating === star ? "active" : ""}`}
                          onClick={() => setReviewRating(star)}
                          style={{ padding: "6px" }}
                        >
                          ★ {star}
                        </div>
                      ))}
                    </div>

                    <input 
                      type="text" 
                      className="glass-input" 
                      placeholder={t("namePlaceholder")} 
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                    />
                    
                    <textarea 
                      className="glass-input" 
                      rows="2" 
                      placeholder={t("reviewTextPlaceholder")}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                    />

                    <button type="submit" className="glass-button" style={{ width: "100%", justifyContent: "center" }}>
                      {t("btnSubmitReview")}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "about" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Description</span>
                    <p style={{ marginTop: "4px" }}>
                      {activeLanguage === "ar" ? selectedTruck.descriptionAr : selectedTruck.descriptionEn}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>{t("hoursLabel")}</span>
                    <p style={{ fontWeight: "600", color: "var(--accent-primary)", marginTop: "2px" }}>⏱️ {selectedTruck.hours}</p>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>{t("phoneLabel")}</span>
                    <p style={{ fontWeight: "600", marginTop: "2px" }}>📞 {selectedTruck.phone}</p>
                  </div>

                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedTruck.lat},${selectedTruck.lng}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="glass-button-primary"
                    style={{ justifyContent: "center", textDecoration: "none", marginTop: "10px" }}
                  >
                    🚗 {t("locationDirections")}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 4. PREMIUM SUBSCRIPTION CHECKOUT GATEWAY DIALOG */}
      {showCheckout && (
        <div className="modal-overlay" onClick={() => setShowCheckout(false)}>
          <div className="auth-modal glass-panel" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowCheckout(false)}>&times;</button>
            
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <span className="badge-tag">💳 Stripe Secure</span>
              <h3 style={{ fontSize: "1.3rem", marginTop: "8px" }}>{t("payModalHeader")}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{t("payModalSub")}</p>
            </div>

            {payError && <div className="status-alert error" style={{ marginBottom: "16px" }}>{payError}</div>}

            <form onSubmit={handleCompletePayment} className="auth-form">
              <div className="form-group">
                <label>{t("payCardName")}</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="Ahmad Al-Harbi"
                  value={cardName} 
                  onChange={(e) => setCardName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>{t("payCardNumber")}</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="4000 1234 5678 9010"
                  value={cardNumber} 
                  onChange={(e) => setCardNumber(e.target.value)} 
                  maxLength="19"
                  required 
                />
              </div>

              <div className="checkout-grid" style={{ gap: "12px" }}>
                <div className="form-group">
                  <label>{t("payCardExpiry")}</label>
                  <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="12/28"
                    value={cardExpiry} 
                    onChange={(e) => setCardExpiry(e.target.value)} 
                    maxLength="5"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>{t("payCardCVC")}</label>
                  <input 
                    type="password" 
                    className="glass-input" 
                    placeholder="•••"
                    value={cardCVC} 
                    onChange={(e) => setCardCVC(e.target.value)} 
                    maxLength="3"
                    required 
                  />
                </div>
              </div>

              <div style={{ 
                margin: "12px 0", padding: "12px", borderRadius: "10px", 
                background: "rgba(0,255,170,0.05)", border: "1px solid rgba(0,255,170,0.15)",
                fontSize: "0.85rem", color: "var(--accent-primary)", textAlign: "center"
              }}>
                Total Due: <strong style={{ fontSize: "1.1rem" }}>100 SAR</strong> / month
              </div>

              <button type="submit" className="glass-button" style={{ width: "100%", justifyContent: "center" }}>
                🔒 {t("btnCompletePayment")}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
