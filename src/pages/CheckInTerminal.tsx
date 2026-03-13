import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  User,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Loader2,
  Smartphone,
  ScanFace,
  Clock,
  Settings,
  LogOut,
  AlertCircle,
  Heart,
  CreditCard,
  Users,
  MessageSquare,
  QrCode,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { accessControlService } from '@/services/accessControl';
import { faceRecognitionService } from '@/services/faceRecognition';
import { livenessCheckService } from '@/services/livenessCheck';
import { deviceCheckinService, bluetoothCheckinService, isWithinRange } from '@/services/bluetoothCheckin';
import { validateToken } from '@/services/qrCheckin';
import { membersService } from '@/services/members';
import { memberNotesService } from '@/services/memberNotes';
import { isDemoMode, DEMO_MEMBERS } from '@/services/demoData';
import { MemberNote } from '@/services/demoData';
import { Member, MemberFaceData, GymAccessSettings } from '@/types/database';

type CheckInMode = 'idle' | 'face' | 'search' | 'device' | 'qr';
type CheckInStatus = 'success' | 'denied' | 'processing' | null;

interface CheckInResult {
  status: CheckInStatus;
  member?: Member;
  message: string;
  notes?: MemberNote[];
}

export default function CheckInTerminal() {
  const { gym } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<CheckInMode>('idle');
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDataCache, setFaceDataCache] = useState<MemberFaceData[]>([]);
  const [settings, setSettings] = useState<GymAccessSettings | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [livenessStatus, setLivenessStatus] = useState<string | null>(null);
  const qrScannerRef = useRef<any>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load settings and face data
  useEffect(() => {
    if (!gym?.id) return;

    const loadData = async () => {
      try {
        const [accessSettings, faceData] = await Promise.all([
          accessControlService.ensureSettings(gym.id),
          accessControlService.getAllFaceData(gym.id),
        ]);
        setSettings(accessSettings);
        setFaceDataCache(faceData);
      } catch (error) {
        console.error('Failed to load access data:', error);
      }
    };

    loadData();
  }, [gym?.id]);

  // Load face recognition models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceRecognitionService.loadModels();
        setModelsLoaded(true);
      } catch (error) {
        console.error('Failed to load face recognition models:', error);
        toast.error('Failed to load face recognition');
      }
    };

    loadModels();
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      toast.error('Camera access denied');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Handle face check-in
  const handleFaceCheckIn = useCallback(async () => {
    if (!gym?.id || !videoRef.current || !modelsLoaded) return;

    setIsProcessing(true);
    setLivenessStatus(null);
    setResult({ status: 'processing', message: 'Scanning face...' });

    try {
      const matchResult = await faceRecognitionService.matchFaceFromInput(
        videoRef.current,
        faceDataCache,
        settings?.face_match_threshold || 0.6
      );

      if (matchResult.matched && matchResult.memberId) {
        // Liveness check if enabled
        if (settings?.require_liveness_check) {
          setResult({ status: 'processing', message: 'Liveness check...' });

          if (isDemoMode()) {
            // Demo: auto-pass after 1.5s
            setLivenessStatus('Please blink...');
            await new Promise((r) => setTimeout(r, 1500));
            setLivenessStatus('Blink detected!');
          } else {
            let attempts = 0;
            const maxAttempts = 3;
            let passed = false;

            while (attempts < maxAttempts && !passed) {
              attempts++;
              const livenessResult = await livenessCheckService.performLivenessCheck(
                videoRef.current!,
                'blink',
                (status) => setLivenessStatus(status)
              );
              passed = livenessResult.passed;

              if (!passed && attempts < maxAttempts) {
                setLivenessStatus(`Attempt ${attempts}/${maxAttempts} failed. Trying again...`);
                await new Promise((r) => setTimeout(r, 500));
              }
            }

            if (!passed) {
              setLivenessStatus(null);
              setResult({
                status: 'denied',
                message: 'Liveness check failed. Please try again.',
              });
              setIsProcessing(false);
              return;
            }
          }
          setLivenessStatus(null);
        }

        const checkInResult = await accessControlService.performCheckIn(
          gym.id,
          matchResult.memberId,
          'face_recognition',
          { confidenceScore: matchResult.confidence }
        );

        if (checkInResult.success) {
          // Fetch member notes for the check-in alert
          const notes = await memberNotesService.getByMember(matchResult.memberId);
          setResult({
            status: 'success',
            member: checkInResult.member,
            message: `Welcome, ${checkInResult.member?.name}!`,
            notes: notes.length > 0 ? notes : undefined,
          });
        } else {
          setResult({
            status: 'denied',
            message: checkInResult.message,
          });
        }
      } else {
        setResult({
          status: 'denied',
          message: 'Face not recognized. Please use manual check-in.',
        });
      }
    } catch (error) {
      console.error('Face check-in error:', error);
      setResult({
        status: 'denied',
        message: 'Face recognition failed. Please try again.',
      });
    } finally {
      setIsProcessing(false);
      setLivenessStatus(null);
    }
  }, [gym?.id, modelsLoaded, faceDataCache, settings?.face_match_threshold, settings?.require_liveness_check]);

  // Continuous face detection loop
  useEffect(() => {
    if (mode !== 'face' || !modelsLoaded || isProcessing) return;

    const interval = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        handleFaceCheckIn();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [mode, modelsLoaded, isProcessing, handleFaceCheckIn]);

  // Handle mode changes
  useEffect(() => {
    if (mode === 'face') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);

  // Handle search
  const handleSearch = async () => {
    if (!gym?.id || !searchQuery.trim()) return;

    try {
      const results = await membersService.search(gym.id, searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    }
  };

  // Handle manual check-in
  const handleManualCheckIn = async (member: Member) => {
    if (!gym?.id) return;

    setIsProcessing(true);
    setResult({ status: 'processing', message: 'Processing...' });

    try {
      const checkInResult = await accessControlService.performCheckIn(
        gym.id,
        member.id,
        'manual'
      );

      if (checkInResult.success) {
        // Fetch member notes for the check-in alert
        const notes = await memberNotesService.getByMember(member.id);
        setResult({
          status: 'success',
          member: checkInResult.member,
          message: `Welcome, ${checkInResult.member?.name}!`,
          notes: notes.length > 0 ? notes : undefined,
        });
        setSearchQuery('');
        setSearchResults([]);
      } else {
        setResult({
          status: 'denied',
          message: checkInResult.message,
        });
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setResult({
        status: 'denied',
        message: 'Check-in failed. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle QR check-in
  const handleQrCheckIn = useCallback(async (decodedText: string) => {
    if (!gym?.id || isProcessing) return;

    setIsProcessing(true);
    setResult({ status: 'processing', message: 'Validating QR code...' });

    try {
      const tokenResult = validateToken(decodedText, gym.id);

      if (!tokenResult.valid || !tokenResult.data) {
        setResult({
          status: 'denied',
          message: tokenResult.error || 'Invalid QR code',
        });
        setIsProcessing(false);
        return;
      }

      const checkInResult = await accessControlService.performCheckIn(
        gym.id,
        tokenResult.data.memberId,
        'qr_code'
      );

      if (checkInResult.success) {
        const notes = await memberNotesService.getByMember(tokenResult.data.memberId);
        setResult({
          status: 'success',
          member: checkInResult.member,
          message: `Welcome, ${checkInResult.member?.name}!`,
          notes: notes.length > 0 ? notes : undefined,
        });
      } else {
        setResult({
          status: 'denied',
          message: checkInResult.message,
        });
      }
    } catch (error) {
      console.error('QR check-in error:', error);
      setResult({
        status: 'denied',
        message: 'QR check-in failed. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [gym?.id, isProcessing]);

  // Start/stop QR scanner
  useEffect(() => {
    if (mode !== 'qr') {
      // Cleanup scanner when leaving QR mode
      if (qrScannerRef.current) {
        qrScannerRef.current.clear().catch(() => {});
        qrScannerRef.current = null;
      }
      return;
    }

    // Demo mode: simulate a scan after delay
    if (isDemoMode()) {
      const timer = setTimeout(() => {
        const randomMember = DEMO_MEMBERS[Math.floor(Math.random() * 10)];
        setResult({
          status: 'success',
          member: randomMember as unknown as Member,
          message: `Welcome, ${randomMember.name}!`,
        });
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Initialize scanner
    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        qrScannerRef.current = scanner;

        scanner.render(
          (decodedText: string) => {
            handleQrCheckIn(decodedText);
            scanner.clear().catch(() => {});
          },
          () => {} // ignore errors during scanning
        );
      } catch (error) {
        console.error('Failed to initialize QR scanner:', error);
        toast.error('Failed to start QR scanner');
      }
    };

    initScanner();

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.clear().catch(() => {});
        qrScannerRef.current = null;
      }
    };
  }, [mode, handleQrCheckIn]);

  // Handle device check-in
  const handleDeviceCheckIn = async () => {
    if (!gym?.id) return;

    setIsProcessing(true);
    setResult({ status: 'processing', message: 'Detecting device...' });

    try {
      const deviceInfo = await deviceCheckinService.getDeviceInfo();

      // Look up member by device
      const device = await accessControlService.getBluetoothDeviceByDeviceId(
        gym.id,
        deviceInfo.deviceId
      );

      if (device) {
        // Check Bluetooth range if configured
        const rangeLimit = settings?.bluetooth_range_meters || 0;
        if (rangeLimit > 0) {
          // In demo mode, simulate RSSI in valid range
          const rssi = isDemoMode() ? -55 : (device as any).rssi;
          if (!isWithinRange(rssi, rangeLimit)) {
            setResult({
              status: 'denied',
              message: 'Device is out of range. Please move closer.',
            });
            setIsProcessing(false);
            return;
          }
        }

        const checkInResult = await accessControlService.performCheckIn(
          gym.id,
          device.member_id,
          'bluetooth',
          { deviceId: device.device_id }
        );

        if (checkInResult.success) {
          // Fetch member notes for the check-in alert
          const notes = await memberNotesService.getByMember(device.member_id);
          setResult({
            status: 'success',
            member: checkInResult.member,
            message: `Welcome, ${checkInResult.member?.name}!`,
            notes: notes.length > 0 ? notes : undefined,
          });
        } else {
          setResult({
            status: 'denied',
            message: checkInResult.message,
          });
        }
      } else {
        setResult({
          status: 'denied',
          message: 'Device not registered. Please register your device first.',
        });
      }
    } catch (error) {
      console.error('Device check-in error:', error);
      setResult({
        status: 'denied',
        message: 'Device check-in failed.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset to idle
  const resetToIdle = () => {
    setMode('idle');
    setResult(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Auto-reset after success/denied (longer timeout if there are notes)
  useEffect(() => {
    if (result?.status === 'success' || result?.status === 'denied') {
      const timeout = result?.notes?.length ? 8000 : 4000; // More time to read notes
      const timer = setTimeout(resetToIdle, timeout);
      return () => clearTimeout(timer);
    }
  }, [result?.status, result?.notes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          {gym?.logo_url && (
            <img src={gym.logo_url} alt={gym.name} className="h-10 w-10 rounded-lg" />
          )}
          <div>
            <h1 className="text-xl font-bold">{gym?.name || 'Gym'}</h1>
            <p className="text-sm text-white/60">Check-In Terminal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-mono">
              {currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-white/60">
              {currentTime.toLocaleDateString('de-DE', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white/60 hover:text-white"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        {/* Result Overlay */}
        {result && result.status !== 'processing' && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center ${
              result.status === 'success'
                ? result.notes?.length ? 'bg-gradient-to-b from-green-500/95 to-orange-500/95' : 'bg-green-500/90'
                : 'bg-red-500/90'
            }`}
          >
            <div className="text-center max-w-2xl px-8">
              {result.status === 'success' ? (
                <CheckCircle2 className="h-24 w-24 mx-auto mb-4" />
              ) : (
                <XCircle className="h-24 w-24 mx-auto mb-4" />
              )}
              <h2 className="text-4xl font-bold mb-4">{result.message}</h2>
              {result.member && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {result.member.membership_type.toUpperCase()}
                  </Badge>
                </div>
              )}

              {/* Member Notes Alert */}
              {result.notes && result.notes.length > 0 && (
                <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-6 text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="h-6 w-6" />
                    <span className="text-xl font-bold">Staff Notes</span>
                  </div>
                  <div className="space-y-3">
                    {result.notes.map((note) => (
                      <div key={note.id} className="flex items-start gap-3 bg-white/10 rounded-lg p-3">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                          note.priority === 'high' ? 'bg-red-600' :
                          note.priority === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                        }`}>
                          {note.category === 'health' ? <Heart className="h-4 w-4" /> :
                           note.category === 'payment' ? <CreditCard className="h-4 w-4" /> :
                           note.category === 'personal' ? <Users className="h-4 w-4" /> :
                           <MessageSquare className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-medium">{note.note}</p>
                          <p className="text-sm opacity-75 mt-1">
                            {note.category.charAt(0).toUpperCase() + note.category.slice(1)} • {note.created_by}
                          </p>
                        </div>
                        {note.priority === 'high' && (
                          <Badge className="bg-red-600 text-white">Important</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processing Overlay */}
        {result?.status === 'processing' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90">
            <div className="text-center">
              <Loader2 className="h-24 w-24 mx-auto mb-6 animate-spin" />
              <h2 className="text-3xl font-bold">{result.message}</h2>
            </div>
          </div>
        )}

        {/* Idle Mode - Method Selection */}
        {mode === 'idle' && !result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
            {settings?.face_recognition_enabled !== false && (
              <Card
                className="glass-card cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setMode('face')}
              >
                <CardContent className="p-8 text-center">
                  <ScanFace className="h-20 w-20 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl font-bold mb-2">Face Check-In</h3>
                  <p className="text-muted-foreground">
                    Look at the camera to check in automatically
                  </p>
                </CardContent>
              </Card>
            )}

            {settings?.bluetooth_enabled !== false && (
              <Card
                className="glass-card cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  setMode('device');
                  handleDeviceCheckIn();
                }}
              >
                <CardContent className="p-8 text-center">
                  <Smartphone className="h-20 w-20 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl font-bold mb-2">Device Check-In</h3>
                  <p className="text-muted-foreground">
                    Use your registered smartphone
                  </p>
                </CardContent>
              </Card>
            )}

            {settings?.qr_code_enabled && (
              <Card
                className="glass-card cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  stopCamera();
                  setMode('qr');
                }}
              >
                <CardContent className="p-8 text-center">
                  <QrCode className="h-20 w-20 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl font-bold mb-2">QR Check-In</h3>
                  <p className="text-muted-foreground">
                    Scan your QR code
                  </p>
                </CardContent>
              </Card>
            )}

            {settings?.manual_checkin_enabled !== false && (
              <Card
                className="glass-card cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setMode('search')}
              >
                <CardContent className="p-8 text-center">
                  <Search className="h-20 w-20 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl font-bold mb-2">Manual Check-In</h3>
                  <p className="text-muted-foreground">
                    Search by name or email
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Face Recognition Mode */}
        {mode === 'face' && !result && (
          <div className="max-w-2xl w-full">
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black">
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
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
                        <p>Loading face recognition...</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <Badge variant="secondary" className="text-sm">
                      <Camera className="h-4 w-4 mr-2" />
                      {livenessStatus ? livenessStatus :
                       isProcessing ? 'Scanning...' : 'Position your face in the frame'}
                    </Badge>
                    <Button variant="secondary" onClick={resetToIdle}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* QR Scanner Mode */}
        {mode === 'qr' && !result && (
          <div className="max-w-2xl w-full">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <QrCode className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <h3 className="text-xl font-bold">Scan QR Code</h3>
                  <p className="text-muted-foreground">
                    Hold your QR code in front of the camera
                  </p>
                </div>
                <div id="qr-reader" className="rounded-lg overflow-hidden" />
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" onClick={resetToIdle}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Mode */}
        {mode === 'search' && !result && (
          <div className="max-w-2xl w-full">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex gap-4 mb-6">
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="text-lg h-14"
                    autoFocus
                  />
                  <Button onClick={handleSearch} size="lg" className="h-14 px-8">
                    <Search className="h-5 w-5" />
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {searchResults.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors flex items-center justify-between"
                        onClick={() => handleManualCheckIn(member)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{member.membership_type}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No members found
                  </p>
                )}

                <div className="mt-6 flex justify-center">
                  <Button variant="outline" onClick={resetToIdle}>
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-white/40">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            {settings && accessControlService.isGymOpen(settings)
              ? 'Open'
              : 'Closed'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToIdle}
          className="text-white/40 hover:text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </footer>
    </div>
  );
}
