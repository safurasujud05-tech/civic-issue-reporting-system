// utils/aiHelpers.js - AI classification and legal assistance logic

// ============================================================
// ISSUE CLASSIFICATION
// ============================================================

// Keyword maps for classifying issues
const CATEGORY_KEYWORDS = {
  Electricity: [
    'power', 'electricity', 'electric', 'light', 'streetlight', 'street light',
    'blackout', 'outage', 'transformer', 'wire', 'voltage', 'current', 'shock',
    'sparking', 'short circuit', 'meter', 'bill', 'load shedding'
  ],
  Water: [
    'water', 'pipe', 'leak', 'drainage', 'sewage', 'flood', 'sewer',
    'tap', 'supply', 'borewell', 'tank', 'pump', 'contamination', 'dirty water',
    'no water', 'pipeline', 'overflow'
  ],
  Roads: [
    'road', 'pothole', 'street', 'highway', 'traffic', 'signal', 'divider',
    'footpath', 'pavement', 'bridge', 'underpass', 'speed breaker', 'broken road',
    'crack', 'repair', 'accident', 'bump'
  ],
  Garbage: [
    'garbage', 'waste', 'trash', 'rubbish', 'litter', 'dump', 'collection',
    'sweeper', 'cleanliness', 'hygiene', 'smell', 'stench', 'decompose',
    'bin', 'dustbin', 'sanitation', 'disposal'
  ],
};

// Department routing based on category
const DEPARTMENT_MAP = {
  Electricity: 'Electricity Board (BESCOM)',
  Water: 'BWSSB (Water Supply)',
  Roads: 'BBMP (Roads Division)',
  Garbage: 'BBMP Solid Waste Management',
};

/**
 * Classifies a complaint into a category using keyword matching
 * @param {string} title - Complaint title
 * @param {string} description - Complaint description
 * @returns {{ category: string, department: string, confidence: string }}
 */
function classifyIssue(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const scores = {};

  // Score each category based on keyword matches
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[category] = keywords.reduce((score, keyword) => {
      return score + (text.includes(keyword) ? 1 : 0);
    }, 0);
  }

  // Find highest score
  const topCategory = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  // Default to Roads if nothing matches
  const category = topCategory[1] > 0 ? topCategory[0] : 'Roads';
  const confidence = topCategory[1] > 2 ? 'High' : topCategory[1] > 0 ? 'Medium' : 'Low';

  return {
    category,
    department: DEPARTMENT_MAP[category],
    confidence,
  };
}

// ============================================================
// LEGAL ADVICE - MOCK RESPONSES
// ============================================================

