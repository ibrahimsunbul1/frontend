import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CustomerForm from './components/CustomerForm';
import CustomerLogin from './components/CustomerLogin';
import CustomerPanel from './components/CustomerPanel';

import BusinessDashboard from './components/BusinessDashboard';
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
        <nav className="navbar" style={{
          padding: '20px',
          background: 'var(--primary-black)',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              Berber Salonu
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/customer-register" className="nav-link" style={{
                  color: 'var(--primary-light)',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  background: 'var(--primary-brown)',
                  transition: 'all 0.3s ease'
                }}>
                  Müşteri Kaydı
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/customer-login" className="nav-link" style={{
                  color: 'var(--primary-light)',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  background: 'var(--primary-brown)',
                  transition: 'all 0.3s ease'
                }}>
                  Müşteri Girişi
                </Link>
              </li>

              <li className="nav-item">
                <Link to="/business-dashboard" className="nav-link" style={{
                  color: 'var(--primary-light)',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  background: 'var(--primary-brown)',
                  transition: 'all 0.3s ease'
                }}>
                  İşletme Paneli
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={
            <div className="home-page">
              <h1>Berber Salonu Yönetim Sistemi</h1>
              <p>Hoş geldiniz! Lütfen yukarıdaki menüden işlem seçin.</p>
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
