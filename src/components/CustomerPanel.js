import React, { useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import './CustomerPanel.css';

function CustomerPanel({ customer, onLogout }) {
  const [selectedServices, setSelectedServices] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const availableServices = [
    { name: 'Saç Kesimi', price: 150 },
    { name: 'Sakal Tıraşı', price: 80 },
    { name: 'Saç Yıkama', price: 50 },
    { name: 'Saç Boyama', price: 300 },
    { name: 'Perma', price: 400 },
    { name: 'Saç Bakımı', price: 200 },
    { name: 'Kaş Düzeltme', price: 60 },
    { name: 'Yüz Bakımı', price: 250 }
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const handleServiceChange = (service) => {
    setSelectedServices(prev => {
      if (prev.some(s => s.name === service.name)) {
        return prev.filter(s => s.name !== service.name);
      } else {
        return [...prev, service];
      }
    });
  };

  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedServices.length === 0) {
      showMessage('Lütfen en az bir hizmet seçin', 'error');
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      showMessage('Lütfen tarih ve saat seçin', 'error');
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        customerId: customer.id,
        businessOwnerId: 1, // Varsayılan işletme sahibi
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        services: selectedServices.map(s => s.name),
        totalPrice: calculateTotalPrice(),
        notes: notes,
        status: 'PENDING'
      };

      const response = await fetch('http://localhost:8080/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        const appointment = await response.json();
        showMessage('Randevunuz başarıyla oluşturuldu!', 'success');
        
        // WebSocket ile işletme sahibine bildirim gönder
        sendNotificationToBusinessOwner(appointment);
        
        // Formu temizle
        setSelectedServices([]);
        setAppointmentDate('');
        setAppointmentTime('');
        setNotes('');
      } else {
        const errorData = await response.json();
        showMessage(errorData.message || 'Randevu oluşturulamadı', 'error');
      }
    } catch (error) {
      console.error('Appointment creation error:', error);
      showMessage('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendNotificationToBusinessOwner = (appointment) => {
    try {
      const socket = new SockJS('http://localhost:8080/ws');
      const stompClient = Stomp.over(socket);
      
      stompClient.connect({}, () => {
        const notification = {
          type: 'NEW_APPOINTMENT',
          message: `${customer.firstName} ${customer.lastName} yeni randevu oluşturdu`,
          appointment: appointment,
          timestamp: new Date().toISOString()
        };
        
        stompClient.send('/topic/notifications/1', {}, JSON.stringify(notification));
        stompClient.disconnect();
      });
    } catch (error) {
      console.error('WebSocket notification error:', error);
    }
  };

  // Bugünden itibaren 30 gün sonrasına kadar tarih seçimine izin ver
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="customer-panel">
      <div className="panel-header">
        <div className="welcome-section">
          <h2>Hoş Geldiniz, {customer.firstName} {customer.lastName}</h2>
          <p>Randevu oluşturmak için aşağıdaki formu doldurun</p>
        </div>
        <button onClick={onLogout} className="logout-btn">
          Çıkış Yap
        </button>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="panel-content">
        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-section">
            <h3>Hizmet Seçimi</h3>
            <div className="services-grid">
              {availableServices.map(service => (
                <label key={service.name} className="service-item">
                  <input
                    type="checkbox"
                    checked={selectedServices.some(s => s.name === service.name)}
                    onChange={() => handleServiceChange(service)}
                  />
                  <span className="checkmark"></span>
                  <div className="service-info">
                    <span className="service-name">{service.name}</span>
                    <span className="service-price">₺{service.price}</span>
                  </div>
                </label>
              ))}
            </div>
            
            {selectedServices.length > 0 && (
              <div className="total-price-section">
                <h4>Seçilen Hizmetler:</h4>
                <ul className="selected-services">
                  {selectedServices.map(service => (
                    <li key={service.name}>
                      {service.name} - ₺{service.price}
                    </li>
                  ))}
                </ul>
                <div className="total-price">
                  <strong>Toplam Fiyat: ₺{calculateTotalPrice()}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Tarih ve Saat</h3>
            <div className="datetime-grid">
              <div className="form-group">
                <label htmlFor="appointmentDate">Tarih *</label>
                <input
                  type="date"
                  id="appointmentDate"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="appointmentTime">Saat *</label>
                <select
                  id="appointmentTime"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  required
                >
                  <option value="">Saat seçin</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Notlar</h3>
            <div className="form-group">
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Özel isteklerinizi buraya yazabilirsiniz..."
                rows="4"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Randevu Oluşturuluyor...' : 'Randevu Oluştur'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CustomerPanel;