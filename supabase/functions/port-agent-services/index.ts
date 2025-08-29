import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, port_id, vessel_size, cargo_type } = await req.json()

    console.log(`Port Agent Service - Action: ${action}`)

    switch (action) {
      case 'get_dashboard':
        return await getPortAgentDashboard(supabase)
      
      case 'get_port_costs':
        return await getPortCosts(supabase, port_id, vessel_size, cargo_type)
      
      case 'get_berth_availability':
        return await getBerthAvailability(supabase, port_id)
      
      case 'get_port_performance':
        return await getPortPerformance(supabase, port_id)
      
      case 'optimize_route':
        return await optimizePortRoute(supabase, vessel_size, cargo_type)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Port agent service error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function getPortAgentDashboard(supabase: any) {
  // Get ports overview
  const { data: ports, error: portsError } = await supabase
    .from('ports')
    .select('*')
    .order('name')
    .limit(8)

  if (portsError) throw portsError

  // Get active port calls
  const { data: activeCalls, error: callsError } = await supabase
    .from('port_calls')
    .select('*, vessels(vessel_name), ports(name, code)')
    .in('status', ['scheduled', 'arrived', 'in_progress'])
    .order('scheduled_arrival')
    .limit(10)

  if (callsError) throw callsError

  // Get port congestion alerts
  const { data: congestion, error: congestionError } = await supabase
    .from('port_congestion')
    .select('*, port_name')
    .in('congestion_level', ['high', 'critical'])
    .order('timestamp', { ascending: false })
    .limit(5)

  if (congestionError) throw congestionError

  // Get fuel prices summary
  const { data: fuelPrices, error: fuelError } = await supabase
    .from('fuel_prices')
    .select('*, port_name')
    .order('price_per_tonne')
    .limit(8)

  if (fuelError) throw fuelError

  // Generate insights
  const insights = generatePortInsights(ports, activeCalls, congestion, fuelPrices)

  return new Response(
    JSON.stringify({
      ports,
      active_calls: activeCalls,
      congestion_alerts: congestion,
      fuel_prices: fuelPrices,
      insights,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getPortCosts(supabase: any, port_id: string, vessel_size: string, cargo_type: string) {
  const { data: port, error: portError } = await supabase
    .from('ports')
    .select('*')
    .eq('id', port_id)
    .single()

  if (portError) throw portError

  const { data: tariffs, error: tariffsError } = await supabase
    .from('port_tariffs')
    .select('*')
    .eq('port_id', port_id)
    .or(`vessel_size_category.eq.${vessel_size},vessel_size_category.eq.all`)
    .or(`cargo_type.eq.${cargo_type},cargo_type.is.null`)

  if (tariffsError) throw tariffsError

  // Calculate estimated costs
  const estimatedCosts = calculatePortCosts(tariffs, vessel_size, 25000) // Assuming 25k GT vessel

  return new Response(
    JSON.stringify({
      port,
      tariffs,
      estimated_costs: estimatedCosts,
      recommendations: generateCostRecommendations(estimatedCosts)
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getBerthAvailability(supabase: any, port_id: string) {
  const { data: availability, error } = await supabase
    .from('berth_availability')
    .select('*')
    .eq('port_id', port_id)
    .gte('available_until', new Date().toISOString())
    .order('available_from')

  if (error) throw error

  return new Response(
    JSON.stringify({
      berths: availability,
      summary: {
        available_count: availability.filter((b: any) => b.status === 'available').length,
        reserved_count: availability.filter((b: any) => b.status === 'reserved').length,
        next_available: availability.find((b: any) => b.status === 'available')?.available_from
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getPortPerformance(supabase: any, port_id: string) {
  const { data: performance, error } = await supabase
    .from('port_performance')
    .select('*')
    .eq('port_id', port_id)
    .gte('measurement_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('measurement_date', { ascending: false })

  if (error) throw error

  return new Response(
    JSON.stringify({
      performance,
      metrics: aggregatePerformanceMetrics(performance)
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function optimizePortRoute(supabase: any, vessel_size: string, cargo_type: string) {
  // Get all ports with their costs and performance
  const { data: ports, error: portsError } = await supabase
    .from('ports')
    .select(`
      *,
      port_tariffs(*),
      port_performance(*),
      port_congestion(*)
    `)

  if (portsError) throw portsError

  // Generate optimization recommendations
  const optimizations = generateRouteOptimizations(ports, vessel_size, cargo_type)

  return new Response(
    JSON.stringify({
      optimizations,
      analysis: {
        cost_savings: optimizations.reduce((sum: number, opt: any) => sum + (opt.savings || 0), 0),
        time_savings: optimizations.reduce((sum: number, opt: any) => sum + (opt.time_saved_hours || 0), 0),
        recommendations_count: optimizations.length
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function generatePortInsights(ports: any[], calls: any[], congestion: any[], fuel: any[]) {
  const insights = []

  // Congestion insight
  if (congestion.length > 0) {
    insights.push({
      type: 'congestion_alert',
      title: `${congestion.length} High Congestion Ports`,
      description: `Delays expected at ${congestion.map(c => c.port_name).join(', ')}`,
      severity: 'high',
      action: 'Consider alternative ports'
    })
  }

  // Fuel pricing insight
  if (fuel.length > 0) {
    const cheapest = fuel[0]
    const expensive = fuel[fuel.length - 1]
    const savings = expensive.price_per_tonne - cheapest.price_per_tonne
    
    insights.push({
      type: 'fuel_optimization',
      title: 'Fuel Cost Optimization',
      description: `Save €${savings.toFixed(0)}/tonne by bunkering at ${cheapest.port_name} vs ${expensive.port_name}`,
      severity: 'medium',
      action: 'Route via cheaper fuel ports'
    })
  }

  // Port efficiency insight
  insights.push({
    type: 'efficiency_tip',
    title: 'Port Efficiency Analysis',
    description: `${calls.length} active port calls across ${ports.length} Baltic ports`,
    severity: 'info',
    action: 'View detailed performance metrics'
  })

  return insights
}

function calculatePortCosts(tariffs: any[], vessel_size: string, gt: number) {
  let totalCost = 0
  const breakdown: any[] = []

  tariffs.forEach(tariff => {
    let cost = 0
    
    switch (tariff.unit_type) {
      case 'per_gt':
        cost = tariff.rate_per_unit * gt
        break
      case 'per_service':
        cost = tariff.rate_per_unit
        break
      default:
        cost = tariff.rate_per_unit
    }

    totalCost += cost
    breakdown.push({
      service: tariff.service_type,
      rate: tariff.rate_per_unit,
      unit: tariff.unit_type,
      cost,
      currency: tariff.currency
    })
  })

  return { total: totalCost, breakdown }
}

function generateCostRecommendations(costs: any) {
  const recommendations = []

  if (costs.total > 15000) {
    recommendations.push({
      type: 'cost_optimization',
      message: 'High port costs detected. Consider smaller nearby ports.',
      potential_savings: costs.total * 0.15
    })
  }

  recommendations.push({
    type: 'timing',
    message: 'Avoid peak hours to reduce waiting time charges.',
    potential_savings: costs.total * 0.05
  })

  return recommendations
}

function aggregatePerformanceMetrics(performance: any[]) {
  const metrics = {
    avg_waiting_time: 0,
    avg_handling_rate: 0,
    efficiency_trend: 'stable'
  }

  const waitingTimes = performance.filter(p => p.metric_type === 'average_waiting_time')
  const handlingRates = performance.filter(p => p.metric_type === 'cargo_handling_rate')

  if (waitingTimes.length > 0) {
    metrics.avg_waiting_time = waitingTimes.reduce((sum, p) => sum + p.metric_value, 0) / waitingTimes.length
  }

  if (handlingRates.length > 0) {
    metrics.avg_handling_rate = handlingRates.reduce((sum, p) => sum + p.metric_value, 0) / handlingRates.length
  }

  return metrics
}

function generateRouteOptimizations(ports: any[], vessel_size: string, cargo_type: string) {
  const optimizations = []

  // Cost-based optimization
  const cheapestPorts = ports
    .filter(p => p.port_tariffs?.some((t: any) => t.service_type === 'port_dues'))
    .sort((a, b) => {
      const aRate = a.port_tariffs?.find((t: any) => t.service_type === 'port_dues')?.rate_per_unit || 999
      const bRate = b.port_tariffs?.find((t: any) => t.service_type === 'port_dues')?.rate_per_unit || 999
      return aRate - bRate
    })
    .slice(0, 3)

  cheapestPorts.forEach((port, index) => {
    optimizations.push({
      type: 'cost_optimization',
      port_name: port.name,
      port_code: port.code,
      description: `${index === 0 ? 'Lowest' : 'Low'} port dues in region`,
      savings: (0.15 - (port.port_tariffs?.find((t: any) => t.service_type === 'port_dues')?.rate_per_unit || 0.15)) * 25000,
      recommendation: 'Consider for cost-sensitive operations'
    })
  })

  // Efficiency-based optimization
  const efficientPorts = ports
    .filter(p => p.port_performance?.some((perf: any) => perf.metric_type === 'average_waiting_time'))
    .sort((a, b) => {
      const aTime = a.port_performance?.find((perf: any) => perf.metric_type === 'average_waiting_time')?.metric_value || 24
      const bTime = b.port_performance?.find((perf: any) => perf.metric_type === 'average_waiting_time')?.metric_value || 24
      return aTime - bTime
    })
    .slice(0, 2)

  efficientPorts.forEach(port => {
    const waitTime = port.port_performance?.find((perf: any) => perf.metric_type === 'average_waiting_time')?.metric_value || 0
    optimizations.push({
      type: 'time_optimization',
      port_name: port.name,
      port_code: port.code,
      description: `Fast turnaround: ${waitTime.toFixed(1)}h average waiting`,
      time_saved_hours: Math.max(0, 8 - waitTime),
      recommendation: 'Optimal for time-critical deliveries'
    })
  })

  return optimizations
}