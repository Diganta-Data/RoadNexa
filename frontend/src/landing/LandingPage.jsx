import { useEffect } from 'react';
import './animations/register';
import './landing.css';
import BackgroundSystem from './components/BackgroundSystem';
import CustomCursor, { ScrollProgress } from './components/CustomCursor';
import LandingNavbar from './components/LandingNavbar';
import HeroSection from './components/HeroSection';
import DataPipeline from './components/DataPipeline';
import IntelligenceMap from './components/IntelligenceMap';
import RiskVisualization from './components/RiskVisualization';
import AccidentVisualization from './components/AccidentVisualization';
import CityShowcase from './components/CityShowcase';
import IndiaMap from './components/IndiaMap';
import MLVisualization from './components/MLVisualization';
import UploadShowcase from './components/UploadShowcase';
import CapabilityCard from './components/CapabilityCard';
import WorkflowTimeline from './components/WorkflowTimeline';
import AnalyticsPreview from './components/AnalyticsPreview';
import WhyIris from './components/WhyIris';
import FinalCTA from './components/FinalCTA';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  useEffect(() => {
    document.body.classList.add('iris-landing-active');
    document.documentElement.classList.add('iris-landing-active');
    return () => {
      document.body.classList.remove('iris-landing-active');
      document.documentElement.classList.remove('iris-landing-active');
    };
  }, []);

  return (
    <div className="iris-lp">
      <a className="iris-skip" href="#hero-heading">Skip to content</a>
      <ScrollProgress />
      <CustomCursor />
      <BackgroundSystem />
      <LandingNavbar />
      <main>
        <HeroSection />
        <DataPipeline />
        <IntelligenceMap />
        <RiskVisualization />
        <AccidentVisualization />
        <CityShowcase />
        <IndiaMap />
        <MLVisualization />
        <UploadShowcase />
        <CapabilityCard />
        <WorkflowTimeline />
        <AnalyticsPreview />
        <WhyIris />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
