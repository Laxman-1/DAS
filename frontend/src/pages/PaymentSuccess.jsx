import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Alert } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const dataQuery = searchParams.get("data");
    const paymentMethod = searchParams.get("method");

    if (!dataQuery && !paymentMethod) {
      setError("No payment data provided");
      setTimeout(() => navigate("/doctors"), 2000);
      return;
    }

    if (paymentMethod === "cash") {
      setMessage("Booking for cash");
      setTimeout(() => navigate("/my-appointments"), 2000);
      return;
    }

    try {
      const resData = atob(dataQuery);
      const resObject = JSON.parse(resData);
      console.log("eSewa response:", resObject);
      setData(resObject);
      setMessage("Payment Successful");
      setTimeout(() => navigate("/my-appointments"), 2000);
    } catch (err) {
      console.error("Error parsing payment data:", err);
      setError("Invalid payment data");
      setTimeout(() => navigate("/doctors"), 2000);
    }
  }, [searchParams, navigate]);

  if (error) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Alert variant="danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </Alert>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="py-5 text-center">
        <img src="/check.png" alt="Success" style={{ width: "100px", marginBottom: "20px" }} />
        <h4 className="text-success mb-3">{message}</h4>
        <p className="text-muted">Amount: NPR {data.total_amount || "N/A"}</p>
        <p className="text-muted">Redirecting to your appointments...</p>
      </Container>
      <Footer />
    </>
  );
};

export default PaymentSuccess;