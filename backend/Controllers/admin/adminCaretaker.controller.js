import { CaretakerApplication } from "../../Models/caretakerApplicationModel.js";
import userModel from "../../Models/userModel.js";
import { sendEmail } from "../../utils/emailHelper.js";

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

    const application = await CaretakerApplication.findById(id).populate("applicant");

    if (!application) {
      return res.json({ success: false, message: "Caretaker application not identified" });
    }

    application.isVerified = true;
    application.isApproved = true;
    application.status = "approved";

    await application.save();

    // The Magic: Upgrade the corresponding user's role to 'caretaker'
    if (application.applicant) {
      const user = await userModel.findById(application.applicant._id);
      if (user && user.role === 'user') {
        user.role = 'caretaker';
        await user.save({ validateModifiedOnly: true });

        // Send Approval Email
        const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #059669;">Congratulations, ${user.name}! 🎉</h1>
          <p style="font-size: 16px;">Your application to become a Caretaker has been officially <strong>APPROVED</strong> by the Admin team!</p>
          <p style="font-size: 16px;">To activate your new dashboard, please firmly <strong>Log Out and Log back in</strong>.</p>
          <p style="font-size: 16px;">We are excited to have you providing excellent care!</p>
          <br/>
          <p style="color: #666;">— The PetConnect Team</p>
        </div>`;
        
        sendEmail({ to: user.email, subject: "Caretaker Application Approved! 🎉", html: emailHtml }).catch(e => console.error("Email error:", e));
      }
    }

    res.json({ success: true, message: "Caretaker Application Approved and Role Upgraded!" });
  } catch (error) {
    console.log("Error in approveCaretaker: ", error);
    res.json({ success: false, message: "Error approving application" });
  }
};

const rejectCaretaker = async (req, res) => {
  try {
    const id = req.body.id;

    const application = await CaretakerApplication.findById(id).populate("applicant");

    if (!application) {
      return res.json({ success: false, message: "Caretaker application not identified" });
    }

    application.isVerified = true;
    application.isApproved = false;
    application.status = "rejected";

    await application.save();

    if (application.applicant) {
      const user = await userModel.findById(application.applicant._id);
      if (user) {
        // Send Rejection Email
        const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #dc2626;">Update on your Caretaker Application</h1>
          <p style="font-size: 16px;">Hi ${user.name},</p>
          <p style="font-size: 16px;">Unfortunately, after reviewing your application, we are unable to approve your request to become a Caretaker at this time.</p>
          <p style="font-size: 16px;">You are still welcome to use PetConnect as a standard user, and you may update your experience and re-apply in the future!</p>
          <br/>
          <p style="color: #666;">— The PetConnect Team</p>
        </div>`;
        
        sendEmail({ to: user.email, subject: "Update on your Caretaker Application", html: emailHtml }).catch(e => console.error("Email error:", e));
      }
    }

    res.json({ success: true, message: "Caretaker Application Rejected" });
  } catch (error) {
    console.log("Error in rejectCaretaker: ", error);
    res.json({ success: false, message: "Error rejecting application" });
  }
};

export { caretakerApplicationList, approveCaretaker, rejectCaretaker };
