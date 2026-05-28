import React, { useState } from "react";
import { loginUser, registerUser } from "../utils/database";

export default function AuthModal({ isOpen, onClose, t, activeLanguage, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("customer"); // customer or owner
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [truckName, setTruckName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password || (!isLogin && !name)) {
      setError(t("authErrorFields"));
      return;
    }

    if (isLogin) {
      const res = loginUser(email, password);
      if (res.success) {
        setSuccess(t("authSuccessLogin"));
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 1000);
      } else {
        setError(t(res.message));
      }
    } else {
      // Sign up
      if (role === "owner" && !truckName) {
        setError(t("authErrorFields"));
        return;
      }

      const res = registerUser({
        email,
        password,
        name,
        role,
        phone,
        truckName
      });

      if (res.success) {
        setSuccess(t("authSuccessRegister"));
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 1000);
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        <div className="auth-tabs">
          <div 
            className={`auth-tab ${isLogin ? "active" : ""}`} 
            onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
          >
            {t("btnSubmitLogin")}
          </div>
          <div 
            className={`auth-tab ${!isLogin ? "active" : ""}`} 
            onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
          >
            {t("authTitleRegister")}
          </div>
        </div>

        <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
          {isLogin ? t("authTitleLogin") : t("authTitleRegister")}
        </h3>

        {error && <div className="status-alert error" style={{ marginBottom: "16px" }}>{error}</div>}
        {success && <div className="status-alert" style={{ marginBottom: "16px" }}>{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group animate-slide-up">
              <label>{t("contactNameLabel")}</label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder={t("namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {!isLogin && (
            <div className="form-group animate-slide-up">
              <label>{t("cuisineLabel")}</label>
              <div className="role-selector">
                <div 
                  className={`role-option ${role === "customer" ? "active" : ""}`}
                  onClick={() => setRole("customer")}
                >
                  {t("roleCustomer")}
                </div>
                <div 
                  className={`role-option ${role === "owner" ? "active" : ""}`}
                  onClick={() => setRole("owner")}
                >
                  {t("roleOwner")}
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>{t("contactEmailLabel")}</label>
            <input 
              type="email" 
              className="glass-input" 
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>{t("passwordPlaceholder")}</label>
            <input 
              type="password" 
              className="glass-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!isLogin && role === "owner" && (
            <div className="form-group animate-slide-up">
              <label>{t("truckNamePlaceholder")}</label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder={t("truckNamePlaceholder")}
                value={truckName}
                onChange={(e) => setTruckName(e.target.value)}
              />
            </div>
          )}

          {!isLogin && role === "owner" && (
            <div className="form-group animate-slide-up">
              <label>{t("contactPhoneLabel")}</label>
              <input 
                type="tel" 
                className="glass-input" 
                placeholder={t("phonePlaceholder")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="glass-button-primary" style={{ marginTop: "10px", width: "100%", justifyContent: "center" }}>
            {isLogin ? t("btnSubmitLogin") : t("btnSubmitRegister")}
          </button>
        </form>

        <div className="auth-switch-text" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? t("authSwitchToRegister") : t("authSwitchToLogin")}
        </div>
      </div>
    </div>
  );
}
