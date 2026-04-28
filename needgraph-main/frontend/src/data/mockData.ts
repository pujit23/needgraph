import type {
  Ward, Need, Alert, Prediction, Volunteer, GraphEdge,
  TrendDataPoint, WardNeedData, VolunteerDeploymentData,
  NeedDistribution, WeeklyReport, WardPerformance, PreventedCrisis,
  NeedType, UrgencyLevel
} from '../types';

// ─── WARDS ──────────────────────────────────────────────
export const wards: Ward[] = [
  { id: 1, name: 'Ward 1 - Secunderabad', lat: 17.4399, lng: 78.4983 },
  { id: 2, name: 'Ward 2 - Begumpet', lat: 17.4445, lng: 78.4720 },
  { id: 3, name: 'Ward 3 - Ameerpet', lat: 17.4375, lng: 78.4483 },
  { id: 4, name: 'Ward 4 - Jubilee Hills', lat: 17.4319, lng: 78.4070 },
  { id: 5, name: 'Ward 5 - Banjara Hills', lat: 17.4156, lng: 78.4347 },
  { id: 6, name: 'Ward 6 - Somajiguda', lat: 17.4260, lng: 78.4510 },
  { id: 7, name: 'Ward 7 - Kukatpally', lat: 17.4947, lng: 78.3996 },
  { id: 8, name: 'Ward 8 - Miyapur', lat: 17.4969, lng: 78.3535 },
  { id: 9, name: 'Ward 9 - Chandanagar', lat: 17.4987, lng: 78.3250 },
  { id: 10, name: 'Ward 10 - Madhapur', lat: 17.4486, lng: 78.3908 },
  { id: 11, name: 'Ward 11 - Gachibowli', lat: 17.4401, lng: 78.3489 },
  { id: 12, name: 'Ward 12 - Charminar', lat: 17.3616, lng: 78.4747 },
  { id: 13, name: 'Ward 13 - Dilsukhnagar', lat: 17.3688, lng: 78.5247 },
  { id: 14, name: 'Ward 14 - LB Nagar', lat: 17.3457, lng: 78.5522 },
  { id: 15, name: 'Ward 15 - Uppal', lat: 17.3995, lng: 78.5593 },
  { id: 16, name: 'Ward 16 - Tarnaka', lat: 17.4224, lng: 78.5440 },
  { id: 17, name: 'Ward 17 - Malkajgiri', lat: 17.4520, lng: 78.5275 },
  { id: 18, name: 'Ward 18 - Alwal', lat: 17.4974, lng: 78.5160 },
  { id: 19, name: 'Ward 19 - Kompally', lat: 17.5355, lng: 78.4854 },
  { id: 20, name: 'Ward 20 - Shamshabad', lat: 17.2403, lng: 78.4294 },
];

// ─── NEEDS ──────────────────────────────────────────────
const needTypes: NeedType[] = [
  'Food Insecurity', 'School Dropout', 'Mental Health', 'Healthcare',
  'Domestic Violence', 'Unemployment', 'Water Scarcity', 'Child Malnutrition'
];

const urgencyFromSeverity = (s: number): UrgencyLevel => {
  if (s >= 80) return 'Critical';
  if (s >= 60) return 'High';
  if (s >= 40) return 'Medium';
  return 'Low';
};

export const wardCoords: Record<number, {lat: number; lng: number}> = {
  1:{lat:17.4126,lng:78.4601}, 2:{lat:17.4401,lng:78.4983},
  3:{lat:17.3850,lng:78.4867}, 4:{lat:17.4239,lng:78.5480},
  5:{lat:17.3616,lng:78.4747}, 6:{lat:17.3950,lng:78.5300},
  7:{lat:17.4500,lng:78.3800}, 8:{lat:17.3700,lng:78.5500},
  9:{lat:17.4800,lng:78.4200}, 10:{lat:17.3400,lng:78.4600},
  11:{lat:17.4100,lng:78.3600}, 12:{lat:17.3600,lng:78.5800},
  13:{lat:17.5000,lng:78.5000}, 14:{lat:17.3200,lng:78.5200},
  15:{lat:17.4700,lng:78.5500}, 16:{lat:17.3300,lng:78.4300},
  17:{lat:17.4300,lng:78.4700}, 18:{lat:17.3900,lng:78.3900},
  19:{lat:17.4600,lng:78.4600}, 20:{lat:17.3500,lng:78.4100},
};

