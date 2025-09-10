import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DoctorAppointments = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }
    fetchData();
    // eslint-disable-next-line
  }, [doctorId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [doctorRes, appointmentsRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/doctors/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:8000/api/appointments/doctor/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDoctor(doctorRes.data);
      setAppointments(appointmentsRes.data);
      setError('');
    } catch (err) {
      console.error(err.response || err);
      setError('Failed to fetch doctor details or appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (appointment) => {
    if (user.role !== 'patient') {
      setError('Only patients can book appointments');
      return;
    }
    if (appointment.status !== 'available') {
      setError('This appointment is not available for booking');
      return;
    }
    navigate('/booking', { state: { doctor, appointment, user } });
  };

  const isPastAppointment = (date) => {
    const today = new Date().toISOString().split('T')[0];
    return date < today;
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="py-5">
        {error && (
          <Alert variant="danger" className="border-0 shadow-sm mb-4">
            {error}
          </Alert>
        )}
        <Row className="g-4">
          {/* Left Column: Doctor Details */}
          <Col md={4}>
            <div className="text-center">
              {doctor?.image ? (
                <img
                  src={`http://127.0.0.1:8000/storage/${doctor.image}`}
                  alt={doctor.name}
                  className="rounded-circle mb-3"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '150px', height: '150px', fontSize: '3rem' }}
                >
                  {doctor?.name?.charAt(0)}
                </div>
              )}
              <h3 className="text-primary mb-1">{doctor?.name}</h3>
              <p className="text-muted mb-1">{doctor?.specialization}</p>
              <p className="text-muted mb-2">{doctor?.qualification}</p>
              {doctor?.bio && <p className="text-secondary mb-2">{doctor.bio}</p>}
              <p className="mb-1"><strong>Contact:</strong> {doctor?.contact || 'N/A'}</p>
              <p className="mb-0"><strong>Address:</strong> {doctor?.address || 'N/A'}</p>
            </div>
          </Col>

          {/* Right Column: Appointments */}
          <Col md={8}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3 text-center text-primary">Appointments</h5>
                <Table hover responsive className="align-middle">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Service Charge</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length > 0 ? (
                      appointments.map((app, idx) => {
                        const past = isPastAppointment(app.appointment_date);
                        return (
                          <tr
                            key={app.id}
                            className={past ? 'text-muted' : ''}
                            style={past ? { backgroundColor: '#f8f9fa' } : {}}
                          >
                            <td>{idx + 1}</td>
                            <td>
                              {app.appointment_date
                                ? format(new Date(app.appointment_date), 'MMM dd, yyyy')
                                : 'N/A'}
                            </td>
                            <td>
                              {app.start_time} - {app.end_time}
                            </td>
                            <td>
                              <Badge
                                bg={
                                  app.status === 'available'
                                    ? 'success'
                                    : app.status === 'booked'
                                    ? 'warning'
                                    : 'secondary'
                                }
                              >
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </Badge>
                            </td>
                            <td>{app.service_charge !== null ? `NPR ${app.service_charge}` : '-'}</td>
                            <td>
                              {app.status === 'available' && user.role === 'patient' && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleBookAppointment(app)}
                                >
                                  Book
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center">
                          No appointments found for this doctor.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                <div className="text-center mt-3">
                  <Button variant="outline-secondary" onClick={() => navigate('/doctors')}>
                    Back to Doctor List
                  </Button>
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

export default DoctorAppointments;
