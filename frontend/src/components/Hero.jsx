import React from 'react';
import { useLanguage } from './LanguageContext';

const Hero = () => {
  const { translations: t } = useLanguage();

  return (
    <section
      className="hero-section d-flex align-items-center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        paddingTop: '60px',
        paddingBottom: '60px',
        position: 'relative'
      }}
    >
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.3
      }}></div>

      <div className="container position-relative">
        <div className="row align-items-center g-5">
          {/* Left Column */}
          <div className="col-lg-6 text-center text-lg-start">
            <h1 className="display-4 fw-bold mb-4 text-white" style={{ 
              textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
              lineHeight: '1.2'
            }}>
              {t.title}
            </h1>
            <p className="lead mb-4 text-white" style={{ 
              lineHeight: '1.8',
              textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
              opacity: 0.95
            }}>
              {t.subtitle}
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
              <a href="/doctor" className="btn btn-light btn-lg px-4 py-3 shadow-lg text-dark fw-bold hover-effect" style={{
                borderRadius: '30px',
                background: 'linear-gradient(45deg, #ffffff, #f8f9fa)',
                border: 'none',
                minWidth: '180px'
              }}>
                {t.getStarted}
              </a>
              <a href="#about" className="btn btn-outline-light btn-lg px-4 py-3 border-3 text-white fw-semibold hover-effect" style={{
                borderRadius: '30px',
                borderWidth: '3px'
              }}>
                {t.learnMore}
              </a>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-lg-6 d-flex justify-content-center">
            <div
              className="bg-transparent w-100 text-center"
              style={{
                padding: '2rem',
                border: 'none',
                margin:'1rem',
                width: '100%',
                maxWidth: '100%',
              }}
            >
              <div className="position-relative">
                <div 
                  className="d-flex align-items-center justify-content-center rounded-4 shadow-lg"
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    height: '320px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    border: '4px solid rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="text-center text-white">
                    <div className="fs-1 mb-3">🏥</div>
                    <h4 className="fw-bold">Doctor Consultation</h4>
                    <p>Healthcare Image</p>
                  </div>
                </div>
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                  <div className="bg-white bg-opacity-90 text-dark p-3 rounded-3 shadow">
                    <h5 className="fw-bold mb-0">🏥 Healthcare</h5>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 rounded-4 shadow-lg" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                border: '2px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 className="fw-semibold mb-3 text-white">
                  {t.findDoctor}
                </h3>
                <p className="text-white mb-3" style={{ opacity: 0.9 }}>
                  {t.findDoctorSubtitle}
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <span className="badge bg-light text-dark me-2 px-3 py-2" style={{ borderRadius: '20px' }}>{t.verified}</span>
                  <span className="badge bg-light text-dark me-2 px-3 py-2" style={{ borderRadius: '20px' }}>{t.experienced}</span>
                  <span className="badge bg-light text-dark px-3 py-2" style={{ borderRadius: '20px' }}>{t.reliable}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional cultural elements */}
        <div className="row mt-5">
          <div className="col-12 text-center">
            <div className="d-flex justify-content-center gap-4 flex-wrap">
              <div className="text-center">
                <div className="fs-1 mb-2 text-white">🙏</div>
                <small className="text-white" style={{ opacity: 0.9 }}>{t.nepaliCulture}</small>
              </div>
              <div className="text-center">
                <div className="fs-1 mb-2 text-white">🏔️</div>
                <small className="text-white" style={{ opacity: 0.9 }}>{t.himalayanHealth}</small>
              </div>
              <div className="text-center">
                <div className="fs-1 mb-2 text-white">🌿</div>
                <small className="text-white" style={{ opacity: 0.9 }}>{t.naturalRemedies}</small>
              </div>
              <div className="text-center">
                <div className="fs-1 mb-2 text-white">💝</div>
                <small className="text-white" style={{ opacity: 0.9 }}>{t.serviceSpirit}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
          transition: all 0.4s ease;
        }
        .btn-outline-light:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.8);
        }
      `}</style>
    </section>
  );
};

export default Hero;
