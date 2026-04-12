import FeaturesSectionDemo from '@/components/features-section-demo-3';
import FeatureShowcase from './components/FeatureShowcase';
import MultilingualCarousel from './components/MultilingualCarousel';
import { Testimonials } from './components/Testimonials';
import { CallToAction } from './components/CallToAction.jsx';
import { Footer } from './components/Footer';
import Chatbot from './components/Chatbot'; 
import Navbar from './components/Navbar';

export default function Home() {
  const selectedFund = {
    name: "WealthPulse",
    code: "1212"
  }; // optional, pass selected fund if needed

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <CallToAction />
      <FeaturesSectionDemo />
      <FeatureShowcase />
      <Testimonials />
      <MultilingualCarousel />
      <Footer />

      {/* Chatbot floating button */}
      <Chatbot selectedFund={selectedFund} />
    </main>
  );
}