function generateNeeds(): Need[] {
  const needs: Need[] = [];
  const descriptions: Record<NeedType, string[]> = {
    'Food Insecurity': [
      'Multiple families in the area reporting food shortages for the past 2 weeks. Children showing signs of malnutrition.',
      'Local ration shops have run out of essential supplies. Over 50 families affected.',
      'Seasonal workers lost income, cannot afford food. Community kitchen needed urgently.',
    ],
    'School Dropout': [
      'Rising dropout rates among girls aged 12-15. Family financial pressure forcing them to work.',
      'School attendance dropped 40% since last month. Many children sent to work in local shops.',
      'Children from migrant families not enrolled in any school. Need education support.',
    ],
    'Mental Health': [
      'Multiple reports of depression and anxiety among youth. No mental health facilities nearby.',
      'Community members showing high stress levels after recent flooding. Counseling needed.',
      'Domestic workers reporting burnout and anxiety. Need mobile counseling unit.',
    ],
    'Healthcare': [
      'Nearest hospital is 15km away. Multiple elderly patients cannot access regular checkups.',
      'Outbreak of waterborne diseases. Need mobile health camp and water purification.',
      'Pregnant women lacking prenatal care access. Need weekly health worker visits.',
    ],
    'Domestic Violence': [
      'Three cases reported this week alone. Women seeking shelter and legal support.',
      'Community leaders report increase in domestic incidents during economic downturn.',
      'Need safe house facility and counselor deployment for affected families.',
    ],
    'Unemployment': [
      'Local factory closed, 200+ workers unemployed. Need skill training programs.',
      'Youth unemployment rate spiking. Many turning to informal and risky employment.',
      'Seasonal work ended, daily wage workers without income for next 3 months.',
    ],
    'Water Scarcity': [
      'Municipal water supply interrupted for 5 days. Residents walking 2km for water.',
      'Borewell dried up serving 100 families. Need tanker supply and long-term solution.',
      'Contaminated local water sources. Children falling sick. Need water testing and purification.',
    ],
    'Child Malnutrition': [
      'Anganwadi reports 15 children severely underweight. Need nutritional supplements.',
      'Children aged 2-5 showing stunted growth. Mid-day meal program insufficient.',
      'Community health worker found multiple cases of iron deficiency in children under 3.',
    ],
  };

  const criticalEntries = [
    { wardId: 12, needType: 'Food Insecurity' as NeedType, severity: 91, affected: 340 },
    { wardId: 12, needType: 'Child Malnutrition' as NeedType, severity: 88, affected: 95 },
    { wardId: 7, needType: 'School Dropout' as NeedType, severity: 84, affected: 120 },
    { wardId: 7, needType: 'Unemployment' as NeedType, severity: 82, affected: 210 },
    { wardId: 3, needType: 'Mental Health' as NeedType, severity: 86, affected: 180 },
    { wardId: 3, needType: 'Domestic Violence' as NeedType, severity: 81, affected: 45 },
    { wardId: 5, needType: 'Healthcare' as NeedType, severity: 78, affected: 230 },
    { wardId: 9, needType: 'Water Scarcity' as NeedType, severity: 76, affected: 310 },
  ];

  // Add critical needs
  criticalEntries.forEach((entry, i) => {
    const ward = wards.find(w => w.id === entry.wardId)!;
    const descs = descriptions[entry.needType];
    needs.push({
      id: `need-${i + 1}`,
      wardId: entry.wardId,
      wardName: ward.name,
      lat: wardCoords[entry.wardId]?.lat || ward.lat,
      lng: wardCoords[entry.wardId]?.lng || ward.lng,
      needType: entry.needType,
      severity: entry.severity,
      affectedCount: entry.affected,
      urgency: urgencyFromSeverity(entry.severity),
      description: descs[i % descs.length],
      language: 'English',
      status: 'Active',
      createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      submittedBy: `Field Worker ${i + 1}`,
    });
  });

  // Generate remaining needs to total 47
  for (let i = criticalEntries.length; i < 47; i++) {
    const wardId = (i % 20) + 1;
    const ward = wards.find(w => w.id === wardId)!;
    const needType = needTypes[i % needTypes.length];
    const severity = Math.floor(Math.random() * 70) + 15;
    const descs = descriptions[needType];
    needs.push({
      id: `need-${i + 1}`,
      wardId,
      wardName: ward.name,
      lat: wardCoords[wardId]?.lat || ward.lat,
      lng: wardCoords[wardId]?.lng || ward.lng,
      needType,
      severity,
      affectedCount: Math.floor(Math.random() * 200) + 20,
      urgency: urgencyFromSeverity(severity),
      description: descs[i % descs.length],
      language: ['English', 'Hindi', 'Telugu'][i % 3],
      status: i % 5 === 0 ? 'Resolved' : 'Active',
      createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      submittedBy: `Field Worker ${(i % 12) + 1}`,
    });
  }

  return needs;
}

