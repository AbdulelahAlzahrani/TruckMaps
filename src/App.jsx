import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import ContactPage from "./components/ContactPage";
import AuthModal from "./components/AuthModal";

import { translations } from "./utils/translations";
import { initDB, getCurrentUser, logoutUser } from "./utils/database";

export default function App() {
  const [activeView, setActiveView] = useState("landing"); // landing, map, contact
  const [activeLanguage, setActiveLanguage] = useState("en"); // en, ar
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initialize DB and fetch session on boot
  useEffect(() => {
    initDB();
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Update HTML document direction and language on toggle
  useEffect(() => {
    document.documentElement.dir = activeLanguage === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = activeLanguage;
  }, [activeLanguage]);

  // Translation helper
  const t = (key) => {
    if (translations[activeLanguage] && translations[activeLanguage][key]) {
      return translations[activeLanguage][key];
    }
    return key;
  };

  // Toggle English / Arabic
  const handleToggleLanguage = () => {
    setActiveLanguage(prev => prev === "en" ? "ar" : "en");
  };

  // Logout session
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setActiveView("landing");
  };

  // Auth Success callback
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    // If owner logins, redirect them to the dashboard automatically
    if (user.role === "owner") {
      setActiveView("map");
    }
  };

  return (
    <div className="app-container">
      {/* 1. PREMIUM GLASSMORPHIC NAVIGATION BAR */}
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setActiveView("landing")} style={{ cursor: "pointer" }}>
          <div className="nav-logo-icon">🚛</div>
          <div className="logo-text">
            {t("logo")}
            <span className="logo-subtext">{t("slogan")}</span>
          </div>
        </div>

        <div className="nav-links">
          <span 
            className={`nav-item ${activeView === "landing" ? "active" : ""}`}
            onClick={() => setActiveView("landing")}
          >
            {t("navHome")}
          </span>
          <span 
            className={`nav-item ${activeView === "map" ? "active" : ""}`}
            onClick={() => setActiveView("map")}
          >
            {t("navMap")}
          </span>
          <span 
            className={`nav-item ${activeView === "contact" ? "active" : ""}`}
            onClick={() => setActiveView("contact")}
          >
            {t("navContact")}
          </span>
        </div>

        <div className="nav-actions">
          {/* Language Switcher */}
          <button className="lang-btn" onClick={handleToggleLanguage}>
            🌐 {activeLanguage === "en" ? "العربية" : "English"}
          </button>

          {/* User Sign In or Account controls */}
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div 
                className="glass-panel" 
                style={{ 
                  padding: "8px 16px", 
                  fontSize: "0.85rem", 
                  fontWeight: "600",
                  borderColor: currentUser.role === "owner" ? "var(--gold-premium)" : "var(--accent-primary)",
                  background: "rgba(255,255,255,0.02)"
                }}
              >
                👤 {currentUser.name} {currentUser.role === "owner" ? "👑" : ""}
              </div>
              <button className="glass-button" style={{ padding: "8px 16px", fontSize: "0.85rem" }} onClick={handleLogout}>
                {t("navLogout")}
              </button>
            </div>
          ) : (
            <button className="glass-button-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }} onClick={() => setShowAuthModal(true)}>
              🔑 {t("navLogin")}
            </button>
          )}
        </div>
      </nav>

      {/* 2. MAIN APPLICATION CONTENT VIEWS */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeView === "landing" && (
          <LandingPage 
            t={t} 
            activeLanguage={activeLanguage}
            onExplore={() => setActiveView("map")}
            onRegister={() => {
              if (currentUser) {
                setActiveView("map");
              } else {
                setShowAuthModal(true);
              }
            }}
          />
        )}

        {activeView === "map" && (
          <Dashboard 
            t={t} 
            currentUser={currentUser}
            onLogout={handleLogout}
            activeLanguage={activeLanguage}
          />
        )}

        {activeView === "contact" && (
          <ContactPage 
            t={t} 
            currentUser={currentUser}
          />
        )}
      </main>

      {/* 3. SIGNIN / SIGNUP MODAL DRAWER */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        t={t}
        activeLanguage={activeLanguage}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
