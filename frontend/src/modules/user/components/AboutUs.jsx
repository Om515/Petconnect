import React from 'react';
import { PawPrint, Heart, Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const AboutUs = () => {
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

  const cardVariants = {
    hover: {
      y: -5,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-cyan-100 py-20 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-6xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            About <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">PetConnect</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Connecting pets with loving homes since 2020. Our mission is to create meaningful bonds between pets and people.
          </motion.p>
        </motion.div>

        {/* Our Story */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 mb-16"
          variants={itemVariants}
          whileHover={{ 
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
            transition: { duration: 0.3 }
          }}
        >
          <div className="flex items-center mb-6">
            <motion.div 
              className="bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full p-3 mr-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <PawPrint className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-800">Our Story</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 mb-4">
                Founded by a team of pet lovers, PetConnect began as a small local initiative to help abandoned pets find forever homes.
              </p>
              <p className="text-gray-600">
                What started as a weekend project quickly grew into a nationwide platform connecting thousands of pets with caring families each year.
              </p>
            </div>
            <motion.div 
              className="bg-gradient-to-br from-cyan-50 to-gray-50 rounded-xl h-64 flex items-center justify-center border-2 border-dashed border-cyan-200"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-gray-400">Founders Photo</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Our Values */}
        <motion.div className="mb-16" variants={itemVariants}>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="w-10 h-10 text-cyan-500" />,
                title: "Compassion",
                description: "We treat every pet with the love and respect they deserve."
              },
              {
                icon: <Users className="w-10 h-10 text-cyan-500" />,
                title: "Community",
                description: "Building connections between pet lovers and animals in need."
              },
              {
                icon: <Shield className="w-10 h-10 text-cyan-500" />,
                title: "Responsibility",
                description: "Ensuring every adoption is ethical and in the pet's best interest."
              }
            ].map((item, index) => (
              <motion.div 
                key={index} 
                className="bg-white rounded-2xl shadow-lg p-6 text-center hover:bg-gradient-to-br hover:from-cyan-50 hover:to-gray-50 transition-all duration-300"
                variants={cardVariants}
                whileHover="hover"
              >
                <motion.div 
                  className="flex justify-center mb-4"
                  whileHover={{ scale: 1.1 }}
                >
                  {item.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8"
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Meet Our Team</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <motion.div 
                key={item} 
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gradient-to-br from-cyan-100 to-gray-100 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-md">
                  <span className="text-gray-400">Team Member</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Team Member {item}</h3>
                <p className="text-gray-600">Position/Role</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="mt-16 text-center"
          variants={itemVariants}
        >
          <motion.button 
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Find Your Pet Today
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutUs;