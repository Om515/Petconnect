import { CaretakerProfile } from "../../Models/caretakerProfileModel.js";
import { CaretakerApplication } from "../../Models/caretakerApplicationModel.js";

// GET /api/caretaker/profile/me (Professional Profile)
const getMyProfessionalProfile = async (req, res) => {
  try {
    const caretakerId = req.user._id;

    // Fetch live approved profile
    const approvedProfile = await CaretakerProfile.findOne({
      caretaker: caretakerId,
      status: "approved",
    }).lean();

    // Fetch pending profile under review
    const pendingProfile = await CaretakerProfile.findOne({
      caretaker: caretakerId,
      status: "pending",
    }).lean();

    // Fetch saved draft profile
    const draftProfile = await CaretakerProfile.findOne({
      caretaker: caretakerId,
      status: "draft",
    }).lean();

    // Fetch latest rejected profile if any for feedback display
    const rejectedProfile = await CaretakerProfile.findOne({
      caretaker: caretakerId,
      status: "rejected",
    })
      .sort({ updatedAt: -1 })
      .lean();

    // Fetch initial onboarding application as fallback baseline
    const baseApplication = await CaretakerApplication.findOne({
      applicant: caretakerId,
    }).lean();

    res.json({
      success: true,
      approvedProfile: approvedProfile || null,
      pendingProfile: pendingProfile || null,
      draftProfile: draftProfile || null,
      rejectedProfile: rejectedProfile || null,
      isLocked: !!pendingProfile, // Locked if under admin review
      baseApplication: baseApplication || null,
    });
  } catch (error) {
    console.error("Error fetching professional profile:", error);
    res.status(500).json({ success: false, message: "Error fetching professional profile" });
  }
};

// POST /api/caretaker/profile/update (Save Draft / Submit Professional Profile)
const updateProfessionalProfile = async (req, res) => {
  try {
    const caretakerId = req.user._id;
    // Strip out MongoDB & Mongoose internal ID metadata from request body to prevent _id duplication errors
    const { action, _id, __v, createdAt, updatedAt, caretaker, ...cleanProfileData } = req.body;

    // Check if there is an existing pending profile under review
    const existingPending = await CaretakerProfile.findOne({
      caretaker: caretakerId,
      status: "pending",
    });

    if (existingPending) {
      return res.status(403).json({
        success: false,
        message: "Your profile is currently under admin review. Editing is disabled until approved or rejected.",
      });
    }

    const targetStatus = action === "submit" ? "pending" : "draft";

    // Fetch current approved profile to determine version
    const currentApproved = await CaretakerProfile.findOne({
      caretaker: caretakerId,
      status: "approved",
    });

    const nextVersion = (currentApproved?.version || 0) + 1;

    // Check if a draft or rejected profile document exists to reuse
    let activeDoc = await CaretakerProfile.findOne({
      caretaker: caretakerId,
      status: { $in: ["draft", "rejected"] },
    });

    if (activeDoc) {
      // Update existing draft / rejected document
      Object.assign(activeDoc, cleanProfileData, {
        caretaker: caretakerId,
        status: targetStatus,
        version: nextVersion,
        rejectionReason: "", // Clear previous rejection reason upon submit/draft
      });
      await activeDoc.save();
    } else {
      // Create a brand new document with a fresh unique MongoDB _id
      activeDoc = new CaretakerProfile({
        ...cleanProfileData,
        caretaker: caretakerId,
        version: nextVersion,
        status: targetStatus,
        rejectionReason: "",
      });
      await activeDoc.save();
    }

    const responseMsg =
      targetStatus === "pending"
        ? "Professional profile submitted for admin approval!"
        : "Professional profile draft saved successfully!";

    res.status(200).json({
      success: true,
      message: responseMsg,
      profile: activeDoc,
      status: targetStatus,
    });
  } catch (error) {
    console.error("Error updating professional profile:", error);
    res.status(500).json({ success: false, message: "Error saving professional profile" });
  }
};

export { getMyProfessionalProfile, updateProfessionalProfile };
