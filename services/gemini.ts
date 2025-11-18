import { GoogleGenAI, Modality } from "@google/genai";

// Helper to check API Key selection for Veo
export const checkApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
        try {
             await window.aistudio.openSelectKey();
             return await window.aistudio.hasSelectedApiKey();
        } catch (e) {
            console.error("Error selecting key", e);
            return false;
        }
    }
    return hasKey;
  }
  return true; // Fallback if not running in the specific studio environment
};

const getClient = () => {
    // Always create a new client to ensure we pick up the latest key if changed via checkApiKey
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateSkinTexture = async (prompt: string): Promise<string> => {
  const ai = getClient();
  // Using imagen-4.0-generate-001 for high quality textures
  // Request a square texture
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `Seamless texture for a sci-fi video game character, ${prompt}, 4k resolution, high detail, flat lighting`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    throw new Error("No image generated");
  } catch (error) {
      console.error("Skin generation failed:", error);
      throw error;
  }
};

export const generateVeoVideo = async (
    imageFile: File,
    prompt: string,
    aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
    // Ensure Key is selected for Veo
    const authorized = await checkApiKey();
    if (!authorized) throw new Error("API Key selection required for Veo.");

    const ai = getClient();
    
    // Convert File to Base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = btoa(
        new Uint8Array(arrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
            imageBytes: base64Image,
            mimeType: imageFile.type,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio
        }
    });

    // Poll for completion
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed to return a URI.");

    // Fetch the actual video bytes using the API key
    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};