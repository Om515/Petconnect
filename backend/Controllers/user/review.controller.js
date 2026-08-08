import Review from "../../Models/reviewModel.js";
import PetRequest from "../../Models/petRequestModel.js";

/**
 * API 1: SUBMIT REVIEW
 * Route: POST /api/user/review
 * Body: { petRequestId, rating, comment }
 */
export const submitReview = async (req, res) => {
  try {
    const { petRequestId, rating, comment } = req.body;
    const userId = req.user._id;

    // Step 1: Validate input presence
    if (!petRequestId) {
      return res.status(400).json({ success: false, message: "petRequestId is required" });
    }

    if (rating === undefined || rating === null) {
      return res.status(400).json({ success: false, message: "rating is required" });
    }

    // Step 2: Find the PetRequest
    const request = await PetRequest.findById(petRequestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Pet request not found" });
    }

    // Step 3: Verify requestStatus === "Completed"
    if (request.requestStatus !== "Completed") {
      return res.status(400).json({
        success: false,
        message: `Only Completed transactions can be reviewed. Current status: '${request.requestStatus}'`,
      });
    }

    // Step 4: Verify authenticated user is either requester/buyer or owner
    const requesterIdStr = request.requesterId.toString();
    const ownerIdStr = request.ownerId.toString();
    const userIdStr = userId.toString();

    if (userIdStr !== requesterIdStr && userIdStr !== ownerIdStr) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You are not a participant in this completed transaction",
      });
    }

    // Step 5: Determine review direction (server-controlled)
    let reviewType;
    let reviewerId;
    let revieweeId;

    if (userIdStr === requesterIdStr) {
      reviewType = "BuyerToOwner";
      reviewerId = request.requesterId;
      revieweeId = request.ownerId;
    } else {
      reviewType = "OwnerToBuyer";
      reviewerId = request.ownerId;
      revieweeId = request.requesterId;
    }

    // Step 6: Validate rating range (must be integer 1 to 5)
    const numericRating = Number(rating);
    if (
      isNaN(numericRating) ||
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    // Step 7: Validate comment length
    const trimmedComment = typeof comment === "string" ? comment.trim() : "";
    if (trimmedComment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 1000 characters",
      });
    }

    // Step 8: Check for duplicate review by this participant for this transaction
    const existingReview = await Review.findOne({
      petRequestId,
      reviewerId,
      reviewType,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this completed transaction",
      });
    }

    // Step 9: Create and save the Review
    const newReview = await Review.create({
      petRequestId,
      petId: request.petId,
      reviewerId,
      revieweeId,
      rating: numericRating,
      comment: trimmedComment,
      reviewType,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Error in submitReview:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this transaction",
      });
    }
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

/**
 * API 2: GET OWNER REVIEWS
 * Route: GET /api/user/reviews/owner/:ownerId
 */
export const getOwnerReviews = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId) {
      return res.status(400).json({ success: false, message: "ownerId is required" });
    }

    const reviews = await Review.find({ revieweeId: ownerId, reviewType: "BuyerToOwner" })
      .populate("reviewerId", "name email")
      .populate("petId", "breed category type image basicInfo")
      .sort({ createdAt: -1 });

    const totalCount = reviews.length;
    const averageRating =
      totalCount > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1))
        : 0;

    return res.status(200).json({
      success: true,
      message: "Owner reviews fetched successfully",
      totalCount,
      averageRating,
      reviews,
    });
  } catch (error) {
    console.error("Error in getOwnerReviews:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

/**
 * API 3: GET BUYER REVIEWS
 * Route: GET /api/user/reviews/buyer/:buyerId
 */
export const getBuyerReviews = async (req, res) => {
  try {
    const { buyerId } = req.params;

    if (!buyerId) {
      return res.status(400).json({ success: false, message: "buyerId is required" });
    }

    const reviews = await Review.find({ revieweeId: buyerId, reviewType: "OwnerToBuyer" })
      .populate("reviewerId", "name email")
      .populate("petId", "breed category type image basicInfo")
      .sort({ createdAt: -1 });

    const totalCount = reviews.length;
    const averageRating =
      totalCount > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1))
        : 0;

    return res.status(200).json({
      success: true,
      message: "Buyer reviews fetched successfully",
      totalCount,
      averageRating,
      reviews,
    });
  } catch (error) {
    console.error("Error in getBuyerReviews:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

/**
 * API 4: CHECK REVIEW ELIGIBILITY
 * Route: GET /api/user/pet-request/:petRequestId/review-status
 */
export const checkReviewEligibility = async (req, res) => {
  try {
    const { petRequestId } = req.params;
    const userId = req.user._id;

    const request = await PetRequest.findById(petRequestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Pet request not found" });
    }

    const requesterIdStr = request.requesterId.toString();
    const ownerIdStr = request.ownerId.toString();
    const userIdStr = userId.toString();

    // Check if participant
    if (userIdStr !== requesterIdStr && userIdStr !== ownerIdStr) {
      return res.status(200).json({
        success: true,
        eligible: false,
        alreadyReviewed: false,
        reviewType: null,
        reason: "You are not a participant in this transaction",
      });
    }

    // Check completion status
    if (request.requestStatus !== "Completed") {
      return res.status(200).json({
        success: true,
        eligible: false,
        alreadyReviewed: false,
        reviewType: userIdStr === requesterIdStr ? "BuyerToOwner" : "OwnerToBuyer",
        reason: `Transaction is not completed yet (current status: '${request.requestStatus}')`,
      });
    }

    const reviewType = userIdStr === requesterIdStr ? "BuyerToOwner" : "OwnerToBuyer";

    // Check existing review
    const existingReview = await Review.findOne({
      petRequestId,
      reviewerId: userId,
      reviewType,
    });

    return res.status(200).json({
      success: true,
      eligible: !existingReview,
      alreadyReviewed: Boolean(existingReview),
      reviewType,
      existingReview: existingReview || null,
      reason: existingReview ? "Review already submitted" : "Eligible for review",
    });
  } catch (error) {
    console.error("Error in checkReviewEligibility:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};
