// Sample Data for Demo
import { SocialProfile, AssessmentResult } from '../types/assessment';
import { analyzeProfile, calculateCategoryScores, calculateOverallScore, generateRemediationItems } from './detectors';

export const sampleProfile: SocialProfile = {
  username: 'suryakant123',
  platform: 'Twitter',
  account_type: 'public',
  name: 'Suryakant Zagade',
  email: 'suryakant@example.com',
  bio: 'Student | Tech Enthusiast | Living in Mumbai',
  location: 'Mumbai, India',
  followers: 120,
  following: 80,
  privacy: {
    account_private: false,
    location_sharing: true,
    tag_approval: false,
    allow_dm: true
  },
  posts: [
    {
      id: '1',
      content: 'Having a great day at the beach!',
      image_url: 'https://example.com/beach.jpg',
      location: 'Marine Drive, Mumbai',
      timestamp: '2024-01-15T10:30:00Z',
      metadata: { device: 'iPhone 14', has_exif: true }
    },
    {
      id: '2',
      content: 'My new home setup!',
      image_url: 'https://example.com/setup.jpg',
      location: 'Andheri West, Mumbai',
      timestamp: '2024-01-10T15:45:00Z'
    },
    {
      id: '3',
      content: 'Family dinner time 🎉',
      image_url: 'https://example.com/dinner.jpg',
      timestamp: '2024-01-05T20:00:00Z'
    }
  ],
  links: [
    { url: 'https://instagram.com/suryakant123', platform: 'Instagram' },
    { url: 'https://facebook.com/suryakant123', platform: 'Facebook' }
  ]
};

export function createSampleAssessment(): AssessmentResult {
  const findings = analyzeProfile(sampleProfile);
  const categoryScores = calculateCategoryScores(findings);
  const overallScore = calculateOverallScore(categoryScores);
  const remediationItems = generateRemediationItems(findings);
  
  return {
    id: 'sample-' + Date.now(),
    profile: sampleProfile,
    timestamp: new Date().toISOString(),
    overallScore,
    riskFindings: findings,
    categoryScores,
    remediationItems
  };
}
