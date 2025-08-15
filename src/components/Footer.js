import React from 'react';
import QRCodeGenerator from './QRCodeGenerator';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-row">
          <div className="footer-col">
            <h3>BerberApp</h3>
            <p>Modern berber salonu yönetim sistemi</p>
          </div>
          <div className="footer-col">
            <h4>Hızlı Erişim</h4>
            <ul>
              <li>Müşteri Kaydı</li>
              <li>Randevu Al</li>
              <li>İşletme Paneli</li>
            </ul>
          </div>
          <div className="footer-col qr-col">
            <h4>QR Kod ile Erişim</h4>
            <QRCodeGenerator url="http://localhost:3000" size={80} />
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 BerberApp. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;