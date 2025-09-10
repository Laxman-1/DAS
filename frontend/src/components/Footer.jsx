import React from 'react';

const Footer = () => {
  return (
    <footer className="py-5 text-white" style={{
      background: 'linear-gradient(135deg, #2E8B57, #3CB371)',
      borderTop: '3px solid #FFD700'
    }}>
      <div className="container">
        {/* Top row */}
        <div className='row mb-5'>
          <div className='col-md-3 pb-4'>
            <h4 className="text-warning mb-3 fw-bold">Doctor Recommendation</h4>
            <p className="text-light">Your trusted healthcare partner.</p>
            <div className='pt-3 pe-5 text-light'>
              Helping you find the right doctor and clinic easily.
            </div>
          </div>

          <div className='col-md-3'>
            <h3 className='mb-3 text-warning fw-bold'>Specialties</h3>
            <ul className="list-unstyled">
              <li className="mb-2"><a href='/specialties/cardiology' className="text-light text-decoration-none hover-effect">Cardiology</a></li>
              <li className="mb-2"><a href='/specialties/neurology' className="text-light text-decoration-none hover-effect">Neurology</a></li>
              <li className="mb-2"><a href='/specialties/pediatrics' className="text-light text-decoration-none hover-effect">Pediatrics</a></li>
              <li className="mb-2"><a href='/specialties/internal' className="text-light text-decoration-none hover-effect">Internal Medicine</a></li>
            </ul>
          </div>

          <div className='col-md-3 pb-4'>
            <h3 className='mb-3 text-warning fw-bold'>Quick Links</h3>
            <ul className="list-unstyled">
              <li className="mb-2"><a href='/userLogin' className="text-light text-decoration-none hover-effect">Login</a></li>
              <li className="mb-2"><a href='/register' className="text-light text-decoration-none hover-effect">Register</a></li>
              <li className="mb-2"><a href='/doctor' className="text-light text-decoration-none hover-effect">Find a Doctor</a></li>
              <li className="mb-2"><a href='/appointments' className="text-light text-decoration-none hover-effect">Book a Service</a></li>
            </ul>
          </div>

          <div className='col-md-3 pb-4'>
            <h3 className='mb-3 text-warning fw-bold'>Contact</h3>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href='tel:+977123456789' className="text-light text-decoration-none hover-effect">
                  <i className="bi bi-telephone me-2"></i> +977 123456789
                </a>
              </li>
              <li className="mb-2">
                <a href='mailto:drs@nepal.com' className="text-light text-decoration-none hover-effect">
                  <i className="bi bi-envelope me-2"></i> drs@nepal.com
                </a>
              </li>
              <li className="mb-2">
                <span className="text-light">
                  <i className="bi bi-geo-alt me-2"></i> Kathmandu, Nepal
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Service highlights */}
        <div className='row spotlight py-5 text-center' style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '15px',
          border: '2px solid rgba(255, 215, 0, 0.3)'
        }}>
          <div className='col-md-4'>
            <div className='py-4'>
              <i className="bi bi-calendar-check fs-2 text-warning"></i>
              <h4 className="text-warning mt-3 fw-bold">Easy Booking</h4>
              <p className="text-light">Book appointments quickly and conveniently.</p>
            </div>
          </div>

          <div className='col-md-4'>
            <div className='py-4'>
              <i className="bi bi-people fs-2 text-warning"></i>
              <h4 className="text-warning mt-3 fw-bold">Verified Doctors</h4>
              <p className="text-light">Connect with trusted and verified doctors.</p>
            </div>
          </div>

          <div className='col-md-4'>
            <div className='py-4'>
              <i className="bi bi-shield-check fs-2 text-warning"></i>
              <h4 className="text-warning mt-3 fw-bold">Secure & Private</h4>
              <p className="text-light">Your data and privacy are fully protected.</p>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className='text-center pt-4 border-top border-warning'>
          <p className="text-light mb-0">© 2025 Doctor Recommendation. All rights reserved.</p>
          <p className="text-warning small mt-2 fw-bold">Your Health, Our Priority</p>
        </div>
      </div>

      <style jsx>{`
        .hover-effect:hover {
          color: #FFD700 !important;
          transform: translateX(5px);
          transition: all 0.3s ease;
        }
      `}</style>
    </footer>
  )
}

export default Footer;
