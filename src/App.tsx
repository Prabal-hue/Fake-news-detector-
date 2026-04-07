import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  Info, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Newspaper,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { analyzeNews, type AnalysisResult } from "./services/geminiService";
import { cn } from "./lib/utils";

export default function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not defined. The app will not be able to analyze news.");
    }
  }, []);

  const handleAnalyze = async () => {
    if (!process.env.GEMINI_API_KEY) {
      setError("API Key is missing. Please ensure the GEMINI_API_KEY is set in the environment.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Please provide both a title and article content.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeNews(title, content);
      setResult(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setTitle("");
    setContent("");
    setResult(null);
    setError(null);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "Real": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "Fake": return "text-rose-600 bg-rose-50 border-rose-200";
      case "Suspicious": return "text-amber-600 bg-amber-50 border-amber-200";
      case "Satire": return "text-purple-600 bg-purple-50 border-purple-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "Real": return <ShieldCheck className="w-6 h-6" />;
      case "Fake": return <ShieldAlert className="w-6 h-6" />;
      case "Suspicious": return <AlertTriangle className="w-6 h-6" />;
      case "Satire": return <Info className="w-6 h-6" />;
      default: return <HelpCircle className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Newspaper className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">VeriNews <span className="text-indigo-600">AI</span></h1>
          </div>
          <button 
            onClick={reset}
            className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Analyze News Article</h2>
              <p className="text-slate-500">Paste the headline and content of any news article to check its credibility.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Article Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter the headline..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Article Content</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste the full article text here..."
                  rows={10}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2",
                  isAnalyzing 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-200"
                )}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing with Gemini...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Detect Misinformation
                  </>
                )}
              </button>
            </div>

            {/* Educational Section */}
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
              <h3 className="text-indigo-900 font-bold flex items-center gap-2 mb-3">
                <Info className="w-5 h-5" />
                How it works
              </h3>
              <p className="text-indigo-800/80 text-sm leading-relaxed">
                Our AI model analyzes linguistic patterns, cross-references claims with known facts, and identifies common misinformation techniques such as sensationalism, logical fallacies, and extreme bias.
              </p>
            </div>

            {/* Monetization Section */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">VeriNews Pro</h3>
              </div>
              <p className="text-indigo-100 text-sm mb-6">
                Get unlimited scans, deep-dive bias reports, and bulk article analysis.
              </p>
              <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                Upgrade for $9.99/mo
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-6"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-indigo-100 rounded-full"></div>
                    <div className="w-24 h-24 border-4 border-t-indigo-600 rounded-full animate-spin absolute top-0 left-0"></div>
                    <Search className="w-10 h-10 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-800">Scanning Article</h3>
                    <p className="text-slate-500 text-sm">Cross-referencing claims and analyzing tone...</p>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Verdict Card */}
                  <div className={cn("rounded-2xl border p-6 shadow-sm", getVerdictColor(result.verdict))}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getVerdictIcon(result.verdict)}
                        <span className="text-lg font-bold uppercase tracking-wider">{result.verdict}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold uppercase opacity-60">Confidence</div>
                        <div className="text-2xl font-black">{result.confidenceScore}%</div>
                      </div>
                    </div>
                    <p className="text-sm font-medium leading-relaxed opacity-90">
                      {result.reasoning}
                    </p>
                  </div>

                  {/* Trust Score Gauge */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Credibility Score</h3>
                    <div className="relative flex justify-center items-center py-4">
                      <svg className="w-48 h-48 -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          fill="none"
                          stroke="#f1f5f9"
                          strokeWidth="12"
                        />
                        <motion.circle
                          cx="96"
                          cy="96"
                          r="80"
                          fill="none"
                          stroke={result.confidenceScore > 70 ? "#10b981" : result.confidenceScore > 40 ? "#f59e0b" : "#f43f5e"}
                          strokeWidth="12"
                          strokeDasharray="502.4"
                          initial={{ strokeDashoffset: 502.4 }}
                          animate={{ strokeDashoffset: 502.4 - (502.4 * result.confidenceScore) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-800">{result.confidenceScore}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase">Reliability</span>
                      </div>
                    </div>
                  </div>

                  {/* Bias Analysis */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Bias Analysis</h3>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      "{result.biasAnalysis}"
                    </p>
                  </div>

                  {/* Key Claims */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Key Claims Verification</h3>
                    <div className="space-y-3">
                      {result.keyClaims.map((claim, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                          {claim.status === "Verified" ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          ) : claim.status === "False" ? (
                            <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                          ) : (
                            <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-800">{claim.claim}</p>
                            <span className={cn(
                              "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                              claim.status === "Verified" ? "bg-emerald-100 text-emerald-700" :
                              claim.status === "False" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                            )}>
                              {claim.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Analysis */}
                  {result.technicalAnalysis && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
                      <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        AI Code Execution Log
                      </h3>
                      <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800">
                        <p className="leading-relaxed">
                          {result.technicalAnalysis}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-3 italic">
                        The AI executed internal Python code to verify linguistic patterns and statistical anomalies.
                      </p>
                    </div>
                  )}

                  {/* Suggestions */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Next Steps</h3>
                    <ul className="space-y-3">
                      {result.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                          <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white/50 rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-400">No Analysis Yet</h3>
                  <p className="text-slate-400 text-sm max-w-[200px] mx-auto">
                    Results will appear here after you run the detector.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-12 border-t border-slate-200 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50 grayscale">
            <Newspaper className="w-5 h-5" />
            <span className="text-sm font-bold">VeriNews AI</span>
          </div>
          <p className="text-slate-400 text-xs text-center md:text-left">
            Disclaimer: This tool uses AI to analyze content. Always cross-reference with multiple trusted sources.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors text-sm font-medium flex items-center gap-1">
              API Docs <ExternalLink className="w-3 h-3" />
            </a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors text-sm font-medium">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

