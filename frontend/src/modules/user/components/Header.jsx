import React from 'react';
import { useNavigate } from 'react-router-dom';
import Image1 from "../assets/images/Image1.png";
import Image2 from "../assets/images/Image2.png";
import Image3 from "../assets/images/Image3.png";
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ImageList = [
    {
        id: 1,
        img: Image1,
        title: "Wanna Get New Buddy!",
        task: "Buy Now",
        description: "Explore a wide range of pets from trusted sellers. Safe, easy, and hassle-free buying—bring home your new best friend today!",
        path: "/buy-pet"
    },
    {
        id: 2,
        img: Image2,
        title: "Rehome Your Pet with Care!",
        task: "Sell Now",
        description: "Easily connect with loving buyers and find the perfect home for your pet.",
        path: "/sell-pet"
    },
    {
        id: 3,
        img: Image3,
        title: "Give Your Pet the Best Care!",
        task: "Find Care Givers",
        description: "Connect with trusted professionals for your pet's needs!",
        path: "/profile"
    },
];

const Header = () => {
    const navigate = useNavigate();
    
    const settings = {
        dots: false,
        arrows: false,
        infinite: true,
        speed: 800,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        cssEase: "ease-in-out",
        pauseOnHover: false,
        pauseOnFocus: true,
    };

    const handleButtonClick = (path) => {
        navigate(path);
    };

    return (
        <div className="relative overflow-hidden min-h-[550px] sm:min-h-[650px] bg-cyan-50 flex justify-center items-center duration-200">
            {/* Background shape - simplified to match screenshot */}
            <div className='absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-cyan-300 to-transparent -z-10'></div>
            
            {/* Slider section */}
            <div className='container px-4 sm:px-10 w-full'>
            <div className="h-[700px] w-[700px] bg-cyan-400/50 
         absolute -top-1/2 right-0 rounded-3xl rotate-45 -z-scale-8
         "></div>
                <Slider {...settings}>
                    {ImageList.map((data) => (
                        <div key={data.id}>
                            <div className='grid grid-cols-1 sm:grid-cols-2 items-center'>
                                {/* Text content section - updated to match screenshot */}
                                <div className='flex flex-col justify-center gap-5 pt-12 sm:pt-0 text-left order-2 sm:order-1 relative z-10 max-w-xl'>
                                    <h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold text-teal-800'>
                                        {data.title}
                                    </h1>
                                    <p className='text-base sm:text-lg text-teal-700 max-w-md'>
                                        {data.description}
                                    </p>
                                    <div>
                                        <button
                                            onClick={() => handleButtonClick(data.path)}
                                            className='inline-block bg-cyan-500 hover:bg-cyan-600 duration-200 text-white font-medium py-3 px-8 rounded-full text-lg'
                                        >
                                            {data.task}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Image section - adjusted to match screenshot */}
                                <div className='order-1 sm:order-2'>
                                    <div className='relative z-10'>
                                        <img 
                                            src={data.img} 
                                            alt="PetConnect" 
                                            className="w-[350px] h-[350px] sm:h-[450px] sm:w-[450px] object-contain mx-auto"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default Header;