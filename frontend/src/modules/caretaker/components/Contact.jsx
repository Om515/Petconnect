import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 }, // Changed from y: 20 to y: -20
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const cardHover = {
    hover: {
      y: -5,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-6xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Contact <span className="bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">Us</span>
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            We'd love to hear from you! Reach out with questions, feedback, or just to say hello.
          </motion.p>
        </motion.div>

        <div className="flex justify-center">
          {/* Contact Information */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full"
            variants={itemVariants}
            whileHover="hover"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Get in Touch</h2>
           
            <div className="space-y-6">
              <motion.div
                className="flex items-start space-x-4 group"
                whileHover={{ x: 5 }}
              >
                <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-500 transition-colors">
                  <Mail className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Email Us</h3>
                  <p className="text-gray-600">hello@petconnect.com</p>
                  <p className="text-gray-600">support@petconnect.com</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start space-x-4 group"
                whileHover={{ x: 5 }}
              >
                <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-500 transition-colors">
                  <Phone className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Call Us</h3>
                  <p className="text-gray-600">(123) 456-7890</p>
                  <p className="text-gray-600">Mon-Fri: 9am-6pm EST</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start space-x-4 group"
                whileHover={{ x: 5 }}
              >
                <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-500 transition-colors">
                  <MapPin className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Visit Us</h3>
                  <p className="text-gray-600">123 Pet Street</p>
                  <p className="text-gray-600">Petville, PC 12345</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;