// Privacy Risk Detectors
import { SocialProfile, RiskFinding, RiskCategory, RemediationItem } from '../types/assessment';

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// PII Detection
export function detectPIIRisks(profile: SocialProfile): RiskFinding[] {
  const findings: RiskFinding[] = [];
  
  if (!profile) return findings;
  
  // Email exposure
  if (profile.email) {
    findings.push({
      id: generateId(),
      category: 'pii_exposure',
      severity: 'high',
      title: 'Email Address Exposed',
      description: `Your email ${profile.email} is visible in your profile`,
      location: 'profile.email',
      remediation: 'Change your email to a private one or use a separate contact email for social media'
    });
  }
  
  // Phone number exposure
  if (profile.phone) {
    findings.push({
      id: generateId(),
      category: 'pii_exposure',
      severity: 'critical',
      title: 'Phone Number Exposed',
      description: `Your phone number ${profile.phone} is visible in your profile`,
      location: 'profile.phone',
      remediation: 'Remove your phone number from public profile immediately'
    });
  }
  
  // Full name exposure (if different from username)
  if (profile.name && profile.name !== profile.username) {
    findings.push({
      id: generateId(),
      category: 'pii_exposure',
      severity: 'medium',
      title: 'Real Name Exposed',
      description: `Your real name "${profile.name}" is visible in your profile`,
      location: 'profile.name',
      remediation: 'Consider using a pseudonym or nickname instead of your real name'
    });
  }
  
  return findings;
}

// Geolocation Leak Detection
export function detectGeoLeakRisks(profile: SocialProfile): RiskFinding[] {
  const findings: RiskFinding[] = [];
  
  if (!profile) return findings;
  
  // Location in profile
  if (profile.location) {
    findings.push({
      id: generateId(),
      category: 'geo_leak',
      severity: 'high',
      title: 'Location Information Exposed',
      description: `Your location "${profile.location}" is visible in your profile`,
      location: 'profile.location',
      remediation: 'Remove your location from your profile or set it to a more general area'
    });
  }
  
  // Check posts for location data
  if (profile.posts && Array.isArray(profile.posts)) {
    profile.posts.forEach((post, index) => {
      if (post.location) {
        findings.push({
          id: generateId(),
          category: 'geo_leak',
          severity: 'high',
          title: 'Post Location Data Found',
          description: `Post #${index + 1} contains location: ${post.location}`,
          location: `posts[${index}].location`,
          remediation: 'Remove location data from your posts or disable location tagging'
        });
      }
      
      if (post.metadata?.location) {
        findings.push({
          id: generateId(),
          category: 'geo_leak',
          severity: 'medium',
          title: 'Metadata Location Found',
          description: `Post #${index + 1} contains location in metadata`,
          location: `posts[${index}].metadata.location`,
          remediation: 'Strip EXIF/location metadata from images before posting'
        });
      }
    });
  }
  
  return findings;
}

// Child Safety Detection
export function detectChildSafetyRisks(profile: SocialProfile): RiskFinding[] {
  const findings: RiskFinding[] = [];
  
  if (!profile) return findings;
  
  // Check for potential child-related content indicators
  const bioLower = (profile.bio || '').toLowerCase();
  const childKeywords = ['kid', 'child', 'children', 'baby', 'toddler', 'student', 'school', 'young'];
  
  const hasChildKeywords = childKeywords.some(keyword => bioLower.includes(keyword));
  
  if (hasChildKeywords) {
    findings.push({
      id: generateId(),
      category: 'child_safety',
      severity: 'high',
      title: 'Potential Child-Related Profile',
      description: 'Your bio contains keywords that may indicate a child or family-related account',
      location: 'profile.bio',
      remediation: 'Review your profile for child safety. Consider removing age-related information and ensuring strict privacy settings'
    });
  }
  
  // Check posts for potential child photos
  if (profile.posts && Array.isArray(profile.posts)) {
    const postsWithImages = profile.posts.filter(p => p.image_url);
    
    if (postsWithImages.length > 5) {
      findings.push({
        id: generateId(),
        category: 'child_safety',
        severity: 'medium',
        title: 'Multiple Image Posts Detected',
        description: `You have ${postsWithImages.length} posts with images. Ensure no sensitive content about minors is shared`,
        location: 'posts',
        remediation: 'Review all image posts to ensure no minors are inappropriately featured'
      });
    }
  }
  
  return findings;
}

