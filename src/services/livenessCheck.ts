/**
 * Liveness Check Service - Anti-Spoofing
 *
 * Detects if a real face is present (not a photo) by asking the user to blink.
 * Uses face-api.js 68-point landmarks to compute Eye Aspect Ratio (EAR).
 *
 * EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
 * Blink detected when EAR drops below 0.2 and rises again.
 *
 * Eye landmarks (0-indexed from face-api.js 68-point model):
 * Left eye:  points 36-41
 * Right eye: points 42-47
 */

import * as faceapi from 'face-api.js';

export type LivenessChallenge = 'blink';

export interface LivenessResult {
  passed: boolean;
  challenge: LivenessChallenge;
  message: string;
}

const EAR_THRESHOLD = 0.2;
const CHECK_DURATION_MS = 3000;
const CHECK_INTERVAL_MS = 100;

function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function computeEAR(landmarks: faceapi.Point[]): number {
  // Left eye: landmarks 36-41
  const leftEye = landmarks.slice(36, 42);
  // Right eye: landmarks 42-47
  const rightEye = landmarks.slice(42, 48);

  const earLeft =
    (distance(leftEye[1], leftEye[5]) + distance(leftEye[2], leftEye[4])) /
    (2 * distance(leftEye[0], leftEye[3]));

  const earRight =
    (distance(rightEye[1], rightEye[5]) + distance(rightEye[2], rightEye[4])) /
    (2 * distance(rightEye[0], rightEye[3]));

  return (earLeft + earRight) / 2;
}

export function generateChallenge(): LivenessChallenge {
  return 'blink';
}

class LivenessCheckService {
  /**
   * Detect face with full 68-point landmarks.
   */
  async detectFaceWithLandmarks(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ): Promise<faceapi.Point[] | null> {
    const detection = await faceapi
      .detectSingleFace(input)
      .withFaceLandmarks();

    if (!detection) return null;
    return detection.landmarks.positions;
  }

  /**
   * Perform liveness check by detecting a blink within a time window.
   * Returns a promise that resolves when the check completes.
   */
  async performLivenessCheck(
    video: HTMLVideoElement,
    _challenge: LivenessChallenge,
    onStatusUpdate?: (status: string) => void
  ): Promise<LivenessResult> {
    return new Promise((resolve) => {
      let eyesClosed = false;
      let blinkDetected = false;
      let frameCount = 0;
      const maxFrames = CHECK_DURATION_MS / CHECK_INTERVAL_MS;

      onStatusUpdate?.('Please blink...');

      const interval = setInterval(async () => {
        frameCount++;

        if (blinkDetected || frameCount >= maxFrames) {
          clearInterval(interval);
          resolve({
            passed: blinkDetected,
            challenge: 'blink',
            message: blinkDetected
              ? 'Liveness confirmed'
              : 'Blink not detected. Please try again.',
          });
          return;
        }

        try {
          const landmarks = await this.detectFaceWithLandmarks(video);
          if (!landmarks || landmarks.length < 48) return;

          const ear = computeEAR(landmarks);

          if (ear < EAR_THRESHOLD) {
            eyesClosed = true;
          } else if (eyesClosed && ear >= EAR_THRESHOLD) {
            // Eyes opened again after being closed = blink detected
            blinkDetected = true;
            onStatusUpdate?.('Blink detected!');
          }
        } catch {
          // Skip frame on error
        }
      }, CHECK_INTERVAL_MS);
    });
  }
}

export const livenessCheckService = new LivenessCheckService();
