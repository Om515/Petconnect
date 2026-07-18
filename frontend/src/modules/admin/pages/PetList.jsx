import { useEffect, useState } from "react";
import axios from "axios";
import { CheckIcon, XIcon, IndianRupee, PawPrintIcon } from "lucide-react";
import { AdminData } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const PetList = () => {
  const [pets, setPets] = useState([]);
  const { petApprove, petReject } = AdminData();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/admin/get-pet-list")
      .then((res) => {
        if (res.data.success) {
          setPets(res.data.petContent);
        }
      })
      .catch((err) => console.error("Error fetching pets:", err));
  }, []);

  const handleApprove = (id) => {
    petApprove(id, navigate);
    window.location.reload();
  };

  const handleReject = (id) => {
    petReject(id, navigate);
    window.location.reload();
  };

  return (
    <>
      <Sidebar />
      <div className="p-6 bg-gradient-to-b from-blue-50 to-cyan-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-teal-700 border-b-2 border-teal-500 pb-3">
            Pet Approval Dashboard
          </h1>
          
          {pets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-teal-500 text-5xl mb-4">🐾</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Pets To Approve</h2>
              <p className="text-gray-500">There are currently no pets waiting for approval.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <div 
                  key={pet._id} 
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="relative">
                    <img
                      src={pet.image.url}
                      alt={pet.type}
                      className="w-full h-52 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {pet.type}
                    </div>
                  </div>
                  <div className="p-5">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{pet.breed}</h2>
                    <div className="space-y-2 mb-4">
                      <p className="text-gray-700 flex items-center">
                        <IndianRupee className="h-5 w-5 mr-2 text-teal-500" />
                        Price: ₹{pet.price}
                      </p>
                      <p className="text-gray-600 line-clamp-2">{pet.description}</p>
                    </div>
                    <div className="flex space-x-3 mt-4">
                      <button
                        onClick={() => handleApprove(pet._id)}
                        className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300 flex items-center justify-center"
                      >
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(pet._id)}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 flex items-center justify-center"
                      >
                        <XIcon className="h-5 w-5 mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PetList;