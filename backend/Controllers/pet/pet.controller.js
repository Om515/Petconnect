import { petOrder } from "../../Models/petModel.js";
import getDataUrl from "../../utils/urlGenerator.js";
import cloudinary from "cloudinary";

const uploadToCloudinary = async (file, folder = "pets", resourceType = "auto") => {
  if (!file) return null;
  try {
    const fileUrl = getDataUrl(file);
    const cloud = await cloudinary.v2.uploader.upload(fileUrl.content, {
      folder,
      resource_type: resourceType,
      timeout: 120000, // 120-second timeout for large files/videos
    });
    return { id: cloud.public_id, url: cloud.secure_url };
  } catch (error) {
    console.error(`Error uploading to Cloudinary (${folder}):`, error);
    return null;
  }
};

const parseJSONOrObject = (val, defaultValue = {}) => {
  if (!val) return defaultValue;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultValue;
  }
};

const sellPet = async (req, res) => {
  try {
    // 1. Extract body data
    const body = req.body;

    const basicInfo = parseJSONOrObject(body.basicInfo, {
      name: body.name || "",
      category: body.category || "Animal",
      type: body.type || "",
      breed: body.breed || "",
      gender: body.gender || "Not specified",
      age: Number(body.age) || 0,
      dob: body.dob || "",
      color: body.color || "",
      weight: body.weight || "",
      listingType: body.listingType || (Number(body.price) > 0 ? "Sale" : "Adoption"),
      price: Number(body.price) || 0,
      adoptionFee: Number(body.adoptionFee) || 0,
      city: body.city || "",
      state: body.state || "",
    });

    const personality = parseJSONOrObject(body.personality, {
      temperament: Array.isArray(body.temperament) ? body.temperament : (body.temperament ? [body.temperament] : []),
      goodWith: Array.isArray(body.goodWith) ? body.goodWith : (body.goodWith ? [body.goodWith] : []),
      training: Array.isArray(body.training) ? body.training : (body.training ? [body.training] : []),
    });

    const health = parseJSONOrObject(body.health, {
      vaccinationStatus: body.vaccinated || body.vaccinationStatus || "Unknown",
      dewormed: body.dewormed || "Unknown",
      microchipped: body.microchipped || "Unknown",
      neutered: body.neutered || "Unknown",
      medicalConditions: Array.isArray(body.medicalConditions) ? body.medicalConditions : (body.medicalConditions ? [body.medicalConditions] : []),
      currentMedications: Array.isArray(body.currentMedications) ? body.currentMedications : (body.currentMedications ? [body.currentMedications] : []),
      allergies: Array.isArray(body.allergies) ? body.allergies : (body.allergies ? [body.allergies] : []),
    });

    const lifestyle = parseJSONOrObject(body.lifestyle, {
      livingStyle: body.livingStyle || "",
      exerciseRequirement: body.exerciseRequirement || "",
      diet: body.diet || "",
      groomingNeeds: body.groomingNeeds || "",
      energyLevel: body.energyLevel || "",
    });

    const history = parseJSONOrObject(body.history, {
      reasonForRehoming: body.reasonForRehoming || "",
      birthDate: body.birthDate || "",
      adoptionDate: body.adoptionDate || "",
      previousOwner: body.previousOwner || "",
      petStory: body.description || body.petStory || "",
    });

    // 2. Handle Parallel File Uploads (Media & Documents)
    const files = req.files || {};
    const singleFile = req.file;

    // Cover Photo Upload
    const coverFile = files.coverPhoto?.[0] || files.file?.[0] || singleFile;
    const coverPhotoPromise = coverFile
      ? uploadToCloudinary(coverFile, "pets/covers", "image")
      : Promise.resolve(null);

    // Gallery Photos (up to 10) - Parallel Uploads
    const galleryItems = (files.gallery && Array.isArray(files.gallery))
      ? files.gallery.slice(0, 10)
      : [];
    const galleryPromises = galleryItems.map((item) =>
      uploadToCloudinary(item, "pets/gallery", "image")
    );

    // Videos (up to 2) - Parallel Uploads
    const videoItems = (files.videos && Array.isArray(files.videos))
      ? files.videos.slice(0, 2)
      : [];
    const videoPromises = videoItems.map((item) =>
      uploadToCloudinary(item, "pets/videos", "video")
    );

    // Documents - Parallel Uploads
    const docFields = [
      "vaccinationCertificate",
      "medicalRecord",
      "registrationCertificate",
      "pedigreeCertificate",
      "ownershipProof",
    ];

    const docPromises = docFields.map((field) => {
      const docFile = files[field]?.[0];
      return docFile
        ? uploadToCloudinary(docFile, `pets/documents/${field}`, "auto").then((res) => ({ field, res }))
        : Promise.resolve({ field, res: null });
    });

    // Wait for all uploads concurrently in parallel
    const [coverPhoto, galleryResults, videoResults, docResults] = await Promise.all([
      coverPhotoPromise,
      Promise.all(galleryPromises),
      Promise.all(videoPromises),
      Promise.all(docPromises),
    ]);

    const gallery = galleryResults.filter(Boolean);
    const videos = videoResults.filter(Boolean);

    const documents = {};
    docResults.forEach(({ field, res }) => {
      if (res) documents[field] = res;
    });

    // 3. Assemble Pet Document Data
    const petData = {
      category: basicInfo.category || "Animal",
      type: basicInfo.type || "Other",
      breed: basicInfo.breed || "Mixed",
      age: basicInfo.age || 0,
      description: history.petStory || body.description || "",
      price: basicInfo.price || 0,
      gender: basicInfo.gender || "Not specified",
      weight: basicInfo.weight || "Not specified",
      vaccinated: health.vaccinationStatus || "Unknown",
      neutered: health.neutered || "Unknown",
      owner: req.user._id,
      image: coverPhoto || { id: "", url: "" },
      basicInfo,
      personality,
      health,
      lifestyle,
      history,
      media: {
        coverPhoto: coverPhoto || { id: "", url: "" },
        gallery,
        videos,
      },
      documents,
    };

    const newPet = await petOrder.create(petData);

    res.status(201).json({
      success: true,
      message: "Product Added successfully awaiting admin approval.",
      product: newPet,
    });
  } catch (error) {
    console.error("Error in sellPet:", error);
    res.status(500).json({ success: false, message: error.message || "Error adding pet" });
  }
};

