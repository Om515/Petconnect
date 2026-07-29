import { CaretakerApplication } from "../../Models/caretakerApplicationModel.js";
import { CaretakerProfile } from "../../Models/caretakerProfileModel.js";

const CaretakerList = async (req, res) => {
  try {
    const rawCaretakers = await CaretakerApplication.find({ isApproved: true, isVerified: true })
      .populate("applicant", "name email mobile")
      .lean();

    const CaretakerContent = await Promise.all(
      rawCaretakers.map(async (caretaker) => {
        if (!caretaker.applicant?._id) return caretaker;
        const professionalProfile = await CaretakerProfile.findOne({
          caretaker: caretaker.applicant._id,
          status: "approved",
        }).lean();

        return {
          ...caretaker,
          professionalProfile: professionalProfile || null,
        };
      })
    );

    res.json({ success: true, message: "Data fetched successfully", CaretakerContent });
  } catch (error) {
    console.log("Error in CaretakerList ", error);
    res.json({ success: false, message: "Error" });
  }
};

const getCaretakerProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const caretaker = await CaretakerApplication.findById(req.params.id)
      .populate("applicant", "name email mobile")
      .lean();

    if (!caretaker || !caretaker.isApproved || !caretaker.isVerified) {
      return res.status(404).json({
        success: false,
        message: "Caretaker not found or not approved",
      });
    }

    let professionalProfile = null;
    if (caretaker.applicant?._id) {
      professionalProfile = await CaretakerProfile.findOne({
        caretaker: caretaker.applicant._id,
        status: "approved",
      }).lean();
    }

    res.json({
      success: true,
      caretaker: {
        ...caretaker,
        professionalProfile: professionalProfile || null,
      },
    });
  } catch (error) {
    console.error("Error in getCaretakerProfile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export { CaretakerList, getCaretakerProfile };
