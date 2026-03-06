import { useState } from 'react';
import { FiSend, FiBarChart2, FiShield, FiAlertTriangle, FiCpu, FiGlobe, FiMenu, FiX } from 'react-icons/fi';
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';

// Header Component
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md fixed top-0 left-0 right-0 z-20 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800 flex items-center">
            <FiCpu className="mr-2 text-green-600" />
            eWaste<span className="text-green-600">Track</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-4">
          <a href="#features" className="text-gray-600 hover:text-green-600 px-4 py-2 rounded-md">Features</a>
          <a href="#problem" className="text-gray-600 hover:text-green-600 px-4 py-2 rounded-md">The Problem</a>
          <SignedOut>
            <Link to="/login" className="text-gray-600 hover:text-green-600 font-semibold py-2 px-4">Sign In</Link>
            <Link to="/signup" className="bg-green-600 text-white font-bold py-2 px-4 rounded-full hover:bg-green-700 transition duration-300">
              Sign Up
            </Link>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard" className="text-gray-600 hover:text-green-600 font-semibold py-2 px-4">Dashboard</Link>
            <UserButton afterSignOutUrl="/"/>
          </SignedIn>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-800 hover:text-green-600 focus:outline-none">
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden bg-white px-6 pt-2 pb-4 space-y-2">
          <a href="#features" onClick={() => setIsOpen(false)} className="block text-gray-600 hover:text-green-600 py-2 rounded-md">Features</a>
          <a href="#problem" onClick={() => setIsOpen(false)} className="block text-gray-600 hover:text-green-600 py-2 rounded-md">The Problem</a>
          <div className="border-t border-gray-200 my-2"></div>
          <SignedOut>
            <Link to="/login" onClick={() => setIsOpen(false)} className="block text-gray-600 hover:text-green-600 py-2 rounded-md">Sign In</Link>
            <Link to="/signup" onClick={() => setIsOpen(false)} className="block bg-green-600 text-white text-center font-bold py-2 px-4 rounded-full hover:bg-green-700 transition duration-300">
              Sign Up
            </Link>
          </SignedOut>
           <SignedIn>
            <Link to="/dashboard" className="block text-gray-600 hover:text-green-600 py-2 rounded-md">Dashboard</Link>
            <UserButton afterSignOutUrl="/"/>
          </SignedIn>
        </nav>
      )}
    </header>
  );
};

// Hero Section Component
const Hero = () => {
  const { user } = useUser();

  return (
    <section className="relative bg-gradient-to-b from-cyan-50 to-green-50 pt-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img className="w-full h-full object-cover opacity-10" src="https://3rrecycler.com/wp-content/uploads/2020/09/e-waste.jpg" alt="Recycling background" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-transparent"></div>
      </div>

      <div className="relative container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-4xl text-center mx-auto">
          <SignedOut>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
              Shining a Light on e-Waste.
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              A data-driven platform to map informal e-waste activities and champion safer, sustainable recycling solutions for our communities and planet.
            </p>
            <a href="#features" className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-green-700 transition duration-300 shadow-lg hover:shadow-xl">
              Discover Our Mission
            </a>
          </SignedOut>
          <SignedIn>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              Ready to make an impact? Go to your dashboard to report an activity or view community data.
            </p>
            <Link to="/dashboard" className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-green-700 transition duration-300 shadow-lg hover:shadow-xl">
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </div>
    </section>
  );
};

// Problem Section Component
const Problem = () => (
  <section id="problem" className="py-20 bg-white">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">The Hidden Dangers of eWaste</h2>
        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Informal recycling poses severe risks to human health and the environment.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <FiAlertTriangle size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-gray-800">Health Hazards</h3>
              <p className="text-gray-600 mt-1">Workers, including children, are exposed to toxic substances like lead, mercury, and cadmium, leading to severe health complications.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <FiGlobe size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-gray-800">Environmental Pollution</h3>
              <p className="text-gray-600 mt-1">Improper disposal contaminates soil, water, and air, causing long-term ecological damage and affecting entire communities.</p>
            </div>
          </div>
        </div>
        <div className="order-first md:order-last">
          {/* You can replace this with a real image */}
          <div className="bg-gray-200 overflow-hidden  rounded-lg shadow-lg h-80 flex items-center justify-center">
            <img className='h-full w-full object-cover' src="https://rekart.co.in/uploads/blog/unveiling-e-waste.jpg" alt="" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Features Section Component
const FeatureCard = ({ icon, title, children }) => (
  <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="text-green-600 mb-4">{icon}</div>
    <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </div>
);

const Features = () => (
  <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">A Solution for Everyone</h2>
        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">We provide tailored tools for citizens and organizations to combat the e-waste crisis together.</p>
      </div>
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <FeatureCard icon={<FiSend size={40} />} title="For Citizens: Easy Reporting">
          Quickly and anonymously report informal e-waste activities using your phone's location. Your reports provide the crucial ground-level data needed to identify problem areas and protect communities.
        </FeatureCard>
        <FeatureCard icon={<FiBarChart2 size={40} />} title="For Government & NGOs: Actionable Data">
          Access a powerful dashboard with interactive maps and analytics. Visualize hotspots, track trends, and use our centralized database to drive policy, launch targeted campaigns, and measure impact.
        </FeatureCard>
      </div>
    </div>
  </section>
);

// CTA Section Component
const CTA = () => (
  <section id="contact" className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
      <p className="text-lg mb-8 max-w-2xl mx-auto">
        Whether you're a researcher, a concerned citizen, or part of an organization, your contribution is vital. Help us build a safer world.
      </p>
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <a href="mailto:contact@ewastetrack.org" className="bg-white text-green-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition duration-300">
          Contact Us
        </a>
        <Link to="/dashboard" className="border-2 border-white text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-white hover:text-green-600 transition duration-300">
          Report an Activity
        </Link>
      </div>
    </div>
  </section>
);

// Footer Component
const Footer = () => (
  <footer className="bg-gray-800 text-white">
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h3 className="text-xl font-bold">eWasteTrack</h3>
          <p className="text-gray-400">Pioneering a safer future for electronics recycling.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
          <a href="#" className="text-gray-400 hover:text-white">About</a>
          <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
          <a href="mailto:contact@ewastetrack.org" className="text-gray-400 hover:text-white">Contact</a>
        </div>
      </div>
      <div className="mt-8 border-t border-gray-700 pt-6 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} eWasteTrack. All rights reserved.</p>
      </div>
    </div>
  </footer>
);


// Main LandingPage Component
const LandingPage = () => {
  return (
    <div className="bg-white font-sans">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;