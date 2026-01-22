import * as faceapi from 'face-api.js';
import { MemberFaceData } from '@/types/database';

// Model URLs - these will be loaded from public folder
const MODEL_URL = '/models/face-api';

export interface FaceDetectionResult {
  detected: boolean;
  descriptor: Float32Array | null;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FaceMatchResult {
  matched: boolean;
  memberId: string | null;
  confidence: number;
  memberFaceData?: MemberFaceData;
}

class FaceRecognitionService {
  private modelsLoaded = false;
  private loading = false;

  async loadModels(): Promise<void> {
    if (this.modelsLoaded || this.loading) return;

    this.loading = true;
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      this.modelsLoaded = true;
    } finally {
      this.loading = false;
    }
  }

  isLoaded(): boolean {
    return this.modelsLoaded;
  }

  async detectFace(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ): Promise<FaceDetectionResult> {
    if (!this.modelsLoaded) {
      await this.loadModels();
    }

    const detection = await faceapi
      .detectSingleFace(input)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return {
        detected: false,
        descriptor: null,
        confidence: 0,
      };
    }

    return {
      detected: true,
      descriptor: detection.descriptor,
      confidence: detection.detection.score,
      boundingBox: {
        x: detection.detection.box.x,
        y: detection.detection.box.y,
        width: detection.detection.box.width,
        height: detection.detection.box.height,
      },
    };
  }

  async detectMultipleFaces(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ): Promise<FaceDetectionResult[]> {
    if (!this.modelsLoaded) {
      await this.loadModels();
    }

    const detections = await faceapi
      .detectAllFaces(input)
      .withFaceLandmarks()
      .withFaceDescriptors();

    return detections.map((detection) => ({
      detected: true,
      descriptor: detection.descriptor,
      confidence: detection.detection.score,
      boundingBox: {
        x: detection.detection.box.x,
        y: detection.detection.box.y,
        width: detection.detection.box.width,
        height: detection.detection.box.height,
      },
    }));
  }

  findBestMatch(
    faceDescriptor: Float32Array,
    memberFaceData: MemberFaceData[],
    threshold = 0.6
  ): FaceMatchResult {
    if (memberFaceData.length === 0) {
      return { matched: false, memberId: null, confidence: 0 };
    }

    // Create labeled descriptors from member data
    const labeledDescriptors = memberFaceData.map((data) => {
      const descriptor = new Float32Array(data.face_descriptor as number[]);
      return new faceapi.LabeledFaceDescriptors(data.member_id, [descriptor]);
    });

    // Create face matcher
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, threshold);

    // Find best match
    const bestMatch = faceMatcher.findBestMatch(faceDescriptor);

    if (bestMatch.label === 'unknown') {
      return { matched: false, memberId: null, confidence: 1 - bestMatch.distance };
    }

    const matchedMemberData = memberFaceData.find(
      (data) => data.member_id === bestMatch.label
    );

    return {
      matched: true,
      memberId: bestMatch.label,
      confidence: 1 - bestMatch.distance,
      memberFaceData: matchedMemberData,
    };
  }

  async matchFaceFromInput(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    memberFaceData: MemberFaceData[],
    threshold = 0.6
  ): Promise<FaceMatchResult & { detectionConfidence: number }> {
    const detection = await this.detectFace(input);

    if (!detection.detected || !detection.descriptor) {
      return {
        matched: false,
        memberId: null,
        confidence: 0,
        detectionConfidence: 0,
      };
    }

    const match = this.findBestMatch(detection.descriptor, memberFaceData, threshold);

    return {
      ...match,
      detectionConfidence: detection.confidence,
    };
  }

  descriptorToArray(descriptor: Float32Array): number[] {
    return Array.from(descriptor);
  }

  arrayToDescriptor(array: number[]): Float32Array {
    return new Float32Array(array);
  }

  calculateDistance(descriptor1: Float32Array, descriptor2: Float32Array): number {
    return faceapi.euclideanDistance(descriptor1, descriptor2);
  }

  // Draw detection on canvas (for visual feedback)
  async drawDetection(
    canvas: HTMLCanvasElement,
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    options?: {
      drawBox?: boolean;
      drawLandmarks?: boolean;
      boxColor?: string;
      label?: string;
    }
  ): Promise<void> {
    if (!this.modelsLoaded) {
      await this.loadModels();
    }

    const detection = await faceapi
      .detectSingleFace(input)
      .withFaceLandmarks();

    if (!detection) return;

    const dims = faceapi.matchDimensions(canvas, input, true);
    const resized = faceapi.resizeResults(detection, dims);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (options?.drawBox !== false) {
      const drawOptions = {
        boxColor: options?.boxColor || '#00ff00',
        label: options?.label,
      };
      const box = new faceapi.draw.DrawBox(resized.detection.box, drawOptions);
      box.draw(canvas);
    }

    if (options?.drawLandmarks) {
      faceapi.draw.drawFaceLandmarks(canvas, resized);
    }
  }

  // Capture frame from video as image data URL
  captureFrame(video: HTMLVideoElement): string {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }
}

export const faceRecognitionService = new FaceRecognitionService();