// Metadata Trail Detection
export function detectMetadataRisks(profile: SocialProfile): RiskFinding[] {
  const findings: RiskFinding[] = [];
  
  if (!profile) return findings;
  
  if (profile.posts && Array.isArray(profile.posts)) {
    const postsWithMetadata = profile.posts.filter(p => p.metadata);
    const postsWithExif = profile.posts.filter(p => p.metadata?.has_exif);
    
    if (postsWithExif.length > 0) {
      findings.push({
        id: generateId(),
        category: 'metadata_trail',
        severity: 'medium',
        title: 'EXIF Data May Be Present',
        description: `${postsWithExif.length} posts may contain EXIF metadata (camera info, location, timestamp)`,
        location: 'posts[].metadata.has_exif',
        remediation: 'Strip EXIF metadata from images before posting using tools like ImageOptim or exiftool'
      });
    }
    
    if (postsWithMetadata.length > 0) {
      findings.push({
        id: generateId(),
        category: 'metadata_trail',
        severity: 'low',
        title: 'Post Metadata Found',
        description: `${postsWithMetadata.length} posts contain metadata that could reveal device or timing information`,
        location: 'posts[].metadata',
        remediation: 'Be aware that metadata can reveal information about your posting habits and device'
      });
    }
  }
  
  return findings;
}

// Weak Privacy Settings Detection
export function detectPrivacySettingsRisks(profile: SocialProfile): RiskFinding[] {
  const findings: RiskFinding[] = [];
  
  if (!profile) return findings;
  
  const privacy = profile.privacy;
  
  if (!privacy) {
    findings.push({
      id: generateId(),
      category: 'weak_settings',
      severity: 'medium',
      title: 'Privacy Settings Not Configured',
      description: 'No privacy settings found in profile data',
      location: 'profile.privacy',
      remediation: 'Configure your privacy settings to restrict who can see your content'
    });
    return findings;
  }
  
  if (!privacy.account_private) {
    findings.push({
      id: generateId(),
      category: 'weak_settings',
      severity: 'high',
      title: 'Account is Public',
      description: 'Your account is set to public, meaning anyone can view your content',
      location: 'profile.privacy.account_private',
      remediation: 'Set your account to private to control who can see your posts'
    });
  }
  
  if (privacy.location_sharing) {
    findings.push({
      id: generateId(),
      category: 'weak_settings',
      severity: 'high',
      title: 'Location Sharing Enabled',
      description: 'Location sharing is enabled on your account',
      location: 'profile.privacy.location_sharing',
      remediation: 'Disable location sharing in your account settings'
    });
  }
  
  if (!privacy.tag_approval) {
    findings.push({
      id: generateId(),
      category: 'weak_settings',
      severity: 'medium',
      title: 'Tag Approval Disabled',
      description: 'Posts tagged by others appear without your approval',
      location: 'profile.privacy.tag_approval',
      remediation: 'Enable tag approval to review posts before they appear on your profile'
    });
  }
  
  if (privacy.allow_dm === false) {
    findings.push({
      id: generateId(),
      category: 'weak_settings',
      severity: 'low',
      title: 'Direct Messages Disabled',
      description: 'You have disabled direct messages, limiting communication',
      location: 'profile.privacy.allow_dm',
      remediation: 'Consider enabling DMs for legitimate contacts while blocking unwanted messages'
    });
  }
  
  return findings;
}

// Handle/Username Reuse Detection
export function detectHandleReuseRisks(profile: SocialProfile): RiskFinding[] {
  const findings: RiskFinding[] = [];
  
  if (!profile) return findings;
  
  // Check if links contain same platform (potential cross-referencing)
  if (profile.links && Array.isArray(profile.links) && profile.links.length > 0) {
    const platformLinks = profile.links.filter(link => 
      link.platform && link.platform.toLowerCase() === profile.platform.toLowerCase()
    );
    
    if (platformLinks.length > 0) {
      findings.push({
        id: generateId(),
        category: 'handle_reuse',
        severity: 'medium',
        title: 'Cross-Platform Handle Reuse',
        description: `You have ${platformLinks.length} links to the same platform, enabling profile correlation`,
        location: 'profile.links',
        remediation: 'Use different usernames across platforms to prevent profile correlation'
      });
    }
  }
  
  return findings;
}

