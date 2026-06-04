// server/utils/openaiHelper.js
// OpenAI integration for legal advice with validation

const OpenAI = require('openai');

// Initialize OpenAI client only when API key is provided to avoid startup crashes
let openai = null;
if (process.env.OPENAI_API_KEY) {
  try {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (err) {
    console.warn('OpenAI client initialization failed:', err.message);
    openai = null;
  }
} else {
  openai = null;
}

// System prompt for legal advisor - ensures answers are legal-focused and action-oriented
const LEGAL_SYSTEM_PROMPT = `You are an AI legal assistant for a civic issue reporting system in India.
When a user describes a civic issue, respond ONLY in JSON with the following keys:
  topic, summary, rights, recommendedActions, relevantAuthority, applicableLaw, expectedTimeline, disclaimer.
- topic: short issue area, such as Electricity, Water, Roads, or Garbage.
- summary: brief explanation of the user's legal rights and next steps.
- rights: 3-4 actionable citizen rights relevant to the issue.
- recommendedActions: 4-5 concrete steps the user can take, including how to report and escalate.
- relevantAuthority: the government body or department to contact.
- applicableLaw: the main Indian law or regulation that supports the citizen's claim.
- expectedTimeline: realistic time frame for response or escalation.
- disclaimer: general legal information only, not legal advice.
Keep the response concise, practical, and focused on what the citizen can do next. Do not include any additional fields.`;

// Check if query is about legal/civic issues
function isLegalIssueQuery(query) {
  const legalKeywords = [
    'law', 'legal', 'right', 'rights', 'rule', 'regulation', 'civic', 'report', 'complaint',
    'tenant', 'property', 'environment', 'safety', 'labor', 'discriminat', 'consumer',
    'authority', 'government', 'court', 'justice', 'violation', 'issue', 'problem',
    'street', 'light', 'power', 'outage', 'water', 'garbage', 'pothole', 'road', 'roads',
    'sewer', 'traffic', 'accident', 'public', 'utility', 'service', 'citizen', 'complain'
  ];
  
  const queryLower = query.toLowerCase();
  const matchCount = legalKeywords.filter(kw => queryLower.includes(kw)).length;
  
  return matchCount > 0;
}

// Get legal advice from OpenAI with validation
async function getLegalAdvice(userQuery) {
  try {
    // Validate the query is legal-related
    if (!isLegalIssueQuery(userQuery)) {
      return {
        success: false,
        message: 'I can only provide information about legal matters related to civic issues. Please ask about your legal rights or how to report civic problems legally.',
        isLegalQuestion: false
      };
    }

    // Use mock advice when OpenAI is not configured or client initialization failed
    if (!process.env.OPENAI_API_KEY || !openai) {
      return getMockLegalAdvice(userQuery);
    }

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: LEGAL_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `Complaint: ${userQuery}`
        }
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    const content = response.choices[0].message.content.trim();
    let parsedAdvice = null;

    try {
      parsedAdvice = JSON.parse(content);
    } catch (jsonError) {
      const jsonMatch = content.match(/\{[\s\S]*\}$/);
      if (jsonMatch) {
        parsedAdvice = JSON.parse(jsonMatch[0]);
      }
    }

    if (parsedAdvice && typeof parsedAdvice === 'object' && parsedAdvice.rights && parsedAdvice.recommendedActions) {
      return {
        success: true,
        advice: parsedAdvice,
        isLegalQuestion: true,
        source: 'OpenAI',
        disclaimer: parsedAdvice.disclaimer || 'This is general information only, not legal advice. Consult a lawyer for specific cases.'
      };
    }

    return getMockLegalAdvice(userQuery);
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return getMockLegalAdvice(userQuery);
  }
}

