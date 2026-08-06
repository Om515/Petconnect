import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const scanPet = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    // Prepare the image for Gemini API requirements (base64 string)
    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    // Construct the highly strict prompt demanding only raw JSON
    const prompt = `
You are an expert veterinarian and pet behaviorist. Analyze this image of a pet. 
If it is NOT a pet (e.g. random objects, buildings), return a JSON object with a single key "error": "Invalid image: Not a pet".
Otherwise, return exclusively a JSON object with the following structure exactly. Do not include markdown formatting like \`\`\`json. Return only the raw JSON string.

{
  "identification": {
    "primaryBreed": "String",
    "confidenceScore": Number (0-100),
    "possibleMix": "String"
  },
  "physicalTraits": {
    "estimatedAgeStage": "String",
    "sizeCategory": "String",
    "weightRange": "String",
    "groomingNeeds": "String"
  },
  "compatibility": {
    "goodWithKids": Boolean,
    "goodWithOtherPets": Boolean,
    "energyLevel": "String",
    "trainability": "String"
  },
  "marketInsights": {
    "estimatedPriceRange": {
      "min": Number,
      "max": Number,
      "currency": "INR",
      "disclaimer": "Market estimate only."
    },
    "maintenanceCostMonthly": "String (e.g. ₹4,000 - ₹7,000)"
  },
  "healthAndCare": {
    "commonBreedRisks": ["String"],
    "dietaryNotes": "String",
    "visualObservations": "String"
  },
  "funFact": "String"
}`;

    // Select the latest multimodal model available for this API key
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    // Send the prompt alongside the image
    const result = await model.generateContent([prompt, imagePart]);
    let text = result.response.text();

    // Guard against Gemini occasionally wrapping answers in markdown
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(text);

    // If Gemini detected it's not a pet, handle properly
    if (parsedData.error) {
       return res.status(400).json({ success: false, message: parsedData.error });
    }

    res.status(200).json({
      success: true,
      data: parsedData,
    });

  } catch (error) {
    console.error("AI Scan Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze pet. Please try a different or clearer image.",
    });
  }
};
