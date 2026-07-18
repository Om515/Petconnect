import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { UploadCloud, X, Check, PawPrint, Clock, Tag, FileText, DollarSign } from "lucide-react";

const SellPets = () => {
  const [formData, setFormData] = useState({
    category: "Animal",
    type: "",
    breed: "",
    age: "",
    description: "",
    price: "",
    file: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, file }));
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      toast.error("Please upload an image.");
      return;
    }

    setLoading(true);
    const petData = new FormData();
    petData.append("category", formData.category);
    petData.append("type", formData.type);
    petData.append("breed", formData.breed);
    petData.append("age", formData.age);
    petData.append("description", formData.description);
    petData.append("price", formData.price);
    petData.append("file", formData.file); // Send file directly to backend

    try {
      const response = await axios.post("/api/user/sell-pet", petData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.product) {
        toast.success("Pet added successfully! Awaiting admin approval.");
        setFormData({ category: "Animal", type: "", breed: "", age: "", description: "", price: "", file: null });
        setPreview(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding pet. Try again later.");
    }
    setLoading(false);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    maxFiles: 1,
  });

  return (
    <div className="max-w-3xl mx-auto my-6 md:mt-10 p-4 md:p-8 bg-white shadow-xl rounded-xl border border-cyan-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-cyan-800">Rehome Your Pet with Care</h2>
        <p className="text-cyan-600 mt-2">Provide details about your pet to find the perfect new home</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Dropdown */}
          <div className="col-span-1">
            <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 mb-1">
              <PawPrint size={16} className="text-cyan-500" />
              Category
            </label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              required 
              className="w-full p-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-cyan-50 transition-all"
            >
              <option value="Animal">Animals</option>
              <option value="Bird">Birds</option>
              <option value="Reptile">Reptiles</option>
              <option value="Other">Others</option>
            </select>
          </div>

          {/* Type (Dog, Cat, etc.) */}
          <div className="col-span-1">
            <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 mb-1">
              <Tag size={16} className="text-cyan-500" />
              Type
            </label>
            <input 
              type="text" 
              name="type" 
              placeholder="e.g., Dog, Cat, Parrot" 
              value={formData.type} 
              onChange={handleChange} 
              required 
              className="w-full p-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-cyan-50 transition-all" 
            />
          </div>

          {/* Breed */}
          <div className="col-span-1">
            <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 mb-1">
              <Tag size={16} className="text-cyan-500" />
              Breed
            </label>
            <input 
              type="text" 
              name="breed" 
              placeholder="e.g., Golden Retriever, Siamese" 
              value={formData.breed} 
              onChange={handleChange} 
              required 
              className="w-full p-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-cyan-50 transition-all" 
            />
          </div>

          {/* Age */}
          <div className="col-span-1">
            <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 mb-1">
              <Clock size={16} className="text-cyan-500" />
              Age (years)
            </label>
            <input 
              type="number" 
              name="age" 
              placeholder="e.g., 2" 
              value={formData.age} 
              onChange={handleChange} 
              required 
              min="0" 
              step="0.1"
              className="w-full p-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-cyan-50 transition-all" 
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 mb-1">
            <FileText size={16} className="text-cyan-500" />
            Description
          </label>
          <textarea 
            name="description" 
            placeholder="Tell potential owners about your pet's personality, habits, training, etc." 
            value={formData.description} 
            onChange={handleChange} 
            required 
            rows="4"
            className="w-full p-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-cyan-50 transition-all"
          ></textarea>
        </div>

        {/* Price */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 mb-1">
            <DollarSign size={16} className="text-cyan-500" />
            Price (₹)
          </label>
          <input 
            type="number" 
            name="price" 
            placeholder="e.g., 25000" 
            value={formData.price} 
            onChange={handleChange} 
            required 
            min="0" 
            className="w-full p-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-cyan-50 transition-all" 
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 mb-1">
            <UploadCloud size={16} className="text-cyan-500" />
            Pet Photo
          </label>
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed p-6 rounded-lg text-center cursor-pointer transition-all hover:bg-cyan-50 ${preview ? 'border-cyan-400 bg-cyan-50' : 'border-cyan-200'}`}
          >
            <input {...getInputProps()} />
            {preview ? (
              <div className="relative">
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(null);
                      setFormData((prev) => ({ ...prev, file: null }));
                    }}
                    className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-md"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex flex-col items-center">
                  <img src={preview} alt="Preview" className="max-w-full h-60 mx-auto object-cover rounded-lg shadow-md" />
                  <div className="flex items-center mt-3 text-cyan-600 font-medium">
                    <Check size={16} className="mr-1" /> Image uploaded successfully
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <UploadCloud size={48} className="text-cyan-400 mb-2" />
                <p className="text-cyan-700 font-medium mb-1">Drag & drop an image of your pet</p>
                <p className="text-cyan-600 text-sm">or click to browse files</p>
                <p className="text-cyan-400 text-xs mt-2">JPEG, PNG or GIF • Max 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-cyan-500 text-white p-3.5 rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-cyan-300 font-medium text-lg shadow-md mt-4 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : "Find a Loving Home"}
        </button>
      </form>
    </div>
  );
};

export default SellPets;