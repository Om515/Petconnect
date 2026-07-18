import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, PawPrint, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

// Define social links
const socialLinks = [
  { Icon: Facebook, href: "#", color: "hover:bg-blue-500", name: "Facebook" },
  { Icon: Instagram, href: "#", color: "hover:bg-gradient-to-br from-pink-500 to-yellow-500", name: "Instagram" },
  { Icon: Twitter, href: "#", color: "hover:bg-blue-400", name: "Twitter" },
  { Icon: Linkedin, href: "#", color: "hover:bg-blue-600", name: "LinkedIn" }
];

export const footerRoutes = [
  { path: '/about', label: 'About Us' },
  { path: '/contact', label: 'Contact' },
  { path: '/privacy', label: 'Privacy Policy' },
  { path: '/terms', label: 'Terms of Service' }
];

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: -50, opacity: 0 }, // Increased from -20 to -50 for more noticeable top-to-bottom motion
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        duration: 0.5
      }
    }
  };

  return (
    <footer className="bg-gradient-to-br from-cyan-600 via-teal-500 to-cyan-600 text-white py-16 px-5 shadow-2xl relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <motion.div 
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }} // Added margin to trigger animation earlier
        variants={containerVariants}
      >
        {/* Brand Section */}
        <motion.div 
          className="space-y-6" 
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div 
              className="bg-gradient-to-br from-white to-gray-100 rounded-full p-2 shadow-lg transform group-hover:rotate-12 transition duration-500"
              whileHover={{ scale: 1.05 }}
            >
              <PawPrint className="w-8 h-8 text-teal-600" />
            </motion.div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
              PetConnect
            </h2>
          </Link>
          <p className="text-white leading-relaxed text-lg">
            Connecting pets with loving homes and creating lasting bonds through our passionate community.
          </p>
          <div className="flex space-x-4 pt-2">
            {socialLinks.map(({ Icon, href, color, name }) => (
              <motion.a 
                key={name}
                href={href} 
                className={`w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center text-white transition-all duration-300 ${color} hover:text-white shadow-lg hover:shadow-xl hover:-translate-y-1`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={name}
              >
                <Icon size={20} />
              </motion.a>
            ))}
          </div>
        </motion.div>
        
        {/* Quick Links */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-semibold mb-6 border-b border-teal-400 pb-3 flex items-center">
            <PawPrint className="w-5 h-5 mr-2 text-white" />
            Quick Links
          </h3>
          <ul className="space-y-3">
            {footerRoutes.map(({ path, label }) => (
              <li key={path}>
                <Link 
                  to={path}
                  className="text-white hover:text-yellow-200 transition-all duration-300 hover:pl-3 flex items-center group"
                >
                  <span className="w-2 h-2 bg-white rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
        
        {/* Contact Information */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-semibold mb-6 border-b border-teal-400 pb-3 flex items-center">
            <PawPrint className="w-5 h-5 mr-2 text-white" />
            Contact Us
          </h3>
          <div className="space-y-4 text-white">
            <div className="flex items-start space-x-3 hover:text-gray-200 transition-colors duration-300 group">
              <div className="bg-teal-700 p-2 rounded-full group-hover:bg-teal-500 transition-colors">
                <MapPin className="w-5 h-5 text-white group-hover:text-white transition-colors" />
              </div>
              <span>123 Pet Street, Petville, PC 12345</span>
            </div>
            <div className="flex items-start space-x-3 hover:text-gray-200 transition-colors duration-300 group">
              <div className="bg-teal-700 p-2 rounded-full group-hover:bg-teal-500 transition-colors">
                <Mail className="w-5 h-5 text-white group-hover:text-white transition-colors" />
              </div>
              <span>hello@petconnect.com</span>
            </div>
            <div className="flex items-start space-x-3 hover:text-gray-200 transition-colors duration-300 group">
              <div className="bg-teal-700 p-2 rounded-full group-hover:bg-teal-500 transition-colors">
                <Phone className="w-5 h-5 text-white group-hover:text-white transition-colors" />
              </div>
              <span>(123) 456-PETS</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Copyright Section */}
      <motion.div 
        className="text-center text-white mt-16 pt-8 border-t border-teal-400 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <p className="text-sm">
          &copy; {new Date().getFullYear()} PetConnect. All rights reserved. 
          <span className="mx-2">•</span> 
          Proudly created by pet lovers
        </p>
        <div className="flex justify-center space-x-6 mt-4 text-sm">
          {footerRoutes.slice(2).map(({ path, label }) => (
            <React.Fragment key={path}>
              <Link to={path} className="hover:text-gray-200 transition-colors">{label}</Link>
              <span className="text-teal-300">•</span>
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
      `}</style>
    </footer>
  );
};

export default Footer;