import { useState } from 'react';
import { SocialProfile, AssessmentResult, RiskCategory } from '../types/assessment';
import { analyzeProfile, calculateCategoryScores, calculateOverallScore, generateRemediationItems } from '../data/detectors';

interface RiskAnalyzerProps {
  profile: SocialProfile;
  onAnalysisComplete: (result: AssessmentResult) => void;
}

export default function RiskAnalyzer({ profile, onAnalysisComplete }: RiskAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false);

  const runAnalysis = async () => {
    setAnalyzing(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const findings = analyzeProfile(profile);
    const categoryScores = calculateCategoryScores(findings);
    const overallScore = calculateOverallScore(categoryScores);
    const remediationItems = generateRemediationItems(findings);
    
    const result: AssessmentResult = {
      id: 'assessment-' + Date.now(),
      profile,
      timestamp: new Date().toISOString(),
      overallScore,
      riskFindings: findings,
      categoryScores,
      remediationItems
    };
    
    onAnalysisComplete(result);
    setAnalyzing(false);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Profile Analysis</h3>
          <p className="text-sm text-gray-500">@{profile.username} on {profile.platform}</p>
        </div>
        
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className={`
            px-6 py-2 rounded-lg font-medium transition-all
            ${analyzing 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {analyzing ? 'Analyzing...' : 'Start Analysis'}
        </button>
      </div>
      
      {analyzing && (
        <div className="space-y-3">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-sm text-gray-500 text-center">Scanning for privacy risks...</p>
        </div>
      )}
    </div>
  );
}
