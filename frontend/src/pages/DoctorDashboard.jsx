import React, { useState, useEffect } from "react";
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
  Tabs,
  Tab,
} from "react-bootstrap";
import axios from "axios";
import { useParams } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

const DoctorDashboard = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    bio: "",
    specialization: "",
    qualification: "",
    license_number: "",
    experience: "",
    gender: "",
    citizenship_file: null,
    passport_file: null,
    image: null, // will be sent as 'image' to the controller
    documents: [], // array of File objects when user selects new docs
  });

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    appointment_date: "",
    start_time: "",
    end_time: "",
    status: "available",
    service_charge: "",
  });
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [activeTab, setActiveTab] = useState("appointments");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    const fetchDoctorAndAppointments = async () => {
      setLoading(true);
      try {
        let parsedDoctor = null;
        const stored = localStorage.getItem("doctorData");
        if (stored) {
          try {
            parsedDoctor = JSON.parse(stored);
          } catch {
            parsedDoctor = null;
          }
        }

        if (!parsedDoctor || parsedDoctor.id?.toString() !== doctorId) {
          const doctorRes = await axios.get(
            `http://127.0.0.1:8000/api/doctors/${doctorId}`
          );
          parsedDoctor = normalizeDoctor(doctorRes.data);
          localStorage.setItem("doctorData", JSON.stringify(parsedDoctor));
        } else {
          parsedDoctor = normalizeDoctor(parsedDoctor);
        }

        setDoctor(parsedDoctor);

        // Prefill profileData with doctor values (files remain null)
        setProfileData((prev) => ({
          ...prev,
          name: parsedDoctor.name || "",
          email: parsedDoctor.email || "",
          contact: parsedDoctor.contact || "",
          address: parsedDoctor.address || "",
          bio: parsedDoctor.bio || "",
          specialization: parsedDoctor.specialization || "",
          qualification: parsedDoctor.qualification || "",
          license_number: parsedDoctor.license_number || "",
          experience: parsedDoctor.experience || "",
          gender: parsedDoctor.gender || "",
          // files remain null/empty until user chooses new ones
          citizenship_file: null,
          passport_file: null,
          image: null,
          documents: [],
        }));

        fetchAppointments(parsedDoctor.id);
      } catch (err) {
        console.error(err);
        setError("Failed to load doctor data");
        setLoading(false);
      }
    };

    fetchDoctorAndAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const normalizeDoctor = (doc) => {
    if (!doc) return doc;
    const normalized = { ...doc };

    // Ensure 'image' is present (controller uses image)
    // Keep it as-is.

    // Ensure documents is an array
    try {
      if (!normalized.documents) {
        normalized.documents = [];
      } else if (typeof normalized.documents === "string") {
        normalized.documents = normalized.documents ? JSON.parse(normalized.documents) : [];
      } else if (!Array.isArray(normalized.documents)) {
        // if something else, convert to array
        normalized.documents = [normalized.documents];
      }
    } catch (e) {
      // if parsing fails, fallback to empty array
      normalized.documents = [];
    }

    return normalized;
  };

  const fetchAppointments = async (docId) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/appointments/doctor/${docId}`
      );
      setAppointments(response.data || []);
    } catch (err) {
      setError("Failed to fetch appointments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      // Append scalar fields
      const scalarFields = [
        "name",
        "email",
        "contact",
        "address",
        "bio",
        "specialization",
        "qualification",
        "license_number",
        "experience",
        "gender",
      ];
      scalarFields.forEach((k) => {
        if (profileData[k] !== undefined && profileData[k] !== null) {
          formData.append(k, profileData[k]);
        }
      });

      // Append files (use names expected by controller)
      if (profileData.citizenship_file) {
        formData.append("citizenship_file", profileData.citizenship_file);
      }
      if (profileData.passport_file) {
        formData.append("passport_file", profileData.passport_file);
      }
      if (profileData.image) {
        // controller expects 'image' (you earlier used image field)
        formData.append("image", profileData.image);
      }

      // Append multiple documents if user selected new ones
      if (profileData.documents && profileData.documents.length > 0) {
        // controller expects documents.* — append as documents[]
        Array.from(profileData.documents).forEach((file, idx) => {
          formData.append("documents[]", file);
        });
      }

      const response = await axios.post(
        `http://127.0.0.1:8000/api/doctors/${doctor.id}?_method=PUT`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const updated = normalizeDoctor(response.data);
      setDoctor(updated);
      localStorage.setItem("doctorData", JSON.stringify(updated));
      setSuccess("Profile updated successfully");
      setShowProfileModal(false);
    } catch (err) {
      console.error(err);
      // Show more specific backend error message if available
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors ||
        "Failed to update profile";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const openAppointmentModal = (apt = null) => {
    if (apt) {
      setAppointmentData({
        appointment_date: apt.appointment_date,
        start_time: apt.start_time,
        end_time: apt.end_time,
        status: apt.status,
        service_charge: apt.service_charge || "",
      });
      setEditingAppointmentId(apt.id);
    } else {
      setAppointmentData({
        appointment_date: "",
        start_time: "",
        end_time: "",
        status: "available",
        service_charge: "",
      });
      setEditingAppointmentId(null);
    }
    setShowAppointmentModal(true);
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (editingAppointmentId) {
        await axios.put(
          `http://127.0.0.1:8000/api/appointments/${editingAppointmentId}`,
          appointmentData
        );
        setSuccess("Appointment updated successfully");
      } else {
        await axios.post(`http://127.0.0.1:8000/api/appointments`, {
          ...appointmentData,
          doctor_id: doctor.id,
        });
        setSuccess("Appointment created successfully");
      }
      fetchAppointments(doctor.id);
      setShowAppointmentModal(false);
    } catch (err) {
      setError("Failed to save appointment");
      console.error(err);
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?"))
      return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/appointments/${id}`);
      setSuccess("Appointment deleted successfully");
      fetchAppointments(doctor.id);
    } catch (err) {
      setError("Failed to delete appointment");
      console.error(err);
    }
  };

  const handleAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/appointments/${appointmentId}`,
        { status }
      );
      setSuccess("Appointment status updated");
      fetchAppointments(doctor.id);
    } catch (err) {
      setError("Failed to update status");
      console.error(err);
    }
  };

  const todayAppointments = appointments.filter((apt) => {
    const today = new Date().toISOString().split("T")[0];
    return apt.appointment_date === today;
  });

  const stats = {
    totalAppointments: appointments.length,
    todayAppointments: todayAppointments.length,
    bookedAppointments: appointments.filter((apt) => apt.status === "booked")
      .length,
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  const getFileUrl = (path) =>
    path ? `http://127.0.0.1:8000/storage/${path}` : null;

  return (
    <>
      <AdminNavbar />
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <h2>Doctor Dashboard</h2>
            <p className="text-muted">Welcome back, {doctor?.name}</p>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* Stats */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary">{stats.totalAppointments}</h3>
                <p>Total Appointments</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">{stats.todayAppointments}</h3>
                <p>Today's Appointments</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">{stats.bookedAppointments}</h3>
                <p>Booked</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          {/* Appointment Management */}
          <Tab eventKey="appointments" title="Appointments">
            <Row>
              <Col>
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5>Appointment Management</h5>
                    <Button variant="primary" onClick={() => openAppointmentModal()}>
                      Add Appointment
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Date</th>
                          <th>Start</th>
                          <th>End</th>
                          <th>Status</th>
                          <th>Service Charge</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((apt) => (
                          <tr key={apt.id}>
                            <td>{apt.booking?.user?.name || "N/A"}</td>
                            <td>{apt.appointment_date}</td>
                            <td>{apt.start_time}</td>
                            <td>{apt.end_time}</td>
                            <td>
                              <Badge
                                bg={
                                  apt.status === "booked"
                                    ? "success"
                                    : apt.status === "available"
                                    ? "info"
                                    : "warning"
                                }
                              >
                                {apt.status}
                              </Badge>
                            </td>
                            <td>{apt.service_charge || "-"}</td>
                            <td>
                              <Button
                                size="sm"
                                variant="outline-success"
                                className="me-2"
                                onClick={() => handleAppointmentStatus(apt.id, "booked")}
                              >
                                Mark Booked
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                className="me-2"
                                onClick={() => handleAppointmentStatus(apt.id, "break")}
                              >
                                Mark Break
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                className="me-2"
                                onClick={() => openAppointmentModal(apt)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteAppointment(apt.id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Profile Tab */}
          <Tab eventKey="profile" title="Profile">
            <Row>
              <Col md={8}>
                <Card>
                  <Card.Header>
                    <h5>Profile Information</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <p>
                          <strong>Name:</strong> {doctor?.name}
                        </p>
                        <p>
                          <strong>Email:</strong> {doctor?.email}
                        </p>
                        <p>
                          <strong>Contact:</strong> {doctor?.contact || "N/A"}
                        </p>
                        <p>
                          <strong>Specialization:</strong> {doctor?.specialization}
                        </p>
                      </Col>
                      <Col md={6}>
                        <p>
                          <strong>Qualification:</strong> {doctor?.qualification}
                        </p>
                        <p>
                          <strong>Experience:</strong> {doctor?.experience || "0"} years
                        </p>
                        <p>
                          <strong>License:</strong> {doctor?.license_number || "N/A"}
                        </p>
                        <p>
                          <strong>Status:</strong>
                          <Badge bg={doctor?.approve_status ? "success" : "warning"} className="ms-2">
                            {doctor?.approve_status ? "Approved" : "Pending"}
                          </Badge>
                        </p>
                      </Col>
                    </Row>

                    {/* Document Previews */}
                    <Row className="mt-3">
                      <Col md={3}>
                        <p>
                          <strong>Profile Image:</strong>
                        </p>
                        {doctor?.image ? (
                          <img
                            src={getFileUrl(doctor.image)}
                            alt="Profile"
                            className="img-fluid rounded"
                          />
                        ) : (
                          <span>No Image</span>
                        )}
                      </Col>
                      <Col md={3}>
                        <p>
                          <strong>Citizenship:</strong>
                        </p>
                        {doctor?.citizenship_file ? (
                          <a href={getFileUrl(doctor.citizenship_file)} target="_blank" rel="noreferrer">
                            View Citizenship
                          </a>
                        ) : (
                          <span>No File</span>
                        )}
                      </Col>
                      <Col md={3}>
                        <p>
                          <strong>Passport:</strong>
                        </p>
                        {doctor?.passport_file ? (
                          <a href={getFileUrl(doctor.passport_file)} target="_blank" rel="noreferrer">
                            View Passport
                          </a>
                        ) : (
                          <span>No File</span>
                        )}
                      </Col>
                      <Col md={3}>
                        <p>
                          <strong>Other Docs:</strong>
                        </p>
                        {doctor?.documents && doctor.documents.length > 0 ? (
                          <ul className="ps-3">
                            {doctor.documents.map((docPath, idx) => (
                              <li key={idx}>
                                <a href={getFileUrl(docPath)} target="_blank" rel="noreferrer">
                                  Document {idx + 1}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span>No File</span>
                        )}
                      </Col>
                    </Row>

                    <Button variant="primary" className="mt-3" onClick={() => setShowProfileModal(true)}>
                      Edit Profile
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>

        {/* Profile Edit Modal */}
        <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleUpdateProfile} encType="multipart/form-data">
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Contact</Form.Label>
                    <Form.Control
                      type="text"
                      value={profileData.contact}
                      onChange={(e) => setProfileData({ ...profileData, contact: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Specialization</Form.Label>
                    <Form.Control
                      type="text"
                      value={profileData.specialization}
                      onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Qualification</Form.Label>
                    <Form.Control
                      type="text"
                      value={profileData.qualification}
                      onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>License Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={profileData.license_number}
                      onChange={(e) => setProfileData({ ...profileData, license_number: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Experience (years)</Form.Label>
                    <Form.Control
                      type="number"
                      value={profileData.experience}
                      onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* File Uploads */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Profile Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfileData({ ...profileData, image: e.target.files[0] })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Citizenship File</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => setProfileData({ ...profileData, citizenship_file: e.target.files[0] })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Passport File</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => setProfileData({ ...profileData, passport_file: e.target.files[0] })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Other Documents</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      onChange={(e) => setProfileData({ ...profileData, documents: e.target.files })}
                    />
                    <Form.Text className="text-muted">Uploading new documents will replace existing ones.</Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={updatingProfile}>
                {updatingProfile ? <Spinner animation="border" size="sm" /> : "Update Profile"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Appointment Modal */}
        <Modal show={showAppointmentModal} onHide={() => setShowAppointmentModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{editingAppointmentId ? "Edit" : "Add"} Appointment</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAppointmentSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={appointmentData.appointment_date}
                  onChange={(e) => setAppointmentData({ ...appointmentData, appointment_date: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  value={appointmentData.start_time}
                  onChange={(e) => setAppointmentData({ ...appointmentData, start_time: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  value={appointmentData.end_time}
                  onChange={(e) => setAppointmentData({ ...appointmentData, end_time: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select value={appointmentData.status} onChange={(e) => setAppointmentData({ ...appointmentData, status: e.target.value })}>
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="break">Break</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Service Charge</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={appointmentData.service_charge}
                  onChange={(e) => setAppointmentData({ ...appointmentData, service_charge: e.target.value })}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAppointmentModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingAppointmentId ? "Update" : "Add"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </>
  );
};

export default DoctorDashboard;
