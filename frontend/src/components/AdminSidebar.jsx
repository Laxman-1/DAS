import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <div
      style={{
        width: '220px',
        height: '100vh',
        background: '#f8f9fa',
        padding: '20px',
        position: 'fixed',
      }}
    >
      <h5>Admin Menu</h5>
      <Nav className="flex-column mt-4">
        <Nav.Item className="mb-2">
          <Link to="/admin/dashboard" className="text-decoration-none">
            Dashboard
          </Link>
        </Nav.Item>
        <Nav.Item className="mb-2">
          <Link to="/admin/categories" className="text-decoration-none">
            Categories
          </Link>
        </Nav.Item>
        <Nav.Item className="mb-2">
          <Link to="/admin/doctors" className="text-decoration-none">
            Doctors
          </Link>
        </Nav.Item>
        <Nav.Item className="mb-2">
          <Link to="/admin/patients" className="text-decoration-none">
            Patients
          </Link>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default AdminSidebar;