export const needs: Need[] = generateNeeds();
export const activeNeeds = needs.filter(n => n.status === 'Active');

// ─── ALERTS ─────────────────────────────────────────────
export const alerts: Alert[] = [
  {
    id: 'alert-1', needId: 'need-1', wardId: 12, wardName: 'Ward 12 - Charminar',
    needType: 'Food Insecurity', severity: 91, affectedCount: 340, urgency: 'Critical',
    status: 'Active', detectedAt: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 'alert-2', needId: 'need-2', wardId: 12, wardName: 'Ward 12 - Charminar',
    needType: 'Child Malnutrition', severity: 88, affectedCount: 95, urgency: 'Critical',
    status: 'Active', detectedAt: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: 'alert-3', needId: 'need-3', wardId: 7, wardName: 'Ward 7 - Kukatpally',
    needType: 'School Dropout', severity: 84, affectedCount: 120, urgency: 'Critical',
    status: 'Active', detectedAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'alert-4', needId: 'need-5', wardId: 3, wardName: 'Ward 3 - Ameerpet',
    needType: 'Mental Health', severity: 86, affectedCount: 180, urgency: 'Critical',
    status: 'Assigned', detectedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    assignedVolunteer: 'Priya Sharma',
  },
  {
    id: 'alert-5', needId: 'need-4', wardId: 7, wardName: 'Ward 7 - Kukatpally',
    needType: 'Unemployment', severity: 82, affectedCount: 210, urgency: 'Critical',
    status: 'Active', detectedAt: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    id: 'alert-6', needId: 'need-7', wardId: 5, wardName: 'Ward 5 - Banjara Hills',
    needType: 'Healthcare', severity: 78, affectedCount: 230, urgency: 'High',
    status: 'Active', detectedAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'alert-7', needId: 'need-8', wardId: 9, wardName: 'Ward 9 - Chandanagar',
    needType: 'Water Scarcity', severity: 76, affectedCount: 310, urgency: 'High',
    status: 'Active', detectedAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: 'alert-8', needId: 'need-6', wardId: 3, wardName: 'Ward 3 - Ameerpet',
    needType: 'Domestic Violence', severity: 81, affectedCount: 45, urgency: 'Critical',
    status: 'Active', detectedAt: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: 'alert-9', needId: 'need-15', wardId: 15, wardName: 'Ward 15 - Uppal',
    needType: 'Food Insecurity', severity: 67, affectedCount: 142, urgency: 'High',
    status: 'Active', detectedAt: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: 'alert-10', needId: 'need-20', wardId: 2, wardName: 'Ward 2 - Begumpet',
    needType: 'Healthcare', severity: 58, affectedCount: 89, urgency: 'Medium',
    status: 'Assigned', detectedAt: new Date(Date.now() - 180 * 60000).toISOString(),
    assignedVolunteer: 'Rajesh Kumar',
  },
];

