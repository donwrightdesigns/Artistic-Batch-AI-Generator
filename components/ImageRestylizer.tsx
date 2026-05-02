'use client';

import React, { useState, useCallback, useRef } from 'react';
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
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STYLE_TYPES, StyleType } from '@/lib/styles';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });

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
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setError("Failed to analyze image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const randomizeAnalysis = async () => {
    if (!analysis) return;
    setIsAnalyzing(true);
    try {
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

    try {
      const batchSize = 3;
      
      for (let i = 0; i < selectedStyles.length; i += batchSize) {
        const batch = selectedStyles.slice(i, i + batchSize);
        const batchPromises = batch.map(async (styleId) => {
          const style = STYLE_TYPES.find(s => s.id === styleId)!;
          const finalPrompt = `${basePrompt} ${style.promptSuffix}`;
          
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
                  { text: `Transform this image into the following style: ${style.name}. ${style.description}. Final prompt: ${finalPrompt}` }
                ]
              },
              config: {
                imageConfig: {
                  aspectRatio: "1:1",
                  imageSize: "1K"
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
    } catch (err) {
      console.error(err);
      setError("Batch generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setSourceImage(null);
    setAnalysis(null);
    setSelectedStyles([]);
    setResults([]);
    setError(null);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-paper font-sans text-ink select-none">
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/*"
        onChange={handleUpload}
      />

      {/* Sidebar - Analysis & Reference */}
      <aside className="w-[320px] flex-shrink-0 border-r border-line p-8 flex flex-col overflow-y-auto">
        <div className="mb-8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Analysis Module v4.2</div>
          <h1 className="font-serif text-4xl font-bold leading-none tracking-tight">
            Re-Stylizer<br />
            <span className="italic font-normal">Pro</span>
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

          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Metadata Logs</div>
            <div className="font-mono text-[10px] space-y-1 text-ink/60 p-4 bg-ink/[0.03] border border-line rounded">
              <div>LATENT_SPACE_COORD: {sourceImage ? '0.442' : '----'}</div>
              <div>SUBJECT_CONF: {sourceImage ? '98.4%' : '----'}</div>
              <div>PROCESSOR: GEMINI_3_FLASH</div>
              <div>BATCH_READY: {selectedStyles.length > 0 ? 'TRUE' : 'FALSE'}</div>
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
        <div className="border-b border-line py-3 overflow-hidden whitespace-nowrap bg-white">
          <div className="inline-block animate-[marquee_20s_linear_infinite] px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
            &bull; SELECT STYLES FOR REGENERATION &bull; SELECT STYLES FOR REGENERATION &bull; SELECT STYLES FOR REGENERATION &bull; SELECT STYLES FOR REGENERATION &bull; SELECT STYLES FOR REGENERATION &bull; SELECT STYLES FOR REGENERATION
          </div>
        </div>

        {results.length > 0 ? (
          <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 gap-8 content-start h-full">
            {results.map((res, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="group relative aspect-square border border-line bg-white p-1">
                  <img src={res.url} alt={res.styleName} className="w-full h-full object-cover filter contrast-110" />
                  <a 
                    href={res.url} 
                    download={`restylized-${res.styleName}.png`}
                    className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Download className="w-10 h-10 text-white" />
                  </a>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-muted leading-none mb-1 tracking-widest">{res.styleName}</div>
                    <div className="font-mono text-[9px] text-ink/40">RESULT_ID_{idx}.PNG</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-6 border-b border-line overflow-y-auto bg-line gap-px auto-rows-max">
            {STYLE_TYPES.map((style) => {
              const isSelected = selectedStyles.includes(style.id);
              return (
                <div
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className={`relative p-5 cursor-pointer flex flex-col gap-4 group transition-all h-[200px] ${
                    isSelected ? 'bg-ink text-white' : 'bg-paper hover:bg-white'
                  }`}
                >
                  <div className={`aspect-square w-full mb-auto ${isSelected ? 'bg-white/10' : 'bg-neutral-200'} relative overflow-hidden group-hover:scale-95 transition-transform`}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 filter grayscale">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-[10px] uppercase leading-[1.2] tracking-tighter">
                      {style.name.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br /></React.Fragment>)}
                    </h4>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                       <Plus className="w-3 h-3 rotate-45" />
                    </div>
                  )}
                </div>
              );
            })}
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
      <aside className="w-[240px] flex-shrink-0 border-l border-line p-8 bg-[#F5F5F3] flex flex-col">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-6">Generation Controls</div>
        
        <div className="space-y-4 mb-12">
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
        </div>

        <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-6">Style Parameters</div>
        <div className="space-y-6">
          <ParameterSlider label="Grain Intensity" value={75} />
          <ParameterSlider label="Line Weight" value={30} />
          <ParameterSlider label="Color Bleed" value={12} />
        </div>

        <div className="mt-auto pt-10">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">System Status</div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-green-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Neural Core Active
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

function ParameterSlider({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-bold">
        <span>{label}</span>
        <span className="text-muted">{value}%</span>
      </div>
      <div className="h-[2px] bg-line relative">
        <div className="absolute top-0 left-0 h-full bg-ink" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
