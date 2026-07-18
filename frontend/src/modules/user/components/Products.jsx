import React, { useState } from "react";
import Img1 from "../assets/images/Img1.jpg";
import Img2 from "../assets/images/Img2.png";
import Img3 from "../assets/images/Img3.jpg";
import Img4 from "../assets/images/Img4.jpg";
import Img5 from "../assets/images/Img5.jpg";
import { FaStar, FaArrowRight, FaPaw } from "react-icons/fa6";

const ProductsData = [
    {
        id: 1,
        img: Img1,
        title: "Dog Walking",
        description: "Daily walks and exercise for your active pup",
        rating: 5.0,
        aosDelay: "0",
    },
    {
        id: 2,
        img: Img2,
        title: "Pet Grooming",
        description: "Professional grooming and spa treatments",
        rating: 4.5,
        aosDelay: "200",
    },
    {
        id: 3,
        img: Img3,
        title: "Vet Services",
        description: "Regular check-ups and medical care",
        rating: 4.5,
        aosDelay: "400",
    },
    {
        id: 4,
        img: Img4,
        title: "DayCare & Boarding",
        description: "Safe, fun environment while you're away",
        rating: 4.5,
        aosDelay: "600",
    },
    {
        id: 5,
        img: Img5,
        title: "Pet Nutrition",
        description: "Customized meal plans for optimal health",
        rating: 4.5,
        aosDelay: "800",
    },
];

const Products = () => {
    const [hoveredCard, setHoveredCard] = useState(null);

    return (
        <div className="bg-gradient-to-b from-cyan-50 to-teal-50 py-16">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header section */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="flex items-center justify-center mb-4">
                        <FaPaw className="text-teal-500 mr-2" />
                        <p data-aos="fade-up" className="text-sm font-medium text-teal-600 uppercase tracking-wider">
                            Top Selling Services for you
                        </p>
                    </div>
                    <h1 
                        data-aos="fade-up" 
                        className="text-4xl md:text-5xl font-bold text-blue-900 mb-6 leading-tight"
                    >
                        "Top Pet Care Services for Your Furry Friends!"
                    </h1>
                    <p 
                        data-aos="fade-up" 
                        data-aos-delay="100"
                        className="text-gray-600 text-lg max-w-xl mx-auto"
                    >
                        Find trusted professionals for dog walking, pet sitting, grooming, and more. 
                        We connect you with the best providers who are dedicated to keeping your pet happy, 
                        healthy, and well-cared for. Your pet's well-being is our priority!
                    </p>
                </div>

                {/* Body section */}
                <div className="mb-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                        {ProductsData.map((data) => (
                            <div 
                                key={data.id}
                                data-aos="fade-up"
                                data-aos-delay={data.aosDelay}
                                className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2"
                                onMouseEnter={() => setHoveredCard(data.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                <div className="relative">
                                    <img
                                        src={data.img}
                                        alt={data.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md">
                                        <div className="flex items-center gap-1">
                                            <FaStar className="text-yellow-400" />
                                            <span className="font-medium">{data.rating}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-xl text-blue-800 mb-2">{data.title}</h3>
                                    <p className="text-gray-600 mb-4 text-sm">{data.description}</p>
                                    <div className="flex justify-end">
                                        {/* <button 
                                            className={`rounded-full p-2 ${hoveredCard === data.id ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'} transition-all duration-300`}
                                        >
                                            <FaArrowRight className="text-sm" />
                                        </button> */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div 
                        data-aos="fade-up"
                        className="flex justify-center mt-12"
                    >
                        <button className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-3 px-8 rounded-full flex items-center gap-3 group hover:shadow-lg transition-all duration-300 font-medium">
                            Explore More
                            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* Additional testimonial section */}
                <div 
                    data-aos="fade-up"
                    className="bg-white rounded-2xl p-8 shadow-md max-w-4xl mx-auto"
                >
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-300 to-teal-300 flex items-center justify-center">
                            <FaPaw className="text-white text-2xl" />
                        </div>
                        <div>
                            <p className="text-gray-600 italic mb-4">
                                "The pet services provided were outstanding! My dog has never been happier after 
                                his grooming sessions, and the dog walker is so reliable. Highly recommend!"
                            </p>
                            <p className="font-bold text-blue-800">Sarah Johnson</p>
                            <p className="text-gray-500 text-sm">Pet parent to Max, Golden Retriever</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;