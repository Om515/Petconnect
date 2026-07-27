import userModel from "../../Models/userModel.js";
import caretakerModel from "../../Models/caretakerModel.js";
import { CaretakerApplication } from "../../Models/caretakerApplicationModel.js";
import { BookingRequest } from "../../Models/bookingRequestModel.js";

const createBookingRequest = async (req, res) => {
  try {
    const { caretakerId, service, date, hours } = req.body;
    const userId = req.user._id;

    console.log("Creating booking request:", { caretakerId, service, date, hours, userId });

    // Validate input
    if (!caretakerId || !service || !date || !hours) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    let finalCaretakerUserId;
    let hourlyRate;

    // 1. Try finding CaretakerApplication by ID
    let application = await CaretakerApplication.findById(caretakerId).populate("applicant");

    // 2. If not found by application _id, try finding application by applicant user _id
    if (!application) {
      application = await CaretakerApplication.findOne({ applicant: caretakerId }).populate("applicant");
    }

    if (!application) {
      console.log("Caretaker application not found for ID:", caretakerId);
      return res.status(404).json({ success: false, message: "Caretaker not found" });
    }

    // 3. Ensure caretaker application is approved
    if (!application.isApproved || !application.isVerified) {
      console.log("Caretaker application not approved/verified:", application._id);
      return res.status(400).json({ success: false, message: "This caretaker is not approved for bookings" });
    }

    if (!application.applicant || !application.applicant._id) {
      console.log("No applicant user found in CaretakerApplication:", application);
      return res.status(404).json({ success: false, message: "Caretaker user not found" });
    }

    finalCaretakerUserId = application.applicant._id;
    hourlyRate = application.hourlyRate;

    // 4. Verify caretaker user exists in userModel
    const caretakerUser = await userModel.findById(finalCaretakerUserId);
    if (!caretakerUser) {
      console.log("Caretaker user record not found for ID:", finalCaretakerUserId);
      return res.status(404).json({ success: false, message: "Caretaker user record not found" });
    }

    // Validate date
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(bookingDate) || bookingDate < today) {
      return res.status(400).json({ success: false, message: "Invalid or past date" });
    }

    // Validate hours
    if (!Number.isInteger(Number(hours)) || hours < 1) {
      return res.status(400).json({ success: false, message: "Hours must be a positive integer" });
    }

    // Calculate total cost
    const totalCost = hours * (hourlyRate || 0);

    // Create booking request
    const bookingRequest = new BookingRequest({
      user: userId,
      caretaker: finalCaretakerUserId,
      service,
      date: bookingDate,
      hours: Number(hours),
      totalCost,
      status: "pending",
    });

    await bookingRequest.save();

    res.json({ success: true, message: "Booking request sent successfully" });
  } catch (error) {
    console.error("Error creating booking request:", error);
    res.status(500).json({ success: false, message: `Error creating booking request: ${error.message}` });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const id = req.user._id;

    const user = await userModel.findById(id).select("name email").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const bookingRequests = await BookingRequest.find({ user: id })
      .populate("caretaker", "name email")
      .select("service date hours totalCost status createdAt")
      .lean();

    const bookingData = bookingRequests.map(booking => ({
      _id: booking._id,
      service: booking.service,
      date: booking.date,
      hours: booking.hours,
      totalCost: booking.totalCost,
      status: booking.status,
      createdAt: booking.createdAt,
      caretaker: booking.caretaker || { name: "Unknown", email: "N/A" },
    }));

    res.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        bookingRequests: bookingData,
      },
    });
  } catch (error) {
    console.error("Error in getUserBookings:", error);
    res.status(500).json({ success: false, message: "Error fetching bookings" });
  }
};

export { createBookingRequest, getUserBookings };
