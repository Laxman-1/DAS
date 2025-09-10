import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import Footer from '../components/Footer';
import Header from '../components/Header';

const UserLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // 1️⃣ Try Doctor login first
      try {
        const doctorRes = await axios.post(
          'http://127.0.0.1:8000/api/doctors/login',
          formData,
          { headers: { Accept: 'application/json' } }
        );

        const doctorData = doctorRes.data.doctor;

        // Store doctor login data
        localStorage.setItem('doctorToken', doctorRes.data.token);
        localStorage.setItem('doctorData', JSON.stringify(doctorData));

        // Navigate to doctordashboard with doctorId in URL
        navigate(`/doctordashboard/${doctorData.id}`);
        return;
      } catch (doctorErr) {
        console.warn('Doctor login failed, trying user login...');
      }

      // 2️⃣ Try User login (Patient/Admin)
      const res = await axios.post(
        'http://127.0.0.1:8000/api/login',
        formData,
        { headers: { Accept: 'application/json' } }
      );

      const { token, user, role } = res.data;

      // Store user login data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // 3️⃣ Redirect based on role
      switch (role) {
        case 'patient':
          navigate('/doctors');
          break;
        case 'admin':
        case 'system_admin':
          navigate('/admindashboard');
          break;
        case 'doctor':
          // If backend returns doctor role here, navigate using doctor ID
          navigate(`/doctordashboard/${user.id}`);
          break;
        default:
          setErrorMessage('Unknown role. Please contact support.');
          navigate('/');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h3>User Login</h3>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                {errorMessage && (
                  <Alert variant="danger" className="mb-3">
                    {errorMessage}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </Form>

                <div className="text-center">
                  <p className="mb-2">
                    Don’t have an account?{' '}
                    <a href="/userRegister" className="text-decoration-none">
                      Register as User
                    </a>
                  </p>
                  <p className="mb-2">
                    Want to be a doctor?{' '}
                    <a href="/doctorRegister" className="text-decoration-none">
                      Register as Doctor
                    </a>
                  </p>
                  <p className="mb-0">
                    <a href="/" className="text-decoration-none">
                      ← Back to Home
                    </a>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default UserLogin;
