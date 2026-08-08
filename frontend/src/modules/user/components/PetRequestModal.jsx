import React, { useState } from "react";
import { X, Sparkles, AlertCircle, ShieldCheck, CreditCard, IndianRupee } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const PetRequestModal = ({ isOpen, onClose, pet, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !pet) return null;

  const basic = pet.basicInfo || {};
  const owner = pet.owner || {};

  const petName = basic.name || pet.breed || pet.type || "Pet";
  const listingType = basic.listingType || (pet.price > 0 ? "Sale" : "Adoption");
  const price = basic.price || pet.price || 0;
  const adoptionFee = basic.adoptionFee || 0;
  const petImage = pet.media?.coverPhoto?.url || pet.image?.url;
  const requestFee = 300;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleConfirmRequest = async () => {
    setSubmitting(true);
    try {
      // 1. Load Razorpay Standard Checkout Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load. Please check your internet connection.");
        setSubmitting(false);
        return;
      }

      // 2. Call Backend Create Order API
      const { data: orderData } = await axios.post("/api/user/razorpay/create-order", {
        petId: pet._id,
      });

      if (!orderData.success) {
        toast.error(orderData.message || "Failed to create payment order.");
        setSubmitting(false);
        return;
      }

      const { orderId, amount, currency, keyId } = orderData;

      // 3. Configure Razorpay Standard Checkout Modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "PetConnect",
        description: `Refundable Request Fee for ${petName}`,
        order_id: orderId,
        theme: {
          color: "#0891b2",
        },
        handler: async function (response) {
          // Send transaction proof to backend verification endpoint
          try {
            const { data: verifyData } = await axios.post("/api/user/razorpay/verify-payment", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              petId: pet._id,
            });

            if (verifyData.success) {
              toast.success("Payment successful. Your request has been submitted.");
              onSuccess(verifyData.petRequest);
              onClose();
            } else {
              toast.error(verifyData.message || "Payment could not be completed. Please try again.");
            }
          } catch (verifyErr) {
            console.error("Payment verification error:", verifyErr);
            toast.error(verifyErr.response?.data?.message || "Payment could not be completed. Please try again.");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled. Your request has not been submitted as paid.");
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        console.error("Razorpay Payment Failed:", resp.error);
        toast.error("Payment could not be completed. Please try again.");
        setSubmitting(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Pet request submission error:", error);
      const msg = error.response?.data?.message || "An error occurred while initiating payment.";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-6 border border-gray-100 animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">
              Confirm {listingType === "Sale" ? "Purchase" : "Adoption"} Request
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Submit a formal request to the pet owner
            </p>
          </div>
        </div>

        {/* Pet Information Summary Card */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4 items-center">
          <img
            src={petImage}
            alt={petName}
            className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm flex-shrink-0"
          />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-900 text-lg truncate">{petName}</h4>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                listingType === "Sale" ? "bg-cyan-100 text-cyan-800" : "bg-emerald-100 text-emerald-800"
              }`}>
                {listingType === "Sale" ? "For Sale" : "For Adoption"}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium truncate">
              Breed: <span className="text-gray-700 font-semibold">{pet.breed}</span>
            </p>
            {owner.name && (
              <p className="text-xs text-gray-500 font-medium truncate">
                Owner: <span className="text-gray-700 font-semibold">{owner.name}</span>
              </p>
            )}
            <p className="text-sm font-black text-cyan-700 flex items-center">
              Price: <IndianRupee className="w-3.5 h-3.5 ml-1 mr-0.5" />
              {listingType === "Sale" ? price.toLocaleString("en-IN") : adoptionFee.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Request Fee Breakdown & Test Mode Notice */}
        <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
              <CreditCard className="w-4 h-4 text-amber-600" /> Request Fee
            </span>
            <span className="text-xs font-black bg-amber-200/80 text-amber-900 px-2.5 py-0.5 rounded-full">
              Razorpay Test Mode
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-sm font-semibold text-amber-800">Amount Due:</span>
            <span className="text-2xl font-black text-amber-950 flex items-center">
              ₹{requestFee}
            </span>
          </div>
        </div>

        {/* Refundable Explanation Notice */}
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-900 leading-relaxed font-medium">
            This is a refundable request fee intended to ensure that requests come from serious buyers/adopters. It does not mean that you have purchased the pet.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-1/2 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors text-sm disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmRequest}
            disabled={submitting}
            className="w-1/2 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-extrabold rounded-2xl transition-all shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Initiating...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> Confirm & Pay
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetRequestModal;
