import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  ScanFace,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { faceRecognitionService } from '@/services/faceRecognition';
import { accessControlService } from '@/services/accessControl';
import { Member, MemberFaceData } from '@/types/database';

interface FaceRegistrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member;
  gymId: string;
  existingFaceData?: MemberFaceData | null;
  onSuccess?: () => void;
}

export default function FaceRegistration({
  open,
  onOpenChange,
  member,
  gymId,
  existingFaceData,
  onSuccess,
}: FaceRegistrationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<'camera' | 'preview' | 'saving' | 'done'>('camera');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceRecognitionService.loadModels();
        setModelsLoaded(true);
      } catch (error) {
        console.error('Failed to load models:', error);
        toast.error('Failed to load face recognition');
      }
    };

    if (open) {
      loadModels();
    }
  }, [open]);

  // Start camera when dialog opens
  useEffect(() => {
    if (!open) {
      stopCamera();
      setStep('camera');
      setCapturedImage(null);
      setFaceDescriptor(null);
      setFaceDetected(false);
      return;
    }

    startCamera();

    return () => stopCamera();
  }, [open]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      toast.error('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  // Continuous face detection
  useEffect(() => {
    if (!open || !modelsLoaded || !cameraReady || step !== 'camera') return;

    const detectFace = async () => {
      if (!videoRef.current) return;

      const result = await faceRecognitionService.detectFace(videoRef.current);
      setFaceDetected(result.detected);

      // Draw detection on canvas
      if (canvasRef.current && videoRef.current) {
        await faceRecognitionService.drawDetection(
          canvasRef.current,
          videoRef.current,
          {
            drawBox: true,
            boxColor: result.detected ? '#22c55e' : '#ef4444',
            label: result.detected ? 'Face detected' : undefined,
          }
        );
      }
    };

    const interval = setInterval(detectFace, 200);
    return () => clearInterval(interval);
  }, [open, modelsLoaded, cameraReady, step]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !modelsLoaded) return;

    setIsProcessing(true);

    try {
      // Detect face and get descriptor
      const result = await faceRecognitionService.detectFace(videoRef.current);

      if (!result.detected || !result.descriptor) {
        toast.error('No face detected. Please position your face in the frame.');
        setIsProcessing(false);
        return;
      }

      // Capture image
      const imageData = faceRecognitionService.captureFrame(videoRef.current);
      setCapturedImage(imageData);
      setFaceDescriptor(result.descriptor);
      setStep('preview');
      stopCamera();
    } catch (error) {
      console.error('Capture failed:', error);
      toast.error('Failed to capture photo');
    } finally {
      setIsProcessing(false);
    }
  }, [modelsLoaded]);

  const retake = () => {
    setCapturedImage(null);
    setFaceDescriptor(null);
    setStep('camera');
    startCamera();
  };

  const saveFaceData = async () => {
    if (!faceDescriptor) return;

    setStep('saving');

    try {
      await accessControlService.saveFaceData({
        member_id: member.id,
        gym_id: gymId,
        face_descriptor: faceRecognitionService.descriptorToArray(faceDescriptor),
        photo_url: capturedImage || undefined,
      });

      setStep('done');
      toast.success('Face registration successful!');
      onSuccess?.();

      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save face data');
      setStep('preview');
    }
  };

  const deleteFaceData = async () => {
    try {
      await accessControlService.deleteFaceData(member.id);
      toast.success('Face data deleted');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete face data');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanFace className="h-5 w-5" />
            Face Registration - {member.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera/Preview View */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {step === 'camera' && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />

                {!modelsLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center text-white">
                      <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                      <p>Loading face recognition...</p>
                    </div>
                  </div>
                )}

                {modelsLoaded && !cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center text-white">
                      <Camera className="h-8 w-8 mx-auto mb-2" />
                      <p>Starting camera...</p>
                    </div>
                  </div>
                )}

                {modelsLoaded && cameraReady && (
                  <div className="absolute bottom-4 left-4">
                    <Badge variant={faceDetected ? 'default' : 'destructive'}>
                      {faceDetected ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Face detected
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          No face detected
                        </>
                      )}
                    </Badge>
                  </div>
                )}
              </>
            )}

            {(step === 'preview' || step === 'saving' || step === 'done') && capturedImage && (
              <img
                src={capturedImage}
                alt="Captured face"
                className="w-full h-full object-cover"
              />
            )}

            {step === 'done' && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/90">
                <div className="text-center text-white">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-2" />
                  <p className="text-xl font-bold">Registration Complete!</p>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          {step === 'camera' && (
            <p className="text-sm text-muted-foreground text-center">
              Position your face in the frame. Make sure you have good lighting
              and look directly at the camera.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {existingFaceData && step === 'camera' && (
              <Button
                variant="destructive"
                onClick={deleteFaceData}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Face Data
              </Button>
            )}

            {step === 'camera' && (
              <Button
                onClick={capturePhoto}
                disabled={!faceDetected || isProcessing || !modelsLoaded}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 mr-2" />
                )}
                Capture Photo
              </Button>
            )}

            {step === 'preview' && (
              <>
                <Button variant="outline" onClick={retake}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button onClick={saveFaceData}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            )}

            {step === 'saving' && (
              <Button disabled>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
