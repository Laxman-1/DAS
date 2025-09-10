import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Alert } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const errorMessage = searchParams.get("error") || "Payment Failed";

  useEffect(() => {
    setTimeout(() => navigate("/doctors"), 2000);
  }, [navigate]);

  return (
    <>
      <Header />
      <Container className="py-5 text-center">
        <img src="/error.png" alt="Failure" style={{ width: "100px", marginBottom: "20px" }} />
        <Alert variant="danger">
          <i className="fas fa-exclamation-circle me-2"></i>
          {errorMessage}
        </Alert>
        <p className="text-muted">Redirecting to doctors page...</p>
      </Container>
      <Footer />
    </>
  );
};

export default PaymentFailure;