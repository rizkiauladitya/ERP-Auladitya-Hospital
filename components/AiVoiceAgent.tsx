import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { Mic, MicOff, Activity, MessageSquare, Power, Radio } from 'lucide-react';
import { ViewState } from '../App';

interface AiVoiceAgentProps {
  onNavigate: (view: ViewState) => void;
}

export const AiVoiceAgent: React.FC<AiVoiceAgentProps> = ({ onNavigate }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [logs, setLogs] = useState<{sender: 'user' | 'ai', text: string}[]>([]);
  
  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Session Ref to avoid closure staleness
  const sessionRef = useRef<any>(null);

  // Tools Definition
  const tools: FunctionDeclaration[] = [
    {
      name: 'navigateTo',
      description: 'Navigasi ke bagian spesifik aplikasi (Dashboard, Pasien, Farmasi, Billing, Pengaturan).',
      parameters: {
        type: Type.OBJECT,
        properties: {
          view: {
            type: Type.STRING,
            description: 'Nama tampilan tujuan (DASHBOARD, PATIENTS, PHARMACY, BILLING, SETTINGS).',
            enum: ['DASHBOARD', 'PATIENTS', 'PHARMACY', 'BILLING', 'SETTINGS']
          }
        },
        required: ['view']
      }
    },
    {
      name: 'checkStock',
      description: 'Cek level stok untuk item farmasi tertentu.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          itemName: { type: Type.STRING, description: 'Nama obat atau item.' }
        },
        required: ['itemName']
      }
    }
  ];

  const connectToGemini = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Audio Output
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: async () => {
            console.log('Gemini Live Connected');
            setIsConnected(true);
            addLog('ai', 'Sistem Online. Ada yang bisa saya bantu terkait operasional Rumah Sakit?');
            
            // Start Audio Input Stream
            await startAudioInput();
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              setIsSpeaking(true);
              playAudio(base64Audio);
            }

            // Handle Tool Calls
            if (message.toolCall) {
              const responses = [];
              for (const fc of message.toolCall.functionCalls) {
                let result = { success: true, message: "Selesai" };
                
                if (fc.name === 'navigateTo') {
                  const viewMap: Record<string, ViewState> = {
                    'DASHBOARD': ViewState.DASHBOARD,
                    'PATIENTS': ViewState.PATIENTS,
                    'PHARMACY': ViewState.PHARMACY,
                    'BILLING': ViewState.BILLING,
                    'SETTINGS': ViewState.SETTINGS
                  };
                  const target = viewMap[fc.args['view'] as string];
                  if (target) {
                    onNavigate(target);
                    result = { success: true, message: `Berpindah ke modul ${fc.args['view']}` };
                    addLog('ai', `Membuka modul ${fc.args['view']}...`);
                  }
                } else if (fc.name === 'checkStock') {
                    // Mock stock check
                    result = { success: true, message: `Stok untuk ${fc.args['itemName']} adalah 450 unit (Batch B-8821). Status: Aman.` };
                    addLog('ai', `Mengecek stok ${fc.args['itemName']}... Ditemukan 450 unit.`);
                }

                responses.push({
                  id: fc.id,
                  name: fc.name,
                  response: result
                });
              }
              
              // Send Tool Response back to model
              sessionRef.current.sendToolResponse({ functionResponses: responses });
            }
            
            if (message.serverContent?.turnComplete) {
              setIsSpeaking(false);
            }
          },
          onclose: () => {
            setIsConnected(false);
            addLog('ai', 'Sesi terputus.');
          },
          onerror: (err) => {
            console.error(err);
            setIsConnected(false);
            addLog('ai', 'Terjadi kesalahan koneksi.');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          // Updated System Instruction to Indonesian
          systemInstruction: "Anda adalah Asisten AI ERP Rumah Sakit (SIMRS) yang canggih. Anda membantu navigasi menu, pelaporan keuangan, dan pengecekan stok obat. Anda berbicara dalam Bahasa Indonesia yang profesional, efisien, dan sopan. Jika diminta navigasi, gunakan tool navigateTo. Jika ditanya stok, gunakan checkStock.",
          tools: [{ functionDeclarations: tools }]
        }
      };

      const session = await ai.live.connect(config);
      sessionRef.current = session;

    } catch (e) {
      console.error("Connection failed", e);
      alert("Gagal terhubung ke Layanan AI. Mohon periksa API Key.");
    }
  };

  const startAudioInput = async () => {
    if (!audioContextRef.current) return;
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;
    
    const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = inputContext.createMediaStreamSource(stream);
    const processor = inputContext.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcm16 = floatTo16BitPCM(inputData);
      
      // Send to Gemini
      if (sessionRef.current) {
         sessionRef.current.sendRealtimeInput({
            media: {
              mimeType: 'audio/pcm;rate=16000',
              data: arrayBufferToBase64(pcm16)
            }
         });
      }
    };
    
    source.connect(processor);
    processor.connect(inputContext.destination);
    
    sourceRef.current = source;
    processorRef.current = processor;
  };

  const disconnect = () => {
    if (sessionRef.current) {
      // There isn't a direct .close() on the wrapper sometimes, 
      // but we can stop sending and release media
    }
    
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    audioContextRef.current?.close();
    
    setIsConnected(false);
    sessionRef.current = null;
  };

  // Helpers
  const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output.buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const playAudio = async (base64String: string) => {
     if (!audioContextRef.current) return;
     
     const binaryString = atob(base64String);
     const len = binaryString.length;
     const bytes = new Uint8Array(len);
     for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
     }
     
     const float32Data = new Float32Array(bytes.length / 2);
     const dataView = new DataView(bytes.buffer);
     for (let i = 0; i < float32Data.length; i++) {
        float32Data[i] = dataView.getInt16(i * 2, true) / 32768.0;
     }

     const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
     audioBuffer.copyToChannel(float32Data, 0);
     
     const source = audioContextRef.current.createBufferSource();
     source.buffer = audioBuffer;
     source.connect(audioContextRef.current.destination);
     source.start();
  };

  const addLog = (sender: 'user' | 'ai', text: string) => {
    setLogs(prev => [...prev.slice(-4), { sender, text }]);
  };

  return (
    <div className="flex h-full flex-col gap-6">
       <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1D2939]">Asisten Suara AI</h2>
            <p className="text-slate-500">Asisten ERP Multimodal • Perintah Suara Aktif</p>
          </div>
          <div className="flex gap-2">
             <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${isConnected ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#0D7A68] animate-pulse' : 'bg-slate-400'}`}></div>
                {isConnected ? 'LIVE TERHUBUNG' : 'OFFLINE'}
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[400px]">
          {/* Main Control Panel - Navy Dark Premium #0A1A2F */}
          <div className="rounded-2xl bg-[#0A1A2F] text-white p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-xl border border-slate-800">
             {/* Background Decoration */}
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(20,184,166,0.4)_0%,rgba(15,23,42,0)_60%)] animate-spin-slow"></div>
             </div>

             <div className={`relative z-10 w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${isSpeaking ? 'scale-110 shadow-[0_0_60px_rgba(45,212,191,0.6)]' : 'shadow-[0_0_20px_rgba(255,255,255,0.1)]'} border-4 ${isConnected ? 'border-[#0FAF94] bg-slate-800' : 'border-slate-600 bg-slate-800'}`}>
                {isConnected ? (
                   <Activity size={64} className={`text-[#01B39A] ${isSpeaking ? 'animate-bounce' : ''}`} />
                ) : (
                   <Power size={64} className="text-slate-500" />
                )}
             </div>
             
             <div className="mt-12 flex gap-4 z-10">
                {!isConnected ? (
                   <button 
                     onClick={connectToGemini}
                     className="flex items-center gap-3 bg-[#0FAF94] hover:bg-[#0D9E86] text-[#0A1A2F] px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-teal-500/30 border-none cursor-pointer"
                   >
                      <Mic size={24} />
                      Mulai Sesi
                   </button>
                ) : (
                   <button 
                     onClick={disconnect}
                     className="flex items-center gap-3 bg-rose-500 hover:bg-rose-400 text-white px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-rose-500/30 border-none cursor-pointer"
                   >
                      <MicOff size={24} />
                      Akhiri Sesi
                   </button>
                )}
             </div>
             
             <p className="mt-8 text-slate-400 text-sm font-medium">
               {isConnected ? "Mendengarkan... Coba 'Buka Farmasi' atau 'Cek stok Amoxicillin'" : "Siap untuk terhubung"}
             </p>
          </div>

          {/* Transcript / Log Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
             <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <MessageSquare className="text-[#0D7A68]" size={24} />
                <h3 className="font-bold text-[#1D2939] text-lg">Transkrip Langsung</h3>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {logs.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 opacity-60">
                     <Radio size={32} className="mb-2" />
                     <p>Belum ada aktivitas.</p>
                  </div>
                )}
                {logs.map((log, i) => (
                   <div key={i} className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed border ${
                         log.sender === 'user' 
                           ? 'bg-slate-100 text-[#1D2939] border-slate-200 rounded-tr-none' 
                           : 'bg-[#F0FDFA] text-teal-900 border-teal-100 rounded-tl-none shadow-sm'
                      }`}>
                         {log.text}
                      </div>
                   </div>
                ))}
             </div>
             
             <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-center text-slate-400">
                   Suara diproses secara real-time. Perintah dijalankan secara otomatis.
                </p>
             </div>
          </div>
       </div>
    </div>
  );
};