// ─── PREDICTIONS ────────────────────────────────────────
export const predictions: Prediction[] = [
  {
    id: 'pred-1', needType: 'School Dropout', wardId: 12, wardName: 'Ward 12 - Charminar',
    predictedSeverity: 78, confidence: 87, predictedDays: 18,
    causalChain: [
      { needType: 'Food Insecurity', score: 91 },
      { needType: 'School Dropout', score: 78, predicted: true },
      { needType: 'Mental Health', score: 62, predicted: true },
    ],
    recommendedAction: 'Deploy food kits and education support immediately',
    estimatedImpact: 73, createdAt: new Date().toISOString(),
  },
  {
    id: 'pred-2', needType: 'Mental Health', wardId: 5, wardName: 'Ward 5 - Banjara Hills',
    predictedSeverity: 72, confidence: 81, predictedDays: 21,
    causalChain: [
      { needType: 'Healthcare', score: 78 },
      { needType: 'Mental Health', score: 72, predicted: true },
    ],
    recommendedAction: 'Set up mobile counseling unit in Ward 5',
    estimatedImpact: 65, createdAt: new Date().toISOString(),
  },
  {
    id: 'pred-3', needType: 'Child Malnutrition', wardId: 7, wardName: 'Ward 7 - Kukatpally',
    predictedSeverity: 69, confidence: 76, predictedDays: 25,
    causalChain: [
      { needType: 'Unemployment', score: 82 },
      { needType: 'Food Insecurity', score: 68, predicted: true },
      { needType: 'Child Malnutrition', score: 69, predicted: true },
    ],
    recommendedAction: 'Launch employment program + nutritional supplements',
    estimatedImpact: 58, createdAt: new Date().toISOString(),
  },
  {
    id: 'pred-4', needType: 'Food Insecurity', wardId: 9, wardName: 'Ward 9 - Chandanagar',
    predictedSeverity: 74, confidence: 83, predictedDays: 14,
    causalChain: [
      { needType: 'Water Scarcity', score: 76 },
      { needType: 'Food Insecurity', score: 74, predicted: true },
    ],
    recommendedAction: 'Arrange water tanker supply and ration distribution',
    estimatedImpact: 70, createdAt: new Date().toISOString(),
  },
  {
    id: 'pred-5', needType: 'Healthcare', wardId: 12, wardName: 'Ward 12 - Charminar',
    predictedSeverity: 65, confidence: 71, predictedDays: 30,
    causalChain: [
      { needType: 'Child Malnutrition', score: 88 },
      { needType: 'Healthcare', score: 65, predicted: true },
    ],
    recommendedAction: 'Deploy pediatric health camp',
    estimatedImpact: 55, createdAt: new Date().toISOString(),
  },
  {
    id: 'pred-6', needType: 'Mental Health', wardId: 7, wardName: 'Ward 7 - Kukatpally',
    predictedSeverity: 61, confidence: 68, predictedDays: 35,
    causalChain: [
      { needType: 'School Dropout', score: 84 },
      { needType: 'Mental Health', score: 61, predicted: true },
    ],
    recommendedAction: 'Youth counseling and after-school program',
    estimatedImpact: 52, createdAt: new Date().toISOString(),
  },
  {
    id: 'pred-7', needType: 'Domestic Violence', wardId: 9, wardName: 'Ward 9 - Chandanagar',
    predictedSeverity: 58, confidence: 64, predictedDays: 28,
    causalChain: [
      { needType: 'Water Scarcity', score: 76 },
      { needType: 'Unemployment', score: 55, predicted: true },
      { needType: 'Domestic Violence', score: 58, predicted: true },
    ],
    recommendedAction: 'Deploy safe house counselors and conflict mediation',
    estimatedImpact: 48, createdAt: new Date().toISOString(),
  },
  {
    id: 'pred-8', needType: 'School Dropout', wardId: 3, wardName: 'Ward 3 - Ameerpet',
    predictedSeverity: 56, confidence: 62, predictedDays: 40,
    causalChain: [
      { needType: 'Domestic Violence', score: 81 },
      { needType: 'Mental Health', score: 86 },
      { needType: 'School Dropout', score: 56, predicted: true },
    ],
    recommendedAction: 'Child protection and education sponsorship',
    estimatedImpact: 45, createdAt: new Date().toISOString(),
  },
  {
    id: 'pred-9', needType: 'Water Scarcity', wardId: 15, wardName: 'Ward 15 - Uppal',
    predictedSeverity: 63, confidence: 72, predictedDays: 20,
    causalChain: [
      { needType: 'Food Insecurity', score: 67 },
      { needType: 'Water Scarcity', score: 63, predicted: true },
    ],
    recommendedAction: 'Water purification systems and bore well repair',
    estimatedImpact: 60, createdAt: new Date().toISOString(),
  },
  {
    id: 'pred-10', needType: 'Unemployment', wardId: 5, wardName: 'Ward 5 - Banjara Hills',
    predictedSeverity: 55, confidence: 59, predictedDays: 45,
    causalChain: [
      { needType: 'Healthcare', score: 78 },
      { needType: 'Unemployment', score: 55, predicted: true },
    ],
    recommendedAction: 'Vocational training and micro-loan program',
    estimatedImpact: 42, createdAt: new Date().toISOString(),
  },
  {
    id: 'pred-11', needType: 'Food Insecurity', wardId: 3, wardName: 'Ward 3 - Ameerpet',
    predictedSeverity: 52, confidence: 57, predictedDays: 38,
    causalChain: [
      { needType: 'Mental Health', score: 86 },
      { needType: 'Unemployment', score: 48, predicted: true },
      { needType: 'Food Insecurity', score: 52, predicted: true },
    ],
    recommendedAction: 'Community kitchen and livelihood support',
    estimatedImpact: 40, createdAt: new Date().toISOString(),
  },
  {
    id: 'pred-12', needType: 'Healthcare', wardId: 9, wardName: 'Ward 9 - Chandanagar',
    predictedSeverity: 60, confidence: 66, predictedDays: 22,
    causalChain: [
      { needType: 'Water Scarcity', score: 76 },
      { needType: 'Healthcare', score: 60, predicted: true },
    ],
    recommendedAction: 'Mobile health clinic and water treatment',
    estimatedImpact: 55, createdAt: new Date().toISOString(),
  },
];

