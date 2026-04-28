import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

export default function OnboardingTour() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Show tour on first visit
    const hasSeenTour = localStorage.getItem('needgraph_tour');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps = [
    {
      title: "Welcome to NeedGraph",
      desc: "The world's most advanced AI-powered community crisis early warning system. Let's take a quick tour.",
      target: "center"
    },
    {
      title: "Command Center",
      desc: "Monitor live metrics, deployed volunteers, and active needs across all wards in real-time.",
      target: "top"
    },
    {
      title: "Geospatial Analysis",
      desc: "Use the Need Map to visualize severity hotspots and compare ward vulnerabilities side-by-side.",
      target: "top"
    },
    {
      title: "Predictive AI Simulator",
      desc: "Test 'what-if' scenarios in the Crisis Simulator to see how interventions prevent cascading failures.",
      target: "center"
    },
    {
      title: "Command Palette",
      desc: "Press Cmd+K (or Ctrl+K) anywhere to instantly search, navigate, or create field reports.",
      target: "top-right"
    }
  ];

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('needgraph_tour', 'true');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-[#0A0A0F]/60 backdrop-blur-sm flex flex-col items-center justify-center p-6"
      >
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#111118] border border-[#2A2A40] rounded-[12px] shadow-2xl max-w-[400px] w-full overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep ? 'w-6 bg-[#6C63FF]' : 'w-1.5 bg-[#1E1E2E]'
                    }`}
                  />
                ))}
              </div>
              <button onClick={handleClose} className="text-[#55556A] hover:text-[#F0F0F5] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h2 className="text-[20px] font-bold text-[#F0F0F5] mb-2">{steps[currentStep].title}</h2>
            <p className="text-[14px] text-[#8A8A9A] leading-relaxed mb-8 min-h-[60px]">
              {steps[currentStep].desc}
            </p>
            
            <div className="flex items-center justify-between mt-auto">
              <button 
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-[6px] text-[13px] font-medium flex items-center gap-1.5 transition-colors ${
                  currentStep === 0 ? 'text-[#55556A] cursor-not-allowed' : 'text-[#8A8A9A] hover:bg-[#1A1A2E] hover:text-[#F0F0F5]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              
              <button 
                onClick={handleNext}
                className="px-5 py-2 rounded-[6px] bg-[#6C63FF] text-white text-[13px] font-medium flex items-center gap-1.5 hover:bg-[#5a52d9] transition-colors shadow-lg shadow-[#6C63FF]/20"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
