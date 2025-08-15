import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HairDesignCarousel.css';

// Import all hair design images
import mohammedSalah from '../hairDesign/Mohammed_salah.png';
import xhaka from '../hairDesign/Xhaka.png';
import deBryne from '../hairDesign/deBryne.png';
import hazard from '../hairDesign/hazard.png';
import hector from '../hairDesign/hector.png';
import ibrahimovic from '../hairDesign/ibrahimovic.png';
import kevinTrapp from '../hairDesign/kevin_trapp.png';
import messi from '../hairDesign/messi.png';
import neymar from '../hairDesign/neymar.png';
import pogba from '../hairDesign/pogba.png';
import sergioRamos from '../hairDesign/sergio_ramos.png';
import toniKroos from '../hairDesign/toni_kroos.png';

const HairDesignCarousel = () => {
  const navigate = useNavigate();
  
  const hairDesigns = [
    { id: 1, image: mohammedSalah, name: 'Mohammed Salah Saç Modeli', description: 'Modern ve şık saç kesimi' },
    { id: 2, image: xhaka, name: 'Xhaka Saç Modeli', description: 'Klasik ve düzenli stil' },
    { id: 3, image: deBryne, name: 'De Bruyne Saç Modeli', description: 'Sportif ve dinamik görünüm' },
    { id: 4, image: hazard, name: 'Hazard Saç Modeli', description: 'Zarif ve profesyonel' },
    { id: 5, image: hector, name: 'Hector Saç Modeli', description: 'Genç ve trendy stil' },
    { id: 6, image: ibrahimovic, name: 'Ibrahimovic Saç Modeli', description: 'Güçlü ve karizmatik' },
    { id: 7, image: kevinTrapp, name: 'Kevin Trapp Saç Modeli', description: 'Temiz ve düzgün kesim' },
    { id: 8, image: messi, name: 'Messi Saç Modeli', description: 'İkonik ve popüler stil' },
    { id: 9, image: neymar, name: 'Neymar Saç Modeli', description: 'Yaratıcı ve cesur tasarım' },
    { id: 10, image: pogba, name: 'Pogba Saç Modeli', description: 'Özgün ve dikkat çekici' },
    { id: 11, image: sergioRamos, name: 'Sergio Ramos Saç Modeli', description: 'Maskülen ve güçlü' },
    { id: 12, image: toniKroos, name: 'Toni Kroos Saç Modeli', description: 'Sofistike ve şık' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === hairDesigns.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, hairDesigns.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? hairDesigns.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === hairDesigns.length - 1 ? 0 : currentIndex + 1);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const handleBookAppointment = () => {
    navigate('/customer-login');
  };

  return (
    <div className="hair-design-carousel">
      <div className="carousel-header">
        <h2>Popüler Saç Modelleri</h2>
        <p>Ünlü futbolcuların tercih ettiği modern saç kesim modelleri</p>
      </div>
      
      <div className="carousel-container">
        <button className="carousel-btn prev-btn" onClick={goToPrevious}>
          &#8249;
        </button>
        
        <div className="carousel-wrapper">
          <div 
            className="carousel-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {hairDesigns.map((design, index) => (
              <div key={design.id} className="carousel-slide">
                <div className="slide-content">
                  <img 
                    src={design.image} 
                    alt={design.name}
                    className="hair-design-image"
                  />
                  <div className="slide-info">
                    <h3>{design.name}</h3>
                    <p>{design.description}</p>
                    <button className="book-btn" onClick={handleBookAppointment}>Randevu Al</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <button className="carousel-btn next-btn" onClick={goToNext}>
          &#8250;
        </button>
      </div>
      
      <div className="carousel-controls">
        <div className="carousel-dots">
          {hairDesigns.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
        
        <button className="auto-play-btn" onClick={toggleAutoPlay}>
          {isAutoPlaying ? '⏸️ Durdur' : '▶️ Oynat'}
        </button>
      </div>
    </div>
  );
};

export default HairDesignCarousel;