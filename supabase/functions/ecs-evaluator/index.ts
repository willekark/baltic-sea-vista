import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoldenSetItem {
  id: string;
  task_type: string;
  query: string;
  expected_answer: string;
  expected_numbers?: Array<{
    name: string;
    value: number;
    tolerance: number;
  }>;
  required_citations?: string[];
  category: string;
}

interface EvaluationResult {
  item_id: string;
  factuality_score: number;
  numeric_accuracy: number;
  citation_validity: number;
  latency_ms: number;
  cost_usd: number;
  model_votes: any[];
  passed: boolean;
}

interface LeaderboardEntry {
  model: string;
  task_type: string;
  accuracy: number;
  avg_cost: number;
  avg_latency: number;
  eval_count: number;
  last_updated: string;
}

const GOLDEN_SET: GoldenSetItem[] = [
  {
    id: 'esg_reg_001',
    task_type: 'qna',
    query: 'What are the current EU emissions regulations for shipping in the Baltic Sea?',
    expected_answer: 'IMO 2020 sulfur regulations, EU Green Deal provisions',
    required_citations: ['IMO', 'EU Commission'],
    category: 'regulations'
  },
  {
    id: 'port_stats_001',
    task_type: 'numeric',
    query: 'What is the average port congestion in Stockholm over the last 30 days?',
    expected_answer: 'Port congestion statistics',
    expected_numbers: [
      { name: 'avg_congestion_hours', value: 4.2, tolerance: 0.5 }
    ],
    category: 'port_operations'
  },
  {
    id: 'emissions_001',
    task_type: 'numeric',
    query: 'Calculate daily CO2 emissions from Baltic Sea shipping',
    expected_answer: 'CO2 emissions calculation',
    expected_numbers: [
      { name: 'daily_co2', value: 45000, tolerance: 0.1 }
    ],
    category: 'emissions'
  },
  {
    id: 'ais_anomaly_001',
    task_type: 'geo',
    query: 'Detect unusual vessel movements in the Baltic Sea',
    expected_answer: 'AIS anomaly detection results',
    category: 'vessel_tracking'
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('ECS Evaluator called');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.url.includes('/eval/run')) {
      const evaluationResults = await runEvaluation(supabase);
      
      // Store results in database
      await storeEvaluationResults(evaluationResults, supabase);
      
      // Update leaderboard
      const leaderboard = await updateLeaderboard(evaluationResults, supabase);
      
      return new Response(JSON.stringify({
        results: evaluationResults,
        leaderboard,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.url.includes('/eval/leaderboard')) {
      const leaderboard = await getLeaderboard(supabase);
      
      return new Response(JSON.stringify({
        leaderboard,
        last_updated: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ECS Evaluator:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function runEvaluation(supabase: any): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = [];
  
  for (const item of GOLDEN_SET) {
    try {
      console.log(`Evaluating item: ${item.id}`);
      
      // Call ECS Gateway
      const { data: ecsResponse, error } = await supabase.functions.invoke('ecs-gateway', {
        body: {
          task_type: item.task_type,
          query: item.query,
          constraints: { must_cite: true, deadline_ms: 8000 }
        }
      });

      if (error) {
        console.error(`Error evaluating ${item.id}:`, error);
        continue;
      }

      // Evaluate response
      const evaluation = await evaluateResponse(item, ecsResponse);
      results.push(evaluation);
      
    } catch (error) {
      console.error(`Error evaluating ${item.id}:`, error);
    }
  }
  
  return results;
}

async function evaluateResponse(goldenItem: GoldenSetItem, response: any): Promise<EvaluationResult> {
  // Factuality scoring (simplified semantic similarity)
  const factuality_score = calculateFactualityScore(goldenItem.expected_answer, response.answer);
  
  // Numeric accuracy
  let numeric_accuracy = 1.0;
  if (goldenItem.expected_numbers) {
    numeric_accuracy = calculateNumericAccuracy(goldenItem.expected_numbers, response.numbers || []);
  }
  
  // Citation validity
  const citation_validity = calculateCitationValidity(
    goldenItem.required_citations || [], 
    response.citations || []
  );
  
  const overall_score = (factuality_score * 0.5) + (numeric_accuracy * 0.3) + (citation_validity * 0.2);
  
  return {
    item_id: goldenItem.id,
    factuality_score,
    numeric_accuracy,
    citation_validity,
    latency_ms: response.latency_ms || 0,
    cost_usd: response.cost_estimate?.usd || 0,
    model_votes: response.model_votes || [],
    passed: overall_score >= 0.7
  };
}

function calculateFactualityScore(expected: string, actual: string): number {
  // Simple word overlap scoring (in production, use embeddings)
  const expectedWords = new Set(expected.toLowerCase().split(/\s+/));
  const actualWords = new Set(actual.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...expectedWords].filter(word => actualWords.has(word)));
  const union = new Set([...expectedWords, ...actualWords]);
  
  return intersection.size / union.size;
}

function calculateNumericAccuracy(expected: any[], actual: any[]): number {
  if (expected.length === 0) return 1.0;
  if (actual.length === 0) return 0.0;
  
  let totalAccuracy = 0;
  let matchedCount = 0;
  
  for (const expectedNum of expected) {
    const actualNum = actual.find(a => a.name === expectedNum.name);
    if (actualNum) {
      const error = Math.abs(actualNum.value - expectedNum.value) / expectedNum.value;
      const accuracy = error <= expectedNum.tolerance ? 1.0 : Math.max(0, 1 - error);
      totalAccuracy += accuracy;
      matchedCount++;
    }
  }
  
  return matchedCount > 0 ? totalAccuracy / expected.length : 0;
}

function calculateCitationValidity(required: string[], actual: any[]): number {
  if (required.length === 0) return actual.length > 0 ? 1.0 : 0.5;
  
  let validCount = 0;
  for (const req of required) {
    const found = actual.some(citation => 
      citation.id.toLowerCase().includes(req.toLowerCase())
    );
    if (found) validCount++;
  }
  
  return validCount / required.length;
}

async function storeEvaluationResults(results: EvaluationResult[], supabase: any) {
  // Create evaluation_runs table if it doesn't exist
  const { error: createError } = await supabase.rpc('create_evaluation_tables');
  
  if (createError) {
    console.log('Tables may already exist:', createError);
  }
  
  // Store evaluation run
  const { data: runData, error: runError } = await supabase
    .from('evaluation_runs')
    .insert({
      run_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      total_items: results.length,
      passed_items: results.filter(r => r.passed).length,
      avg_score: results.reduce((sum, r) => sum + r.factuality_score, 0) / results.length
    })
    .select()
    .single();
    
  if (runError) {
    console.error('Error storing run:', runError);
    return;
  }
  
  // Store individual results
  for (const result of results) {
    const { error } = await supabase
      .from('evaluation_results')
      .insert({
        run_id: runData.run_id,
        item_id: result.item_id,
        factuality_score: result.factuality_score,
        numeric_accuracy: result.numeric_accuracy,
        citation_validity: result.citation_validity,
        latency_ms: result.latency_ms,
        cost_usd: result.cost_usd,
        passed: result.passed,
        model_votes: result.model_votes
      });
      
    if (error) {
      console.error('Error storing result:', error);
    }
  }
}

async function updateLeaderboard(results: EvaluationResult[], supabase: any): Promise<LeaderboardEntry[]> {
  const leaderboard: LeaderboardEntry[] = [];
  
  // Group results by model and task type
  const modelStats = new Map<string, Map<string, any>>();
  
  for (const result of results) {
    for (const vote of result.model_votes) {
      const modelKey = vote.model;
      const taskType = 'general'; // Simplified
      
      if (!modelStats.has(modelKey)) {
        modelStats.set(modelKey, new Map());
      }
      
      const taskStats = modelStats.get(modelKey)!;
      if (!taskStats.has(taskType)) {
        taskStats.set(taskType, {
          accuracy_sum: 0,
          cost_sum: 0,
          latency_sum: 0,
          count: 0
        });
      }
      
      const stats = taskStats.get(taskType);
      stats.accuracy_sum += result.factuality_score;
      stats.cost_sum += result.cost_usd;
      stats.latency_sum += result.latency_ms;
      stats.count += 1;
    }
  }
  
  // Calculate averages and create leaderboard entries
  for (const [model, taskMap] of modelStats.entries()) {
    for (const [taskType, stats] of taskMap.entries()) {
      leaderboard.push({
        model,
        task_type: taskType,
        accuracy: stats.accuracy_sum / stats.count,
        avg_cost: stats.cost_sum / stats.count,
        avg_latency: stats.latency_sum / stats.count,
        eval_count: stats.count,
        last_updated: new Date().toISOString()
      });
    }
  }
  
  return leaderboard.sort((a, b) => b.accuracy - a.accuracy);
}

async function getLeaderboard(supabase: any): Promise<LeaderboardEntry[]> {
  // In production, this would query the leaderboard table
  // For now, return mock data
  return [
    {
      model: 'claude',
      task_type: 'qna',
      accuracy: 0.89,
      avg_cost: 0.03,
      avg_latency: 2100,
      eval_count: 45,
      last_updated: new Date().toISOString()
    },
    {
      model: 'grok',
      task_type: 'qna',
      accuracy: 0.85,
      avg_cost: 0.02,
      avg_latency: 1800,
      eval_count: 45,
      last_updated: new Date().toISOString()
    },
    {
      model: 'openai',
      task_type: 'qna',
      accuracy: 0.87,
      avg_cost: 0.05,
      avg_latency: 2300,
      eval_count: 45,
      last_updated: new Date().toISOString()
    }
  ];
}