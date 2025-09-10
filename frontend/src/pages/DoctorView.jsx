import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DoctorView = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/doctors");
        const approvedDoctors = response.data.filter(
          (doctor) => doctor.approve_status === 1 || doctor.approve_status === true
        );
        setDoctors(approvedDoctors);
      } catch (err) {
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Available Doctors</h2>

      {loading && (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {doctors.length > 0 ? (
          doctors.map((doctor) => (
            <Col md={4} key={doctor.id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{doctor.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {doctor.specialization}
                  </Card.Subtitle>
                  <Card.Text>
                    <strong>Qualification:</strong> {doctor.qualification} <br />
                    <strong>Experience:</strong> {doctor.experience} <br />
                    <strong>Contact:</strong> {doctor.contact} <br />
                    <strong>Address:</strong> {doctor.address} <br />
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/doctor/${doctor.id}`)}
                  >
                    View Details & Appointments
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          !loading && <p className="text-center">No approved doctors available.</p>
        )}
      </Row>
    </Container>
  );
};

export default DoctorView;
