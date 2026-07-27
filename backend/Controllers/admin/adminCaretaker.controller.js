import { CaretakerApplication } from "../../Models/caretakerApplicationModel.js";

const caretakerApplicationList = async (req, res) => {
  try {
    const applications = await CaretakerApplication.find({ isVerified: false }).populate("applicant", "name email mobile");
    res.json({ success: true, message: "Data fetched successfully", applications });
  } catch (error) {
    console.log("Error in caretakerApplicationList: ", error);
    res.json({ success: false, message: "Error fetching caretaker applications" });
  }
};

const approveCaretaker = async (req, res) => {
  try {
    const id = req.body.id;

    const application = await CaretakerApplication.findById(id);

    if (!application) {
      return res.json({ success: false, message: "Caretaker application not identified" });
    }

    application.isVerified = true;
    application.isApproved = true;
    application.status = "approved";

    await application.save();

    res.json({ success: true, message: "Caretaker Application Approved" });
  } catch (error) {
    console.log("Error in approveCaretaker: ", error);
    res.json({ success: false, message: "Error approving application" });
  }
};

const rejectCaretaker = async (req, res) => {
  try {
    const id = req.body.id;

    const application = await CaretakerApplication.findById(id);

    if (!application) {
      return res.json({ success: false, message: "Caretaker application not identified" });
    }

    application.isVerified = true;
    application.isApproved = false;
    application.status = "rejected";

    await application.save();

    res.json({ success: true, message: "Caretaker Application Rejected" });
  } catch (error) {
    console.log("Error in rejectCaretaker: ", error);
    res.json({ success: false, message: "Error rejecting application" });
  }
};

export { caretakerApplicationList, approveCaretaker, rejectCaretaker };
