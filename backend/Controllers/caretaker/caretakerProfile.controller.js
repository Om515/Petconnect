import userModel from "../../Models/userModel.js";
import { CaretakerApplication } from "../../Models/caretakerApplicationModel.js";
import { BookingRequest } from "../../Models/bookingRequestModel.js";

const myProfile = async (req, res) => {
  try {
    const id = req.user._id;

    // Get base user info
    const user = await userModel.findById(id)
      .select("name email role")
      .lean();

    if (!user || user.role !== "caretaker") {
      return res.status(401).json({ success: false, message: "Unauthorized profile access" });
    }

    // Get application info if exists
    const application = await CaretakerApplication.findOne({ applicant: id })
      .select("fullName mobile experience skills availability hourlyRate description")
      .lean();

    // Get booking requests
    const bookingRequests = await BookingRequest.find({ caretaker: id })
      .populate("user", "name email") // Populate user info
      .select("service date hours totalCost status createdAt")
      .lean();

    // Combine data
    const profileData = {
      name: application?.fullName || user?.name || "",
      email: user?.email || "",
      mobile: application?.mobile || "",
      experience: application?.experience || 0,
      skills: application?.skills || [],
      availability: application?.availability || "Not specified",
      hourlyRate: application?.hourlyRate || 0,
      description: application?.description || "",
      hasApplication: !!application,
      bookingRequests: bookingRequests || [],
    };

    res.json({ success: true, user: profileData });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};

export { myProfile };