// Image Analysis Detection (mock)
export function detectImageAnalysisRisks(profile: SocialProfile): RiskFinding[] {
  const findings: RiskFinding[] = [];
  
  if (!profile) return findings;
  
  if (profile.posts && Array.isArray(profile.posts)) {
    const postsWithImages = profile.posts.filter(p => p.image_url);
    
    if (postsWithImages.length > 10) {
      findings.push({
        id: generateId(),
        category: 'image_analysis',
        severity: 'medium',
        title: 'High Image Volume',
        description: `You have ${postsWithImages.length} image posts. AI can analyze these for facial recognition and behavior patterns`,
        location: 'posts',
        remediation: 'Reduce the number of image posts or use profile pictures that don\'t reveal your identity'
      });
    }
    
    // Check for potentially sensitive image patterns
    const sensitiveKeywords = ['selfie', 'home', 'family', 'vacation', 'daily'];
    const hasSensitiveImages = postsWithImages.some(post => 
      sensitiveKeywords.some(keyword => (post.content || '').toLowerCase().includes(keyword))
    );
    
    if (hasSensitiveImages) {
      findings.push({
        id: generateId(),
        category: 'image_analysis',
        severity: 'high',
        title: 'Sensitive Image Content Detected',
        description: 'Your posts may contain images that reveal personal habits, home environment, or daily routines',
        location: 'posts',
        remediation: 'Review posts for sensitive content that could reveal your daily patterns or home location'
      });
    }
  }
  
  return findings;
}

// Main function to run all detectors
export function analyzeProfile(profile: SocialProfile): RiskFinding[] {
  const allFindings: RiskFinding[] = [];
  
  allFindings.push(...detectPIIRisks(profile));
  allFindings.push(...detectGeoLeakRisks(profile));
  allFindings.push(...detectChildSafetyRisks(profile));
  allFindings.push(...detectMetadataRisks(profile));
  allFindings.push(...detectPrivacySettingsRisks(profile));
  allFindings.push(...detectHandleReuseRisks(profile));
  allFindings.push(...detectImageAnalysisRisks(profile));
  
  return allFindings;
}

// Calculate category scores
export function calculateCategoryScores(findings: RiskFinding[]): Record<RiskCategory, number> {
  const categories: RiskCategory[] = [
    'pii_exposure', 'geo_leak', 'child_safety', 'metadata_trail', 
    'weak_settings', 'handle_reuse', 'image_analysis', 'data_breach'
  ];
  
  const scores: Record<string, number> = {};
  
  categories.forEach(category => {
    const categoryFindings = findings.filter(f => f.category === category);
    if (categoryFindings.length === 0) {
      scores[category] = 100;
    } else {
      const severityWeights = { low: 10, medium: 25, high: 50, critical: 75 };
      const totalWeight = categoryFindings.reduce((sum, f) => sum + severityWeights[f.severity], 0);
      scores[category] = Math.max(0, 100 - totalWeight);
    }
  });
  
  return scores as Record<RiskCategory, number>;
}

// Calculate overall score
export function calculateOverallScore(categoryScores: Record<RiskCategory, number>): number {
  const values = Object.values(categoryScores);
  if (values.length === 0) return 100;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

// Generate remediation items from findings
export function generateRemediationItems(findings: RiskFinding[]): RemediationItem[] {
  const remediationMap = new Map<string, RemediationItem>();
  
  findings.forEach(finding => {
    if (!remediationMap.has(finding.category)) {
      remediationMap.set(finding.category, {
        id: generateId(),
        priority: 'high',
        title: getCategoryTitle(finding.category),
        description: getCategoryDescription(finding.category),
        steps: [],
        category: finding.category
      });
    }
    
    const item = remediationMap.get(finding.category)!;
    if (!item.steps.includes(finding.remediation)) {
      item.steps.push(finding.remediation);
    }
    
    // Update priority based on findings
    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    const currentPriority = severityOrder[item.priority];
    const findingPriority = severityOrder[finding.severity];
    if (findingPriority > currentPriority) {
      item.priority = finding.priority as 'high' | 'medium' | 'low';
    }
  });
  
  return Array.from(remediationMap.values()).sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

function getCategoryTitle(category: RiskCategory): string {
  const titles: Record<RiskCategory, string> = {
    pii_exposure: 'Protect Personal Information',
    geo_leak: 'Secure Location Data',
    child_safety: 'Child Safety Review',
    metadata_trail: 'Remove Metadata Trail',
    weak_settings: 'Strengthen Privacy Settings',
    handle_reuse: 'Address Handle Reuse',
    image_analysis: 'Manage Image Exposure',
    data_breach: 'Check for Data Breaches'
  };
  return titles[category] || 'Privacy Improvement';
}

function getCategoryDescription(category: RiskCategory): string {
  const descriptions: Record<RiskCategory, string> = {
    pii_exposure: 'Your personal information may be exposed to strangers',
    geo_leak: 'Your location data could reveal your physical whereabouts',
    child_safety: 'Content may attract inappropriate attention to minors',
    metadata_trail: 'Hidden metadata in your posts could reveal sensitive info',
    weak_settings: 'Your privacy settings may not be properly configured',
    handle_reuse: 'Using the same username across platforms enables tracking',
    image_analysis: 'Your images could be analyzed by AI systems',
    data_breach: 'Your data may have been exposed in known breaches'
  };
  return descriptions[category] || 'Privacy risk detected';
}
