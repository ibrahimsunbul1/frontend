import React from 'react';
import QRCode from 'react-qr-code';
import './QRCodeGenerator.css';

const QRCodeGenerator = ({ url = 'http://localhost:3000', size = 200 }) => {
  const downloadQR = () => {
    const svg = document.querySelector('.qr-container svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = size;
      canvas.height = size;
      
      img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        
        const link = document.createElement('a');
        link.download = 'berber-app-qr.png';
        link.href = canvas.toDataURL();
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className="qr-generator">
      <div className="qr-header">
        <h3>Berber App QR Kodu</h3>
        <p>Bu QR kodu tarayarak uygulamaya hızlı erişim sağlayabilirsiniz</p>
      </div>
      
      <div className="qr-container">
        <QRCode
          value={url}
          size={size}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          viewBox={`0 0 ${size} ${size}`}
          fgColor="#D4AF37"
          bgColor="#ffffff"
        />
      </div>
      
      <div className="qr-info">
        <p className="qr-url">URL: {url}</p>
        <button onClick={downloadQR} className="download-btn">
          QR Kodu İndir
        </button>
      </div>
    </div>
  );
};

export default QRCodeGenerator;