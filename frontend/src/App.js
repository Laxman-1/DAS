import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import { LanguageProvider } from './components/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <div>
        <Header/>
        <Hero></Hero>
        <Footer></Footer>
      </div>
    </LanguageProvider>
  );
}

export default App;
