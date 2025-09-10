import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserRegister from './pages/UserRegister';
import UserLogin from './pages/UserLogin';
import DoctorLogin from './pages/DoctorLogin';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Doctor from './pages/Doctor';
import DoctorRegister from './pages/DoctorRegister';
import DoctorList from './pages/DoctorList';
import Appointment from './pages/Appointment';
import ViewAppoinment from './pages/ViewAppoinment';
import Booking from './pages/Booking';
import MyAppoinments from './pages/MyAppoinments';
import Approve from './pages/Approve';
import DoctorAppointments from './pages/DoctorAppointments';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

//import icons from 'react-bootstrap-icons';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 <React.StrictMode>
    <BrowserRouter>
      <Routes>


      <Route path="/paymentsuccess" element={<PaymentSuccess />} />
      <Route path="/paymentfailure" element={<PaymentFailure/>} />
      <Route path="/doctors" element={<Doctor/>} />
      <Route path="/my-appointments" element={<MyAppoinments/>} />
    <Route path="/" element={<App />} />
         <Route path="/paymentsuccess" element={<PaymentSuccess/>} />
        <Route path="/doctors/:doctorId/appointments" element={<DoctorAppointments />} />
  <Route path="/userRegister" element={<UserRegister/>} />
<Route path="/userLogin" element={<UserLogin/>} />
<Route path="/doctorLogin" element={<DoctorLogin/>} />
<Route path="/doctordashboard/:doctorId" element={<DoctorDashboard />} />
<Route path="/admindashboard" element={<AdminDashboard/>} />
<Route path="/doctors" element={<Doctor/>} />
<Route path="/doctorRegister" element={<DoctorRegister/>} />
<Route path="/doctorList" element={<DoctorList/>}/>
<Route path="/viewAppoinment/:id" element={<ViewAppoinment/>}/>
<Route path="/booking" element={<Booking/>} />
<Route path="/approve" element={<Approve/>} />
<Route path="/doctor/availability" element={<Appointment/>}/>
<Route path="/doctor/availability/:doctorId" element={<Appointment/>} />
<Route path="/booking" element={<Booking />} />
<Route path="/payment/success" element={<Booking />} />
<Route path="/payment/failure" element={<Booking />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
