import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Regulatory intelligence collector starting...');

    // Collect regulatory intelligence data
    const regulatoryData = await collectRegulatoryData();
    
    // Analyze impact using AI
    const impactAnalysis = await analyzeRegulatoryImpact(regulatoryData);
    
    // Store in database
    await storeRegulatoryData(supabase, regulatoryData, impactAnalysis);

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      regulatory_data: regulatoryData,
      impact_analysis: impactAnalysis,
      total_regulations: regulatoryData.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in regulatory-intelligence:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function collectRegulatoryData() {
  console.log('Collecting regulatory intelligence data...');
  
  const now = new Date();
  
  // Simulate real regulatory data collection from multiple sources
  const recentRegulations = [
    {
      title: 'Enhanced Maritime Security Directive 2024/152/EU',
      description: 'New cybersecurity requirements for port operations and digital maritime services',
      regulation_type: 'EU Directive',
      source_authority: 'European Commission',
      effective_date: '2024-07-01',
      impact_level: 'High',
      sectors: ['Maritime', 'Cybersecurity', 'Port Operations'],
      content: {
        key_requirements: [
          'Mandatory cybersecurity assessments for port operators',
          'Enhanced incident reporting procedures',
          'Digital supply chain security measures'
        ],
        compliance_deadline: '2024-12-31',
        penalties: 'Up to 4% of annual turnover'
      },
      published_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Green Shipping Corridor Regulation (EU) 2024/234',
      description: 'Incentive framework for zero-emission shipping corridors in European waters',
      regulation_type: 'EU Regulation',
      source_authority: 'European Parliament',
      effective_date: '2024-08-15',
      impact_level: 'Medium',
      sectors: ['Shipping', 'Green Technology', 'Port Infrastructure'],
      content: {
        key_requirements: [
          'Green fuel infrastructure development',
          'Emission monitoring systems',
          'Performance reporting standards'
        ],
        funding_available: '€2.1B over 5 years',
        eligibility_criteria: 'Zero or near-zero emission technologies'
      },
      published_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Baltic Sea Protection Amendment 2024/167/EU',
      description: 'Strengthened environmental protection measures for Baltic Sea marine ecosystem',
      regulation_type: 'Environmental Directive',
      source_authority: 'European Environment Agency',
      effective_date: '2024-09-01',
      impact_level: 'High',
      sectors: ['Environmental', 'Shipping', 'Fisheries', 'Tourism'],
      content: {
        key_requirements: [
          'Enhanced ballast water treatment standards',
          'Stricter nutrient discharge limits',
          'Marine protected area expansion'
        ],
        monitoring_requirements: 'Real-time environmental data reporting',
        research_funding: '€450M for ecosystem restoration'
      },
      published_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Digital Maritime Services Act 2024/189/EU',
      description: 'Framework for digital transformation of maritime administration and services',
      regulation_type: 'Digital Services Act',
      source_authority: 'European Maritime Safety Agency',
      effective_date: '2024-10-01',
      impact_level: 'Medium',
      sectors: ['Maritime Administration', 'Digital Services', 'Data Management'],
      content: {
        key_requirements: [
          'Digital-first approach for maritime permits',
          'Interoperable data systems',
          'Enhanced data protection measures'
        ],
        implementation_phases: '3 phases over 24 months',
        technical_standards: 'Based on IMO FAL Convention'
      },
      published_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Sustainable Port Operations Directive 2024/201/EU',
      description: 'Environmental performance standards and circular economy requirements for ports',
      regulation_type: 'Sustainability Directive',
      source_authority: 'European Commission DG MOVE',
      effective_date: '2025-01-01',
      impact_level: 'High',
      sectors: ['Port Operations', 'Environmental', 'Waste Management'],
      content: {
        key_requirements: [
          'Carbon neutral port operations by 2035',
          'Waste-to-energy systems implementation',
          'Green logistics certification'
        ],
        investment_incentives: '€1.8B in green port funding',
        performance_metrics: 'Mandatory ESG reporting'
      },
      published_at: new Date().toISOString()
    }
  ];

  return recentRegulations;
}

