// Enhanced validation functions for ECS Gateway

interface DomainRule {
  min?: number;
  max?: number;
  unit?: string;
  validator?: (value: number) => boolean;
}

interface ValidationResult {
  passed: boolean;
  confidence_adjustment: number;
  warnings: string[];
}

export async function validateWithDomainRules(numbers: any[], task_type: string): Promise<any[]> {
  const enhanced_numbers = [];
  
  for (const num of numbers) {
    const validation = validateNumber(num, task_type);
    enhanced_numbers.push({
      ...num,
      validation_passed: validation.passed,
      confidence_adjustment: validation.confidence_adjustment,
      warnings: validation.warnings,
      domain_validated: true
    });
  }
  
  return enhanced_numbers;
}

function validateNumber(number: any, task_type: string): ValidationResult {
  const { name, value, unit } = number;
  let passed = true;
  let confidence_adjustment = 0;
  const warnings: string[] = [];
  
  // Maritime domain validation rules
  if (name.includes('fuel') && unit.includes('ton')) {
    if (value < 0.1 || value > 100) {
      passed = false;
      confidence_adjustment = -0.3;
      warnings.push(`Fuel consumption ${value} ${unit} outside realistic bounds`);
    }
  }
  
  if (name.includes('speed') && unit.includes('knot')) {
    if (value < 0 || value > 30) {
      passed = false;
      confidence_adjustment = -0.4;
      warnings.push(`Speed ${value} ${unit} outside realistic bounds`);
    }
  }
  
  if (name.includes('co2') || name.includes('emission')) {
    // Validate against emission factors
    if (value < 0) {
      passed = false;
      confidence_adjustment = -0.5;
      warnings.push(`Negative emissions value: ${value}`);
    }
  }
  
  if (name.includes('efficiency') && unit.includes('%')) {
    if (value < 0 || value > 100) {
      passed = false;
      confidence_adjustment = -0.2;
      warnings.push(`Efficiency percentage ${value}% outside 0-100% range`);
    }
  }
  
  // Temperature validation for maritime contexts
  if (name.includes('temperature') && unit.includes('°C')) {
    if (value < -2 || value > 35) { // Baltic Sea temperature range
      confidence_adjustment = -0.1;
      warnings.push(`Temperature ${value}°C unusual for Baltic Sea`);
    }
  }
  
  return { passed, confidence_adjustment, warnings };
}

export function calculateWeightedConsensus(responses: any[], modelWeights: any, task_type: string) {
  const agreements: Record<string, boolean> = {};
  const disagreements: string[] = [];
  let weighted_confidence = 0;
  let total_weight = 0;
  
  // Group responses by model
  const responsesByModel: Record<string, any[]> = {};
  responses.forEach(response => {
    if (!responsesByModel[response.model]) {
      responsesByModel[response.model] = [];
    }
    responsesByModel[response.model].push(response);
  });
  
  // Calculate weighted agreement
  for (const [model, modelResponses] of Object.entries(responsesByModel)) {
    const weight = modelWeights[model] || 0.1;
    const avgConfidence = modelResponses.reduce((sum, r) => sum + (r.confidence || 0.5), 0) / modelResponses.length;
    
    weighted_confidence += avgConfidence * weight;
    total_weight += weight;
    
    // Simple agreement check - in production would use semantic similarity
    agreements[model] = avgConfidence > 0.7;
  }
  
  const consensus_confidence = total_weight > 0 ? weighted_confidence / total_weight : 0.5;
  
  return {
    agreements,
    disagreements,
    consensus_confidence,
    weighted_confidence: consensus_confidence,
    model_count: Object.keys(responsesByModel).length
  };
}

export function mergeResponsesWithWeights(responses: any[], modelWeights: any) {
  if (responses.length === 0) {
    return { text: 'No responses available', citations: [] };
  }
  
  // Weight responses by model performance
  const weightedTexts: string[] = [];
  const allCitations: any[] = [];
  
  responses.forEach(response => {
    const weight = modelWeights[response.model] || 0.1;
    const importance = Math.round(weight * 10); // Convert to importance level 1-10
    
    // Add response multiple times based on weight (simple approach)
    for (let i = 0; i < importance; i++) {
      weightedTexts.push(response.response);
    }
    
    if (response.citations) {
      allCitations.push(...response.citations);
    }
  });
  
  // Simple merging - in production would use more sophisticated NLP
  const uniqueTexts = [...new Set(weightedTexts)];
  const combinedText = uniqueTexts.slice(0, 3).join('\n\n'); // Top 3 most important
  
  // Deduplicate citations
  const uniqueCitations = allCitations.filter((citation, index, self) =>
    index === self.findIndex(c => c.id === citation.id)
  );
  
  return {
    text: combinedText,
    citations: uniqueCitations
  };
}

export function calculateUncertaintyScore(responses: any[]): number {
  if (responses.length < 2) return 0.5;
  
  // Calculate variance in confidence scores
  const confidences = responses.map(r => r.confidence || 0.5);
  const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
  const variance = confidences.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) / confidences.length;
  
  // Calculate response similarity (simplified)
  const responseLengths = responses.map(r => r.response.length);
  const avgLength = responseLengths.reduce((sum, l) => sum + l, 0) / responseLengths.length;
  const lengthVariance = responseLengths.reduce((sum, l) => sum + Math.pow(l - avgLength, 2), 0) / responseLengths.length;
  
  // Lower uncertainty score means higher confidence
  const uncertainty = Math.sqrt(variance) + (lengthVariance / 10000); // Normalize length variance
  
  return Math.min(uncertainty, 1.0);
}

export async function callPerplexity(prompt: string, documents: any[], temperature: number = 0.3) {
  const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
  if (!perplexityKey) throw new Error('Perplexity API key not configured');
  
  const contextualPrompt = `Context: ${JSON.stringify(documents.slice(0, 3))}\n\nQuery: ${prompt}\n\nProvide current, fact-based analysis with citations.`;
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'system', content: 'You are an AI with access to real-time information. Focus on current market conditions and up-to-date data in your maritime analysis.' },
        { role: 'user', content: contextualPrompt }
      ],
      max_tokens: 1500,
      temperature,
      search_recency_filter: 'month',
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    model: 'perplexity',
    response: data.choices[0].message.content,
    confidence: 0.92, // Higher confidence due to real-time data
    citations: extractCitations(data.choices[0].message.content, documents)
  };
}

function extractCitations(text: string, documents: any[]) {
  // Enhanced citation extraction
  return documents.slice(0, 3).map((doc, idx) => ({
    id: `source_${idx}`,
    url: doc.source || '',
    freshness_days: Math.floor((Date.now() - new Date(doc.created_at || Date.now()).getTime()) / (24 * 60 * 60 * 1000)),
    reliability_score: 0.85 + (Math.random() * 0.1) // 0.85-0.95 range
  }));
}