import React, { useState } from 'react';
import './CustomerForm.css';

const CustomerForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    birthDate: '',
    preferredServices: [],
    notes: ''
  });


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceChange = (service) => {
    setFormData(prev => ({
      ...prev,
      preferredServices: prev.preferredServices.includes(service)
        ? prev.preferredServices.filter(s => s !== service)
        : [...prev.preferredServices, service]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8080/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Müşteri başarıyla kaydedildi:', result);
        alert('Müşteri kaydı başarıyla oluşturuldu!');
        
        // WebSocket bildirimi gönder
        try {
          const SockJS = require('sockjs-client');
          const { Client } = require('@stomp/stompjs');
          
          const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
              // İşletme sahibine yeni müşteri bildirimi gönder
              client.publish({
                destination: '/topic/notifications/1', // businessOwnerId = 1
                body: JSON.stringify({
                  type: 'NEW_CUSTOMER',
                  message: `Yeni müşteri kaydı: ${result.firstName} ${result.lastName}`,
                  customerId: result.id,
                  timestamp: new Date().toISOString()
                })
              });
              
              // Bağlantıyı kapat
              setTimeout(() => client.deactivate(), 1000);
            }
          });
          
          client.activate();
        } catch (wsError) {
          console.log('WebSocket bildirimi gönderilemedi:', wsError);
        }
        
        // Formu temizle
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          birthDate: '',
          preferredServices: [],
          notes: ''
        });
      } else {
        const errorData = await response.json();
        console.error('Kayıt hatası:', errorData);
        alert('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      alert('Sunucuya bağlanırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
    }
  };

  return (
    <div className="customer-form-container">
      <div className="customer-form">
        <h1>Müşteri Kayıt Formu</h1>
        <p className="form-description">
          Berber salonumuza hoş geldiniz! Lütfen bilgilerinizi doldurun.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Ad *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder="Adınızı girin"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Soyad *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Soyadınızı girin"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Telefon *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="(0555) 123 45 67"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">E-posta</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="ornek@email.com"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Şifre *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Şifrenizi girin"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="birthDate">Doğum Tarihi</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
            />
          </div>        
          <button type="submit" className="submit-btn">
            Kayıt Ol
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;