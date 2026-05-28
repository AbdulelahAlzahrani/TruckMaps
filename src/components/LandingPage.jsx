import React from "react";

export default function LandingPage({ t, onExplore, onRegister, activeLanguage }) {
  return (
    <div className="animate-fade" style={{ position: "relative" }}>
      {/* Background radial glow */}
      <div className="bg-glow-light"></div>

      {/* Hero Welcome Section */}
      <section className="landing-hero">
        <h1 className="hero-heading animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {t("heroTitle")}
        </h1>
        <p className="hero-desc animate-slide-up" style={{ animationDelay: "0.2s" }}>
          {t("heroSubtitle")}
        </p>
        <div className="hero-actions animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <button className="glass-button-primary" onClick={onExplore}>
            🔍 {t("btnFindTrucks")}
          </button>
          <button className="glass-button" onClick={onRegister}>
            🚛 {t("btnRegisterTruck")}
          </button>
        </div>

        {/* Small Riyadh Map preview box decoration */}
        <div 
          className="map-preview-container glass-panel animate-slide-up" 
          style={{ animationDelay: "0.4s", cursor: "pointer" }}
          onClick={onExplore}
        >
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: "url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/46.6753,24.7136,11.5,0/1000x400?access_token=mock')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.6) contrast(1.1)",
            backgroundColor: "#08120e"
          }}>
            {/* Visual simulation of dark Leaflet mapping */}
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"
            }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "rgba(0, 255, 170, 0.2)",
                border: "2px solid #00ffaa",
                display: "flex", alignItems: "center", justifyCenter: "center",
                boxShadow: "0 0 20px #00ffaa",
                animation: "pulseGlow 2s infinite",
                fontSize: "1.5rem",
                justifyContent: "center"
              }}>
                📍
              </div>
              <div className="glass-panel" style={{ padding: "6px 12px", fontSize: "0.8rem", fontWeight: "600", color: "#00ffaa" }}>
                Olaya District - Riyadh
              </div>
            </div>
            {/* Glowing pins simulation */}
            <div style={{ position: "absolute", top: "30%", left: "30%", fontSize: "1.2rem", animation: "pulseGlow 2.5s infinite" }}>🍔</div>
            <div style={{ position: "absolute", top: "70%", left: "20%", fontSize: "1.2rem", animation: "pulseGlow 1.8s infinite" }}>☕</div>
            <div style={{ position: "absolute", top: "25%", left: "75%", fontSize: "1.2rem", animation: "pulseGold 3s infinite" }}>🧇</div>
            <div style={{ position: "absolute", top: "60%", left: "80%", fontSize: "1.2rem", animation: "pulseGlow 2.2s infinite" }}>🌯</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <span className="badge-tag">{t("featuresTitle")}</span>
        <h2 className="section-title">{t("featuresSubtitle")}</h2>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">📍</div>
            <h3>{t("featGpsTitle")}</h3>
            <p>{t("featGpsDesc")}</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">📄</div>
            <h3>{t("featMenuTitle")}</h3>
            <p>{t("featMenuDesc")}</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">👑</div>
            <h3>{t("featSubTitle")}</h3>
            <p>{t("featSubDesc")}</p>
          </div>
        </div>
      </section>

      {/* Pricing / Subscription Section */}
      <section className="pricing-section">
        <span className="badge-tag">💰 Subscription</span>
        <h2 className="section-title">{t("pricingTitle")}</h2>
        <p className="section-subtitle">{t("pricingSubtitle")}</p>

        <div className="pricing-grid">
          {/* Standard Plan */}
          <div className="pricing-card glass-panel">
            <h3 className="plan-name">{t("planStandard")}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Best for pop-up food vendors in Riyadh</p>
            <div className="price-container">
              <span className="price-value">{t("priceStandard")}</span>
              <span className="price-period">{t("perMonth")}</span>
            </div>
            <ul className="plan-features-list">
              <li>{t("planStandardFeat1")}</li>
              <li>{t("planStandardFeat2")}</li>
              <li>{t("planStandardFeat3")}</li>
              <li>{t("planStandardFeat4")}</li>
            </ul>
            <button className="glass-button" style={{ width: "100%", justifyContent: "center" }} onClick={onRegister}>
              {t("btnSubscribe")}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="premium-footer">
        <div className="footer-grid">
          
          {/* Brand Info Column */}
          <div className="footer-col animate-fade">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="nav-logo-icon" style={{ width: "36px", height: "36px" }}>
                🚛
              </div>
              <span className="footer-brand-title">
                TruckMaps
              </span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.6" }}>
              {t("slogan")}
            </p>
          </div>

          {/* Quick Contact Info Column */}
          <div className="footer-col animate-fade">
            <h4 style={{ color: "var(--text-white)", fontSize: "1.05rem" }}>{t("contactInfoTitle")}</h4>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <span style={{ fontSize: "1.2rem" }}>✉️</span>
                <div className="footer-contact-details">
                  <span className="footer-contact-label">{t("directEmail")}</span>
                  <a href={`mailto:${t("emailLinkText")}`} className="footer-contact-value">
                    {t("emailLinkText")}
                  </a>
                </div>
              </div>
              
              <div className="footer-contact-item">
                <span style={{ fontSize: "1.2rem" }}>📞</span>
                <div className="footer-contact-details">
                  <span className="footer-contact-label">{t("directPhone")}</span>
                  <a href={`tel:${t("phoneLinkText").replace(/\s+/g, '')}`} className="footer-contact-value">
                    {t("phoneLinkText")}
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Rights */}
        <div className="footer-bottom">
          {t("footerRights")}
        </div>
      </footer>
    </div>
  );
}
