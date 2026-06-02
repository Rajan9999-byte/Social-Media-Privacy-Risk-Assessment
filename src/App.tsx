import { useState, useEffect } from 'react';
import { SocialProfile, AssessmentResult } from './types/assessment';
import { createSampleAssessment } from './data/sampleData';
import FileUploader from './components/FileUploader';
import RiskAnalyzer from './components/RiskAnalyzer';
import ScoreCard from './components/ScoreCard';
import RemediationList from './components/RemediationList';
import AwarenessPanel from './components/AwarenessPanel';

function App() {
  const [currentProfile, setCurrentProfile] = useState<SocialProfile | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [history, setHistory] = useState<AssessmentResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('privacy-assessment-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('privacy-assessment-history', JSON.stringify(history.slice(0, 20)));
    }
  }, [history]);

  const handleProfileLoaded = (profile: SocialProfile) => {
    setCurrentProfile(profile);
    setResult(null);
  };

  const handleAnalysisComplete = (analysisResult: AssessmentResult) => {
    setResult(analysisResult);
    setHistory(prev => [analysisResult, ...prev.slice(0, 19)]);
  };

  const handleLoadSample = () => {
    const sample = createSampleAssessment();
    setCurrentProfile(sample.profile);
    setResult(sample);
    setHistory(prev => [sample, ...prev.slice(0, 19)]);
  };

  const handleExport = () => {
    if (!result) return;
    
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `privacy-assessment-${result.profile.username}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleNewAnalysis = () => {
    setCurrentProfile(null);
    setResult(null);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all assessment history?')) {
      setHistory([]);
      localStorage.removeItem('privacy-assessment-history');
      setShowHistory(false);
    }
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-800">Privacy Risk Assessment</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 text-sm text-gray-700 hover:text-indigo-600 hover:bg-white/50 rounded-lg transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History ({history.length})
              </button>
              
              {result && (
                <button
                  onClick={handleExport}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-indigo-600 hover:bg-white/50 rounded-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-20 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div>
          <div className="relative w-80 bg-white/95 backdrop-blur-md shadow-2xl overflow-y-auto rounded-l-2xl">
            <div className="p-4 border-b border-gray-200/50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur">
              <h2 className="font-semibold text-gray-800">Assessment History</h2>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No assessments yet</p>
              ) : (
                <>
                  <button
                    onClick={handleClearHistory}
                    className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 mb-4"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear History
                  </button>
                  
                  {history.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentProfile(item.profile);
                        setResult(item);
                        setShowHistory(false);
                      }}
                      className="w-full p-3 text-left bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all border border-gray-100 hover:border-indigo-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">@{item.profile.username}</span>
                        <span className={`text-sm font-bold ${
                          item.overallScore >= 80 ? 'text-green-600' :
                          item.overallScore >= 60 ? 'text-yellow-600' :
                          item.overallScore >= 40 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {item.overallScore}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(item.timestamp).toLocaleDateString()} • {item.profile.platform}
                      </p>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentProfile ? (
          /* Upload State */
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md">
                Analyze Your Social Media Privacy
              </h2>
              <p className="text-white/90 text-lg">
                Upload your profile data (JSON or CSV) to detect privacy risks and get actionable recommendations.
              </p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
              <FileUploader onProfileLoaded={handleProfileLoaded} />
            </div>
            
            <div className="text-center">
              <button
                onClick={handleLoadSample}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-xl transition-all hover:scale-105"
              >
                Or try with sample data →
              </button>
            </div>
          </div>
        ) : !result ? (
          /* Analysis State */
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <button
                onClick={handleNewAnalysis}
                className="text-sm text-white/80 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Upload different file
              </button>
            </div>
            
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
              <RiskAnalyzer profile={currentProfile} onAnalysisComplete={handleAnalysisComplete} />
            </div>
          </div>
        ) : (
          /* Results State */
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={handleNewAnalysis}
                  className="text-sm text-white/80 hover:text-white flex items-center gap-1 mb-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  New analysis
                </button>
                <h2 className="text-3xl font-bold text-white drop-shadow-md">
                  Assessment Complete
                </h2>
                <p className="text-white/80 text-lg">
                  @{result.profile.username} on {result.profile.platform}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score Card */}
              <div className="lg:col-span-1">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
                  <ScoreCard result={result} />
                </div>
              </div>
              
              {/* Remediation & Findings */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
                  <RemediationList items={result.remediationItems} />
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
                  <AwarenessPanel findings={result.riskFindings} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-white/70">
            🔒 All analysis is performed locally in your browser. No data is sent to external servers.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