const LEGAL_ADVICE_DB = {
  electricity: {
    rights: [
      'Right to uninterrupted power supply under the Electricity Act 2003',
      'Compensation for damages caused by power outages (Section 57)',
      'Right to file complaint with State Electricity Regulatory Commission (SERC)',
      'Right to get written acknowledgment of your complaint',
    ],
    actions: [
      'Call the electricity board helpline immediately (e.g., 1912 for BESCOM)',
      'File a written complaint at the local sub-station office',
      'Email the consumer grievance cell of your electricity provider',
      'If unresolved in 7 days, escalate to State Electricity Regulatory Commission',
      'Keep record of all communications and any losses incurred',
    ],
    authority: 'Electricity Board / State Electricity Regulatory Commission (SERC)',
    law: 'Electricity Act, 2003 - Section 57 & Consumer Rights under CEA 2010',
    timeline: '72 hours for restoration; compensation applicable after that',
  },
  water: {
    rights: [
      'Right to clean and safe drinking water (Article 21 - Right to Life)',
      'Right to uninterrupted water supply as per Municipal regulations',
      'Right to file grievance with Water Supply Board',
      'Right to compensation for water-borne diseases caused by contamination',
    ],
    actions: [
      'File complaint with local water authority (e.g., BWSSB helpline: 1916)',
      'Collect water sample evidence if contaminated',
      'Contact Municipal Corporation / Panchayat office',
      'File RTI to know about water supply schedule in your area',
      'Escalate to District Collector if no response in 15 days',
    ],
    authority: 'Municipal Water Supply Board / District Collector',
    law: 'Environment Protection Act 1986, Municipal Laws, Right to Life (Art. 21)',
    timeline: '48 hours for supply restoration; 7 days for contamination complaints',
  },
  roads: {
    rights: [
      'Right to safe roads under the Motor Vehicles Act 1988',
      'Right to claim compensation for accidents caused by potholes (NH Act)',
      'Right to file PIL in High Court for persistent road issues',
      'Municipal corporations are legally bound to maintain roads',
    ],
    actions: [
      'Report pothole on government app (e.g., BBMP app, MyGov)',
      'File complaint at local Municipal Corporation office',
      'Contact PWD (Public Works Department) for state highways',
      'Take photos with GPS location as evidence',
      'File accident compensation claim if injured due to road defect',
    ],
    authority: 'Municipal Corporation (BBMP) / PWD / NHAI for National Highways',
    law: 'Motor Vehicles Act 1988, NH Act 1956, Municipal Solid Waste Rules',
    timeline: 'Potholes should be fixed within 48 hours under BBMP SLA',
  },
  garbage: {
    rights: [
      'Right to clean environment under Article 48A (Directive Principle)',
      'Right to regular waste collection under Municipal Solid Waste Rules 2016',
      'Right to file complaint against municipality for non-collection',
      'Right to segregated waste collection',
    ],
    actions: [
      'Call BBMP/Municipal garbage helpline',
      'File complaint on Swachh Bharat app or MyGov portal',
      'Contact local Ward Councillor or MLA',
      'File RTI asking about solid waste management in your ward',
      'Escalate to State Pollution Control Board for illegal dumping',
    ],
    authority: 'Municipal Corporation / Solid Waste Management Department',
    law: 'Solid Waste Management Rules 2016, Environment Protection Act 1986',
    timeline: 'Daily collection is mandatory; missed collection to be addressed in 24 hours',
  },
};

/**
 * Returns mock legal advice based on complaint text
 * In production, this calls OpenAI API
 */
function getMockLegalAdvice(complaintText) {
  const text = complaintText.toLowerCase();

  let topic = 'roads'; // default
  if (text.includes('power') || text.includes('electric') || text.includes('light') || text.includes('current')) {
    topic = 'electricity';
  } else if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('supply')) {
    topic = 'water';
  } else if (text.includes('road') || text.includes('pothole') || text.includes('street') || text.includes('traffic')) {
    topic = 'roads';
  } else if (text.includes('garbage') || text.includes('waste') || text.includes('trash') || text.includes('litter')) {
    topic = 'garbage';
  }

  const advice = LEGAL_ADVICE_DB[topic];

  return {
    topic: topic.charAt(0).toUpperCase() + topic.slice(1),
    summary: `Based on your complaint, here are your legal rights and recommended actions for a ${topic}-related civic issue in India.`,
    rights: advice.rights,
    recommendedActions: advice.actions,
    relevantAuthority: advice.authority,
    applicableLaw: advice.law,
    expectedTimeline: advice.timeline,
    disclaimer: 'This is AI-generated general legal information. For specific legal advice, consult a qualified lawyer.',
  };
}

/**
 * Get legal advice via OpenAI (used when API key is available)
 */
async function getOpenAILegalAdvice(complaintText) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a legal advisor specializing in Indian civic rights and municipal law. 
          When a user describes a civic issue, provide:
          1. Their legal rights (3-4 points)
          2. Recommended actions (4-5 steps)
          3. Relevant authority to contact
          4. Applicable Indian laws
          5. Expected resolution timeline
          
          Respond in JSON format with keys: topic, summary, rights (array), recommendedActions (array), 
          relevantAuthority, applicableLaw, expectedTimeline, disclaimer.
          Keep responses practical and actionable.`,
        },
        {
          role: 'user',
          content: `I have this civic complaint: "${complaintText}". What are my legal rights and what should I do?`,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Try to parse JSON response
  try {
    return JSON.parse(content);
  } catch {
    // If not valid JSON, return structured response
    return getMockLegalAdvice(complaintText);
  }
}

module.exports = { classifyIssue, getMockLegalAdvice, getOpenAILegalAdvice };
