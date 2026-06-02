// Types for Social Media Privacy Risk Assessment

export interface SocialProfile {
  username: string;
  platform: string;
  account_type?: string;
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  followers?: number;
  following?: number;
  posts?: SocialPost[];
  privacy?: {
    account_private?: boolean;
    location_sharing?: boolean;
    tag_approval?: boolean;
    allow_dm?: boolean;
  };
  links?: { url: string; platform?: string }[];
}

export interface SocialPost {
  id: string;
  content?: string;
  image_url?: string;
  location?: string;
  timestamp?: string;
  metadata?: {
    device?: string;
    location?: string;
    has_exif?: boolean;
  };
}

export interface RiskFinding {
  id: string;
  category: RiskCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location?: string;
  remediation: string;
}

export type RiskCategory = 
  | 'pii_exposure'
  | 'geo_leak'
  | 'child_safety'
  | 'metadata_trail'
  | 'weak_settings'
  | 'handle_reuse'
  | 'image_analysis'
  | 'data_breach';

export interface AssessmentResult {
  id: string;
  profile: SocialProfile;
  timestamp: string;
  overallScore: number;
  riskFindings: RiskFinding[];
  categoryScores: Record<RiskCategory, number>;
  remediationItems: RemediationItem[];
}

export interface RemediationItem {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  steps: string[];
  category: RiskCategory;
}

export interface RiskDetector {
  name: string;
  category: RiskCategory;
  detect: (profile: SocialProfile) => RiskFinding[];
}
