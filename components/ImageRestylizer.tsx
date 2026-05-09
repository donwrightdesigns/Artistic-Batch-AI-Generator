'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Upload, 
  RotateCcw, 
  Sparkles, 
  Image as ImageIcon, 
  Plus, 
  X, 
  RefreshCw,
  Info,
  Dices,
  ChevronRight,
  Download,
  Key,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STYLE_TYPES, StyleType } from '@/lib/styles';

import { useAuth } from '@/hooks/use-auth';

const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

function MadLibInput({ value, onChange, label }: { value: string, onChange: (v: string) => void, label: string }) {
  return (
    <span className="relative group inline-block bg-white/50 px-1 border-b-2 border-accent font-mono text-xs cursor-text mx-0.5">
      <input 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent font-bold text-ink focus:outline-none min-w-[40px] text-center"
        style={{ width: `${Math.max(value.length + 1, 4)}ch` }}
      />
      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-ink text-white text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
        {label}
      </span>
    </span>
  );
}

interface Analysis {
  subject: string;
  action: string;
  setting: string;
  mood: string;
  lighting: string;
  details: string;
}

interface GeneratedImage {
  url: string;
  styleName: string;
  prompt: string;
}

export default function ImageRestylizer() {
  const { user, signInWithGoogle, logout } = useAuth();
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [outputScale, setOutputScale] = useState<string>("1K");
  const [isFlexPriority, setIsFlexPriority] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('artrefinery_custom_api_key') || '';
    }
    return '';
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize AI client with current best key
  const getAiClient = useCallback(() => {
    const key = customApiKey || DEFAULT_API_KEY;
    if (!key) throw new Error("API Key missing");
    return new GoogleGenAI({ apiKey: key });
  }, [customApiKey]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImage(event.target?.result as string);
        analyzeImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const ai = getAiClient();
      const data = base64.split(',')[1];
      const mimeType = base64.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data,
                  mimeType
                }
              },
              {
                text: `Analyze this image and extract its core components for a prompt. Return JSON with:
                - subject: The main subject(s)
                - action: What is happening
                - setting: Where it is
                - mood: The emotional tone
                - lighting: Lighting conditions
                - details: Any specific notable details
                Keep each field concise (1-5 words).`
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              action: { type: Type.STRING },
              setting: { type: Type.STRING },
              mood: { type: Type.STRING },
              lighting: { type: Type.STRING },
              details: { type: Type.STRING },
            },
            required: ["subject", "action", "setting", "mood", "lighting", "details"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze image (check API key possibly).");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const randomizeAnalysis = async () => {
    if (!analysis) return;
    setIsAnalyzing(true);
    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Given the current image components: ${JSON.stringify(analysis)}, generate a set of RANDOMIZED alternative versions that keep the structure but change the content significantly (e.g. if it's a person, make it a robot or mythical creature). Return ONLY JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              action: { type: Type.STRING },
              setting: { type: Type.STRING },
              mood: { type: Type.STRING },
              lighting: { type: Type.STRING },
              details: { type: Type.STRING },
            },
            required: ["subject", "action", "setting", "mood", "lighting", "details"]
          }
        }
      });
      const result = JSON.parse(response.text || "{}");
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleStyle = (id: string) => {
    setSelectedStyles(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const generateBatch = async () => {
    if (!analysis || selectedStyles.length === 0) return;
    setIsGenerating(true);
    setError(null);
    setResults([]);

    const basePrompt = `${analysis.subject} ${analysis.action} in ${analysis.setting}, ${analysis.mood} mood, ${analysis.lighting} lighting, ${analysis.details}. `;
    const prioritySuffix = isFlexPriority ? " (High Priority Optimization: sharp focus, clear silhouettes, minimal noise)" : "";

    try {
      const ai = getAiClient();
      const batchSize = 6;
      
      for (let i = 0; i < selectedStyles.length; i += batchSize) {
        const batch = selectedStyles.slice(i, i + batchSize);
        const batchPromises = batch.map(async (styleId) => {
          const style = STYLE_TYPES.find(s => s.id === styleId)!;
          const finalPrompt = `${basePrompt} ${style.promptSuffix}${prioritySuffix}`;
          
          try {
            const response = await ai.models.generateContent({
              model: 'gemini-3.1-flash-image-preview',
              contents: {
                parts: [
                  {
                    inlineData: {
                      data: sourceImage?.split(',')[1] || '',
                      mimeType: sourceImage?.split(';')[0].split(':')[1] || 'image/png'
                    }
                  },
                  { text: `Create stylized artwork based 100% on this image's subject and style.  The output should be: ${style.name}. ${style.description}. Final prompt: ${finalPrompt}` }
                ]
              },
              config: {
                imageConfig: {
                  aspectRatio: aspectRatio as any,
                  imageSize: outputScale as any
                }
              }
            });

            const parts = response.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
              if (part.inlineData) {
                return {
                  url: `data:image/png;base64,${part.inlineData.data}`,
                  styleName: style.name,
                  prompt: finalPrompt
                };
              }
            }
          } catch (err) {
            console.error(`Failed to generate style ${styleId}:`, err);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        const validResults = batchResults.filter((r): r is GeneratedImage => r !== null);
        setResults(prev => [...prev, ...validResults]);
        
        if (i + batchSize < selectedStyles.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('429') || err?.message?.toLowerCase().includes('quota')) {
        setError("Rate limit reached. Please use your own API key in Generation Controls.");
        setShowApiKeyInput(true);
      } else {
        setError("Batch generation failed.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const finalizeImage = async (styleName: string) => {
    if (!analysis) return;
    setIsGenerating(true);
    setError(null);
    
    // Temporarily set high scale for this specific generation
    const prevScale = outputScale;
    setOutputScale("4K");

    const basePrompt = `${analysis.subject} ${analysis.action} in ${analysis.setting}, ${analysis.mood} mood, ${analysis.lighting} lighting, ${analysis.details}. `;
    const style = STYLE_TYPES.find(s => s.name === styleName)!;
    const finalPrompt = `${basePrompt} ${style.promptSuffix}`;

    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: sourceImage?.split(',')[1] || '',
                mimeType: sourceImage?.split(';')[0].split(':')[1] || 'image/png'
              }
            },
            { text: `FINAL PRODUCTION RENDER: ${style.name}. ${style.description}. High fidelity, maximum detail. Prompt: ${finalPrompt}` }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: "4K"
          }
        }
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          const newImage = {
            url: `data:image/png;base64,${part.inlineData.data}`,
            styleName: style.name,
            prompt: finalPrompt
          };
          setResults(prev => [newImage, ...prev.filter(r => r.styleName !== styleName)]);
          break;
        }
      }
    } catch (err) {
      console.error(err);
      setError("Finalization failed.");
    } finally {
      setOutputScale(prevScale);
      setIsGenerating(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('artrefinery_custom_api_key', customApiKey);
    if (!customApiKey) {
      localStorage.removeItem('artrefinery_custom_api_key');
    }
    setShowApiKeyInput(false);
  };

  const reset = () => {
    setSourceImage(null);
    setAnalysis(null);
    setSelectedStyles([]);
    setResults([]);
    setError(null);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-paper font-sans text-ink select-none relative">
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/*"
        onChange={handleUpload}
      />

      {/* Sidebar - Analysis & Reference */}
      <aside className="w-[320px] flex-shrink-0 border-r border-line p-8 flex flex-col overflow-y-auto bg-white/30 backdrop-blur-sm">
        <div className="mb-8 p-4 bg-ink/5 border border-line rounded flex items-center justify-between">
          {user ? (
            <div className="flex items-center gap-3">
              {user.photoURL && <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-ink/20" />}
              <div className="overflow-hidden">
                <div className="text-[10px] font-bold uppercase truncate">{user.displayName || 'Creator'}</div>
                <button onClick={logout} className="text-[8px] uppercase tracking-widest text-muted hover:text-accent font-bold">Sign Out</button>
              </div>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-accent transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Sign In to Cloud
            </button>
          )}
        </div>

        <div className="mb-8">
          <div className="text-[10px] italic font-normal font-[Verdana] leading-[14px] text-[#7a8ca7] uppercase tracking-widest mb-2">Analysis Module v4.2</div>
          <h1 className="font-serif text-4xl font-bold leading-none tracking-tight">
            Re-Stylizer<br />
            <span className="italic font-normal text-[#7a8ca7]">Pro</span>
          </h1>
        </div>

        <div 
          className="relative aspect-[4/3] bg-neutral-200 border border-dashed border-muted flex items-center justify-center mb-8 group cursor-pointer overflow-hidden rounded-sm"
          onClick={() => fileInputRef.current?.click()}
        >
          {sourceImage ? (
            <img src={sourceImage} alt="Input" className="w-full h-full object-cover grayscale brightness-90 border-2 border-transparent group-hover:border-ink transition-all" />
          ) : (
            <div className="text-center p-4">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted" />
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Initialize Source</div>
            </div>
          )}
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-all flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-[10px] font-black uppercase tracking-widest bg-paper px-3 py-1 border border-ink">Upload Image</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Subject Description</div>
            <div className="bg-white border border-line p-5 text-sm leading-[1.8] min-h-[140px] shadow-sm italic text-ink/70">
              {isAnalyzing ? (
                <div className="flex flex-col gap-3">
                  <div className="h-2 w-full bg-line rounded animate-pulse" />
                  <div className="h-2 w-3/4 bg-line rounded animate-pulse" />
                  <div className="h-2 w-1/2 bg-line rounded animate-pulse" />
                </div>
              ) : analysis ? (
                <>
                  A vision of <MadLibInput value={analysis.subject} onChange={(v) => setAnalysis({...analysis, subject: v})} label="subject"/> engaged in <MadLibInput value={analysis.action} onChange={(v) => setAnalysis({...analysis, action: v})} label="action"/> within the bounds of <MadLibInput value={analysis.setting} onChange={(v) => setAnalysis({...analysis, setting: v})} label="setting"/>.
                  The atmosphere feels <MadLibInput value={analysis.mood} onChange={(v) => setAnalysis({...analysis, mood: v})} label="mood"/>, bathed in <MadLibInput value={analysis.lighting} onChange={(v) => setAnalysis({...analysis, lighting: v})} label="lighting"/> with <MadLibInput value={analysis.details} onChange={(v) => setAnalysis({...analysis, details: v})} label="notable details"/>.
                </>
              ) : (
                <span className="opacity-30">No analysis active. Upload a source image to begin latent extraction.</span>
              )}
            </div>
          </div>


        </div>

        <button 
          onClick={generateBatch}
          disabled={!sourceImage || selectedStyles.length === 0 || isGenerating}
          className="mt-auto bg-ink text-white p-6 text-xs font-bold uppercase tracking-[0.15em] hover:bg-accent transition-all disabled:opacity-30 flex items-center justify-center gap-3"
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Process Batch
        </button>
      </aside>

      {/* Main Panel - Style Explorer */}
      <main className="flex-1 flex flex-col overflow-hidden bg-paper">
        {error && (
          <div className="bg-accent/10 border-b border-accent/20 px-8 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3 text-xs font-bold text-accent uppercase tracking-widest">
              <Info className="w-4 h-4" />
              {error}
            </div>
            <button onClick={() => setError(null)} className="text-muted hover:text-ink"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="border-b border-line py-3 overflow-hidden whitespace-nowrap bg-white">
          <div className="inline-block animate-[marquee_20s_linear_infinite] px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
            &bull; SELECT STYLES FOR REGENERATION &bull; SELECT STYLES FOR REGENERATION &bull; SELECT STYLES FOR REGENERATION &bull; SELECT STYLES FOR REGENERATION &bull; SELECT STYLES FOR REGENERATION &bull; SELECT STYLES FOR REGENERATION
          </div>
        </div>

        {results.length > 0 ? (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col h-full bg-[#f8f8f8]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-line">
              <div>
                <h2 className="text-xl font-serif font-bold italic">Generation Archive</h2>
                <div className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Batch complete &bull; {results.length} iterations captured</div>
              </div>
              <button 
                onClick={() => setResults([])}
                className="flex items-center gap-2 bg-ink text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-all"
              >
                <Plus className="w-4 h-4" />
                Add More Styles
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 content-start">
              {results.map((res, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-4 group"
                >
                  <div className="relative aspect-square border border-line bg-white p-1 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img src={res.url} alt={res.styleName} className="w-full h-full object-cover filter contrast-110" />
                    <div className="absolute inset-0 bg-ink/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-6 p-12 text-center backdrop-blur-sm">
                      <div>
                        <div className="text-[10px] text-accent font-bold uppercase tracking-[0.2em] mb-2">Style Identified</div>
                        <div className="text-white text-2xl font-serif font-bold italic leading-tight">{res.styleName}</div>
                      </div>
                      <div className="flex flex-col w-full gap-2">
                        <a 
                          href={res.url} 
                          download={`restylized-${res.styleName}.png`}
                          className="bg-white text-ink w-full py-3 text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download HQ
                        </a>
                        <button 
                          onClick={() => finalizeImage(res.styleName)}
                          className="border border-white/30 text-white w-full py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-ink transition-all"
                        >
                          Finalize Large Scale
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <div className="font-mono text-[9px] text-ink/40 uppercase tracking-tighter">ITERATION_{idx + 100} &bull; {aspectRatio} &bull; {outputScale}</div>
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-6 border-b border-line overflow-y-auto bg-line gap-[2px] auto-rows-max">
            {STYLE_TYPES.map((style) => {
              const isSelected = selectedStyles.includes(style.id);
              return (
                <div
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className={`relative cursor-pointer group transition-all h-[180px] overflow-hidden ${
                    isSelected ? 'ring-4 ring-inset ring-ink' : ''
                  }`}
                >
                  <div className={`absolute inset-0 ${isSelected ? 'bg-ink' : 'bg-neutral-200'} flex items-center justify-center overflow-hidden`}>
                    <img 
                      src={style.thumbnail} 
                      alt={style.name}
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isSelected ? 'opacity-40 grayscale' : 'opacity-100'}`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-20 filter grayscale transition-opacity">
                      <ImageIcon className={`w-12 h-12 ${isSelected ? 'text-white' : 'text-ink'}`} />
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-500/50 text-white backdrop-blur-[1px] border-t border-white/10">
                    <h4 className="font-bold text-[10px] uppercase leading-[1.2] tracking-widest text-center drop-shadow-sm">
                      {style.name}
                    </h4>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-white text-ink rounded-full p-0.5">
                       <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Submit New Style Tile */}
            <div
              onClick={() => window.open('mailto:don@donwrightdesigns.com?subject=New Style Suggestion for Restyler-AI', '_blank')}
              className="relative cursor-pointer group transition-all h-[180px] overflow-hidden bg-white/50 hover:bg-white flex flex-col items-center justify-center border-dashed border-2 border-line hover:border-accent"
            >
              <div className="flex flex-col items-center gap-3 group-hover:scale-110 transition-transform duration-500">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-muted group-hover:text-accent border border-line shadow-inner">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted text-center px-4 leading-relaxed group-hover:text-ink">
                  Submit an<br />Artist / Style
                </div>
              </div>
              <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/[0.03] transition-colors" />
            </div>
          </div>
        )}

        <div className="h-[140px] border-t border-line p-8 flex flex-col flex-shrink-0 bg-paper/50">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4 flex items-center gap-2">
            Selected Batch ({selectedStyles.length})
            {selectedStyles.length > 0 && <button onClick={() => setSelectedStyles([])} className="ml-auto underline hover:text-accent">Clear Selection</button>}
          </div>
          <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[60px]">
             {selectedStyles.length > 0 ? selectedStyles.map(id => (
              <span key={id} className="text-[9px] bg-line px-2 py-1 uppercase font-bold tracking-widest border border-ink/10 flex items-center gap-1">
                {id.replace(/-/g, '_')}
                <button onClick={(e) => { e.stopPropagation(); toggleStyle(id); }} className="hover:text-accent"><X className="w-3 h-3" /></button>
              </span>
            )) : <span className="text-[11px] italic text-muted">No styles selected for generation...</span>}
          </div>
          <div className="mt-auto text-[11px] text-muted italic">Ready for high-resolution synthesis using analyzed metadata.</div>
        </div>
      </main>

      {/* Control Panel - Parameters */}
      <aside className="w-[240px] flex-shrink-0 border-l border-line p-8 bg-[#F5F5F3] flex flex-col overflow-y-auto">
        <div className="mb-10">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4 flex items-center gap-2">
            Output Dimensions
            <Info className="w-3 h-3 opacity-50" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["1:1", "4:3", "3:4", "16:9", "9:16"].map(ratio => (
              <button 
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`py-2 text-[10px] font-bold border transition-all ${aspectRatio === ratio ? 'bg-ink text-white border-ink' : 'bg-white border-line hover:border-ink'}`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">Export Quality</div>
          <div className="space-y-2">
            {[
              { id: '1K', label: '1K - PREVIEW' },
              { id: '2K', label: '2K - SOCIAL' },
              { id: '4K', label: '4K - PRINT' }
            ].map(size => (
              <button 
                key={size.id}
                onClick={() => setOutputScale(size.id)}
                className={`w-full text-left p-3 border transition-all relative overflow-hidden group ${outputScale === size.id ? 'border-accent bg-accent/5' : 'border-line bg-white hover:border-ink'}`}
              >
                <div className={`text-[10px] font-black uppercase tracking-widest ${outputScale === size.id ? 'text-accent' : 'text-ink'}`}>{size.label}</div>
                {outputScale === size.id && <div className="absolute top-0 right-0 w-2 h-full bg-accent" />}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-6">Workflow Controls</div>
        
        <div className="space-y-4 mb-12">
          <button 
            onClick={() => setIsFlexPriority(!isFlexPriority)}
            className={`w-full border p-3 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isFlexPriority ? 'bg-accent border-accent text-white shadow-lg' : 'border-ink hover:bg-ink hover:text-white'}`}
          >
            <Sparkles className={`w-4 h-4 ${isFlexPriority ? 'animate-pulse' : ''}`} />
            Flex Priority: {isFlexPriority ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={randomizeAnalysis}
            className="w-full border border-ink p-3 text-[10px] font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Dices className="w-4 h-4" />
            Randomize Vars
          </button>
          <button 
            onClick={reset}
            className="w-full border border-ink p-3 text-[10px] font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Session
          </button>
          
          <button 
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className={`w-full border border-ink p-3 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${customApiKey ? 'bg-green-100 border-green-600 text-green-700' : 'hover:bg-ink hover:text-white'}`}
          >
            {customApiKey ? <ShieldCheck className="w-4 h-4" /> : <Key className="w-4 h-4" />}
            {customApiKey ? 'Custom Key Active' : 'Use Private Key'}
          </button>
        </div>

        <AnimatePresence>
          {showApiKeyInput && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden space-y-3"
            >
              <div className="text-[9px] text-muted font-bold uppercase leading-tight italic">
                Free tier quota limited. Enter your own Gemini API key for unlimited generation.
              </div>
              <input 
                type="password"
                placeholder="Enter Gemini API Key"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                className="w-full bg-paper border border-line p-2 text-xs font-mono focus:outline-none focus:border-ink shadow-inner"
              />
              <div className="flex gap-2">
                <button onClick={handleSaveApiKey} className="flex-1 bg-ink text-white text-[10px] font-bold py-2 uppercase tracking-widest">Apply Key</button>
                <button onClick={() => { setCustomApiKey(''); localStorage.removeItem('artrefinery_custom_api_key'); setShowApiKeyInput(false); }} className="px-2 text-muted hover:text-accent"><X className="w-4 h-4" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>



        <div className="mt-auto pt-10">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">System Status</div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-green-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Neural Core Active
          </div>
          <div className="mt-2 text-[9px] text-muted font-mono leading-tight">
            API_SOURCE: {customApiKey ? 'PRIVATE_USER' : 'SYSTEM_SHARED'}
          </div>
        </div>
      </aside>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3%); }
        }
      `}</style>
    </div>
  );
}

