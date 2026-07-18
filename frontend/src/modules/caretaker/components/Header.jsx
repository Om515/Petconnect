import assets from "../assets/assets";

const Header = () => {
  return (
    <header className="relative w-full h-[500px] flex items-center justify-center">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-300"></div>
      
      {/* Optional: You can keep a pet image overlay with reduced opacity */}
      <img 
        src={assets.header_img}
        alt="Cute pets" 
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      
      {/* Dynamic wave shape */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
          className="w-full h-16"
        >
          <path 
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" 
            className="fill-white"
          ></path>
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative text-center text-white p-6 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold drop-shadow-lg mb-6">
          Welcome to PetConnect
        </h1>
        <p className="text-xl md:text-2xl mb-8 drop-shadow-md max-w-2xl mx-auto">
          Find your perfect pet or connect with pet lovers around you.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/buy"
            className="px-8 py-3 bg-white text-teal-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Explore Now
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;