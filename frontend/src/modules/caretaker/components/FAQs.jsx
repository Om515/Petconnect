import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I adopt a pet through PetConnect?",
      answer: "Browse available pets, submit an adoption application, and our team will connect you with the pet owner to arrange a meeting."
    },
    {
      question: "What are the adoption fees?",
      answer: "Adoption fees vary depending on the pet and organization. All fees will be clearly listed in the pet's profile."
    },
    {
      question: "Can I list my pet for adoption on PetConnect?",
      answer: "Yes! Create an account, complete your profile, and you can list pets you need to rehome following our guidelines."
    },
    {
      question: "How does PetConnect ensure pet safety?",
      answer: "We verify all user accounts and encourage meet-and-greets in safe, public locations. However, we recommend always exercising caution."
    },
    {
      question: "What if I have issues with my adoption?",
      answer: "Contact our support team immediately. While we can't guarantee outcomes, we'll help mediate any disputes that arise."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-cyan-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex justify-center items-center mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 shadow-lg">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-800 mb-4">
            Frequently Asked <span className="text-teal-500">Questions</span>
          </h1>
          <p className="text-xl text-cyan-700/80 max-w-2xl mx-auto">
            Find answers to common questions about PetConnect and our services
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                activeIndex === index ? "ring-2 ring-teal-400" : "hover:shadow-xl"
              }`}
            >
              <button
                className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-cyan-50/50 transition-colors"
                onClick={() => toggleFAQ(index)}
              >
                <h2 className="text-xl font-semibold text-cyan-800">{faq.question}</h2>
                {activeIndex === index ? (
                  <ChevronUp className="w-6 h-6 text-teal-500" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-teal-500" />
                )}
              </button>
              {activeIndex === index && (
                <div className="px-8 pb-8 pt-2 text-cyan-700/90">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQs;