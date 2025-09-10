import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, isAfter, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  Badge,
  InputGroup
} from 'react-bootstrap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './../App.css';

const Doctor = () => {
  // State declarations
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [isRecommending, setIsRecommending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [user, setUser] = useState(null);

  const chatBodyRef = useRef(null);
  const cancelTokenRef = useRef(null);
  const navigate = useNavigate();

  const symptomKeywords = [
    "pain", "ache", "fever", "cough", "nausea", "dizziness", "fatigue", "headache", "chills",
    "vomiting", "diarrhea", "constipation", "rash", "swelling", "bleeding", "shortness of breath",
    "palpitations", "weakness", "numbness", "tingling", "dry mouth", "sore throat", "runny nose",
    "congestion", "chest pain", "back pain", "joint pain", "muscle pain", "blurred vision",
    "earache", "toothache", "weight loss", "weight gain", "insomnia", "anxiety", "depression",
    "loss of appetite", "night sweats", "irritability", "confusion", "memory loss", "hair loss",
    "itching", "frequent urination", "painful urination", "blood in urine", "coughing blood",
    "hoarseness", "wheezing", "abdominal pain", "bloating", "heartburn", "indigestion",
    "stiff neck", "difficulty swallowing", "excessive thirst", "nosebleed", "jaw pain"
  ];

  // Effects
  useEffect(() => {
    cancelTokenRef.current = axios.CancelToken.source();

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userResponse = await axios.get('http://localhost:8000/api/user', {
            cancelToken: cancelTokenRef.current.token,
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(userResponse.data);
        }

        await fetchCategories();
        await fetchDoctors();
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError('Failed to load initial data');
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            setUser(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelTokenRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // API Functions
  const fetchDoctors = async () => {
    try {
      let response;
      const token = localStorage.getItem('token');
      
      if (token) {
        response = await axios.get('http://localhost:8000/api/doctors/with-available-appointments', {
          cancelToken: cancelTokenRef.current.token,
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await axios.get('http://localhost:8000/api/doctors', {
          cancelToken: cancelTokenRef.current.token
        });
        response.data = response.data.filter(doctor => doctor.approve_status);
      }

      // Attach category object to each doctor
      const enrichedDoctors = response.data.map(doctor => ({
        ...doctor,
        category: categories.find(cat => cat.id === doctor.category_id) || { category: 'Unknown', id: null }
      }));
      setAllDoctors(enrichedDoctors || []);
      setDoctors(enrichedDoctors || []);
      console.log('Fetched doctors:', enrichedDoctors); // Debugging
    } catch (error) {
      if (!axios.isCancel(error)) {
        setError('Failed to fetch doctors');
        console.error('Fetch doctors error:', error);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/categories', {
        cancelToken: cancelTokenRef.current.token
      });
      setCategories(response.data || []);
      console.log('Fetched categories:', response.data); // Debugging
    } catch (error) {
      if (!axios.isCancel(error)) {
        setError('Fetch categories error:', error);
      }
    }
  };

  // Recommendation System
  const getRecommendations = useCallback(async () => {
    if (!chatInput.trim()) return;

    setIsRecommending(true);
    setError(null);
    setChatHistory(prev => [...prev, { sender: 'You', text: chatInput }]);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/predict-specialist',
        { symptoms: chatInput },
        { cancelToken: cancelTokenRef.current.token }
      );

      const { data } = response;
      console.log('Recommendation response:', data); // Debugging

      if (data.success) {
        const specialist = data.recommended_specialist_category;
        const category = data.category || { id: null, category: specialist };
        setRecommendation({
          recommended_specialist_category: specialist,
          category,
        });

        setChatHistory(prev => [
          ...prev,
          {
            sender: 'System',
            text: `Based on your symptoms, I recommend seeing a ${specialist}`,
          },
        ]);

        // Use doctors from predict-specialist response (already filtered by backend for available appointments)
        const recommendedDoctors = data.doctors.map(doctor => ({
          ...doctor,
          category: doctor.category || categories.find(cat => cat.id === doctor.category_id) || { category: 'Unknown', id: null }
        }));

        console.log('Filtered recommended doctors:', recommendedDoctors); // Debugging

        if (recommendedDoctors.length > 0) {
          setDoctors(recommendedDoctors);
          setShowAllDoctors(false);
          setChatHistory(prev => [
            ...prev,
            {
              sender: 'System',
              text: `Found ${recommendedDoctors.length} ${specialist}(s) with available appointments.`,
            },
          ]);
        } else {
          setDoctors([]);
          setShowAllDoctors(false);
          setChatHistory(prev => [
            ...prev,
            {
              sender: 'System',
              text: `No ${specialist}s with available appointments found. Please try again later.`,
            },
          ]);
        }
      } else {
        throw new Error(data.error || 'Recommendation failed');
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err.response?.data?.error || 'Failed to process your request');
        setChatHistory(prev => [
          ...prev,
          { sender: 'System', text: 'Sorry, I could not process your symptoms. Please try again.' },
        ]);
        console.error('Recommendation error:', err);
      }
    } finally {
      setIsRecommending(false);
      setChatInput('');
    }
  }, [chatInput, categories]);

  const containsSymptom = useCallback((text) => {
    const lowerText = text.toLowerCase();
    return symptomKeywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(lowerText);
    });
  }, []);

  const handleSend = useCallback(() => {
    if (!chatInput.trim()) return;

    if (containsSymptom(chatInput)) {
      getRecommendations();
    } else {
      setChatHistory(prev => [
        ...prev,
        { sender: 'You', text: chatInput },
        {
          sender: 'Bot',
          text: 'Please describe your symptoms (e.g., "I have headache and fever") to get doctor recommendations.'
        }
      ]);
      setChatInput('');
    }
  }, [chatInput, containsSymptom, getRecommendations]);

  // Helper Functions
  const getDisplayedDoctors = () => {
    return showAllDoctors ? allDoctors : doctors;
  };

  const handleBookAppointment = (doctor, appointment) => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/doctors/${doctor.id}/appointments` } });
      return;
    }
    
    navigate(`/doctors/${doctor.id}/appointments`, { 
      state: { 
        doctor,
        selectedAppointment: appointment 
      } 
    });
  };

  const DoctorCard = ({ doctor }) => {
    const timeZone = 'Asia/Kathmandu';
    const doctorAppointments = doctor.appointments
      ?.filter(appt => {
        try {
          const utcDateTime = parseISO(`${appt.appointment_date.split('T')[0]}T${appt.start_time}:00Z`);
          const localDateTime = toZonedTime(utcDateTime, timeZone);
          return appt.status === 'available' && isAfter(localDateTime, new Date());
        } catch (error) {
          console.error(`Error parsing date for appointment ${appt.id}:`, error);
          return false;
        }
      })
      .sort((a, b) => new Date(`${a.appointment_date}T${a.start_time}`) - new Date(`${b.appointment_date}T${b.start_time}`)) || [];
    
    return (
      <Card className="h-100 shadow-sm border-0 rounded">
        <Card.Body className="p-4">
          <Row className="align-items-center">
            <Col md={4} className="text-center">
              <div className="doctor-avatar mb-3 position-relative">
                {doctor.image ? (
                  <img 
                    src={doctor.image.startsWith('http') ? doctor.image : `http://localhost:8000/storage/${doctor.image}`}
                    alt={doctor.name}
                    className="rounded-circle shadow-sm"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto shadow-sm"
                    style={{ width: '120px', height: '120px', fontSize: '2.5rem' }}
                  >
                    {doctor.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h5 className="mb-1 fw-bold">{doctor.name}</h5>
              <p className="text-primary mb-1">{doctor.specialization}</p>
              <p className="text-muted small mb-2">{doctor.qualification}</p>
              {doctor.category && (
                <Badge bg="primary" pill className="px-3 py-2">
                  {doctor.category.category}
                </Badge>
              )}
            </Col>
            
            <Col md={8}>
              <div className="appointment-slots">
                <h6 className="mb-3 fw-semibold">Available Appointments</h6>
                <div className="d-flex flex-wrap gap-2">
                  {doctorAppointments.slice(0, 4).map((appt, i) => (
                    <Button
                      key={i}
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleBookAppointment(doctor, appt)}
                      className="appointment-slot rounded-pill px-3 py-2"
                    >
                      <div className="text-center">
                        <div className="fw-bold">{format(new Date(appt.appointment_date), 'MMM dd')}</div>
                        <small>{appt.start_time}</small>
                      </div>
                    </Button>
                  ))}
                </div>
                {doctorAppointments.length > 4 && (
                  <small className="text-muted d-block mt-2">
                    +{doctorAppointments.length - 4} more slots available
                  </small>
                )}
                {doctorAppointments.length === 0 && (
                  <p className="text-muted small mb-0">No available slots</p>
                )}
              </div>
              
              <div className="mt-4">
                <Button
                  variant="success"
                  size="sm"
                  className="me-2 px-4 py-2 rounded-pill"
                  onClick={() => navigate(`/viewAppointment/${doctor.id}`)}
                >
                  View Profile
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="px-4 py-2 rounded-pill"
                  onClick={() => navigate(`/doctors/${doctor.id}/appointments`, { state: { doctor } })}
                >
                  See All Slots
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold mb-3">Doctor Recommendation</h1>
              <p className="lead mb-4">Your trusted healthcare partner. Helping you find the right doctor and clinic easily.</p>
              <Button variant="light" size="lg" onClick={() => document.getElementById('symptom-checker').scrollIntoView({ behavior: 'smooth' })}>
                Check Symptoms
              </Button>
            </Col>
            <Col md={6} className="text-center">
              <div className="hero-image">
                <i className="fas fa-user-md" style={{ fontSize: '8rem', opacity: 0.8 }}></i>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Container fluid className="flex-grow-1 py-5">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Row className="g-4">
          {/* Symptom Checker Section */}
          <Col md={4}>
            <Card id="symptom-checker" className="h-100 shadow border-0 rounded">
              <Card.Header className="bg-primary text-white py-3">
                <h3 className="mb-0">💬 Symptom Checker</h3>
              </Card.Header>
              <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }} ref={chatBodyRef} className="bg-white">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-muted p-3">
                    <p>Describe your symptoms to get personalized doctor recommendations.</p>
                    <p className="small">Example: "I have chest pain and dizziness"</p>
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 mb-2 rounded ${
                        msg.sender === 'You' ? 'bg-primary-subtle ms-auto' : 'bg-secondary-subtle'
                      }`}
                      style={{ maxWidth: '80%' }}
                    >
                      <strong>{msg.sender}:</strong> {msg.text}
                    </div>
                  ))
                )}
                {isRecommending && (
                  <div className="text-center p-2">
                    <Spinner animation="border" variant="primary" size="sm" />
                    <span className="ms-2">Analyzing symptoms...</span>
                  </div>
                )}
              </Card.Body>
              <Card.Footer className="bg-white">
                <InputGroup>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Describe your symptoms..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={isRecommending}
                  />
                  <Button
                    variant="primary"
                    onClick={handleSend}
                    disabled={isRecommending || !chatInput.trim()}
                  >
                    {isRecommending ? 'Sending...' : 'Send'}
                  </Button>
                </InputGroup>
              </Card.Footer>
            </Card>
          </Col>

          {/* Doctor Cards Section */}
          <Col md={8}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold text-success">
                {recommendation && !showAllDoctors
                  ? `👨‍⚕️ Recommended Doctors`
                  : '👨‍⚕️ Available Doctors'}
              </h2>
              {recommendation && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowAllDoctors(!showAllDoctors)}
                >
                  {showAllDoctors ? 'Show Recommended' : 'Show All Doctors'}
                </Button>
              )}
            </div>

            {recommendation && !showAllDoctors && (
              <Alert variant="info" className="mb-4 rounded">
                <strong>Recommendation:</strong> You should see a {recommendation.recommended_specialist_category} specialist.
                <Badge bg="success" className="ms-2">
                  {recommendation.category?.category || recommendation.recommended_specialist_category}
                </Badge>
              </Alert>
            )}

            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" size="lg" />
                <p className="mt-3">Loading doctors...</p>
              </div>
            ) : getDisplayedDoctors().length > 0 ? (
              <Row className="gy-4">
                {getDisplayedDoctors().map((doctor) => (
                  <Col key={doctor.id} xs={12}>
                    <DoctorCard doctor={doctor} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert variant="warning" className="text-center py-4 rounded">
                <h5>No Available Doctors</h5>
                <p className="mb-0">
                  {recommendation 
                    ? `No ${recommendation.recommended_specialist_category}s with available appointments found.`
                    : 'No doctors with available appointments found.'
                  }
                </p>
                <p className="mt-2">
                  <small>Please try again later or contact support.</small>
                </p>
              </Alert>
            )}
          </Col>
        </Row>
      </Container>
      
      <Footer />
    </div>
  );
};

export default Doctor;