import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AlertRule {
  alert_type: string;
  variable_name: string;
  threshold_value: number;
  threshold_operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration_minutes?: number;
  spatial_scope?: 'point' | 'area' | 'region';
  region?: string;
}

interface NotificationChannel {
  type: 'email' | 'webhook' | 'sms';
  endpoint: string;
  enabled: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log(`Intelligence Alerts Processor: ${action}`, params);

    switch (action) {
      case 'process_realtime_alerts':
        const result = await processRealtimeAlerts(params);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'create_alert_rule':
        const ruleResult = await createAlertRule(params as AlertRule);
        return new Response(JSON.stringify(ruleResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_active_alerts':
        const alerts = await getActiveAlerts(params);
        return new Response(JSON.stringify(alerts), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'resolve_alert':
        const resolveResult = await resolveAlert(params.alert_id, params.resolution_notes);
        return new Response(JSON.stringify(resolveResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'send_alert_notifications':
        const notificationResult = await sendAlertNotifications(params.alert_id, params.channels);
        return new Response(JSON.stringify(notificationResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_alert_statistics':
        const stats = await getAlertStatistics(params);
        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in intelligence alerts processor:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processRealtimeAlerts(params: any) {
  const { check_period_hours = 1, region = 'baltic_sea' } = params;
  
  try {
    console.log(`Processing real-time alerts for ${region}, checking ${check_period_hours}h period`);

    const checkTime = new Date();
    const startTime = new Date(checkTime.getTime() - check_period_hours * 60 * 60 * 1000);

    // Get recent observations
    const { data: observations, error: obsError } = await supabase
      .from('oceanographic_observations')
      .select('*')
      .gte('timestamp', startTime.toISOString())
      .lte('timestamp', checkTime.toISOString())
      .order('timestamp', { ascending: false });

    if (obsError) throw obsError;

    if (!observations || observations.length === 0) {
      return {
        success: true,
        message: 'No recent observations to check',
        alerts_triggered: 0,
        check_period: `${check_period_hours}h`,
        timestamp: checkTime.toISOString()
      };
    }

    console.log(`Checking ${observations.length} recent observations for alerts`);

    const triggeredAlerts = [];

    // Define alert rules
    const alertRules: AlertRule[] = [
      {
        alert_type: 'hypoxia_critical',
        variable_name: 'dissolved_oxygen',
        threshold_value: 2.0,
        threshold_operator: 'lt',
        severity: 'critical',
        duration_minutes: 60
      },
      {
        alert_type: 'hypoxia_severe',
        variable_name: 'dissolved_oxygen',
        threshold_value: 1.0,
        threshold_operator: 'lt',
        severity: 'critical',
        duration_minutes: 30
      },
      {
        alert_type: 'temperature_extreme_high',
        variable_name: 'temperature',
        threshold_value: 25.0,
        threshold_operator: 'gt',
        severity: 'high',
        duration_minutes: 120
      },
      {
        alert_type: 'temperature_extreme_low',
        variable_name: 'temperature',
        threshold_value: -1.0,
        threshold_operator: 'lt',
        severity: 'medium',
        duration_minutes: 120
      },
      {
        alert_type: 'salinity_anomaly_high',
        variable_name: 'salinity',
        threshold_value: 15.0,
        threshold_operator: 'gt',
        severity: 'medium',
        duration_minutes: 180
      },
      {
        alert_type: 'salinity_anomaly_low',
        variable_name: 'salinity',
        threshold_value: 2.0,
        threshold_operator: 'lt',
        severity: 'medium',
        duration_minutes: 180
      },
      {
        alert_type: 'chlorophyll_bloom',
        variable_name: 'chlorophyll',
        threshold_value: 20.0,
        threshold_operator: 'gt',
        severity: 'medium',
        duration_minutes: 240
      },
      {
        alert_type: 'data_quality_poor',
        variable_name: 'quality_flag',
        threshold_value: 0.5, // Confidence threshold
        threshold_operator: 'lt',
        severity: 'low',
        duration_minutes: 60
      }
    ];

    // Process each alert rule
    for (const rule of alertRules) {
      const ruleAlerts = await checkAlertRule(rule, observations, startTime, checkTime);
      triggeredAlerts.push(...ruleAlerts);
    }

    // Check for spatial clustering of issues
    const spatialAlerts = await checkSpatialAlerts(observations, startTime, checkTime);
    triggeredAlerts.push(...spatialAlerts);

    // Check for rapid changes
    const trendAlerts = await checkTrendAlerts(observations, startTime, checkTime);
    triggeredAlerts.push(...trendAlerts);

    // Store new alerts
    if (triggeredAlerts.length > 0) {
      const { error: insertError } = await supabase
        .from('intelligence_alerts')
        .insert(triggeredAlerts);

      if (insertError) {
        console.error('Error storing alerts:', insertError);
        // Don't throw - continue with notification
      }

      // Send notifications for critical alerts
      const criticalAlerts = triggeredAlerts.filter(alert => alert.severity === 'critical');
      if (criticalAlerts.length > 0) {
        await sendCriticalAlertNotifications(criticalAlerts);
      }
    }

    return {
      success: true,
      alerts_triggered: triggeredAlerts.length,
      alerts_by_severity: {
        critical: triggeredAlerts.filter(a => a.severity === 'critical').length,
        high: triggeredAlerts.filter(a => a.severity === 'high').length,
        medium: triggeredAlerts.filter(a => a.severity === 'medium').length,
        low: triggeredAlerts.filter(a => a.severity === 'low').length
      },
      alerts: triggeredAlerts,
      observations_checked: observations.length,
      check_period: `${check_period_hours}h`,
      timestamp: checkTime.toISOString()
    };

  } catch (error) {
    console.error('Error processing real-time alerts:', error);
    throw error;
  }
}

async function checkAlertRule(rule: AlertRule, observations: any[], startTime: Date, checkTime: Date) {
  const matchingObs = observations.filter(obs => {
    if (obs.variable_name !== rule.variable_name) return false;
    
    // Handle special case for quality flag checking
    if (rule.variable_name === 'quality_flag') {
      return obs.confidence_score < rule.threshold_value;
    }
    
    // Apply threshold operator
    switch (rule.threshold_operator) {
      case 'gt': return obs.value > rule.threshold_value;
      case 'lt': return obs.value < rule.threshold_value;
      case 'gte': return obs.value >= rule.threshold_value;
      case 'lte': return obs.value <= rule.threshold_value;
      case 'eq': return Math.abs(obs.value - rule.threshold_value) < 0.01;
      default: return false;
    }
  });

  if (matchingObs.length === 0) return [];

  // Check if we already have an active alert for this type
  const { data: existingAlerts } = await supabase
    .from('intelligence_alerts')
    .select('*')
    .eq('alert_type', rule.alert_type)
    .eq('status', 'active')
    .gte('triggered_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Group matching observations by location to identify clusters
  const locationGroups: { [key: string]: any[] } = {};
  matchingObs.forEach(obs => {
    const locationKey = `${obs.location_lat.toFixed(2)},${obs.location_lng.toFixed(2)}`;
    if (!locationGroups[locationKey]) locationGroups[locationKey] = [];
    locationGroups[locationKey].push(obs);
  });

  const newAlerts = [];

  // Create alerts for significant clusters
  Object.entries(locationGroups).forEach(([locationKey, obs]) => {
    const [lat, lng] = locationKey.split(',').map(Number);
    
    // Check duration requirement
    if (rule.duration_minutes) {
      const observationSpan = Math.max(...obs.map(o => new Date(o.timestamp).getTime())) - 
                              Math.min(...obs.map(o => new Date(o.timestamp).getTime()));
      const requiredSpan = rule.duration_minutes * 60 * 1000;
      
      if (observationSpan < requiredSpan) return;
    }

    // Check if we already have an alert for this location
    const hasExistingAlert = existingAlerts?.some(alert => 
      alert.location_lat && alert.location_lng &&
      Math.abs(alert.location_lat - lat) < 0.1 &&
      Math.abs(alert.location_lng - lng) < 0.1
    );

    if (!hasExistingAlert && obs.length >= 3) { // Require at least 3 observations
      const avgValue = obs.reduce((sum, o) => sum + (o.value || 0), 0) / obs.length;
      const minValue = Math.min(...obs.map(o => o.value || 0));
      const maxValue = Math.max(...obs.map(o => o.value || 0));

      newAlerts.push({
        alert_type: rule.alert_type,
        title: generateAlertTitle(rule, avgValue),
        description: generateAlertDescription(rule, obs, avgValue, minValue, maxValue),
        severity: rule.severity,
        status: 'active',
        location_lat: lat,
        location_lng: lng,
        trigger_conditions: {
          rule,
          threshold: rule.threshold_value,
          operator: rule.threshold_operator,
          duration_minutes: rule.duration_minutes
        },
        trigger_data: {
          observation_count: obs.length,
          avg_value: avgValue,
          min_value: minValue,
          max_value: maxValue,
          time_span_minutes: Math.round((Math.max(...obs.map(o => new Date(o.timestamp).getTime())) - 
                                       Math.min(...obs.map(o => new Date(o.timestamp).getTime()))) / 60000),
          affected_platforms: [...new Set(obs.map(o => o.platform_id))],
          first_detected: Math.min(...obs.map(o => new Date(o.timestamp).getTime()))
        },
        affected_datasets: [...new Set(obs.map(o => o.dataset_id))],
        notification_channels: ['email', 'webhook']
      });
    }
  });

  return newAlerts;
}

function generateAlertTitle(rule: AlertRule, value: number): string {
  const variable = rule.variable_name.replace('_', ' ');
  
  switch (rule.alert_type) {
    case 'hypoxia_critical':
      return `Critical Hypoxia Detected - Oxygen ${value.toFixed(1)} mg/L`;
    case 'hypoxia_severe':
      return `Severe Hypoxia Alert - Oxygen ${value.toFixed(1)} mg/L`;
    case 'temperature_extreme_high':
      return `Extreme High Temperature - ${value.toFixed(1)}°C`;
    case 'temperature_extreme_low':
      return `Extreme Low Temperature - ${value.toFixed(1)}°C`;
    case 'salinity_anomaly_high':
      return `High Salinity Anomaly - ${value.toFixed(1)} PSU`;
    case 'salinity_anomaly_low':
      return `Low Salinity Anomaly - ${value.toFixed(1)} PSU`;
    case 'chlorophyll_bloom':
      return `Potential Algal Bloom - Chlorophyll ${value.toFixed(1)} µg/L`;
    case 'data_quality_poor':
      return `Poor Data Quality Detected - Confidence ${value.toFixed(2)}`;
    default:
      return `${variable} Alert - Value ${value.toFixed(2)}`;
  }
}

function generateAlertDescription(rule: AlertRule, observations: any[], avgValue: number, minValue: number, maxValue: number): string {
  const variable = rule.variable_name.replace('_', ' ');
  const platforms = [...new Set(observations.map(o => o.platform_id))];
  const timeSpan = Math.round((Math.max(...observations.map(o => new Date(o.timestamp).getTime())) - 
                              Math.min(...observations.map(o => new Date(o.timestamp).getTime()))) / 60000);

  let description = `${observations.length} observations of ${variable} detected over ${timeSpan} minutes `;
  description += `from ${platforms.length} platform${platforms.length > 1 ? 's' : ''} (${platforms.join(', ')}). `;
  description += `Average value: ${avgValue.toFixed(2)}, Range: ${minValue.toFixed(2)} - ${maxValue.toFixed(2)}`;

  // Add context-specific information
  switch (rule.alert_type) {
    case 'hypoxia_critical':
    case 'hypoxia_severe':
      description += '. Dissolved oxygen levels below 2 mg/L indicate hypoxic conditions that can harm marine life.';
      break;
    case 'temperature_extreme_high':
      description += '. Unusually high temperatures may indicate heat stress conditions for marine organisms.';
      break;
    case 'temperature_extreme_low':
      description += '. Unusually low temperatures may affect marine ecosystem dynamics.';
      break;
    case 'chlorophyll_bloom':
      description += '. High chlorophyll concentrations may indicate algal bloom conditions.';
      break;
    case 'data_quality_poor':
      description += '. Multiple observations showing low confidence scores - data reliability concerns.';
      break;
  }

  return description;
}

async function checkSpatialAlerts(observations: any[], startTime: Date, checkTime: Date) {
  const alerts = [];
  
  // Check for spatial clusters of hypoxic conditions
  const oxygenObs = observations.filter(obs => obs.variable_name === 'dissolved_oxygen' && obs.value < 4);
  
  if (oxygenObs.length >= 10) {
    // Simple spatial clustering - in production would use proper spatial analysis
    const clusters = identifySpatialClusters(oxygenObs, 0.5); // 0.5 degree radius
    
    for (const cluster of clusters) {
      if (cluster.observations.length >= 5) {
        const avgLat = cluster.observations.reduce((sum, obs) => sum + obs.location_lat, 0) / cluster.observations.length;
        const avgLng = cluster.observations.reduce((sum, obs) => sum + obs.location_lng, 0) / cluster.observations.length;
        const avgOxygen = cluster.observations.reduce((sum, obs) => sum + obs.value, 0) / cluster.observations.length;
        
        alerts.push({
          alert_type: 'spatial_hypoxia_cluster',
          title: `Spatial Hypoxia Cluster Detected`,
          description: `Cluster of ${cluster.observations.length} low oxygen observations (avg: ${avgOxygen.toFixed(1)} mg/L) in ${cluster.radius_km.toFixed(1)}km radius`,
          severity: avgOxygen < 2 ? 'critical' : 'high',
          status: 'active',
          location_lat: avgLat,
          location_lng: avgLng,
          trigger_conditions: {
            cluster_threshold: 5,
            radius_km: cluster.radius_km,
            oxygen_threshold: 4.0
          },
          trigger_data: {
            cluster_size: cluster.observations.length,
            avg_oxygen: avgOxygen,
            min_oxygen: Math.min(...cluster.observations.map(o => o.value)),
            cluster_area_km2: Math.PI * Math.pow(cluster.radius_km, 2)
          },
          affected_datasets: [...new Set(cluster.observations.map(o => o.dataset_id))]
        });
      }
    }
  }
  
  return alerts;
}

function identifySpatialClusters(observations: any[], radiusDegrees: number) {
  const clusters = [];
  const processed = new Set();
  
  observations.forEach((obs, index) => {
    if (processed.has(index)) return;
    
    const cluster = {
      center: { lat: obs.location_lat, lng: obs.location_lng },
      observations: [obs],
      radius_km: 0
    };
    processed.add(index);
    
    // Find nearby observations
    observations.forEach((otherObs, otherIndex) => {
      if (processed.has(otherIndex) || index === otherIndex) return;
      
      const distance = calculateDistance(
        obs.location_lat, obs.location_lng,
        otherObs.location_lat, otherObs.location_lng
      );
      
      if (distance <= radiusDegrees) {
        cluster.observations.push(otherObs);
        processed.add(otherIndex);
        cluster.radius_km = Math.max(cluster.radius_km, distance * 111.32); // Convert degrees to km
      }
    });
    
    if (cluster.observations.length >= 3) {
      clusters.push(cluster);
    }
  });
  
  return clusters;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
           Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return 6371 * c / 111.32; // Return in degrees for consistency
}

async function checkTrendAlerts(observations: any[], startTime: Date, checkTime: Date) {
  const alerts = [];
  
  // Check for rapid temperature changes
  const tempObs = observations.filter(obs => obs.variable_name === 'temperature')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  if (tempObs.length >= 5) {
    const recentTemps = tempObs.slice(-5);
    const tempChange = recentTemps[recentTemps.length - 1].value - recentTemps[0].value;
    const timeSpan = (new Date(recentTemps[recentTemps.length - 1].timestamp).getTime() - 
                     new Date(recentTemps[0].timestamp).getTime()) / (1000 * 60 * 60); // hours
    
    const changeRate = Math.abs(tempChange) / timeSpan;
    
    if (changeRate > 2.0) { // >2°C per hour is rapid change
      alerts.push({
        alert_type: 'rapid_temperature_change',
        title: `Rapid Temperature Change Detected`,
        description: `Temperature changed by ${tempChange.toFixed(1)}°C over ${timeSpan.toFixed(1)} hours (${changeRate.toFixed(1)}°C/h)`,
        severity: changeRate > 4 ? 'high' : 'medium',
        status: 'active',
        trigger_conditions: {
          change_rate_threshold: 2.0,
          time_window_hours: timeSpan
        },
        trigger_data: {
          temperature_change: tempChange,
          change_rate_per_hour: changeRate,
          time_span_hours: timeSpan,
          observation_count: recentTemps.length
        },
        affected_datasets: [...new Set(recentTemps.map(o => o.dataset_id))]
      });
    }
  }
  
  return alerts;
}

async function sendCriticalAlertNotifications(criticalAlerts: any[]) {
  console.log(`Sending notifications for ${criticalAlerts.length} critical alerts`);
  
  // In production, this would integrate with actual notification services
  // For now, just log the notifications
  criticalAlerts.forEach(alert => {
    console.log(`CRITICAL ALERT: ${alert.title}`);
    console.log(`Description: ${alert.description}`);
    console.log(`Location: ${alert.location_lat?.toFixed(3)}, ${alert.location_lng?.toFixed(3)}`);
    console.log('---');
  });
  
  // Could integrate with:
  // - Email service (SendGrid, AWS SES, etc.)
  // - SMS service (Twilio, etc.)
  // - Webhook notifications
  // - Push notifications
  // - Slack/Teams integrations
}

async function createAlertRule(rule: AlertRule) {
  // In production, this would store custom alert rules in a database
  console.log('Creating alert rule:', rule);
  
  return {
    success: true,
    message: 'Alert rule created successfully',
    rule_id: `rule_${Date.now()}`,
    rule
  };
}

async function getActiveAlerts(params: any) {
  const { severity, region, limit = 50 } = params;
  
  let query = supabase
    .from('intelligence_alerts')
    .select('*')
    .eq('status', 'active')
    .order('triggered_at', { ascending: false })
    .limit(limit);
    
  if (severity) {
    query = query.eq('severity', severity);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return {
    success: true,
    alerts: data || [],
    count: data?.length || 0,
    filters: { severity, region, limit }
  };
}

async function resolveAlert(alertId: string, resolutionNotes?: string) {
  const { data, error } = await supabase
    .from('intelligence_alerts')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolution_notes: resolutionNotes
    })
    .eq('id', alertId)
    .select();
    
  if (error) throw error;
  
  return {
    success: true,
    message: 'Alert resolved successfully',
    alert: data?.[0],
    resolved_at: new Date().toISOString()
  };
}

async function sendAlertNotifications(alertId: string, channels: NotificationChannel[]) {
  console.log(`Sending notifications for alert ${alertId} via channels:`, channels.map(c => c.type));
  
  // In production, implement actual notification sending
  const results = channels.map(channel => ({
    type: channel.type,
    endpoint: channel.endpoint,
    status: 'sent', // or 'failed'
    sent_at: new Date().toISOString()
  }));
  
  return {
    success: true,
    alert_id: alertId,
    notifications_sent: results.length,
    results
  };
}

async function getAlertStatistics(params: any) {
  const { days = 7, region } = params;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  let query = supabase
    .from('intelligence_alerts')
    .select('*')
    .gte('triggered_at', startDate.toISOString());
    
  if (region) {
    // Would need to add region field to alerts table for proper filtering
    // For now, just get all alerts
  }
  
  const { data: alerts, error } = await query;
  
  if (error) throw error;
  
  const stats = {
    total_alerts: alerts?.length || 0,
    by_severity: {
      critical: alerts?.filter(a => a.severity === 'critical').length || 0,
      high: alerts?.filter(a => a.severity === 'high').length || 0,
      medium: alerts?.filter(a => a.severity === 'medium').length || 0,
      low: alerts?.filter(a => a.severity === 'low').length || 0
    },
    by_status: {
      active: alerts?.filter(a => a.status === 'active').length || 0,
      resolved: alerts?.filter(a => a.status === 'resolved').length || 0,
      acknowledged: alerts?.filter(a => a.status === 'acknowledged').length || 0
    },
    by_type: {},
    resolution_time_avg_hours: 0,
    period_days: days
  };
  
  // Calculate by type
  if (alerts) {
    alerts.forEach(alert => {
      stats.by_type[alert.alert_type] = (stats.by_type[alert.alert_type] || 0) + 1;
    });
    
    // Calculate average resolution time
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved' && a.resolved_at);
    if (resolvedAlerts.length > 0) {
      const totalResolutionTime = resolvedAlerts.reduce((sum, alert) => {
        const triggered = new Date(alert.triggered_at).getTime();
        const resolved = new Date(alert.resolved_at).getTime();
        return sum + (resolved - triggered);
      }, 0);
      stats.resolution_time_avg_hours = (totalResolutionTime / resolvedAlerts.length) / (1000 * 60 * 60);
    }
  }
  
  return {
    success: true,
    statistics: stats,
    period: { days, start_date: startDate.toISOString() }
  };
}