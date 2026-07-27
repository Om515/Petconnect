import { BookingRequest } from "../../Models/bookingRequestModel.js";

const updateBookingRequestStatus = async (req, res) => {
  const { requestId, status } = req.body;

  try {
    const bookingRequest = await BookingRequest.findById(requestId);
    if (!bookingRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Booking request not found" });
    }

    // Ensure only the caretaker can update their requests
    if (bookingRequest.caretaker.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action" });
    }

    bookingRequest.status = status;
    await bookingRequest.save();

    res.json({
      success: true,
      message: `Booking request ${status} successfully`,
    });
  } catch (error) {
    console.error("Error updating booking request:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating booking request" });
  }
};

export { updateBookingRequestStatus };
