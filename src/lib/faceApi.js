import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadModels = async () => {
  if (modelsLoaded) return;

  try {
    const MODEL_URL = '/models';
    console.log("Loading Face API models from:", MODEL_URL);
    
    // Load only essential models for faster startup
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    
    modelsLoaded = true;
    console.log("Face API Models Loaded successfully.");
  } catch (error) {
    console.error("Error loading Face API models:", error);
    throw error;
  }
};