// ─── VOLUNTEERS ─────────────────────────────────────────
const volunteerNames = [
  'Priya Sharma', 'Rajesh Kumar', 'Ananya Reddy', 'Vikram Patel', 'Deepa Nair',
  'Arjun Singh', 'Kavitha Rao', 'Mohammed Iqbal', 'Sneha Gupta', 'Rahul Verma',
  'Lakshmi Devi', 'Suresh Babu', 'Fatima Begum', 'Anil Mehta', 'Pooja Iyer',
  'Sanjay Joshi', 'Meera Krishnan', 'Ravi Teja', 'Sunita Patil', 'Harish Gowda',
  'Divya Agarwal', 'Kiran Shetty', 'Neha Banerjee', 'Varun Chopra', 'Rekha Mishra',
];

const skillSets = [
  ['Medical', 'First Aid', 'Healthcare'],
  ['Education', 'Tutoring', 'Youth Mentoring'],
  ['Counselling', 'Mental Health', 'Crisis Support'],
  ['Food Distribution', 'Logistics', 'Community Outreach'],
  ['Medical', 'Counselling', 'Child Welfare'],
  ['Education', 'Community Outreach', 'Data Collection'],
  ['Legal Aid', 'Women Safety', 'Counselling'],
  ['Water Management', 'Sanitation', 'Community Health'],
  ['Food Distribution', 'Education', 'First Aid'],
  ['Medical', 'Water Management', 'Healthcare'],
];

