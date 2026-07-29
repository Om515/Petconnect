import { CaretakerProfile } from "../../Models/caretakerProfileModel.js";

// GET /api/admin/caretaker-profiles/pending
const getPendingProfiles = async (req, res) => {
  try {
    const pendingDocs = await CaretakerProfile.find({ status: "pending" })
      .populate("caretaker", "name email mobile address")
      .sort({ updatedAt: -1 })
      .lean();

    // For each pending profile, attach existing approved version if present
    const profilesWithComparison = await Promise.all(
      pendingDocs.map(async (pending) => {
        const approved = await CaretakerProfile.findOne({
          caretaker: pending.caretaker._id,
          status: "approved",
        }).lean();

        return {
          pending,
          approved: approved || null,
          caretaker: pending.caretaker,
        };
      })
    );

    res.json({
      success: true,
      pendingProfiles: profilesWithComparison,
    });
  } catch (error) {
    console.error("Error in getPendingProfiles:", error);
    res.status(500).json({ success: false, message: "Error fetching pending profile applications" });
  }
};

// POST /api/admin/caretaker-profiles/approve
const approveProfile = async (req, res) => {
  try {
    const { profileId } = req.body;

    const pendingProfile = await CaretakerProfile.findById(profileId);

    if (!pendingProfile || pendingProfile.status !== "pending") {
      return res.status(404).json({ success: false, message: "Pending profile not found or already processed" });
    }

    // Archive previous approved profile for this caretaker
    await CaretakerProfile.updateMany(
      { caretaker: pendingProfile.caretaker, status: "approved" },
      { $set: { status: "archived" } }
    );

    // Promote target pending profile to approved
    pendingProfile.status = "approved";
    pendingProfile.reviewedBy = req.user?._id;
    pendingProfile.reviewedAt = new Date();
    pendingProfile.rejectionReason = "";

    await pendingProfile.save();

    res.json({
      success: true,
      message: "Caretaker professional profile approved successfully!",
    });
  } catch (error) {
    console.error("Error in approveProfile:", error);
    res.status(500).json({ success: false, message: "Error approving professional profile" });
  }
};

// POST /api/admin/caretaker-profiles/reject
const rejectProfile = async (req, res) => {
  try {
    const { profileId, rejectionReason } = req.body;

    const pendingProfile = await CaretakerProfile.findById(profileId);

    if (!pendingProfile || pendingProfile.status !== "pending") {
      return res.status(404).json({ success: false, message: "Pending profile not found or already processed" });
    }

    pendingProfile.status = "rejected";
    pendingProfile.rejectionReason = rejectionReason || "Profile edits do not satisfy quality guidelines.";
    pendingProfile.reviewedBy = req.user?._id;
    pendingProfile.reviewedAt = new Date();

    await pendingProfile.save();

    res.json({
      success: true,
      message: "Caretaker professional profile update rejected.",
    });
  } catch (error) {
    console.error("Error in rejectProfile:", error);
    res.status(500).json({ success: false, message: "Error rejecting professional profile" });
  }
};

export { getPendingProfiles, approveProfile, rejectProfile };
