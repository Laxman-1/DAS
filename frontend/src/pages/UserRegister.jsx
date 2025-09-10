import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Card, Button, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const UserRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'patient',
    gender: '',
    dob: '',
    contact: '',
    emergency_contact: '',
    email: '',
    address: '',
    password: '',
    password_confirmation: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [createdUser, setCreatedUser] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setCreatedUser(null);

    try {
      const res = await axios.post('http://localhost:8000/api/register', formData, {
        headers: { 'Accept': 'application/json' }
      });

      if (res.status === 201) {
        setSuccessMessage('✅ User registered successfully!');
        const userData = res.data.user || res.data;
        setCreatedUser(userData);
        setFormData({
          name: '',
          role: 'patient',
          gender: '',
          dob: '',
          contact: '',
          emergency_contact: '',
          email: '',
          address: '',
          password: '',
          password_confirmation: ''
        });
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat().join(', ');
        setErrorMessage(errors);
      } else {
        setErrorMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely display values
  const displayValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
  };

  return (

    <>
    <Header/>
     <Container className="mt-5" style={{ maxWidth: '800px' }}>
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="p-4 shadow">
            <h3 className="text-center mb-4">User Registration</h3>

            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter full name"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="role">
                    <Form.Label>Role *</Form.Label>
                    <Form.Select name="role" value={formData.role} onChange={handleChange}>
                      <option value="system_admin">System Admin</option>
                      <option value="admin">Admin</option>
                      <option value="doctor">Doctor</option>
                      <option value="patient">Patient</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="gender">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="dob">
                    <Form.Label>Date of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="contact">
                    <Form.Label>Contact</Form.Label>
                    <Form.Control
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      placeholder="Enter contact number"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="emergency_contact">
                    <Form.Label>Emergency Contact</Form.Label>
                    <Form.Control
                      type="tel"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleChange}
                      placeholder="Enter emergency contact"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter email"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="address">
                    <Form.Label>Address *</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Enter address"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password *</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      placeholder="Enter password"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="password_confirmation">
                    <Form.Label>Confirm Password *</Form.Label>
                    <Form.Control
                      type="password"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      required
                      minLength={6}
                      placeholder="Confirm password"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button type="submit" variant="primary" disabled={loading} className="w-100">
                {loading ? <Spinner animation="border" size="sm" /> : 'Register'}
              </Button>
            </Form>
          </Card>

          {createdUser && (
            <Card className="mt-4 p-3 shadow-sm bg-light">
              <h5 className="mb-3">👤 Registered User Details</h5>
              <p><strong>Name:</strong> {displayValue(createdUser.name)}</p>
              <p><strong>Email:</strong> {displayValue(createdUser.email)}</p>
              <p><strong>Role:</strong> {displayValue(createdUser.role)}</p>
              <p><strong>Gender:</strong> {displayValue(createdUser.gender)}</p>
              <p><strong>DOB:</strong> {displayValue(createdUser.dob)}</p>
              <p><strong>Contact:</strong> {displayValue(createdUser.contact)}</p>
              <p><strong>Emergency Contact:</strong> {displayValue(createdUser.emergency_contact)}</p>
              <p><strong>Address:</strong> {displayValue(createdUser.address)}</p>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
    <Footer/>

    </>
   
  );
};

export default UserRegister;
