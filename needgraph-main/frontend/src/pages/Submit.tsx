// Add VITE_CLAUDE_API_KEY=your_key to .env for full AI. Without it, offline keyword analysis is used.
import { useState, useRef, useEffect } from 'react';
import { Mic, Square, LocateFixed, Send, MapPin as MapPinIcon, Bot, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmSubmitModal from '../components/ConfirmSubmitModal';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || '';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

interface AnalysisResult {
  needType: string;
  severityScore: number;
  peopleAffected: number;
  translatedDescription: string;
  confidence: number;
  urgencyFlag: boolean;
  keywords: string[];
  originalLanguageDetected: string;
  suggestedActions: string[];
  locationMentioned: string | null;
}

const NEED_TYPE_MAP: Record<string, string> = {
  'Food Scarcity': 'Food Insecurity', 'Food Insecurity': 'Food Insecurity',
  'Water Shortage': 'Water Scarcity', 'Water Scarcity': 'Water Scarcity',
  'Medical Emergency': 'Healthcare', 'Healthcare': 'Healthcare',
  'Education Access': 'School Dropout', 'School Dropout': 'School Dropout',
  'Shelter Crisis': 'Healthcare', 'Livelihood Loss': 'Unemployment',
  'Domestic Violence': 'Domestic Violence', 'Mental Health': 'Mental Health',
  'Sanitation Issue': 'Healthcare', 'Other': 'Healthcare',
};

function localFallbackAnalysis(text: string): AnalysisResult {
  const lower = text.toLowerCase();
  const rules = [
    { keywords: ['food','hunger','eat','starving','ration','rice','hungry','meals','খাবার','తిండి','ఆహారం','अन्नम','खाना','भूख','राशन'], needType: 'Food Scarcity', severity: 58 },
    { keywords: ['water','drinking','thirsty','borewell','tap','well','నీళ్ళు','నీరు','पानी','प्यास'], needType: 'Water Shortage', severity: 62 },
    { keywords: ['sick','hospital','doctor','medicine','fever','injury','pain','dying','అనారోగ్యం','జ్వరం','बीमार','दवाई','अस्पताल'], needType: 'Medical Emergency', severity: 72 },
    { keywords: ['flood','rain','house','shelter','roof','displaced','homeless','వరద','ఇల్లు','बाढ़','घर','छत'], needType: 'Shelter Crisis', severity: 68 },
    { keywords: ['job','money','income','debt','farmer','crop','unemployed','పని','డబ్బు','नौकरी','पैसा','किसान'], needType: 'Livelihood Loss', severity: 48 },
    { keywords: ['school','children','education','books','dropout','study','పాఠశాల','చదువు','स्कूल','पढ़ाई'], needType: 'Education Access', severity: 38 },
    { keywords: ['violence','abuse','hit','beating','కొట్టు','हिंसा','मारपीट'], needType: 'Domestic Violence', severity: 70 },
    { keywords: ['mental','stress','depress','anxiety','suicide','మానసిక','तनाव','अवसाद'], needType: 'Mental Health', severity: 60 },
  ];
  let best = { needType: 'Other', severity: 35 }; let maxHits = 0;
  for (const r of rules) { const h = r.keywords.filter(k => lower.includes(k)).length; if (h > maxHits) { maxHits = h; best = r; } }
  let sev = best.severity;
  if (['urgent','emergency','critical','dying','severe','అత్యవసరం','तुरंत','आपातकाल'].some(w => lower.includes(w))) sev = Math.min(sev + 20, 95);
  const numMatch = text.match(/(\d+)/);
  const people = numMatch ? parseInt(numMatch[1]) : (lower.includes('village') ? 150 : lower.includes('family') ? 5 : 10);
  const kws = rules.flatMap(r => r.keywords.slice(0, 2)).filter(k => lower.includes(k)).slice(0, 5);
  return {
    needType: best.needType, severityScore: sev, peopleAffected: people,
    translatedDescription: `Field report: ${best.needType.toLowerCase()} affecting ~${people} people. ${sev > 65 ? 'Urgent attention required.' : 'Follow-up within 48h recommended.'} Offline analysis — verify manually.`,
    confidence: maxHits > 2 ? 55 : maxHits > 0 ? 35 : 20, urgencyFlag: sev > 65,
    keywords: kws, originalLanguageDetected: /[\u0C00-\u0C7F]/.test(text) ? 'Telugu' : /[\u0900-\u097F]/.test(text) ? 'Hindi' : 'English',
    suggestedActions: [`Assign ${best.needType} specialist`, sev > 65 ? 'Escalate to emergency team' : 'Schedule field visit within 48h'],
    locationMentioned: null,
  };
}

const defaultIcon = L.icon({
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

function LocationPicker({ position, setPosition }: any) {
  useMapEvents({
    click(e) { setPosition(e.latlng); },
  });
  return position ? <Marker position={position} icon={defaultIcon} /> : null;
}

function MapUpdater({ center }: { center: L.LatLng | null }) {
  const map = useMap();
  
  useEffect(() => {
    // Force Leaflet to recalculate its container size after the flex layout resolves
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (center) {
      map.invalidateSize();
      map.setView(center, 14, { animate: false });
    }
  }, [center, map]);
  return null;
}

export default function Submit() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [position, setPosition] = useState<L.LatLng | null>(new L.LatLng(17.3850, 78.4867));
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    needType: '',
    severity: 50,
    affectedCount: 1,
    description: '',
    language: 'telugu',
    predictedCascade: '',
  });

  const timerRef = useRef<number>(undefined);

  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // AI analysis state
  const [confidence, setConfidence] = useState<number | null>(null);
  const [urgencyFlag, setUrgencyFlag] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const [analysisError, setAnalysisError] = useState('');

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = formData.language === 'english' ? 'en-IN' : formData.language === 'hindi' ? 'hi-IN' : 'te-IN';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone permissions.');
          stopRecording();
        }
      };

      recognitionRef.current = recognition;
    }
  }, [formData.language]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }
    setTranscript('');
    setAudioBlob(null);
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(timerRef.current);
    if (transcript.trim() || recordingTime > 0) {
      const mockBlob = new Blob(['mock audio data'], { type: 'audio/webm' });
      setAudioBlob(mockBlob);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const applyResult = (r: AnalysisResult) => {
    const mapped = NEED_TYPE_MAP[r.needType] || r.needType;
    setFormData(prev => ({
      ...prev, needType: mapped, severity: r.severityScore,
      affectedCount: r.peopleAffected, description: r.translatedDescription,
      predictedCascade: r.urgencyFlag ? 'High risk of cascade events within 14 days if unresolved.' : '',
    }));
    setConfidence(r.confidence); setUrgencyFlag(r.urgencyFlag);
    setKeywords(r.keywords || []); setSuggestedActions(r.suggestedActions || []);
    if (r.locationMentioned) setSearchQuery(r.locationMentioned);
  };

  const analyzeWithAI = async (rawText: string) => {
    if (!rawText || rawText.trim().length < 2) return;
    setIsAnalyzing(true); setAnalysisError(''); setKeywords([]); setSuggestedActions([]);
    const sysPrompt = `You are a humanitarian crisis analyst. Analyze field reports (Telugu/Hindi/English/mixed). Extract structured data. Pick needType from: "Food Scarcity"|"Water Shortage"|"Medical Emergency"|"Shelter Crisis"|"Education Access"|"Livelihood Loss"|"Sanitation Issue"|"Domestic Violence"|"Mental Health"|"Other". severityScore 0-100. peopleAffected integer. translatedDescription 2-3 English sentences. confidence 0-100. urgencyFlag true if severity>65. keywords 3-5 strings. suggestedActions 2 strings. locationMentioned string|null. originalLanguageDetected string. Return ONLY valid JSON, no markdown.`;
    const userPrompt = `Analyze (language hint: ${formData.language}): "${rawText}"`;
    try {
      if (!CLAUDE_API_KEY) throw new Error('No API key');
      const res = await fetch(CLAUDE_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': CLAUDE_API_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 1024, system: sysPrompt, messages: [{ role: 'user', content: userPrompt }] }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const cleaned = (data.content?.[0]?.text || '').replace(/```json|```/g, '').trim();
      applyResult(JSON.parse(cleaned));
      toast.success('AI analysis complete', { style: { background: '#111118', color: '#4AAF85', border: '1px solid #1E1E2E' } });
    } catch (err) {
      console.warn('Claude API unavailable, using fallback:', err);
      applyResult(localFallbackAnalysis(rawText));
      setAnalysisError(CLAUDE_API_KEY ? 'Used offline analysis. Results may be less accurate.' : 'No API key. Using keyword analysis. Add VITE_CLAUDE_API_KEY to .env for full AI.');
      toast.success('Analysis complete (offline mode)', { style: { background: '#111118', color: '#D4874A', border: '1px solid #1E1E2E' } });
    } finally { setIsAnalyzing(false); }
  };

  const simulateAnalysis = () => {
    if (!transcript && !audioBlob) return;
    analyzeWithAI(transcript || 'general need report');
  };

  const handleSearchLocation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Hyderabad, India')}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const newPos = new L.LatLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
        setPosition(newPos);
        toast.success('Location found');
      } else {
        toast.error('Location not found. Try a different area name.');
      }
    } catch (err) {
      toast.error('Failed to search location.');
    }
    setIsSearching(false);
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      <div>
        <h1 className="text-[20px] font-semibold text-[#F0F0F5]">Field Report Submit</h1>
        <p className="text-[12px] text-[#55556A]">Record audio or enter data manually for AI processing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Voice Input Card */}
          <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[20px_24px]">
            <h2 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-4 flex items-center gap-2">
              <Mic className="w-4 h-4" /> Voice Input
            </h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="flex-1 bg-[#0A0A0F] text-[#F0F0F5] text-[14px] px-3 py-2 rounded-[6px] border border-[#1E1E2E]"
                >
                  <option value="english">English</option>
                  <option value="telugu">Telugu</option>
                  <option value="hindi">Hindi</option>
                </select>
              </div>

              <div className="flex flex-col items-center justify-center py-6 border border-dashed border-[#2A2A40] rounded-[8px] bg-[#0A0A0F]">
                {isRecording ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    onClick={stopRecording}
                    className="w-16 h-16 rounded-full bg-[#E05555] flex items-center justify-center cursor-pointer shadow-lg"
                  >
                    <Square className="w-6 h-6 text-white fill-current" />
                  </motion.div>
                ) : (
                  <button
                    onClick={startRecording}
                    className="w-16 h-16 rounded-full bg-[#6C63FF] hover:bg-[#5a52d9] transition-colors flex items-center justify-center"
                  >
                    <Mic className="w-6 h-6 text-white" />
                  </button>
                )}
                <div className="mt-4 text-[14px] font-medium text-[#F0F0F5] text-center px-4">
                  {isRecording ? (
                    <div>
                      <div>{formatTime(recordingTime)}</div>
                      {transcript && <div className="text-[12px] text-[#8A8A9A] mt-2 italic">"{transcript}"</div>}
                    </div>
                  ) : audioBlob || transcript ? (
                    <div>
                      <div>Audio captured</div>
                      {transcript && <div className="text-[12px] text-[#8A8A9A] mt-2 italic line-clamp-2">"{transcript}"</div>}
                    </div>
                  ) : (
                    'Tap to speak'
                  )}
                </div>
              </div>

              <button
                onClick={simulateAnalysis}
                disabled={(!audioBlob && !transcript) || isAnalyzing || isRecording}
                className={`w-full py-[10px] rounded-[6px] text-[14px] font-medium flex items-center justify-center gap-2 transition-colors ${(!audioBlob && !transcript) || isRecording
                  ? 'bg-[#1E1E2E] text-[#55556A] cursor-not-allowed'
                  : 'bg-[#6C63FF] text-white hover:bg-[#5a52d9]'
                  }`}
              >
                {isAnalyzing ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Processing...</>
                ) : (
                  <><Bot className="w-4 h-4" /> Analyse with AI</>
                )}
              </button>
            </div>
          </div>

          {/* Map Card */}
          <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] overflow-hidden flex flex-col h-[300px]">
            <div className="p-4 border-b border-[#1E1E2E] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" /> Location Assignment
                </h2>
                <button
                  onClick={() => setPosition(new L.LatLng(17.3850, 78.4867))}
                  className="text-[11px] text-[#8A8A9A] hover:text-[#F0F0F5] flex items-center gap-1"
                >
                  <LocateFixed className="w-3 h-3" /> Reset
                </button>
              </div>
              <form onSubmit={handleSearchLocation} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter location (e.g., Kukatpally)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-[#0A0A0F] text-[#F0F0F5] text-[13px] px-3 py-1.5 rounded-[4px] border border-[#1E1E2E] placeholder-[#55556A]"
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-3 py-1.5 bg-[#1E1E2E] text-[#F0F0F5] text-[13px] rounded-[4px] hover:bg-[#2A2A40] transition-colors disabled:opacity-50"
                >
                  {isSearching ? '...' : 'Search'}
                </button>
              </form>
            </div>
            <div className="flex-1 bg-[#0A0A0F] map-container-wrapper m-4">
              <MapContainer center={[17.3850, 78.4867]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <MapUpdater center={position} />
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Form Details Card */}
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[20px_24px] flex flex-col">
          <h2 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-6">Structured Data</h2>

          <div className="space-y-5 flex-1 relative">
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 bg-[#111118]/80 backdrop-blur-[2px] flex items-center justify-center border border-[#1E1E2E] rounded-[8px]"
                >
                  <div className="text-center">
                    <div className="text-[#6C63FF] text-[14px] font-medium mb-2">Transcribing & Classifying...</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Urgency Banner */}
            {urgencyFlag && (
              <div className="bg-[#f43f5e]/10 border border-[#f43f5e]/40 rounded-[8px] p-3 mb-4 flex items-center gap-2 text-[#f43f5e] text-[13px] font-semibold animate-pulse">
                ⚠ URGENT: Immediate escalation recommended
              </div>
            )}

            {/* Confidence Badge */}
            {confidence !== null && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide mb-3 border ${
                confidence > 75 ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]'
                : confidence > 50 ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]'
                : 'bg-[#f43f5e]/10 border-[#f43f5e]/30 text-[#f43f5e]'
              }`}>
                {confidence > 75 ? '● High' : confidence > 50 ? '◐ Medium' : '○ Low'} Confidence — {confidence}%
              </div>
            )}

            {/* Analysis Error */}
            {analysisError && (
              <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-[8px] p-2.5 mb-3 text-[#f59e0b] text-[12px]">
                {analysisError}
              </div>
            )}

            <div>
              <label className="block text-[12px] text-[#8A8A9A] mb-1.5">Identified Need Type</label>
              <select
                value={formData.needType}
                onChange={(e) => setFormData({ ...formData, needType: e.target.value })}
                className="w-full bg-[#0A0A0F] text-[#F0F0F5] text-[14px] px-3 py-2 rounded-[6px] border border-[#1E1E2E]"
              >
                <option value="">Select type...</option>
                <option value="Food Insecurity">Food Insecurity</option>
                <option value="School Dropout">School Dropout</option>
                <option value="Mental Health">Mental Health</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Water Scarcity">Water Scarcity</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-[12px] text-[#8A8A9A]">Severity Score</label>
                <span className="text-[12px] font-medium" style={{ color: formData.severity >= 80 ? '#E05555' : formData.severity >= 60 ? '#D4874A' : '#4AAF85' }}>
                  {formData.severity}/100
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                className="w-full accent-[#6C63FF] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[12px] text-[#8A8A9A] mb-1.5">People Affected</label>
              <input
                type="number"
                value={formData.affectedCount}
                onChange={(e) => setFormData({ ...formData, affectedCount: parseInt(e.target.value) })}
                className="w-full bg-[#0A0A0F] text-[#F0F0F5] text-[14px] px-3 py-2 rounded-[6px] border border-[#1E1E2E]"
              />
            </div>

            <div>
              <label className="block text-[12px] text-[#8A8A9A] mb-1.5">Translated Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#0A0A0F] text-[#F0F0F5] text-[14px] px-3 py-2 rounded-[6px] border border-[#1E1E2E] resize-none"
                placeholder="Details of the situation..."
              />
            </div>

            {/* Keyword Chips */}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {keywords.map((kw, i) => (
                  <span key={i} className="bg-[#6366f1]/10 border border-[#6366f1]/25 text-[#a5b4fc] rounded-full px-2.5 py-0.5 text-[11px] font-medium">{kw}</span>
                ))}
              </div>
            )}

            {formData.predictedCascade && (
              <div className="bg-[#1F1010] border border-[#E05555]/30 p-3 rounded-[6px] flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-[#E05555] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12px] font-medium text-[#E05555] mb-0.5">AI Cascade Warning</div>
                  <div className="text-[13px] text-[#F0F0F5]">{formData.predictedCascade}</div>
                </div>
              </div>
            )}

            {/* Suggested Actions */}
            {suggestedActions.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] tracking-[0.12em] text-[#55556A] uppercase mb-2">Suggested Actions</p>
                {suggestedActions.map((a, i) => (
                  <div key={i} className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-[6px] p-2.5 mb-1.5 text-[12px] text-[#8A8A9A] flex gap-2">
                    <span className="text-[#6C63FF]">{i+1}.</span> {a}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="w-full py-[10px] mt-6 rounded-[6px] bg-[#6C63FF] text-white text-[14px] font-medium hover:bg-[#5a52d9] flex justify-center items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" /> Finalize Submit
          </button>
        </div>
      </div>

      <ConfirmSubmitModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onSubmitAnother={() => {
          setFormData({ needType: '', severity: 50, affectedCount: 1, description: '', language: 'telugu', predictedCascade: '' });
          setTranscript('');
          setAudioBlob(null);
          setConfidence(null);
          setUrgencyFlag(false);
          setKeywords([]);
          setSuggestedActions([]);
          setAnalysisError('');
        }}
        needType={formData.needType}
        severityScore={formData.severity}
        peopleAffected={formData.affectedCount}
        description={formData.description}
        transcript={transcript || undefined}
        locationAddress={searchQuery || `${position?.lat.toFixed(4) ?? '17.3850'}, ${position?.lng.toFixed(4) ?? '78.4867'}`}
        locationLat={position?.lat ?? 17.3850}
        locationLng={position?.lng ?? 78.4867}
      />
    </div>
  );
}
