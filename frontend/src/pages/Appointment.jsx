import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Alert,
  Spinner,
  Badge,
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Appointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    appointment_date: '',
    start_time: '',
    end_time: '',
    status: 'available',
    service_charge: '',
  });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem('token');

  // Fetch doctor & appointments
  const fetchData = async () => {
    setLoading(true);
    try {
      const [doctorRes, appointmentRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/doctors/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:8000/api/appointments/doctor/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDoctor(doctorRes.data);
      setAppointments(appointmentRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load doctor or appointments');
      console.error(err.response || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [doctorId, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.appointment_date || !form.start_time || !form.end_time) {
      setError('Please fill all required fields: Date, Start Time, End Time');
      return false;
    }
    if (form.end_time <= form.start_time) {
      setError('End time must be after start time');
      return false;
    }
    if (!['available', 'booked', 'break'].includes(form.status)) {
      setError('Invalid status selected');
      return false;
    }
    if (
      form.service_charge !== '' &&
      (isNaN(form.service_charge) || Number(form.service_charge) < 0)
    ) {
      setError('Service charge must be a number >= 0');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...form,
      doctor_id: parseInt(doctorId, 10),
      service_charge: form.service_charge === '' ? null : Number(form.service_charge),
    };

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:8000/api/appointments/${editingId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingId(null);
      } else {
        await axios.post('http://localhost:8000/api/appointments', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm({
        appointment_date: '',
        start_time: '',
        end_time: '',
        status: 'available',
        service_charge: '',
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save appointment');
    }
  };

  const handleEdit = (appointment) => {
    setEditingId(appointment.id);
    setForm({
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      status: appointment.status,
      service_charge: appointment.service_charge !== null ? String(appointment.service_charge) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      setError('Failed to delete appointment');
      console.error(err.response || err);
    }
  };

  const getFileUrl = (path) =>
    path ? `http://127.0.0.1:8000/storage/${path}` : null;

  const isPastAppointment = (date) => {
    const today = new Date().toISOString().split('T')[0];
    return date < today;
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="my-5">
      {error && <Alert variant="danger">{error}</Alert>}
      <Row>
        {/* Left: Doctor Details */}
        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Body className="text-center">
              {doctor?.profile_image ? (
                <img
                  src={getFileUrl(doctor.profile_image)}
                  alt={doctor.name}
                  className="img-fluid rounded mb-3"
                />
              ) : (
                <div className="bg-secondary text-white rounded p-5 mb-3">No Image</div>
              )}
              <h4>{doctor?.name}</h4>
              <p className="text-muted">{doctor?.specialization}</p>
              <p>{doctor?.bio || 'No bio available.'}</p>
              <p>
                <strong>Qualification:</strong> {doctor?.qualification}
              </p>
              <p>
                <strong>Experience:</strong> {doctor?.experience || '0'} years
              </p>
              <p>
                <strong>Contact:</strong> {doctor?.contact || 'N/A'}
              </p>
              <p>
                <strong>Address:</strong> {doctor?.address || 'N/A'}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <Badge bg={doctor?.approve_status ? 'success' : 'warning'}>
                  {doctor?.approve_status ? 'Approved' : 'Pending'}
                </Badge>
              </p>
            </Card.Body>
          </Card>
        </Col>

        {/* Right: Appointment Management */}
        <Col md={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h5 className="mb-4">
                {editingId ? 'Edit Appointment' : 'Add Appointment'}
              </h5>
              <Form onSubmit={handleSubmit} className="mb-4">
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date *</Form.Label>
                      <Form.Control
                        type="date"
                        name="appointment_date"
                        value={form.appointment_date}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start *</Form.Label>
                      <Form.Control
                        type="time"
                        name="start_time"
                        value={form.start_time}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>End *</Form.Label>
                      <Form.Control
                        type="time"
                        name="end_time"
                        value={form.end_time}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={form.status}
                        onChange={handleInputChange}
                      >
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="break">Break</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>Service Charge</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        name="service_charge"
                        value={form.service_charge}
                        onChange={handleInputChange}
                        placeholder="Optional"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button type="submit" variant="success">
                  {editingId ? 'Update' : 'Add'}
                </Button>{' '}
                {editingId && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingId(null);
                      setForm({
                        appointment_date: '',
                        start_time: '',
                        end_time: '',
                        status: 'available',
                        service_charge: '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Form>

              <h5>Appointments</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th>Charge</th>
                    <th>Actions</th>
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
                          <td>{app.appointment_date}</td>
                          <td>{app.start_time}</td>
                          <td>{app.end_time}</td>
                          <td>
                            <Badge
                              bg={
                                app.status === 'booked'
                                  ? 'success'
                                  : app.status === 'available'
                                  ? 'info'
                                  : 'warning'
                              }
                            >
                              {app.status}
                            </Badge>
                          </td>
                          <td>{app.service_charge !== null ? app.service_charge : '-'}</td>
                          <td>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleEdit(app)}
                              className="me-2"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(app.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center">
                        No appointments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <Button variant="secondary" onClick={() => navigate('/doctor-list')}>
                Back to Doctor List
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Appointment;
