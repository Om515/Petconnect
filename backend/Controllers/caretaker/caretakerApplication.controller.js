import { CaretakerApplication } from "../../Models/caretakerApplicationModel.js";

const applyAsCaretaker = async (req, res) => {
  try {
    const { fullName, mobile, experience, skills, availability, hourlyRate, description } = req.body;
    const applicant = req.user._id; // From isAuth middleware

    const application = new CaretakerApplication({
      fullName,
      mobile,
      experience,
      skills,
      availability,
      hourlyRate,
      description,
      applicant,
    });

    await application.save();
    res.status(201).json({ success: true, message: "Application submitted successfully", application });
  } catch (error) {
    console.log("Error in applyAsCaretaker:", error);
    res.status(500).json({ success: false, message: "Error submitting application" });
  }
};

const getMyApplication = async (req, res) => {
  try {
    const applicantId = req.user.id; // From isAuth middleware
    const applications = await CaretakerApplication.find({ applicant: applicantId });
    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.log("Error in getMyApplications:", error);
    res.status(500).json({ success: false, message: "Error fetching applications" });
  }
};

export { applyAsCaretaker, getMyApplication };
