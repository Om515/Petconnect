import React from 'react';
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsOfService = () => {
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
  const sectionVariants = {
    hover: {
      x: 5,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <motion.div
            className="flex justify-center mb-6"
            animate={{
              rotate: [0, 10, -10, 0],
              y: [0, -10, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <FileText className="w-12 h-12 text-blue-500" />
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Terms of Service
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Effective Date: {new Date().toLocaleDateString()}
          </motion.p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          variants={itemVariants}
          whileHover={{
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
        >
          <div className="prose max-w-none">
            <motion.section className="mb-10" variants={sectionVariants} whileHover="hover">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing or using the PetConnect service, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
              </p>
            </motion.section>

            <motion.section className="mb-10" variants={sectionVariants} whileHover="hover">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-blue-500" />
                2. User Responsibilities
              </h2>
              <p className="text-gray-600 mb-4">
                As a user of PetConnect, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide accurate information about yourself and your pets</li>
                <li>Not use the service for any illegal purpose</li>
                <li>Not harass other users or misrepresent information</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </motion.section>

            <motion.section className="mb-10" variants={sectionVariants} whileHover="hover">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Pet Listings</h2>
              <p className="text-gray-600">
                All pet listings must be accurate and truthful. PetConnect reserves the right to remove any listing that violates our policies or contains misleading information.
              </p>
            </motion.section>

            <motion.section className="mb-10" variants={sectionVariants} whileHover="hover">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-500" />
                4. Adoption Process
              </h2>
              <p className="text-gray-600">
                PetConnect facilitates connections between pet owners and potential adopters but is not responsible for the final adoption decisions. All adoptions should be conducted responsibly and with proper consideration.
              </p>
            </motion.section>

            <motion.section variants={sectionVariants} whileHover="hover">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Changes to Terms</h2>
              <p className="text-gray-600">
                We reserve the right to modify these terms at any time. Your continued use of the service after such modifications constitutes your acceptance of the new terms.
              </p>
            </motion.section>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;