import React, { useState } from "react";
import { saveInquiry } from "../utils/database";

export default function ContactPage({ t, currentUser }) {
  const [name, setName] = useState(currentUser ? currentUser.name : "");
  const [email, setEmail] = useState(currentUser ? currentUser.email : "");
  const [phone, setPhone] = useState(currentUser ? currentUser.phone || "" : "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [truckName, setTruckName] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name || !email || !subject || !message) {
      setError(t("authErrorFields"));
      return;
    }

    const res = saveInquiry({
      name,
      email,
      phone,
      subject,
      message,
      truckName: currentUser?.role === "owner" ? currentUser.truckId : truckName,
      userId: currentUser?.id || "anonymous"
    });

    if (res.success) {
      setSuccess(true);
      setMessage("");
      setSubject("");
    } else {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="contact-container animate-fade">
      <div className="contact-form-panel glass-panel">
        <h2 className="section-title" style={{ textAlign: "left", marginBottom: "12px" }}>
          {t("contactFormHeader")}
        </h2>
        <p style={{ marginBottom: "30px" }}>
          {t("contactSubtitle")}
        </p>

        {success && (
          <div className="status-alert" style={{ marginBottom: "20px" }}>
            {t("contactSuccess")}
          </div>
        )}

        {error && (
          <div className="status-alert error" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t("contactNameLabel")} *</label>
            <input 
              type="text" 
              className="glass-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={t("namePlaceholder")}
              required
            />
          </div>

          <div className="form-group">
            <label>{t("contactEmailLabel")} *</label>
            <input 
              type="email" 
              className="glass-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder={t("emailPlaceholder")}
              required
            />
          </div>

          <div className="form-group">
            <label>{t("contactPhoneLabel")}</label>
            <input 
              type="tel" 
              className="glass-input" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder={t("phonePlaceholder")}
            />
          </div>

          {currentUser?.role !== "owner" && (
            <div className="form-group">
              <label>{t("truckNamePlaceholder")} ({t("statusOffline")})</label>
              <input 
                type="text" 
                className="glass-input" 
                value={truckName} 
                onChange={(e) => setTruckName(e.target.value)} 
                placeholder={t("truckNamePlaceholder")}
              />
            </div>
          )}

          <div className="form-group">
            <label>{t("contactSubjectLabel")} *</label>
            <select 
              className="glass-input" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              required
              style={{ color: subject ? "#fff" : "rgba(255,255,255,0.4)" }}
            >
              <option value="" disabled>{t("contactSubjectPlaceholder")}</option>
              <option value="billing">{t("subjectBilling")}</option>
              <option value="map">{t("subjectMap")}</option>
              <option value="general">{t("subjectGeneral")}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t("contactMessageLabel")} *</label>
            <textarea 
              className="glass-input" 
              rows="5"
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder={t("contactMessagePlaceholder")}
              required
              style={{ resize: "vertical" }}
            />
          </div>

          <button type="submit" className="glass-button-primary" style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}>
            {t("btnSubmitContact")}
          </button>
        </form>
      </div>

      <div className="contact-info-panel">
        <div>
          <span className="badge-tag">{t("contactInfoTitle")}</span>
          <h2 className="section-title" style={{ textAlign: "left", marginBottom: "16px", marginTop: "8px" }}>
            {t("contactInfoTitle")}
          </h2>
          <p style={{ fontSize: "1.1rem" }}>
            {t("contactInfoSubtitle")}
          </p>
        </div>

        <div className="contact-card glass-panel">
          <div className="contact-card-icon">
            💬
          </div>
          <div className="contact-card-content">
            <span className="contact-card-title">{t("directWhatsApp")}</span>
            <p style={{ fontSize: "0.9rem", marginBottom: "4px" }}>Available 24/7 for premium subscribers in Riyadh</p>
            <a href="https://wa.me/966114650000" target="_blank" rel="noopener noreferrer" className="contact-card-link">
              {t("whatsappLinkText")} →
            </a>
          </div>
        </div>

        <div className="contact-card glass-panel">
          <div className="contact-card-icon">
            ✉️
          </div>
          <div className="contact-card-content">
            <span className="contact-card-title">{t("directEmail")}</span>
            <p style={{ fontSize: "0.9rem", marginBottom: "4px" }}>Inquiries handled within 12 hours</p>
            <a href="mailto:support@truckmaps.sa" className="contact-card-link">
              {t("emailLinkText")}
            </a>
          </div>
        </div>

        <div className="contact-card glass-panel">
          <div className="contact-card-icon">
            📞
          </div>
          <div className="contact-card-content">
            <span className="contact-card-title">{t("directPhone")}</span>
            <p style={{ fontSize: "0.9rem", marginBottom: "4px" }}>Daily 9:00 AM - 9:00 PM Riyadh time</p>
            <a href="tel:+966114650000" className="contact-card-link">
              {t("phoneLinkText")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
