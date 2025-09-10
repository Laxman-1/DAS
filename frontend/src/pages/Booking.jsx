import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctor, appointment, user } = location.state || {};
  const [formData, setFormData] = useState({
    contact: user?.contact || '',
    paymentMethod: 'cash',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!doctor || !appointment || !user || !token) {
      setError('Invalid booking data. Please select an appointment first.');
      setTimeout(() => navigate('/doctors'), 2000);
    } else {
      console.log('Appointment data:', appointment);
    }
  }, [doctor, appointment, user, token, navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('data');
    const errorParam = urlParams.get('error');
    if (data) {
      setLoading(true);
      const verifyPayment = async () => {
        try {
          const response = await axios.post(
            'http://localhost:8000/api/bookings/callback',
            { data },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setSuccess('Payment Successful! Booking confirmed.');
          setTimeout(() => navigate('/my-appointments'), 2000);
          // Store booking data in localStorage or sessionStorage if needed
          localStorage.setItem('bookingData', JSON.stringify(response.data));
        } catch (error) {
          setError(decodeURIComponent(errorParam) || 'Payment Failed. Please try again.');
          console.error('Callback error:', error.response || error);
        } finally {
          setLoading(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      verifyPayment();
    } else if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [navigate, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.contact) {
      setError('Contact number is required');
      setLoading(false);
      return;
    }

    const price = appointment.service_charge || 100;
    const transactionId = formData.paymentMethod === 'esewa' ? `booking-${appointment.id}-${Date.now()}` : null;
    const bookingData = {
      appointment_id: appointment.id,
      user_id: user.id, // Assuming user object has an id
      payment_method: formData.paymentMethod,
      price,
      transaction_id: transactionId,
      contact: formData.contact,
    };

    try {
      console.log('Creating booking with data:', bookingData);
      const response = await axios.post(
        'http://localhost:8000/api/bookings',
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const bookingId = response.data.booking_id;
      setBookingId(bookingId);

      if (formData.paymentMethod === 'cash') {
        setSuccess('Payment needs to be completed by cash on arrival.');
        setTimeout(() => navigate('/my-appointments'), 2000);
      } else if (formData.paymentMethod === 'esewa') {
        console.log('Initiating eSewa payment for booking ID:', bookingId);
        const esewaResponse = await axios.post(
          `http://localhost:8000/api/bookings/${bookingId}/initiate-esewa`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('eSewa response:', esewaResponse.data);
        const { form_url, form_data } = esewaResponse.data;
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = form_url;
        Object.keys(form_data).forEach((key) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = form_data[key];
          form.appendChild(input);
        });
        document.body.appendChild(form);
        console.log('Submitting eSewa form:', form_data);
        form.submit();
      }
    } catch (error) {
      console.error('Booking error:', error.response || error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to create booking';
      setError(errorMessage === 'Appointment is not available' ? 'This appointment slot is no longer available. Please select another slot.' : errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId && formData.paymentMethod === 'esewa') {
      const timer = setTimeout(async () => {
        try {
          console.log('Checking eSewa status for booking ID:', bookingId);
          const response = await axios.post(
            'http://localhost:8000/api/bookings/check-esewa-status',
            { booking_id: bookingId },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.data.status === 'completed') {
            setSuccess('Payment Successful! Booking confirmed.');
            setTimeout(() => navigate('/my-appointments'), 2000);
          } else {
            setError(`Payment verification timed out: ${response.data.status}`);
          }
        } catch (error) {
          setError('Payment verification failed. Please try again.');
          console.error('Status check error:', error.response || error);
        }
      }, 5 * 60 * 1000); // 5 minutes
      return () => clearTimeout(timer);
    }
  }, [bookingId, navigate, token]);

  if (!doctor || !appointment || !user) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Card className="shadow-sm border-0" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <Card.Body className="p-5 text-center">
              <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
              <h4 className="text-warning mb-3">Invalid Booking Data</h4>
              <p className="text-muted mb-4">Please select an appointment first to proceed with booking.</p>
              <Button variant="primary" size="lg" onClick={() => navigate('/doctors')}>
                <i className="fas fa-arrow-left me-2"></i>
                Go to Doctors
              </Button>
            </Card.Body>
          </Card>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="py-5" style={{ maxWidth: '800px' }}>
        <div className="text-center mb-4">
          <h2 className="text-primary fw-bold mb-2">Book Your Appointment</h2>
          <p className="text-muted">Complete your booking details and choose payment method</p>
        </div>

        <Card className="shadow border-0">
          <Card.Header className="bg-primary text-white text-center py-4">
            <h3 className="mb-0">
              <i className="fas fa-calendar-check me-3"></i>
              Appointment Booking
            </h3>
          </Card.Header>
          <Card.Body className="p-5">
            {error && (
              <Alert variant="danger" className="border-0 shadow-sm">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success" border-0 shadow-sm>
                <i className="fas fa-check-circle me-2"></i>
                {success}
              </Alert>
            )}

            <Card className="mb-4 border-0 bg-light">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Appointment Summary
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-4">
                  <Col md={6}>
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                        <i className="fas fa-user-md text-white"></i>
                      </div>
                      <div>
                        <h6 className="mb-1 fw-bold">{doctor.name}</h6>
                        <Badge bg="info" className="fs-6">
                          {doctor.specialization || 'General Physician'}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                        <i className="fas fa-calendar text-white"></i>
                      </div>
                      <div>
                        <h6 className="mb-1 fw-bold">
                          {appointment.appointment_date ? format(new Date(appointment.appointment_date), 'MMM dd, yyyy') : 'N/A'}
                        </h6>
                        <p className="mb-0 text-muted">
                          {appointment.start_time} - {appointment.end_time}
                        </p>
                      </div>
                    </div>
                  </Col>
                </Row>
                <div className="text-center mt-3 p-3 bg-white rounded">
                  <h4 className="text-success mb-0">
                    <i className="fas fa-tag me-2"></i>
                    Service Charge: NPR {appointment.service_charge || 100}
                  </h4>
                </div>
              </Card.Body>
            </Card>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  <i className="fas fa-phone me-2 text-primary"></i>
                  Contact Number <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="contact"
                  placeholder="Enter your contact number"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  size="lg"
                  className="border-2"
                />
                <Form.Text className="text-muted">
                  We'll use this number to contact you about your appointment
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  <i className="fas fa-credit-card me-2 text-primary"></i>
                  Payment Method <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                  size="lg"
                  className="border-2"
                >
                  <option value="cash">Pay at Clinic (Cash)</option>
                  <option value="esewa">Pay Now with eSewa</option>
                </Form.Select>
                {formData.paymentMethod === 'cash' && (
                  <Alert variant="info" className="mt-3 border-0 bg-info bg-opacity-10">
                    <i className="fas fa-info-circle me-2 text-info"></i>
                    <strong>Cash Payment:</strong> You'll need to pay the service charge at the clinic before your appointment.
                  </Alert>
                )}
                {formData.paymentMethod === 'esewa' && (
                  <Alert variant="success" className="mt-3 border-0 bg-success bg-opacity-10">
                    <i className="fas fa-mobile-alt me-2 text-success"></i>
                    <strong>eSewa Payment:</strong> You'll be redirected to eSewa to complete your payment securely.
                  </Alert>
                )}
              </Form.Group>

              <div className="d-grid gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="py-3 fw-bold shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-3" />
                      Processing Your Booking...
                    </>
                  ) : formData.paymentMethod === 'cash' ? (
                    <>
                      <i className="fas fa-check-circle me-2"></i>
                      Confirm Booking (Pay Later)
                    </>
                  ) : (
                    <>
                      <i className="fas fa-credit-card me-2"></i>
                      Proceed to Payment
                    </>
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  size="lg"
                  onClick={() => navigate('/doctors')}
                  className="py-2"
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Doctors
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default Booking;