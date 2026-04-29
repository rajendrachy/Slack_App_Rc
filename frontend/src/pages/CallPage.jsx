import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { Video, ShieldAlert, RefreshCw, Home, Loader2 } from "lucide-react";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const { user, isLoaded } = useUser();

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!user,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !user || !callId) return;

      try {
        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: {
            id: user.id,
            name: user.fullName,
            image: user.imageUrl,
          },
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);
        await callInstance.join({ create: true });

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.log("Error init call:", error);
        toast.error("Cannot connect to the call.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, user, callId]);

  if (isConnecting || !isLoaded) {
    return (
      <div className="h-screen flex flex-col gap-6 justify-center items-center bg-[#0a0a0c] text-white">
        <div className="relative">
          <div className="size-24 border-b-2 border-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-10 text-primary/40 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            Initializing Secure Call
          </h2>
          <p className="text-zinc-500 font-medium text-sm animate-pulse">
            Configuring encrypted stream connection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 p-4">
      <div className="relative w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-8 text-center p-12 bg-zinc-900/40 backdrop-blur-3xl">
            <div className="relative">
              <div className="size-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
                 <ShieldAlert className="size-12 text-red-500" />
              </div>
              <div className="absolute -bottom-2 -right-2 size-8 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                <Video className="size-4 text-zinc-500" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Connection Failed</h2>
              <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
                We couldn't initialize your video session. Please ensure your camera and microphone permissions are granted.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
              >
                <RefreshCw className="size-5" />
                Retry Connection
              </button>
              <button 
                onClick={() => navigate("/")}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-zinc-800/50 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all border border-zinc-700/50 active:scale-95"
              >
                <Home className="size-5" />
                Return Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { 
  useCallCallingState, 
  useCallRecordingState 
} from "@stream-io/video-react-sdk";

const CallContent = () => {
  const callingState = useCallCallingState();
  const { isRecordingInProgress } = useCallRecordingState();
  
  const navigate = useNavigate();
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  useEffect(() => {
    let interval;
    if (isRecordingInProgress) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingInProgress]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <StreamTheme>
      <div className="relative h-full w-full flex flex-col overflow-hidden bg-zinc-950">
        {/* Production-grade styles for Stream Video components */}
        <style dangerouslySetInnerHTML={{ __html: `
          .str-video__call-controls {
            padding: 0 !important;
            margin: 0 !important;
            position: relative !important;
            bottom: unset !important;
            left: unset !important;
            transform: unset !important;
            background: transparent !important;
          }
          .str-video__speaker-layout {
            height: 100% !important;
            width: 100% !important;
          }
          .str-video__call-controls__button {
            background: rgba(39, 39, 42, 0.8) !important;
            backdrop-filter: blur(12px) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 14px !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .str-video__call-controls__button:hover {
            background: rgba(63, 63, 70, 0.9) !important;
            transform: translateY(-2px) !important;
          }
          .str-video__call-controls__button--hangup {
            background: #ef4444 !important;
            box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4) !important;
          }
        `}} />

        {/* Top Overlay Indicators */}
        <div className="absolute top-6 left-6 z-50 flex items-center gap-3">
          {isRecordingInProgress && (
            <div className="flex items-center gap-2 bg-red-500/10 backdrop-blur-md text-red-500 px-4 py-2 rounded-2xl animate-pulse shadow-xl border border-red-500/20">
              <div className="size-2.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              <span className="text-sm font-bold tracking-tight">REC {formatTime(recordingSeconds)}</span>
            </div>
          )}
          
          <div className="bg-zinc-900/60 backdrop-blur-md text-zinc-300 px-4 py-2 rounded-2xl border border-zinc-800/50 flex items-center gap-2 shadow-lg">
             <div className="size-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
             <span className="text-xs font-medium uppercase tracking-wider">Live Connection</span>
          </div>
        </div>

        {/* Main Video Viewport */}
        <div className="flex-1 min-h-0 relative">
          <SpeakerLayout />
        </div>

        {/* Bottom Controls Bar */}
        <div className="relative z-50 py-8 flex flex-col items-center justify-center bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent">
          <CallControls onLeave={() => navigate("/")} />
        </div>
      </div>
    </StreamTheme>
  );
};

export default CallPage;
