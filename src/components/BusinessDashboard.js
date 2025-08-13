import React, { useState, useEffect } from 'react';
import './BusinessDashboard.css';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const BusinessDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('appointments');
  const [customerActivities, setCustomerActivities] = useState([]);
  const [businessOwnerId, setBusinessOwnerId] = useState(1); // Geçici olarak 1 kullanıyoruz

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:8080/customers');
      if (!response.ok) {
        throw new Error('Müşteriler yüklenemedi');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error('Müşteri yükleme hatası:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let url;
      if (filter === 'ALL') {
        url = `http://localhost:8080/appointments/business/${businessOwnerId}`;
      } else {
        url = `http://localhost:8080/appointments/business/${businessOwnerId}/status/${filter}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Randevular yüklenemedi');
      }
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error('Randevu yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      // Önce randevu bilgilerini al
      const appointment = appointments.find(app => app.id === appointmentId);
      
      const response = await fetch(`http://localhost:8080/appointments/${appointmentId}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Durum güncellenemedi');
      }
      
      // Aktivite ekle
      if (appointment) {
        const activity = {
          id: Date.now(),
          type: 'APPOINTMENT_STATUS_CHANGED',
          message: `${appointment.customerName} randevusu ${getStatusText(newStatus).toLowerCase()} olarak işaretlendi`,
          timestamp: new Date().toISOString(),
          details: {
            ...appointment,
            newStatus: newStatus,
            totalPrice: appointment.totalPrice || 0
          }
        };
        setCustomerActivities(prev => [activity, ...prev.slice(0, 9)]);
      }
      
      // Randevuları yeniden yükle
      fetchAppointments();
    } catch (err) {
      console.error('Durum güncelleme hatası:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchCustomers();
  }, [filter, businessOwnerId]);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      onConnect: () => {
        console.log('WebSocket bağlantısı kuruldu');
        
        // Randevu bildirimleri için abone ol
        client.subscribe(`/topic/notifications/${businessOwnerId}`, (message) => {
          const notification = JSON.parse(message.body);
          console.log('Bildirim alındı:', notification);
          
          if (notification.type === 'NEW_APPOINTMENT') {
            fetchAppointments();
            // Müşteri aktivitesi olarak ekle
            const activity = {
              id: Date.now(),
              type: 'APPOINTMENT_CREATED',
              message: `${notification.appointment?.customerName || 'Müşteri'} yeni randevu oluşturdu`,
              timestamp: new Date().toISOString(),
              details: {
                ...notification.appointment,
                totalPrice: notification.appointment?.totalPrice || 0,
                services: notification.appointment?.services || []
              }
            };
            setCustomerActivities(prev => [activity, ...prev.slice(0, 9)]); // Son 10 aktiviteyi tut
          } else if (notification.type === 'NEW_CUSTOMER') {
            fetchCustomers();
            // Müşteri aktivitesi olarak ekle
            const activity = {
              id: Date.now(),
              type: 'CUSTOMER_REGISTERED',
              message: `${notification.customer?.firstName || ''} ${notification.customer?.lastName || ''} sisteme kayıt oldu`,
              timestamp: new Date().toISOString(),
              details: notification.customer
            };
            setCustomerActivities(prev => [activity, ...prev.slice(0, 9)]); // Son 10 aktiviteyi tut
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP hatası:', frame);
      }
    });
    
    client.activate();
    
    return () => {
      client.deactivate();
    };
  }, [businessOwnerId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#ffa500';
      case 'CONFIRMED': return '#28a745';
      case 'COMPLETED': return '#6c757d';
      case 'CANCELLED': return '#dc3545';
      default: return '#007bff';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Beklemede';
      case 'CONFIRMED': return 'Onaylandı';
      case 'COMPLETED': return 'Tamamlandı';
      case 'CANCELLED': return 'İptal Edildi';
      default: return status;
    }
  };

  if (loading) {
    return <div className="loading">Randevular yükleniyor...</div>;
  }

  if (error) {
    return <div className="error">Hata: {error}</div>;
  }

  return (
    <div className="business-dashboard">
      <header className="dashboard-header">
        <h1>İşletme Yönetim Paneli</h1>
        <p>Randevularınızı yönetin ve takip edin</p>
      </header>

      <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Randevular
          </button>
          <button 
            className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            Müşteriler
          </button>
          <button 
            className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            Aktiviteler
          </button>
        </div>

      {activeTab === 'appointments' && (
        <div className="dashboard-controls">
          <div className="filter-section">
            <label htmlFor="status-filter">Durum Filtresi:</label>
            <select 
              id="status-filter"
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Tümü</option>
              <option value="PENDING">Beklemede</option>
              <option value="CONFIRMED">Onaylandı</option>
              <option value="COMPLETED">Tamamlandı</option>
              <option value="CANCELLED">İptal Edildi</option>
            </select>
          </div>
          
          <button 
            onClick={fetchAppointments}
            className="refresh-btn"
          >
            🔄 Yenile
          </button>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="appointments-section">
          <h2>Randevular ({appointments.length})</h2>
          
          {appointments.length === 0 ? (
            <div className="no-appointments">
              <p>Henüz randevu bulunmuyor.</p>
            </div>
          ) : (
            <div className="appointments-grid">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-header">
                    <span className="appointment-id">#{appointment.id}</span>
                    <span 
                      className="appointment-status"
                      style={{ backgroundColor: getStatusColor(appointment.status) }}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                  
                  <div className="appointment-details">
                    <h3>{appointment.customerName}</h3>
                    <p><strong>Telefon:</strong> {appointment.customerPhone}</p>
                    <div className="services-section">
                      <p><strong>Hizmetler ve Bedelleri:</strong></p>
                      {(() => {
                        const services = Array.isArray(appointment.services) 
                          ? appointment.services 
                          : (appointment.services || appointment.serviceName || 'Belirtilmemiş').split(',').map(s => s.trim());
                        
                        const servicePrices = {
                          'Saç Kesimi': 150,
                          'Sakal Tıraşı': 80,
                          'Saç Yıkama': 50,
                          'Saç Boyama': 300,
                          'Perma': 400,
                          'Saç Bakımı': 200,
                          'Kaş Düzeltme': 60,
                          'Yüz Bakımı': 250
                        };
                        
                        return (
                          <ul className="services-list">
                            {services.map((service, index) => {
                              const cleanService = service.trim();
                              const price = servicePrices[cleanService] || 25;
                              return (
                                <li key={index} className="service-item">
                                  <span className="service-name">{cleanService}</span>
                                  <span className="service-price">₺{price}</span>
                                </li>
                              );
                            })}
                          </ul>
                        );
                      })()}
                    </div>
                    <p><strong>Tarih:</strong> {formatDate(appointment.appointmentDate)}</p>
                    <p><strong>Durum:</strong> <span className={`status-badge ${appointment.status.toLowerCase()}`}>{getStatusText(appointment.status)}</span></p>
                    {appointment.notes && (
                      <p><strong>Notlar:</strong> {appointment.notes}</p>
                    )}
                  </div>
                  
                  <div className="appointment-actions">
                    {appointment.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={() => updateAppointmentStatus(appointment.id, 'CONFIRMED')}
                          className="btn-confirm"
                        >
                          ✓ Onayla
                        </button>
                        <button 
                          onClick={() => updateAppointmentStatus(appointment.id, 'CANCELLED')}
                          className="btn-cancel"
                        >
                          ✗ İptal Et
                        </button>
                      </>
                    )}
                    {appointment.status === 'CONFIRMED' && (
                      <button 
                        onClick={() => updateAppointmentStatus(appointment.id, 'COMPLETED')}
                        className="btn-complete"
                      >
                        ✓ Tamamla
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="customers-section">
          <h2>Müşteriler ({customers.length})</h2>
          
          <div className="dashboard-controls">
            <button 
              onClick={fetchCustomers}
              className="refresh-btn"
            >
              🔄 Yenile
            </button>
          </div>
          
          {customers.length === 0 ? (
            <div className="no-customers">
              <p>Henüz müşteri bulunmuyor.</p>
            </div>
          ) : (
            <div className="customers-grid">
              {customers.map((customer) => (
                <div key={customer.id} className="customer-card">
                  <div className="customer-header">
                    <span className="customer-id">#{customer.id}</span>
                  </div>
                  
                  <div className="customer-details">
                    <h3>{customer.name}</h3>
                    <p><strong>Telefon:</strong> {customer.phone}</p>
                    <p><strong>Email:</strong> {customer.email}</p>
                    <p><strong>Doğum Tarihi:</strong> {customer.birthDate}</p>
                    <p><strong>Tercih Edilen Hizmetler:</strong> {customer.preferredServices}</p>
                    {customer.notes && (
                      <p><strong>Notlar:</strong> {customer.notes}</p>
                    )}
                    <p><strong>Kayıt Tarihi:</strong> {formatDate(customer.registrationDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
     

      {activeTab === 'activities' && (
        <section className="activities-section">
          <div className="section-header">
            <h3>Müşteri Aktiviteleri</h3>
            <p>Son müşteri aktiviteleri ve işlemleri</p>
          </div>
          
          {customerActivities.length === 0 ? (
            <div className="no-activities">
              <p>Henüz aktivite bulunmuyor</p>
            </div>
          ) : (
            <div className="activities-list">
              {customerActivities.map(activity => (
                <div key={activity.id} className="activity-card">
                  <div className="activity-header">
                    <span className={`activity-type ${activity.type.toLowerCase()}`}>
                      {activity.type === 'APPOINTMENT_CREATED' ? '📅' : 
                       activity.type === 'APPOINTMENT_STATUS_CHANGED' ? '✅' : '👤'}
                    </span>
                    <div className="activity-info">
                      <h4>{activity.message}</h4>
                      <p className="activity-time">
                        {new Date(activity.timestamp).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  {activity.details && (
                    <div className="activity-details">
                      {activity.type === 'APPOINTMENT_CREATED' && (
                        <>
                          {activity.details.services && (
                            <p><strong>Hizmetler:</strong> {Array.isArray(activity.details.services) ? activity.details.services.join(', ') : activity.details.services}</p>
                          )}
                          {activity.details.totalPrice && (
                            <p><strong>Toplam Fiyat:</strong> ₺{activity.details.totalPrice}</p>
                          )}
                          {activity.details.appointmentDate && (
                            <p><strong>Randevu Tarihi:</strong> {formatDate(activity.details.appointmentDate)}</p>
                          )}
                        </>
                      )}
                      {activity.type === 'APPOINTMENT_STATUS_CHANGED' && (
                        <>
                          {(activity.details.services || activity.details.serviceName) && (
                             <p><strong>Hizmet:</strong> {Array.isArray(activity.details.services) ? activity.details.services.join(', ') : activity.details.serviceName}</p>
                           )}
                          {activity.details.totalPrice && (
                            <p><strong>Toplam Fiyat:</strong> ₺{activity.details.totalPrice}</p>
                          )}
                          <p><strong>Yeni Durum:</strong> {getStatusText(activity.details.newStatus)}</p>
                        </>
                      )}
                      {activity.type === 'CUSTOMER_REGISTERED' && activity.details.email && (
                        <p><strong>E-posta:</strong> {activity.details.email}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default BusinessDashboard;