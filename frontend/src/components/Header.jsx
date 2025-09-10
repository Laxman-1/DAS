import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear all local storage data
    navigate('/userLogin'); // Redirect to login page
  };

  return (
    <>
      <Navbar expand="lg" className="shadow-lg" style={{
        background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
        borderBottom: '4px solid #ff6b35'
      }}>
        <Container fluid>
          <Navbar.Brand href="#" className="text-white fw-bold fs-4" style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            background: 'linear-gradient(45deg, #ffffff, #f0f8ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Doctor Recommendation
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" className="border-warning" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>
              <Nav.Link href="/" className="text-white fw-semibold hover-effect">Home</Nav.Link>
              <Nav.Link href="/userLogin" className="text-white fw-semibold hover-effect">Login</Nav.Link>
              <NavDropdown title="Clinic" id="navbarScrollingDropdown" className="text-white">
                <NavDropdown.Item href="/healthcarelogin" className="text-dark">Clinic Login</NavDropdown.Item>
                <NavDropdown.Item href="/registerhealthcare" className="text-dark">Clinic Register</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action5" className="text-dark">Other Services</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link href="/doctor" className="text-white fw-semibold hover-effect">
                Doctor Appointment
              </Nav.Link>
            </Nav>

            {/* Search Bar */}
            <Form className="d-flex me-3">
              <Form.Control
                type="search"
                placeholder="Search..."
                className="me-2 border-0 shadow-sm"
                aria-label="Search"
                style={{
                  borderRadius: '25px',
                  padding: '8px 20px',
                  background: 'rgba(255,255,255,0.9)'
                }}
              />
              <Button
                variant="warning"
                className="fw-semibold shadow-sm"
                style={{
                  background: '#ff6b35',
                  borderColor: '#ff6b35',
                  borderRadius: '25px',
                  padding: '8px 20px'
                }}
              >
                Search
              </Button>
            </Form>

            {/* Logout Button */}
            <Button
              variant="danger"
              className="fw-semibold shadow-sm"
              onClick={handleLogout}
            >
              Logout
            </Button>

          </Navbar.Collapse>
        </Container>
      </Navbar>

      <style jsx>{`
        .hover-effect:hover {
          color: #ff6b35 !important;
          transform: translateY(-2px);
          transition: all 0.3s ease;
          text-shadow: 0 2px 4px rgba(255,107,53,0.3);
        }
      `}</style>
    </>
  )
}

export default Header;
