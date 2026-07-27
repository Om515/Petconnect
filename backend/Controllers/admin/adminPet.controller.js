import { petOrder } from "../../Models/petModel.js";

const petList = async (req, res) => {
    try {
        const petContent = await petOrder.find({ isVerified: false });
        console.log(petContent);
        res.json({ success: true, message: "Data fetched successfully", petContent });
    } catch (error) {
        console.log("Error in petList ", error);
        res.json({ success: false, message: "Error" });
    }
};

const approvePet = async (req, res) => {
    try {
        const id = req.body.id;

        const pet = await petOrder.findById(id);

        if (!pet) {
            return res.json({ success: false, message: "Pet not identified" });
        }

        pet.isVerified = true;
        pet.isApproved = true;

        await pet.save();

        res.json({ success: true, message: "Request Approved" });

    } catch (error) {
        console.log("Error in approvePet: ", error);
        res.json({ success: false, message: "Error" });
    }
};

const rejectPet = async (req, res) => {
    try {
        const id = req.body.id;

        const pet = await petOrder.findById(id);

        if (!pet) {
            return res.json({ success: false, message: "Pet not identified" });
        }

        pet.isVerified = true;
        pet.isApproved = false;

        await pet.save();

        res.json({ success: true, message: "Request Rejected" });

    } catch (error) {
        console.log("Error in approvePet: ", error);
        res.json({ success: false, message: "Error" });
    }
};

const soldPetslist = async (req, res) => {
    try {
        const petsSold = await petOrder.find({ soldBool: true });
    
        if (!petsSold) {
            return res.json({ success: false, message: "No pets are sold" });
        }
    
        res.json({ success: true, message: "Fetched data successfully", petsSold });
        
    } catch (error) {
        console.log("Error in soldPets: ", error);
        res.json({ success: false, message: "Internal server Error" });
    }
};

export { petList, approvePet, rejectPet, soldPetslist };
