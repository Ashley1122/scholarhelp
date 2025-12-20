import * as faceapi from 'face-api.js';

interface FaceDetectionResult {
  success: boolean;
  croppedDataURL?: string;
  message?: string;
}

let modelLoaded = false;

// Preload face detection models
export const preloadFaceDetectionModels = async (): Promise<boolean> => {
  if (modelLoaded) return true;
  
  try {
    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    modelLoaded = true;
    return true;
  } catch (error) {
    console.error('Failed to load face detection models:', error);
    return false;
  }
};

function averagePoints(points: faceapi.Point[]): { x: number; y: number } {
  const sum = points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 }
  );
  return { x: sum.x / points.length, y: sum.y / points.length };
}

export const detectAndCropFace = async (
  file: File,
  currentZoom: number = 1
): Promise<FaceDetectionResult> => {
  if (!modelLoaded) {
    return {
      success: false,
      message: 'Please wait while the face detection model loads...'
    };
  }

  try {
    // Create image element
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = URL.createObjectURL(file);
    });

    // Detect faces
    const detections = await faceapi
      .detectAllFaces(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptors();

    // Clean up
    URL.revokeObjectURL(img.src);

    if (detections.length === 0) {
      return {
        success: false,
        message: 'No faces detected'
      };
    }

    // Get the largest face
    const sortedFaces = detections.sort(
      (a, b) =>
        b.detection.box.width * b.detection.box.height -
        a.detection.box.width * a.detection.box.height
    );
    const face = sortedFaces[0];
    const landmarks = face.landmarks;

    // Get important face landmarks
    const eyeLeft = landmarks.getLeftEye();
    const eyeRight = landmarks.getRightEye();
    const mouth = landmarks.getMouth();
    const nose = landmarks.getNose();

    // Calculate eye midpoint
    const eyeMidpointX = (averagePoints(eyeLeft).x + averagePoints(eyeRight).x) / 2;
    const eyeMidpointY = (averagePoints(eyeLeft).y + averagePoints(eyeRight).y) / 2;

    // Calculate mouth and nose positions
    const mouthMidpointY = averagePoints(mouth).y;
    const noseTip = nose[6]; // Nose tip

    // Calculate head dimensions
    const eyeToNoseDistance = Math.abs(noseTip.y - eyeMidpointY);
    const noseToMouthDistance = Math.abs(mouthMidpointY - noseTip.y);
    const headHeight = eyeToNoseDistance + noseToMouthDistance;

    // Standard passport photo specifications - 35mm × 45mm
    const passportAspectRatio = 35 / 45;

    // Add hair margin (30% above eyes)
    const hairMargin = headHeight * 1;
    const totalHeight = headHeight + hairMargin;
    const passportHeight = totalHeight * 2.5; // Head takes up 40% of total height

    // Apply zoom factor
    const zoomedHeight = passportHeight / currentZoom;
    const zoomedWidth = zoomedHeight * passportAspectRatio;

    // Center the face horizontally
    const centerX = eyeMidpointX;
    const topY = eyeMidpointY - headHeight * 2.2; // Position for hair

    // Clamp to image bounds
    const clampedX = Math.max(0, Math.min(centerX - zoomedWidth / 2, img.width - zoomedWidth));
    const clampedY = Math.max(0, Math.min(topY, img.height - zoomedHeight));

    // Create cropped image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { success: false, message: 'Failed to create canvas context' };
    }

    canvas.width = zoomedWidth;
    canvas.height = zoomedHeight;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, clampedX, clampedY, zoomedWidth, zoomedHeight, 0, 0, zoomedWidth, zoomedHeight);

    return {
      success: true,
      croppedDataURL: canvas.toDataURL('image/jpeg', 1.0)
    };
  } catch (error) {
    console.error('Face detection error:', error);
    return {
      success: false,
      message: 'Error processing image'
    };
  }
};

export const createCroppedImage = (
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.95);
};
