import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CustomerForm from './components/CustomerForm';
import CustomerLogin from './components/CustomerLogin';
import CustomerPanel from './components/CustomerPanel';
import HairDesignCarousel from './components/HairDesignCarousel';

import BusinessDashboard from './components/BusinessDashboard';
import logo from './assets/logo.svg';
import './App.css';

function App() {
  const [loggedInCustomer, setLoggedInCustomer] = useState(null);

  const handleCustomerLogin = (customer) => {
    setLoggedInCustomer(customer);
  };

  const handleCustomerLogout = () => {
    setLoggedInCustomer(null);
  };

  // Eğer müşteri giriş yapmışsa, müşteri panelini göster
  if (loggedInCustomer) {
    return (
      <CustomerPanel 
        customer={loggedInCustomer} 
        onLogout={handleCustomerLogout} 
      />
    );
  }

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              <img src={logo} alt="BerberApp Logo" className="logo-icon" />
              BerberApp
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/customer-register" className="nav-link">
                  Müşteri Kaydı
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/customer-login" className="nav-link">
                  Müşteri Girişi
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/business-dashboard" className="nav-link">
                  İşletme Paneli
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={
            <div className="home-page">
              <div className="home-content">
                <h1>
                  <img src={logo} alt="Logo" className="home-logo-start" />
                  Berber Salonu Yönetim Sistemi
                  <img src={logo} alt="Logo" className="home-logo-end" />
                </h1>
                <p>
                  <img src={logo} alt="Logo" className="home-logo-start" />
                  Hoş geldiniz! Lütfen yukarıdaki menüden işlem seçin.
                  <img src={logo} alt="Logo" className="home-logo-end" />
                </p>
              </div>
              <div className="carousel-section">
                <HairDesignCarousel />
              </div>
            </div>
          } />
          <Route path="/customer-register" element={<CustomerForm />} />
          <Route path="/customer-login" element={
            <CustomerLogin onLoginSuccess={handleCustomerLogin} />
          } />

          <Route path="/business-dashboard" element={<BusinessDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
