import { useState } from 'react';
import { RiskFinding, RiskCategory } from '../types/assessment';

interface AwarenessPanelProps {
  findings: RiskFinding[];
}

const categoryLabels: Record<RiskCategory, string> = {
  pii_exposure: 'PII Exposure',
  geo_leak: 'Location Leaks',
  child_safety: 'Child Safety',
  metadata_trail: 'Metadata Trail',
  weak_settings: 'Privacy Settings',
  handle_reuse: 'Handle Reuse',
  image_analysis: 'Image Analysis',
  data_breach: 'Data Breaches'
};

export default function AwarenessPanel({ findings }: AwarenessPanelProps) {
  const [filter, setFilter] = useState<RiskCategory | 'all'>('all');
  const [selectedFinding, setSelectedFinding] = useState<RiskFinding | null>(null);

  const filteredFindings = filter === 'all' 
    ? findings 
    : findings.filter(f => f.category === filter);

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    const iconClass = "w-4 h-4";
    switch (severity) {
      case 'critical':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
      case 'high':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'medium':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      default:
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  const categories = ['all', ...Object.keys(categoryLabels)] as const;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Risk Findings</h3>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as RiskCategory | 'all')}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : categoryLabels[cat as RiskCategory]}
            </option>
          ))}
        </select>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredFindings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No findings in this category
          </div>
        ) : (
          filteredFindings.map(finding => (
            <div
              key={finding.id}
              onClick={() => setSelectedFinding(selectedFinding?.id === finding.id ? null : finding)}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all
                ${selectedFinding?.id === finding.id 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getSeverityColor(finding.severity)}`}>
                      {finding.severity}
                    </span>
                    <span className="text-xs text-gray-500">
                      {categoryLabels[finding.category]}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">{finding.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
                </div>
                
                <div className={`${getSeverityColor(finding.severity)} p-1.5 rounded-lg`}>
                  {getSeverityIcon(finding.severity)}
                </div>
              </div>
              
              {selectedFinding?.id === finding.id && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Location:</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block mb-2">
                    {finding.location || 'N/A'}
                  </code>
                  
                  <p className="text-xs font-medium text-gray-500 mb-1">Remediation:</p>
                  <p className="text-sm text-gray-700">{finding.remediation}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Showing {filteredFindings.length} of {findings.length} findings
        </p>
      </div>
    </div>
  );
}
