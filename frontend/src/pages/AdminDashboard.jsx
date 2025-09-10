import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Form,
  Alert,
  Spinner,
  Tab,
  Tabs,
} from 'react-bootstrap';
import axios from 'axios';
import AdminNavbar from '../components/AdminNavbar';

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [activeTab, setActiveTab] = useState('doctors');
  const [categoryData, setCategoryData] = useState({ category: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [doctorsRes, categoriesRes, appointmentsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/doctors'),
        axios.get('http://127.0.0.1:8000/api/categories'),
        axios.get('http://127.0.0.1:8000/api/appointments'),
      ]);
      setDoctors(doctorsRes.data);
      setCategories(categoriesRes.data);
      setAppointments(appointmentsRes.data);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Approve doctor
  const handleApproveDoctor = async (doctorId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/doctors/${doctorId}/approve`);
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === doctorId ? { ...doc, approve_status: true } : doc
        )
      );
      setSuccess('Doctor approved and email sent');
    } catch (err) {
      setError('Failed to approve doctor');
      console.error(err);
    }
  };

  // Reject doctor
  const handleRejectDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to reject this doctor?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/doctors/${doctorId}`);
      setDoctors((prev) => prev.filter((doc) => doc.id !== doctorId));
      setSuccess('Doctor rejected and removed');
    } catch (err) {
      setError('Failed to reject doctor');
      console.error(err);
    }
  };

  // View doctor
  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorModal(true);
  };

  // Add category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/categories', categoryData);
      setSuccess('Category added successfully');
      setCategoryData({ category: '' });
      setShowCategoryModal(false);
      fetchData();
    } catch (err) {
      setError('Failed to add category');
      console.error(err);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/categories/${categoryId}`);
      setSuccess('Category deleted successfully');
      fetchData();
    } catch (err) {
      setError('Failed to delete category');
      console.error(err);
    }
  };

  const stats = {
    totalDoctors: doctors.length,
    pendingApprovals: doctors.filter((d) => !d.approve_status).length,
    approvedDoctors: doctors.filter((d) => d.approve_status).length,
    totalAppointments: appointments.length,
    totalCategories: categories.length,
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '50vh' }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <h2>Admin Dashboard</h2>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" onClose={() => setSuccess('')} dismissible>
            {success}
          </Alert>
        )}

        {/* Stats */}
        <Row className="mb-4">
          {[
            { label: 'Total Doctors', value: stats.totalDoctors, color: 'primary' },
            { label: 'Pending Approvals', value: stats.pendingApprovals, color: 'warning' },
            { label: 'Approved Doctors', value: stats.approvedDoctors, color: 'success' },
            { label: 'Appointments', value: stats.totalAppointments, color: 'info' },
            { label: 'Categories', value: stats.totalCategories, color: 'secondary' },
          ].map((stat, idx) => (
            <Col md={2} key={idx}>
              <Card className="text-center shadow-sm">
                <Card.Body>
                  <h3 className={`text-${stat.color}`}>{stat.value}</h3>
                  <p className="mb-0">{stat.label}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
          {/* Doctor Management */}
          <Tab eventKey="doctors" title="Doctor Management">
            <Card>
              <Card.Header>
                <h5>Doctor Management</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Specialization</th>
                      <th>Experience</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.name}</td>
                        <td>{doc.email}</td>
                        <td>{doc.specialization}</td>
                        <td>{doc.experience} years</td>
                        <td>
                          <Badge bg={doc.approve_status ? 'success' : 'warning'}>
                            {doc.approve_status ? 'Approved' : 'Pending'}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleViewDoctor(doc)}
                          >
                            View
                          </Button>
                          {!doc.approve_status && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                className="me-2"
                                onClick={() => handleApproveDoctor(doc.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRejectDoctor(doc.id)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          {/* Appointments */}
          <Tab eventKey="appointments" title="Appointments">
            <Card>
              <Card.Header>
                <h5>Appointments</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.id}>
                        <td>{a.booking?.user?.name || 'N/A'}</td>
                        <td>{a.doctor?.name || 'N/A'}</td>
                        <td>{a.appointment_date}</td>
                        <td>{a.start_time}</td>
                        <td>
                          <Badge
                            bg={
                              a.status === 'booked'
                                ? 'success'
                                : a.status === 'available'
                                ? 'info'
                                : 'secondary'
                            }
                          >
                            {a.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          {/* Categories */}
          <Tab eventKey="categories" title="Categories">
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5>Categories</h5>
                <Button size="sm" onClick={() => setShowCategoryModal(true)}>
                  Add Category
                </Button>
              </Card.Header>
              <Card.Body>
                {categories.length === 0 ? (
                  <div className="text-center py-4">
                    <p>No categories yet</p>
                    <Button onClick={() => setShowCategoryModal(true)}>
                      Add First Category
                    </Button>
                  </div>
                ) : (
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Category</th>
                        <th>Doctors</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr key={c.id}>
                          <td>{c.id}</td>
                          <td>{c.category}</td>
                          <td>
                            <Badge bg="info">
                              {doctors.filter((d) => d.category_id === c.id).length}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDeleteCategory(c.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        {/* Doctor Modal */}
        <Modal
          show={showDoctorModal}
          onHide={() => setShowDoctorModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Doctor Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedDoctor && (
              <Row>
                <Col md={6}>
                  <h6>Personal Information</h6>
                  {selectedDoctor.image && (
                    <div className="mb-3 text-center">
                      <img
                        src={`http://127.0.0.1:8000/storage/${selectedDoctor.image}`}
                        alt="Doctor"
                        className="img-fluid rounded"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                  )}
                  <p><strong>Name:</strong> {selectedDoctor.name}</p>
                  <p><strong>Email:</strong> {selectedDoctor.email}</p>
                  <p><strong>Contact:</strong> {selectedDoctor.contact}</p>
                  <p><strong>Gender:</strong> {selectedDoctor.gender}</p>
                  <p><strong>DOB:</strong> {selectedDoctor.dob}</p>
                  <p><strong>Address:</strong> {selectedDoctor.address}</p>
                  <p><strong>Citizenship No:</strong> {selectedDoctor.citizenship_number}</p>
                </Col>
                <Col md={6}>
                  <h6>Professional Information</h6>
                  <p><strong>Qualification:</strong> {selectedDoctor.qualification}</p>
                  <p><strong>Specialization:</strong> {selectedDoctor.specialization}</p>
                  <p><strong>License:</strong> {selectedDoctor.license_number}</p>
                  <p><strong>Experience:</strong> {selectedDoctor.experience} years</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <Badge bg={selectedDoctor.approve_status ? 'success' : 'warning'}>
                      {selectedDoctor.approve_status ? 'Approved' : 'Pending'}
                    </Badge>
                  </p>
                  {selectedDoctor.bio && <p><strong>Bio:</strong> {selectedDoctor.bio}</p>}
                </Col>
                <Col md={12} className="mt-3">
                  <h6>Documents</h6>
                  {selectedDoctor.citizenship_file && (
                    <p>
                      <a
                        href={`http://127.0.0.1:8000/storage/${selectedDoctor.citizenship_file}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Citizenship File
                      </a>
                    </p>
                  )}
                  {selectedDoctor.passport_file && (
                    <p>
                      <a
                        href={`http://127.0.0.1:8000/storage/${selectedDoctor.passport_file}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Passport File
                      </a>
                    </p>
                  )}
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDoctorModal(false)}>
              Close
            </Button>
            {selectedDoctor && !selectedDoctor.approve_status && (
              <Button
                variant="success"
                onClick={() => {
                  handleApproveDoctor(selectedDoctor.id);
                  setShowDoctorModal(false);
                }}
              >
                Approve Doctor
              </Button>
            )}
          </Modal.Footer>
        </Modal>

        {/* Category Modal */}
        <Modal
          show={showCategoryModal}
          onHide={() => setShowCategoryModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Category</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddCategory}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Category Name</Form.Label>
                <Form.Control
                  type="text"
                  value={categoryData.category}
                  onChange={(e) =>
                    setCategoryData({ ...categoryData, category: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </>
  );
};

export default AdminDashboard;
