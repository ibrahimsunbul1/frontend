import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>Berber Salonu</h1>
        <p>Profesyonel berber hizmetleri</p>
      </header>
      
      <main className="homepage-main">
        <section className="services">
          <h2>Hizmetlerimiz</h2>
          <div className="service-grid">
            <div className="service-card">
              <h3>Saç Kesimi</h3>
              <p>Profesyonel saç kesim hizmeti</p>
              <span className="price">₺50</span>
            </div>
            <div className="service-card">
              <h3>Sakal Tıraşı</h3>
              <p>Geleneksel ustura tıraşı</p>
              <span className="price">₺30</span>
            </div>
            <div className="service-card">
              <h3>Saç + Sakal</h3>
              <p>Komple bakım paketi</p>
              <span className="price">₺70</span>
            </div>
          </div>
        </section>
        
        <section className="about">
          <h2>Hakkımızda</h2>
          <p>
            20 yıllık deneyimimizle size en kaliteli berber hizmetini sunuyoruz. 
            Modern teknikler ve geleneksel ustalık bir arada.
          </p>
        </section>
        
        <section className="contact">
          <h2>İletişim</h2>
          <div className="contact-info">
            <p><strong>Adres:</strong> Merkez Mahallesi, Berber Sokak No:1</p>
            <p><strong>Telefon:</strong> (0212) 555 0123</p>
            <p><strong>Çalışma Saatleri:</strong> 09:00 - 20:00</p>
          </div>
        </section>
      </main>
      
      <footer className="homepage-footer">
        <p>&copy; 2024 Berber Salonu. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default HomePage;