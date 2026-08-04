import multer from "multer";

const storage = multer.memoryStorage();

const uploadFile = multer({ storage: storage }).single("file");

export const uploadPetFields = multer({ storage: storage }).fields([
  { name: "file", maxCount: 1 },
  { name: "coverPhoto", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
  { name: "videos", maxCount: 2 },
  { name: "vaccinationCertificate", maxCount: 1 },
  { name: "medicalRecord", maxCount: 1 },
  { name: "registrationCertificate", maxCount: 1 },
  { name: "pedigreeCertificate", maxCount: 1 },
  { name: "ownershipProof", maxCount: 1 },
]);

export default uploadFile;

