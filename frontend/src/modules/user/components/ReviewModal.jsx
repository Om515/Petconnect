import React, { useState } from "react";
import axios from "axios";
import { Star, X, PawPrint, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

const ReviewModal = ({ isOpen, onClose, petRequest, targetRole = "Owner", onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !petRequest) return null;

  const pet = petRequest.petId || {};
  const isPetAvailable = pet && typeof pet === "object";
  const petName = isPetAvailable
    ? pet.basicInfo?.name || pet.breed || pet.type || "Pet"
    : "Pet";
  const petImage = isPetAvailable ? pet.image?.url || pet.media?.coverPhoto?.url : null;

  const isRatingBuyer = targetRole === "Buyer";
  const targetName = isRatingBuyer
    ? petRequest.requesterId?.name || "Buyer"
    : petRequest.ownerId?.name || "Pet Owner";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating (1 to 5)");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        petRequestId: petRequest._id,
        rating,
        comment: comment.trim(),
      };

      const { data } = await axios.post("/api/user/review", payload);

      if (data.success) {
        toast.success("Review submitted successfully.");
        if (onSuccess) onSuccess(data.review);
        onClose();
      } else {
        toast.error(data.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      const msg = err.response?.data?.message || "Failed to submit review. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative border border-gray-100 animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Summary */}
        <div className="text-center space-y-2">
          <div className="relative inline-block">
            {petImage ? (
              <img
                src={petImage}
                alt={petName}
                className="w-20 h-20 object-cover rounded-2xl border-2 border-amber-300 mx-auto shadow-md"
              />
            ) : (
              <div className="w-20 h-20 bg-amber-50 rounded-2xl border-2 border-amber-200 flex items-center justify-center mx-auto text-amber-500 shadow-inner">
                <PawPrint className="w-9 h-9" />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-sm">
              <Star className="w-3.5 h-3.5 fill-white" />
            </span>
          </div>

          <div>
            <h3 className="text-xl font-black text-gray-900">
              How was your experience with this {isRatingBuyer ? "buyer" : "owner"}?
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              Pet: <strong className="text-gray-800">{petName}</strong> • {isRatingBuyer ? "Buyer" : "Owner"}: <strong className="text-gray-800">{targetName}</strong>
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Picker */}
          <div className="space-y-1 text-center">
            <span className="text-xs font-extrabold uppercase text-gray-400 tracking-wider block">
              Select Rating
            </span>
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled
                          ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            {rating > 0 && (
              <span className="text-xs font-bold text-amber-600 block mt-1">
                {rating === 5
                  ? "⭐ Excellent (5/5)"
                  : rating === 4
                  ? "⭐ Great (4/5)"
                  : rating === 3
                  ? "⭐ Average (3/5)"
                  : rating === 2
                  ? "⭐ Below Average (2/5)"
                  : "⭐ Poor (1/5)"}
              </span>
            )}
          </div>

          {/* Comment Textarea */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label className="font-extrabold text-gray-700 uppercase tracking-wider">
                Share your experience
              </label>
              <span className="text-gray-400 font-semibold text-[11px]">
                {comment.length}/1000
              </span>
            </div>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
              placeholder={
                isRatingBuyer
                  ? "Share your experience with this buyer regarding communication, responsibility, punctuality, seriousness, etc..."
                  : "Tell other pet owners/buyers about your experience..."
              }
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none transition font-medium text-gray-800 resize-none"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-1/2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="w-1/2 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