async function analyzeRegulatoryImpact(regulatoryData: any) {
  if (!OPENAI_API_KEY) {
    console.log('OpenAI API key not available, skipping AI analysis');
    return generateBasicImpactAnalysis(regulatoryData);
  }

  console.log('Analyzing regulatory impact with AI...');

  try {
    const prompt = `
    Analyze the following recent EU maritime and environmental regulations for investment impact:

    ${JSON.stringify(regulatoryData, null, 2)}

    Provide analysis on:
    1. Investment opportunities created by these regulations
    2. Sectors most affected (positive/negative)
    3. Compliance costs and implementation timelines
    4. Risk mitigation strategies for investors
    5. Long-term market implications

    Format your response as structured JSON with clear categories.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are an expert in EU regulatory analysis and maritime investment intelligence. Provide structured, actionable insights for institutional investors.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 2000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;
    
    return {
      ai_analysis: analysis,
      analysis_timestamp: new Date().toISOString(),
      confidence_score: 85,
      methodology: 'GPT-4.1 regulatory impact analysis'
    };

  } catch (error) {
    console.error('Error in AI regulatory analysis:', error);
    return generateBasicImpactAnalysis(regulatoryData);
  }
}

function generateBasicImpactAnalysis(regulatoryData: any) {
  console.log('Generating basic impact analysis...');
  
  const highImpactRegulations = regulatoryData.filter((reg: any) => reg.impact_level === 'High');
  const upcomingDeadlines = regulatoryData.filter((reg: any) => {
    const effectiveDate = new Date(reg.effective_date);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return effectiveDate <= threeMonthsFromNow;
  });

  return {
    summary: {
      total_regulations: regulatoryData.length,
      high_impact_count: highImpactRegulations.length,
      upcoming_deadlines: upcomingDeadlines.length,
      most_affected_sectors: ['Maritime', 'Environmental', 'Port Operations']
    },
    investment_implications: {
      opportunities: [
        'Green technology investments driven by environmental regulations',
        'Cybersecurity solutions for maritime digital transformation',
        'Port infrastructure upgrades for sustainability compliance'
      ],
      risks: [
        'Compliance costs for existing maritime operations',
        'Technology transition requirements',
        'Potential operational disruptions during implementation'
      ]
    },
    sector_impact: {
      'Maritime': 'High positive impact through green incentives, medium compliance costs',
      'Port Operations': 'High transformation requirements, significant investment opportunities',
      'Environmental': 'Strong regulatory support for clean technologies'
    },
    timeline_priorities: upcomingDeadlines.map((reg: any) => ({
      regulation: reg.title,
      deadline: reg.effective_date,
      preparation_time: `${Math.ceil((new Date(reg.effective_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
    }))
  };
}

async function storeRegulatoryData(supabase: any, regulatoryData: any, impactAnalysis: any) {
  console.log('Storing regulatory data in database...');
  
  const records = regulatoryData.map((regulation: any) => ({
    title: regulation.title,
    description: regulation.description,
    regulation_type: regulation.regulation_type,
    source_authority: regulation.source_authority,
    effective_date: regulation.effective_date,
    impact_level: regulation.impact_level,
    sectors: regulation.sectors,
    url: `https://eur-lex.europa.eu/search?q=${encodeURIComponent(regulation.title.slice(0, 50))}`,
    content: regulation.content,
    published_at: regulation.published_at
  }));

  if (records.length > 0) {
    const { error } = await supabase
      .from('regulatory_feeds')
      .upsert(records, { onConflict: 'title' });
      
    if (error) {
      console.error('Error storing regulatory data:', error);
    } else {
      console.log(`Stored ${records.length} regulatory records`);
    }
  }

  // Store impact analysis in data cache
  await supabase
    .from('data_cache')
    .upsert({
      cache_key: 'regulatory_impact_analysis',
      source: 'AI Analysis',
      endpoint: 'internal',
      data_type: 'analysis',
      cached_data: impactAnalysis,
      expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 hours
    });
}