const taskDescriptions = [
  'Food kit distribution', 'Health checkup camp', 'School enrollment drive',
  'Mental health counseling session', 'Water quality testing', 'Community survey',
  'Nutrition assessment', 'Legal awareness workshop', 'Skill training session',
  'Emergency relief coordination',
];

const outcomes = ['Completed successfully', 'Partial completion - follow-up needed', 'Completed with recommendations', 'Completed - escalated to supervisor'];

export const volunteers: Volunteer[] = volunteerNames.map((name, i) => {
  const wardId = (i % 20) + 1;
  const ward = wards.find(w => w.id === wardId)!;
  const statuses: ('Available' | 'Deployed' | 'Off-duty')[] = ['Available', 'Deployed', 'Off-duty'];
  const assignments = Array.from({ length: Math.floor(Math.random() * 6) + 2 }, (_, j) => ({
    id: `assign-${i}-${j}`,
    date: new Date(Date.now() - (j + 1) * 86400000 * (Math.floor(Math.random() * 3) + 1)).toISOString().split('T')[0],
    wardName: wards[(i + j) % 20].name,
    task: taskDescriptions[(i + j) % taskDescriptions.length],
    hours: Math.floor(Math.random() * 6) + 2,
    outcome: outcomes[j % outcomes.length],
  }));

  return {
    id: `vol-${i + 1}`,
    name,
    skills: skillSets[i % skillSets.length],
    wardId,
    wardName: ward.name,
    status: statuses[i % 3],
    tasksThisWeek: Math.floor(Math.random() * 8) + 1,
    totalTasks: Math.floor(Math.random() * 50) + 10,
    contact: `+91 ${9000000000 + i * 1111}`,
    joinedAt: new Date(Date.now() - Math.random() * 180 * 86400000).toISOString(),
    assignments,
  };
});

// ─── GRAPH EDGES ────────────────────────────────────────
export const graphEdges: GraphEdge[] = [
  { source: 'Food Insecurity', target: 'School Dropout', relationship: 'causes', weight: 0.87 },
  { source: 'Food Insecurity', target: 'Child Malnutrition', relationship: 'directly causes', weight: 0.92 },
  { source: 'School Dropout', target: 'Mental Health', relationship: 'leads to', weight: 0.74 },
  { source: 'Unemployment', target: 'Food Insecurity', relationship: 'causes', weight: 0.81 },
  { source: 'Domestic Violence', target: 'Mental Health', relationship: 'worsens', weight: 0.69 },
  { source: 'Water Scarcity', target: 'Healthcare', relationship: 'triggers', weight: 0.63 },
  { source: 'Unemployment', target: 'Domestic Violence', relationship: 'worsens', weight: 0.56 },
  { source: 'Child Malnutrition', target: 'Healthcare', relationship: 'triggers', weight: 0.71 },
  { source: 'Mental Health', target: 'School Dropout', relationship: 'worsens', weight: 0.52 },
  { source: 'Water Scarcity', target: 'Food Insecurity', relationship: 'causes', weight: 0.67 },
  { source: 'Healthcare', target: 'Mental Health', relationship: 'leads to', weight: 0.45 },
  { source: 'School Dropout', target: 'Unemployment', relationship: 'leads to', weight: 0.78 },
];

// ─── TREND DATA (30 days) ───────────────────────────────
export const trendData: TrendDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(Date.now() - (29 - i) * 86400000);
  const day = i;
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    foodInsecurity: Math.round(45 + day * 1.5 + Math.sin(day * 0.5) * 10),
    schoolDropout: Math.round(35 + day * 1.2 + Math.cos(day * 0.3) * 8),
    mentalHealth: Math.round(40 + day * 1.3 + Math.sin(day * 0.4) * 12),
    healthcare: Math.round(30 + day * 0.8 + Math.cos(day * 0.6) * 6),
    domesticViolence: Math.round(25 + day * 0.6 + Math.sin(day * 0.7) * 5),
    unemployment: Math.round(38 + day * 1.0 + Math.cos(day * 0.4) * 7),
    waterScarcity: Math.round(20 + day * 1.1 + Math.sin(day * 0.3) * 9),
    childMalnutrition: Math.round(32 + day * 1.4 + Math.cos(day * 0.5) * 8),
  };
});

