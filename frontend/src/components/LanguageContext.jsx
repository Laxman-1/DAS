import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const translations = {
    en: {
      // Header
      brand: '🏥 Doctor Recommendation System',
      home: 'Home',
      login: 'Login',
      clinic: 'Clinic',
      clinicLogin: 'Clinic Login',
      clinicRegister: 'Clinic Registration',
      otherServices: 'Other Services',
      doctorAppointment: 'Doctor Appointment',
      searchPlaceholder: 'Search for doctors...',
      searchButton: 'Search',
      
      // Hero
      title: 'Your Health, Our Priority',
      subtitle: 'Our smart recommendation system connects you with top-rated doctors based on your health concerns, preferences, and location—bringing personalized care to your fingertips.',
      getStarted: '🚀 Get Started',
      learnMore: '📖 Learn More',
      findDoctor: 'Find the Right Doctor',
      findDoctorSubtitle: 'We help you connect with the best healthcare professionals quickly and easily.',
      verified: '✅ Verified',
      experienced: '🏥 Experienced',
      reliable: '💯 Reliable',
      nepaliCulture: 'Nepali Culture',
      himalayanHealth: 'Himalayan Health',
      naturalRemedies: 'Natural Remedies',
      serviceSpirit: 'Service Spirit',
      
      // Footer
      subtitle: 'Connecting patients with the right healthcare professionals.',
      description: 'Connecting patients with healthcare professionals.',
      specialties: 'Specialties',
      cardiology: 'Cardiology',
      neurology: 'Neurology',
      pediatrics: 'Pediatrics',
      internal: 'Internal Medicine',
      quickLinks: 'Quick Links',
      register: 'Register',
      findDoctorFooter: 'Find a Doctor',
      bookService: 'Book Service',
      contact: 'Contact',
      phone: '+977 123 456 789',
      email: 'drs@nepal.com',
      location: 'Kathmandu, Nepal',
      easyBooking: 'Easy Appointment Booking',
      easyBookingDesc: 'Book your appointment in minutes',
      verifiedDoctors: 'Verified Doctors',
      verifiedDoctorsDesc: 'All doctors are verified and experienced',
      securePrivate: 'Secure and Private',
      securePrivateDesc: 'Your information stays secure',
      copyright: '© 2025 Doctor Recommendation System. All rights reserved.',
      tagline: 'Nepali Healthcare - Our Priority'
    },
    ne: {
      // Header
      brand: '🏥 डाक्टर सिफारिस प्रणाली',
      home: 'गृह',
      login: 'लगइन',
      clinic: 'क्लिनिक',
      clinicLogin: 'क्लिनिक लगइन',
      clinicRegister: 'क्लिनिक दर्ता',
      otherServices: 'अन्य सेवाहरू',
      doctorAppointment: 'डाक्टर भेट',
      searchPlaceholder: 'डाक्टर खोज्नुहोस्...',
      searchButton: 'खोज्नुहोस्',
      
      // Hero
      title: 'तपाईंको स्वास्थ्य, हाम्रो प्राथमिकता',
      subtitle: 'हाम्रो बुद्धिमान सिफारिस प्रणालीले तपाईंको स्वास्थ्य चिन्ता, रुचि र स्थानको आधारमा शीर्ष-स्तरीय डाक्टरहरूसँग जोड्छ—तपाईंको हातमा व्यक्तिगत देखभाल ल्याउँछ।',
      getStarted: '🚀 सुरु गर्नुहोस्',
      learnMore: '📖 थप जानकारी',
      findDoctor: 'सही डाक्टर फेला पार्नुहोस्',
      findDoctorSubtitle: 'हामीले तपाईंलाई छिटो र सजिलै उत्तम स्वास्थ्य सेवा पेशेवरहरूसँग जोड्न मद्दत गर्छौं।',
      verified: '✅ प्रमाणित',
      experienced: '🏥 अनुभवी',
      reliable: '💯 विश्वसनीय',
      nepaliCulture: 'नेपाली संस्कृति',
      himalayanHealth: 'हिमाली स्वास्थ्य',
      naturalRemedies: 'प्राकृतिक उपचार',
      serviceSpirit: 'सेवा भावना',
      
      // Footer
      subtitle: 'रोगीहरूलाई उचित स्वास्थ्य सेवा पेशेवरहरूसँग जोड्ने',
      description: 'स्वास्थ्य सेवा पेशेवरहरूसँग जडान गर्ने।',
      specialties: 'विशेषताहरू',
      cardiology: 'हृदय रोग',
      neurology: 'स्नायु रोग',
      pediatrics: 'बाल रोग',
      internal: 'आन्तरिक रोग',
      quickLinks: 'द्रुत लिङ्कहरू',
      register: 'दर्ता',
      findDoctorFooter: 'डाक्टर खोज्नुहोस्',
      bookService: 'सेवा बुक',
      contact: 'सम्पर्क',
      phone: '+977 123 456 789',
      email: 'drs@nepal.com',
      location: 'काठमाडौं, नेपाल',
      easyBooking: 'सजिलो भेट बुकिङ',
      easyBookingDesc: 'अलिकति समयमै आफ्नो भेट बुक गर्नुहोस्',
      verifiedDoctors: 'प्रमाणित डाक्टरहरू',
      verifiedDoctorsDesc: 'सबै डाक्टरहरू प्रमाणित र अनुभवी छन्',
      securePrivate: 'सुरक्षित र निजी',
      securePrivateDesc: 'तपाईंको जानकारी सुरक्षित रहन्छ',
      copyright: '© २०२५ डाक्टर सिफारिस प्रणाली। सर्वाधिकार सुरक्षित।',
      tagline: 'नेपाली स्वास्थ्य सेवा - हाम्रो प्राथमिकता'
    }
  };

  const value = {
    language,
    setLanguage,
    translations: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
