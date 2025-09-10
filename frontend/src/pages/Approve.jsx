// src/pages/Approve.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import { Table, Button, Alert, Spinner, Card } from 'react-bootstrap';

const Approve = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch all doctors
  const fetchDoctors = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Approve a doctor
  const handleApprove = async (id) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(`http://localhost:8000/api/doctors/${id}/approve`);
      setMessage(`✅ Doctor "${res.data.doctor.name}" approved and email sent successfully!`);
      fetchDoctors(); // Refresh the table
    } catch (err) {
      setMessage(
        err.response?.data?.message || 'Error approving doctor. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <AdminSidebar />
      <div style={{ marginLeft: '220px', padding: '20px' }}>
        <h2 className="mb-4">Approve Doctors</h2>

        {message && <Alert variant="success">{message}</Alert>}

        <Card className="p-4 shadow-sm">
          <Table bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Specialization</th>
                <th>License Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length > 0 ? (
                doctors.map((doc, idx) => (
                  <tr key={doc.id}>
                    <td>{idx + 1}</td>
                    <td>{doc.name}</td>
                    <td>{doc.email}</td>
                    <td>{doc.specialization}</td>
                    <td>{doc.license_number}</td>
                    <td>
                      {doc.approve_status ? (
                        <span className="text-success">Approved</span>
                      ) : (
                        <span className="text-danger">Pending</span>
                      )}
                    </td>
                    <td>
                      {!doc.approve_status && (
                        <Button
                          size="sm"
                          variant="success"
                          disabled={loading}
                          onClick={() => handleApprove(doc.id)}
                        >
                          {loading ? <Spinner animation="border" size="sm" /> : 'Approve'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No doctors found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>
    </>
  );
};

export default Approve;