// ─── WARD NEED DATA ─────────────────────────────────────
export const wardNeedData: WardNeedData[] = [
  { ward: 'Ward 12', score: 179, severity: 'Critical' },
  { ward: 'Ward 7', score: 166, severity: 'Critical' },
  { ward: 'Ward 3', score: 167, severity: 'Critical' },
  { ward: 'Ward 5', score: 108, severity: 'High' },
  { ward: 'Ward 9', score: 106, severity: 'High' },
  { ward: 'Ward 15', score: 97, severity: 'High' },
  { ward: 'Ward 2', score: 78, severity: 'Medium' },
  { ward: 'Ward 8', score: 72, severity: 'Medium' },
  { ward: 'Ward 11', score: 65, severity: 'Medium' },
  { ward: 'Ward 1', score: 45, severity: 'Low' },
];

// ─── VOLUNTEER DEPLOYMENT DATA ──────────────────────────
export const volunteerDeploymentData: VolunteerDeploymentData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(Date.now() - (29 - i) * 86400000);
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volunteers: Math.round(60 + i * 2 + Math.sin(i * 0.5) * 15),
    needs: Math.round(80 + i * 2.5 + Math.cos(i * 0.3) * 10),
  };
});

// ─── NEED DISTRIBUTION ─────────────────────────────────
export const needDistribution: NeedDistribution[] = [
  { name: 'Food Insecurity', value: 24, color: '#D85A30' },
  { name: 'School Dropout', value: 18, color: '#BA7517' },
  { name: 'Mental Health', value: 15, color: '#7F77DD' },
  { name: 'Healthcare', value: 13, color: '#3C3489' },
  { name: 'Unemployment', value: 11, color: '#5B8DEF' },
  { name: 'Water Scarcity', value: 8, color: '#0F6E56' },
  { name: 'Child Malnutrition', value: 7, color: '#E84393' },
  { name: 'Domestic Violence', value: 4, color: '#6C5CE7' },
];

// ─── REPORTS DATA ───────────────────────────────────────
export const weeklyReports: WeeklyReport[] = [
  { week: 'W1', recorded: 32, resolved: 28 },
  { week: 'W2', recorded: 38, resolved: 31 },
  { week: 'W3', recorded: 45, resolved: 36 },
  { week: 'W4', recorded: 41, resolved: 38 },
  { week: 'W5', recorded: 52, resolved: 40 },
  { week: 'W6', recorded: 48, resolved: 44 },
  { week: 'W7', recorded: 56, resolved: 47 },
  { week: 'W8', recorded: 61, resolved: 52 },
  { week: 'W9', recorded: 58, resolved: 55 },
  { week: 'W10', recorded: 67, resolved: 58 },
  { week: 'W11', recorded: 72, resolved: 63 },
  { week: 'W12', recorded: 69, resolved: 65 },
];