// Mock legal advice fallback
function getMockLegalAdvice(query) {
  if (!isLegalIssueQuery(query)) {
    return {
      success: false,
      message: 'I can only provide information about legal matters related to civic issues. Please ask about your legal rights or how to report civic problems legally.',
      isLegalQuestion: false
    };
  }

  const q = query.toLowerCase();
  const baseDisclaimer = 'This is general information only, not legal advice. Consult a lawyer for specific cases.';

  const makeAdvice = ({ topic, summary, rights, actions, authority, law, timeline }) => ({
    success: true,
    advice: {
      topic,
      summary,
      rights,
      recommendedActions: actions,
      relevantAuthority: authority,
      applicableLaw: law,
      expectedTimeline: timeline,
      disclaimer: baseDisclaimer,
    },
    isLegalQuestion: true,
    source: 'Mock',
    disclaimer: baseDisclaimer,
  });

  if (q.includes('street light') || q.includes('light') || q.includes('power') || q.includes('outage') || q.includes('electricity')) {
    return makeAdvice({
      topic: 'Electricity',
      summary: 'You have the right to reliable street lighting and informed service from the electricity board. Report outages and escalate if they are not fixed promptly.',
      rights: [
        'Right to uninterrupted street lighting and public safety under municipal service rules.',
        'Right to file a written complaint with the local electricity board.',
        'Right to receive a complaint acknowledgment or reference number.',
        'Right to escalate to the municipal commissioner or local councilor if unresolved.',
      ],
      actions: [
        'Note the exact location and duration of the outage.',
        'File a complaint with the local electricity board or municipal lighting department.',
        'Keep a copy of the complaint ID, email, or message.',
        'If not fixed within 3 days, escalate to the municipal commissioner or local councilor.',
        'Record any danger caused by poor lighting and share evidence if needed.',
      ],
      authority: 'Local Electricity Board / Municipal Lighting Department',
      law: 'Electricity Act 2003 and local municipal service rules',
      timeline: 'Report immediately; escalate after 3–5 days of no action.',
    });
  }

  if (q.includes('water') || q.includes('no water') || q.includes('water supply')) {
    return makeAdvice({
      topic: 'Water',
      summary: 'You have the right to clean, regular water supply. Register your complaint with the local water board and escalate if the disruption continues.',
      rights: [
        'Right to clean drinking water under Article 21 of the Constitution.',
        'Right to file a grievance with the local water supply authority.',
        'Right to ask for a timeline for supply restoration.',
        'Right to escalate to the district collector if unresolved.',
      ],
      actions: [
        'Record the days and times when water supply was missing.',
        'Submit a complaint to the local water board or municipality.',
        'Keep a copy of your complaint reference number.',
        'If not resolved in 7 days, send a written escalation to the district collector.',
        'Collect evidence of contamination if water quality is poor.',
      ],
      authority: 'Local Water Supply Board / Municipal Corporation',
      law: 'Environment Protection Act 1986 and municipal water supply regulations',
      timeline: 'Expect a response within 48–72 hours; escalate if unresolved after 7 days.',
    });
  }

  if (q.includes('garbage') || q.includes('waste') || q.includes('dustbin') || q.includes('trash')) {
    return makeAdvice({
      topic: 'Garbage',
      summary: 'You are entitled to regular garbage collection and a clean environment. Complain to the sanitation department and escalate if service is repeatedly missed.',
      rights: [
        'Right to a clean environment under Article 48A and municipal waste rules.',
        'Right to file a complaint with the local sanitation department.',
        'Right to demand regular door-to-door collection.',
        'Right to escalate to the pollution control board if the problem persists.',
      ],
      actions: [
        'Take photos of uncollected garbage and note missed collection dates.',
        'Report the issue to the municipal sanitation department or BBMP app.',
        'Keep any complaint IDs or acknowledgment receipts.',
        'Contact your ward councilor or local elected representative.',
        'Escalate to the pollution control board for illegal dumping or health risks.',
      ],
      authority: 'Local Municipal Corporation / Sanitation Department',
      law: 'Solid Waste Management Rules 2016 and Environment Protection Act 1986',
      timeline: 'Daily collection is expected; escalate if not collected within 24–48 hours.',
    });
  }

  if (q.includes('pothole') || q.includes('road') || q.includes('roads') || q.includes('accident')) {
    return makeAdvice({
      topic: 'Roads',
      summary: 'You have the right to safe roads. Report potholes and damaged roads to the municipal roads department and follow up until repairs are made.',
      rights: [
        'Right to safe public roads under the Motor Vehicles Act.',
        'Right to file a complaint with the municipal corporation or PWD.',
        'Right to request repair work for road defects.',
        'Right to escalate to the local commissioner if there is no repair.',
      ],
      actions: [
        'Photograph the pothole or damaged road with the exact location.',
        'File a formal complaint with the local roads department or BBMP.',
        'Retain copies of the complaint reference number or email.',
        'If the issue is not fixed, contact your ward councilor or local MP.',
        'If the defect causes an accident, report it to the police and seek compensation.',
      ],
      authority: 'Municipal Roads Department / Public Works Department',
      law: 'Motor Vehicles Act 1988 and municipal road maintenance regulations',
      timeline: 'Pothole repairs should begin within 48–72 hours after reporting.',
    });
  }

  return makeAdvice({
    topic: 'General Civic Issue',
    summary: 'You have the right to seek action from local civic authorities. Document the issue clearly and follow the official complaint process.',
    rights: [
      'Right to file a grievance with the relevant municipal or utility authority.',
      'Right to receive a complaint acknowledgment or reference number.',
      'Right to escalate the matter if the authority does not respond.',
      'Right to consult an elected representative or district official.',
    ],
    actions: [
      'Write down the exact nature of the problem and the location.',
      'Submit a complaint to the local civic authority or utility provider.',
      'Save any evidence, such as photos, videos, or correspondence.',
      'Follow up after 3–5 days if there is no response.',
      'Escalate to higher officials like the district collector or municipal commissioner.',
    ],
    authority: 'Local Municipal Authority / Utility Provider',
    law: 'Indian Constitution Article 21 and local civic service regulations',
    timeline: 'Expect an initial response within a few days; escalate after one week without action.',
  });
}