const buyPetList = async (req, res) => {
  try {
    const petContent = await petOrder.find({ isVerified: true, isApproved: true, soldBool: false }).populate("owner", "name email mobile address");
    res.json({ success: true, message: "Data fetched successfully", petContent });
  } catch (error) {
    console.log("Error in buyPetList ", error);
    res.json({ success: false, message: "Error" });
  }
};

const petInfo = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.json({ success: false, message: "Id is required" });
    }

    const petDetails = await petOrder.findById(id).populate("owner", "name email mobile address role");

    if (!petDetails) {
      return res.json({ success: false, message: "Pet Not Found" });
    }

    res.json({ success: true, message: "Data fetched successfully", petDetails });
  } catch (error) {
    console.error("Error in petInfo:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const bookPet = async (req, res) => {
  try {
    const petId = req.body.petId;
    const userId = req.user._id;

    if (!userId || !petId) {
      return res.json({ success: false, message: "userId or petId not found" });
    }

    const pet = await petOrder.findById(petId);

    if (!pet) {
      return res.json({ success: false, message: "Pet not found" });
    }

    if (userId.toString() === pet.owner.toString()) {
      return res.json({ success: false, message: "Owner and buyer are same" });
    }

    pet.soldBool = true;
    pet.buyer = userId;

    await pet.save();

    res.json({ success: true, message: "Pet successfully Booked" });
  } catch (error) {
    console.log("Error in bookPet: ", error);
    res.json({ success: false, message: "Internal server error" });
  }
};

export { sellPet, buyPetList, petInfo, bookPet };