export const wardPerformance: WardPerformance[] = [
  { ward: 'Ward 12', recorded: 28, resolved: 19, avgResolutionTime: '2.3 days', volunteersDeployed: 14, outcomeScore: 68 },
  { ward: 'Ward 7', recorded: 24, resolved: 18, avgResolutionTime: '1.8 days', volunteersDeployed: 12, outcomeScore: 75 },
  { ward: 'Ward 3', recorded: 22, resolved: 17, avgResolutionTime: '2.1 days', volunteersDeployed: 11, outcomeScore: 77 },
  { ward: 'Ward 5', recorded: 18, resolved: 15, avgResolutionTime: '1.5 days', volunteersDeployed: 9, outcomeScore: 83 },
  { ward: 'Ward 9', recorded: 16, resolved: 13, avgResolutionTime: '1.9 days', volunteersDeployed: 8, outcomeScore: 81 },
  { ward: 'Ward 15', recorded: 14, resolved: 12, avgResolutionTime: '1.4 days', volunteersDeployed: 7, outcomeScore: 86 },
  { ward: 'Ward 2', recorded: 12, resolved: 11, avgResolutionTime: '1.2 days', volunteersDeployed: 6, outcomeScore: 92 },
  { ward: 'Ward 8', recorded: 10, resolved: 9, avgResolutionTime: '1.1 days', volunteersDeployed: 5, outcomeScore: 90 },
  { ward: 'Ward 11', recorded: 8, resolved: 7, avgResolutionTime: '1.0 days', volunteersDeployed: 4, outcomeScore: 88 },
  { ward: 'Ward 1', recorded: 6, resolved: 6, avgResolutionTime: '0.8 days', volunteersDeployed: 3, outcomeScore: 95 },
];

export const preventedCrises: PreventedCrisis[] = [
  {
    id: 'pc-1', predictedNeed: 'School Dropout', ward: 'Ward 5',
    predictedDate: '2026-03-15', intervention: 'Education support program + meal subsidies deployed',
    outcome: 'Dropout rate reduced by 62%', peopleProtected: 85,
  },
  {
    id: 'pc-2', predictedNeed: 'Mental Health', ward: 'Ward 2',
    predictedDate: '2026-03-20', intervention: 'Mobile counseling unit deployed for 2 weeks',
    outcome: 'Mental health reports stabilized', peopleProtected: 120,
  },
  {
    id: 'pc-3', predictedNeed: 'Child Malnutrition', ward: 'Ward 8',
    predictedDate: '2026-03-25', intervention: 'Nutritional supplement distribution + health camps',
    outcome: 'Malnutrition cases reduced by 78%', peopleProtected: 45,
  },
  {
    id: 'pc-4', predictedNeed: 'Water Scarcity', ward: 'Ward 11',
    predictedDate: '2026-04-01', intervention: 'Emergency water tanker supply + bore well repair',
    outcome: 'Water access restored for all families', peopleProtected: 200,
  },
  {
    id: 'pc-5', predictedNeed: 'Healthcare', ward: 'Ward 16',
    predictedDate: '2026-04-05', intervention: 'Weekly health worker visits established',
    outcome: 'Healthcare access improved by 89%', peopleProtected: 150,
  },
  {
    id: 'pc-6', predictedNeed: 'Food Insecurity', ward: 'Ward 1',
    predictedDate: '2026-04-10', intervention: 'Community kitchen + ration supply chain',
    outcome: 'Food security restored for 95% of families', peopleProtected: 310,
  },
];

// ─── KPI SPARKLINE DATA ────────────────────────────────
export const kpiSparklines = {
  activeNeeds: [35, 38, 40, 39, 42, 44, 47],
  criticalAlerts: [5, 6, 5, 7, 6, 8, 8],
  volunteersDeployed: [98, 105, 110, 112, 118, 120, 124],
  wardsAtRisk: [4, 5, 4, 5, 6, 5, 6],
};

// ─── WARD RISK LEVELS ───────────────────────────────────
export const wardRiskLevels: Record<number, UrgencyLevel> = {
  1: 'Low', 2: 'Medium', 3: 'Critical', 4: 'Low', 5: 'High',
  6: 'Low', 7: 'Critical', 8: 'Medium', 9: 'High', 10: 'Low',
  11: 'Medium', 12: 'Critical', 13: 'Low', 14: 'Low', 15: 'High',
  16: 'Low', 17: 'Low', 18: 'Low', 19: 'Low', 20: 'Low',
};

export const severityColors: Record<UrgencyLevel, string> = {
  Critical: '#D85A30',
  High: '#BA7517',
  Medium: '#D4A017',
  Low: '#0F6E56',
};
