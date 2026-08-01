import userModel from "../../Models/userModel.js";

// Toggle pet in wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { petId } = req.body;

    if (!petId) {
      return res.json({ success: false, message: "Pet ID is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isWishlisted = user.wishlist.includes(petId);

    if (isWishlisted) {
      // Remove from wishlist
      user.wishlist.pull(petId);
    } else {
      // Add to wishlist
      user.wishlist.push(petId);
    }

    await user.save();

    res.json({
      success: true,
      message: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error in toggleWishlist:", error);
    res.json({ success: false, message: "Server Error" });
  }
};

// Get populated wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userModel.findById(userId).populate("wishlist");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error in getWishlist:", error);
    res.json({ success: false, message: "Server Error" });
  }
};