function classifyComplaintText(text) {
  const normalized = text.toLowerCase();
  if (normalized.match(/\b(electric|power|street light|outage|electricity)\b/)) {
    return {
      category: 'Electricity',
      authority: 'Electricity Board / Local Power Distribution Authority',
    };
  }
  if (normalized.match(/\b(water|drinking water|supply|sewer|sewage)\b/)) {
    return {
      category: 'Water',
      authority: 'Water Supply Board / Local Municipality',
    };
  }
  if (normalized.match(/\b(pothole|road|roads|street|traffic|accident|pavement)\b/)) {
    return {
      category: 'Roads',
      authority: 'Public Works Department / Roads Department',
    };
  }
  if (normalized.match(/\b(garbage|waste|trash|dustbin|sanitation|rubbish)\b/)) {
    return {
      category: 'Garbage',
      authority: 'Sanitation Department / Municipal Corporation',
    };
  }

  return {
    category: 'General Civic Issue',
    authority: 'Local Municipal Authority',
  };
}

function createMockActionAnalysis(complaintText) {
  const { category, authority } = classifyComplaintText(complaintText);
  const simpleAdvice = `This complaint appears to involve ${category.toLowerCase()} service. Contact ${authority} and explain your issue clearly. Keep records of all communication and escalate if no action is taken.`;
  const complaintLetter = `To: ${authority}\nSubject: Formal Complaint Regarding ${category} Issue\n\nDear Sir/Madam,\n\nI am writing to formally report a civic issue that requires urgent attention. The problem is described as follows:\n\n${complaintText.trim()}\n\nThis issue is causing inconvenience and affects public safety/welfare. I request that your office take prompt action to investigate and resolve the matter. Please keep me informed of the steps taken and any expected timeline for resolution.\n\nThank you for your prompt attention to this matter.\n\nSincerely,\n[Your Name]\n[Contact Information]`;

  return {
    category,
    authority,
    legal_advice: simpleAdvice,
    steps: [
      `Note the exact location and details of the issue in writing.`,
      `Submit a complaint to ${authority} through their complaint portal, helpline, or office.`,
      'Keep copies of any receipts, complaint IDs, or communication records.',
      'If the issue is not resolved within a reasonable time, escalate to the local municipal commissioner or elected representative.',
    ],
    complaint_letter: complaintLetter,
  };
}

async function analyzeComplaintText(complaintText) {
  const baseResponse = createMockActionAnalysis(complaintText);

  if (!process.env.OPENAI_API_KEY || !openai) {
    return {
      ...baseResponse,
      source: 'Mock',
      disclaimer: 'This is general information only, not legal advice. Consult a lawyer for specific cases.',
    };
  }

  try {
    const prompt = `You are an AI assistant for a civic issue reporting system. Analyze the complaint text and return only valid JSON with the following keys: category, authority, legal_advice, steps, complaint_letter. Use simple language and keep the legal advice easy to understand. The complaint letter must be formal and realistic.`;
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Complaint text: ${complaintText}` },
      ],
      temperature: 0.3,
      max_tokens: 700,
    });

    const rawText = response.choices[0].message.content.trim();
    let result = null;

    try {
      result = JSON.parse(rawText);
    } catch (jsonError) {
      const jsonMatch = rawText.match(/\{[\s\S]*\}$/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      }
    }

    if (!result || typeof result !== 'object' || !result.category) {
      throw new Error('OpenAI result missing expected fields');
    }

    return {
      ...result,
      source: 'OpenAI',
      disclaimer: 'This is general information only, not legal advice. Consult a lawyer for specific cases.',
    };
  } catch (error) {
    console.error('AI action analysis failed:', error.message);
    return {
      ...baseResponse,
      source: 'Mock',
      disclaimer: 'This is general information only, not legal advice. Consult a lawyer for specific cases.',
    };
  }
}

module.exports = {
  getLegalAdvice,
  getMockLegalAdvice,
  isLegalIssueQuery,
  classifyComplaintText,
  createMockActionAnalysis,
  analyzeComplaintText,
};
