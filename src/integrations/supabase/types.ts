export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ais_tracking: {
        Row: {
          ais_active: boolean | null
          course: number | null
          created_at: string
          dark_zone_duration_hours: number | null
          dark_zone_entry: string | null
          destination: string | null
          draught: number | null
          eta: string | null
          heading: number | null
          id: string
          imo_number: number | null
          location_lat: number
          location_lng: number
          mmsi: number | null
          source: string | null
          speed: number | null
          status: string | null
          timestamp: string
          vessel_id: string | null
        }
        Insert: {
          ais_active?: boolean | null
          course?: number | null
          created_at?: string
          dark_zone_duration_hours?: number | null
          dark_zone_entry?: string | null
          destination?: string | null
          draught?: number | null
          eta?: string | null
          heading?: number | null
          id?: string
          imo_number?: number | null
          location_lat: number
          location_lng: number
          mmsi?: number | null
          source?: string | null
          speed?: number | null
          status?: string | null
          timestamp: string
          vessel_id?: string | null
        }
        Update: {
          ais_active?: boolean | null
          course?: number | null
          created_at?: string
          dark_zone_duration_hours?: number | null
          dark_zone_entry?: string | null
          destination?: string | null
          draught?: number | null
          eta?: string | null
          heading?: number | null
          id?: string
          imo_number?: number | null
          location_lat?: number
          location_lng?: number
          mmsi?: number | null
          source?: string | null
          speed?: number | null
          status?: string | null
          timestamp?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ais_tracking_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      arbitrage_opportunities: {
        Row: {
          affected_regions: string[] | null
          alternative_route: string | null
          arbitrage_rate_per_ton: number | null
          carbon_cost_savings_eur: number | null
          confidence_level: number | null
          created_at: string
          current_rate_per_ton: number | null
          data_sources: string[] | null
          description: string | null
          destination_port: string | null
          fuel_cost_difference_per_tonne: number | null
          ice_class_required: boolean | null
          id: string
          implementation_complexity: string | null
          market_data: Json | null
          max_vessel_size_dwt: number | null
          min_vessel_size_dwt: number | null
          mitigation_strategies: string[] | null
          opportunity_type: string
          origin_port: string | null
          potential_revenue_eur: number | null
          potential_savings_eur: number | null
          probability_score: number | null
          regulatory_factors: Json | null
          risk_factors: string[] | null
          risk_level: string | null
          seasonal_factor: number | null
          status: string | null
          time_sensitivity: string | null
          title: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
          vessel_type_required: string | null
          weather_factors: Json | null
        }
        Insert: {
          affected_regions?: string[] | null
          alternative_route?: string | null
          arbitrage_rate_per_ton?: number | null
          carbon_cost_savings_eur?: number | null
          confidence_level?: number | null
          created_at?: string
          current_rate_per_ton?: number | null
          data_sources?: string[] | null
          description?: string | null
          destination_port?: string | null
          fuel_cost_difference_per_tonne?: number | null
          ice_class_required?: boolean | null
          id?: string
          implementation_complexity?: string | null
          market_data?: Json | null
          max_vessel_size_dwt?: number | null
          min_vessel_size_dwt?: number | null
          mitigation_strategies?: string[] | null
          opportunity_type: string
          origin_port?: string | null
          potential_revenue_eur?: number | null
          potential_savings_eur?: number | null
          probability_score?: number | null
          regulatory_factors?: Json | null
          risk_factors?: string[] | null
          risk_level?: string | null
          seasonal_factor?: number | null
          status?: string | null
          time_sensitivity?: string | null
          title: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          vessel_type_required?: string | null
          weather_factors?: Json | null
        }
        Update: {
          affected_regions?: string[] | null
          alternative_route?: string | null
          arbitrage_rate_per_ton?: number | null
          carbon_cost_savings_eur?: number | null
          confidence_level?: number | null
          created_at?: string
          current_rate_per_ton?: number | null
          data_sources?: string[] | null
          description?: string | null
          destination_port?: string | null
          fuel_cost_difference_per_tonne?: number | null
          ice_class_required?: boolean | null
          id?: string
          implementation_complexity?: string | null
          market_data?: Json | null
          max_vessel_size_dwt?: number | null
          min_vessel_size_dwt?: number | null
          mitigation_strategies?: string[] | null
          opportunity_type?: string
          origin_port?: string | null
          potential_revenue_eur?: number | null
          potential_savings_eur?: number | null
          probability_score?: number | null
          regulatory_factors?: Json | null
          risk_factors?: string[] | null
          risk_level?: string | null
          seasonal_factor?: number | null
          status?: string | null
          time_sensitivity?: string | null
          title?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          vessel_type_required?: string | null
          weather_factors?: Json | null
        }
        Relationships: []
      }
      baltic_indicators: {
        Row: {
          bbox: Json | null
          computed_at: string | null
          confidence: number | null
          created_at: string | null
          data_sources: Json | null
          id: string
          indicator_type: string
          metadata: Json | null
          methodology: string | null
          period_end: string
          period_start: string
          region: string | null
          value: number
        }
        Insert: {
          bbox?: Json | null
          computed_at?: string | null
          confidence?: number | null
          created_at?: string | null
          data_sources?: Json | null
          id?: string
          indicator_type: string
          metadata?: Json | null
          methodology?: string | null
          period_end: string
          period_start: string
          region?: string | null
          value: number
        }
        Update: {
          bbox?: Json | null
          computed_at?: string | null
          confidence?: number | null
          created_at?: string | null
          data_sources?: Json | null
          id?: string
          indicator_type?: string
          metadata?: Json | null
          methodology?: string | null
          period_end?: string
          period_start?: string
          region?: string | null
          value?: number
        }
        Relationships: []
      }
      bathing_water_sites: {
        Row: {
          created_at: string
          id: string
          location_lat: number
          location_lng: number
          municipality_id: string | null
          name: string
          site_id: string
          status_2022: string | null
          status_2023: string | null
          status_2024: string | null
          updated_at: string
          water_body_type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location_lat: number
          location_lng: number
          municipality_id?: string | null
          name: string
          site_id: string
          status_2022?: string | null
          status_2023?: string | null
          status_2024?: string | null
          updated_at?: string
          water_body_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location_lat?: number
          location_lng?: number
          municipality_id?: string | null
          name?: string
          site_id?: string
          status_2022?: string | null
          status_2023?: string | null
          status_2024?: string | null
          updated_at?: string
          water_body_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bathing_water_sites_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      berth_availability: {
        Row: {
          available_from: string
          available_until: string
          berth_number: string
          berth_type: string
          created_at: string
          id: string
          max_draft_m: number | null
          max_length_m: number | null
          port_id: string
          reserved_vessel_id: string | null
          status: string
        }
        Insert: {
          available_from: string
          available_until: string
          berth_number: string
          berth_type: string
          created_at?: string
          id?: string
          max_draft_m?: number | null
          max_length_m?: number | null
          port_id: string
          reserved_vessel_id?: string | null
          status?: string
        }
        Update: {
          available_from?: string
          available_until?: string
          berth_number?: string
          berth_type?: string
          created_at?: string
          id?: string
          max_draft_m?: number | null
          max_length_m?: number | null
          port_id?: string
          reserved_vessel_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "berth_availability_port_id_fkey"
            columns: ["port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
        ]
      }
      business_sites: {
        Row: {
          basin: string
          created_at: string
          id: string
          location_lat: number
          location_lng: number
          municipality_id: string | null
          name: string
          site_type: string
          updated_at: string
        }
        Insert: {
          basin?: string
          created_at?: string
          id?: string
          location_lat: number
          location_lng: number
          municipality_id?: string | null
          name: string
          site_type: string
          updated_at?: string
        }
        Update: {
          basin?: string
          created_at?: string
          id?: string
          location_lat?: number
          location_lng?: number
          municipality_id?: string | null
          name?: string
          site_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_sites_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      cargo_flows: {
        Row: {
          cargo_subtype: string | null
          cargo_type: string
          commodity_group: string | null
          consignee_company: string | null
          contract_duration_months: number | null
          created_at: string
          currency: string | null
          demand_level: string | null
          destination_region: string
          discharge_time_hours: number | null
          environmental_requirements: Json | null
          frequency: string | null
          id: string
          lead_time_days: number | null
          loading_time_hours: number | null
          max_vessel_size_dwt: number | null
          metadata: Json | null
          min_vessel_size_dwt: number | null
          origin_region: string
          port_destination: string | null
          port_origin: string | null
          rate_per_ton: number | null
          route_restrictions: Json | null
          seasonal_factor: number | null
          shipper_company: string | null
          spot_vs_contract: string | null
          updated_at: string
          valid_from: string
          valid_until: string | null
          vessel_type_required: string | null
          volume_tons: number | null
        }
        Insert: {
          cargo_subtype?: string | null
          cargo_type: string
          commodity_group?: string | null
          consignee_company?: string | null
          contract_duration_months?: number | null
          created_at?: string
          currency?: string | null
          demand_level?: string | null
          destination_region: string
          discharge_time_hours?: number | null
          environmental_requirements?: Json | null
          frequency?: string | null
          id?: string
          lead_time_days?: number | null
          loading_time_hours?: number | null
          max_vessel_size_dwt?: number | null
          metadata?: Json | null
          min_vessel_size_dwt?: number | null
          origin_region: string
          port_destination?: string | null
          port_origin?: string | null
          rate_per_ton?: number | null
          route_restrictions?: Json | null
          seasonal_factor?: number | null
          shipper_company?: string | null
          spot_vs_contract?: string | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          vessel_type_required?: string | null
          volume_tons?: number | null
        }
        Update: {
          cargo_subtype?: string | null
          cargo_type?: string
          commodity_group?: string | null
          consignee_company?: string | null
          contract_duration_months?: number | null
          created_at?: string
          currency?: string | null
          demand_level?: string | null
          destination_region?: string
          discharge_time_hours?: number | null
          environmental_requirements?: Json | null
          frequency?: string | null
          id?: string
          lead_time_days?: number | null
          loading_time_hours?: number | null
          max_vessel_size_dwt?: number | null
          metadata?: Json | null
          min_vessel_size_dwt?: number | null
          origin_region?: string
          port_destination?: string | null
          port_origin?: string | null
          rate_per_ton?: number | null
          route_restrictions?: Json | null
          seasonal_factor?: number | null
          shipper_company?: string | null
          spot_vs_contract?: string | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          vessel_type_required?: string | null
          volume_tons?: number | null
        }
        Relationships: []
      }
      co2_emissions: {
        Row: {
          created_at: string
          data_type: string
          id: string
          location_lat: number
          location_lng: number
          metadata: Json | null
          quality_flag: string | null
          source: string
          timestamp: string
          unit: string
          value: number
          vessel_id: string | null
        }
        Insert: {
          created_at?: string
          data_type: string
          id?: string
          location_lat: number
          location_lng: number
          metadata?: Json | null
          quality_flag?: string | null
          source: string
          timestamp: string
          unit: string
          value: number
          vessel_id?: string | null
        }
        Update: {
          created_at?: string
          data_type?: string
          id?: string
          location_lat?: number
          location_lng?: number
          metadata?: Json | null
          quality_flag?: string | null
          source?: string
          timestamp?: string
          unit?: string
          value?: number
          vessel_id?: string | null
        }
        Relationships: []
      }
      commissions: {
        Row: {
          commission_amount_eur: number
          commission_percentage: number
          contract_id: string
          contract_value_eur: number
          created_at: string
          id: string
          payment_status: string
          stripe_payment_intent_id: string | null
          updated_at: string
          winning_bid_id: string
        }
        Insert: {
          commission_amount_eur: number
          commission_percentage?: number
          contract_id: string
          contract_value_eur: number
          created_at?: string
          id?: string
          payment_status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          winning_bid_id: string
        }
        Update: {
          commission_amount_eur?: number
          commission_percentage?: number
          contract_id?: string
          contract_value_eur?: number
          created_at?: string
          id?: string
          payment_status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          winning_bid_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract_bidding_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_winning_bid_id_fkey"
            columns: ["winning_bid_id"]
            isOneToOne: false
            referencedRelation: "contract_bids"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_bidding_opportunities: {
        Row: {
          bid_deadline: string
          bid_requirements: Json | null
          cargo_type: string | null
          cargo_volume_tons: number | null
          competitive_score: number | null
          contact_info: Json | null
          contract_description: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          contract_status: string | null
          contract_title: string
          contract_type: string
          contract_value_eur: number | null
          created_at: string | null
          estimated_value_eur: number | null
          evaluation_criteria: Json | null
          id: string
          issuing_organization: string
          recommended_bid_strategy: string | null
          region: string | null
          regulatory_requirements: Json | null
          route_destination: string | null
          route_origin: string | null
          source_url: string | null
          terms_conditions: string | null
          updated_at: string | null
          vessel_requirements: Json | null
          win_probability: number | null
        }
        Insert: {
          bid_deadline: string
          bid_requirements?: Json | null
          cargo_type?: string | null
          cargo_volume_tons?: number | null
          competitive_score?: number | null
          contact_info?: Json | null
          contract_description?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_status?: string | null
          contract_title: string
          contract_type: string
          contract_value_eur?: number | null
          created_at?: string | null
          estimated_value_eur?: number | null
          evaluation_criteria?: Json | null
          id?: string
          issuing_organization: string
          recommended_bid_strategy?: string | null
          region?: string | null
          regulatory_requirements?: Json | null
          route_destination?: string | null
          route_origin?: string | null
          source_url?: string | null
          terms_conditions?: string | null
          updated_at?: string | null
          vessel_requirements?: Json | null
          win_probability?: number | null
        }
        Update: {
          bid_deadline?: string
          bid_requirements?: Json | null
          cargo_type?: string | null
          cargo_volume_tons?: number | null
          competitive_score?: number | null
          contact_info?: Json | null
          contract_description?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_status?: string | null
          contract_title?: string
          contract_type?: string
          contract_value_eur?: number | null
          created_at?: string | null
          estimated_value_eur?: number | null
          evaluation_criteria?: Json | null
          id?: string
          issuing_organization?: string
          recommended_bid_strategy?: string | null
          region?: string | null
          regulatory_requirements?: Json | null
          route_destination?: string | null
          route_origin?: string | null
          source_url?: string | null
          terms_conditions?: string | null
          updated_at?: string | null
          vessel_requirements?: Json | null
          win_probability?: number | null
        }
        Relationships: []
      }
      contract_bids: {
        Row: {
          bid_amount_eur: number
          bid_message: string | null
          bidder_id: string
          contract_id: string
          id: string
          status: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          bid_amount_eur: number
          bid_message?: string | null
          bidder_id: string
          contract_id: string
          id?: string
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          bid_amount_eur?: number
          bid_message?: string | null
          bidder_id?: string
          contract_id?: string
          id?: string
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_bids_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract_bidding_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      data_cache: {
        Row: {
          cache_key: string
          cached_data: Json
          created_at: string
          data_type: string
          endpoint: string
          expires_at: string
          id: string
          source: string
          updated_at: string
        }
        Insert: {
          cache_key: string
          cached_data: Json
          created_at?: string
          data_type: string
          endpoint: string
          expires_at: string
          id?: string
          source: string
          updated_at?: string
        }
        Update: {
          cache_key?: string
          cached_data?: Json
          created_at?: string
          data_type?: string
          endpoint?: string
          expires_at?: string
          id?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_quality_assessments: {
        Row: {
          accuracy_score: number | null
          assessment_details: Json | null
          assessment_period_end: string
          assessment_period_start: string
          completeness_score: number | null
          computed_at: string | null
          created_at: string | null
          dataset_id: string
          id: string
          overall_score: number | null
          quality_flags: Json | null
          spatial_coverage_score: number | null
          temporal_continuity_score: number | null
        }
        Insert: {
          accuracy_score?: number | null
          assessment_details?: Json | null
          assessment_period_end: string
          assessment_period_start: string
          completeness_score?: number | null
          computed_at?: string | null
          created_at?: string | null
          dataset_id: string
          id?: string
          overall_score?: number | null
          quality_flags?: Json | null
          spatial_coverage_score?: number | null
          temporal_continuity_score?: number | null
        }
        Update: {
          accuracy_score?: number | null
          assessment_details?: Json | null
          assessment_period_end?: string
          assessment_period_start?: string
          completeness_score?: number | null
          computed_at?: string | null
          created_at?: string | null
          dataset_id?: string
          id?: string
          overall_score?: number | null
          quality_flags?: Json | null
          spatial_coverage_score?: number | null
          temporal_continuity_score?: number | null
        }
        Relationships: []
      }
      data_summaries: {
        Row: {
          calculation_date: string
          change_percent: number | null
          created_at: string
          current_value: number
          id: string
          indicator_type: string
          metadata: Json | null
          previous_value: number | null
          region: string | null
          status: string
          trend: string
          updated_at: string
        }
        Insert: {
          calculation_date?: string
          change_percent?: number | null
          created_at?: string
          current_value: number
          id?: string
          indicator_type: string
          metadata?: Json | null
          previous_value?: number | null
          region?: string | null
          status: string
          trend: string
          updated_at?: string
        }
        Update: {
          calculation_date?: string
          change_percent?: number | null
          created_at?: string
          current_value?: number
          id?: string
          indicator_type?: string
          metadata?: Json | null
          previous_value?: number | null
          region?: string | null
          status?: string
          trend?: string
          updated_at?: string
        }
        Relationships: []
      }
      ecological_ctas: {
        Row: {
          actions: Json
          created_at: string
          description: string | null
          entity_id: string
          entity_type: string
          estimated_impact: string | null
          evidence_metrics: Json | null
          id: string
          period_end: string
          period_start: string
          priority: number
          title: string
          trigger_rules: Json
          triggered_by_metrics: Json
        }
        Insert: {
          actions?: Json
          created_at?: string
          description?: string | null
          entity_id: string
          entity_type: string
          estimated_impact?: string | null
          evidence_metrics?: Json | null
          id?: string
          period_end: string
          period_start: string
          priority?: number
          title: string
          trigger_rules?: Json
          triggered_by_metrics?: Json
        }
        Update: {
          actions?: Json
          created_at?: string
          description?: string | null
          entity_id?: string
          entity_type?: string
          estimated_impact?: string | null
          evidence_metrics?: Json | null
          id?: string
          period_end?: string
          period_start?: string
          priority?: number
          title?: string
          trigger_rules?: Json
          triggered_by_metrics?: Json
        }
        Relationships: []
      }
      ecological_metrics: {
        Row: {
          anomaly_score: number | null
          basin: string
          confidence: number | null
          created_at: string
          data_source: string
          entity_id: string
          entity_type: string
          id: string
          last_updated: string
          metric_name: string
          period_end: string
          period_start: string
          period_type: string
          processing_method: string | null
          value: number
        }
        Insert: {
          anomaly_score?: number | null
          basin: string
          confidence?: number | null
          created_at?: string
          data_source: string
          entity_id: string
          entity_type: string
          id?: string
          last_updated?: string
          metric_name: string
          period_end: string
          period_start: string
          period_type: string
          processing_method?: string | null
          value: number
        }
        Update: {
          anomaly_score?: number | null
          basin?: string
          confidence?: number | null
          created_at?: string
          data_source?: string
          entity_id?: string
          entity_type?: string
          id?: string
          last_updated?: string
          metric_name?: string
          period_end?: string
          period_start?: string
          period_type?: string
          processing_method?: string | null
          value?: number
        }
        Relationships: []
      }
      ecological_scores: {
        Row: {
          bathing_wastewater: number | null
          coastal_hazard: number | null
          computed_at: string
          confidence: number | null
          config_version: string
          created_at: string
          ecosystem_health: number | null
          entity_id: string
          entity_type: string
          eutrophication_pressure: number | null
          id: string
          overall_score: number
          period_end: string
          period_start: string
          period_type: string
          trend_compliance: number | null
        }
        Insert: {
          bathing_wastewater?: number | null
          coastal_hazard?: number | null
          computed_at?: string
          confidence?: number | null
          config_version?: string
          created_at?: string
          ecosystem_health?: number | null
          entity_id: string
          entity_type: string
          eutrophication_pressure?: number | null
          id?: string
          overall_score: number
          period_end: string
          period_start: string
          period_type: string
          trend_compliance?: number | null
        }
        Update: {
          bathing_wastewater?: number | null
          coastal_hazard?: number | null
          computed_at?: string
          confidence?: number | null
          config_version?: string
          created_at?: string
          ecosystem_health?: number | null
          entity_id?: string
          entity_type?: string
          eutrophication_pressure?: number | null
          id?: string
          overall_score?: number
          period_end?: string
          period_start?: string
          period_type?: string
          trend_compliance?: number | null
        }
        Relationships: []
      }
      emissions_anomalies: {
        Row: {
          actual_emissions: number | null
          analysis_data: Json | null
          anomaly_type: string
          created_at: string
          detected_at: string
          deviation_percent: number | null
          expected_emissions: number | null
          id: string
          location_lat: number
          location_lng: number
          severity: string
          status: string | null
          vessel_id: string | null
        }
        Insert: {
          actual_emissions?: number | null
          analysis_data?: Json | null
          anomaly_type: string
          created_at?: string
          detected_at?: string
          deviation_percent?: number | null
          expected_emissions?: number | null
          id?: string
          location_lat: number
          location_lng: number
          severity?: string
          status?: string | null
          vessel_id?: string | null
        }
        Update: {
          actual_emissions?: number | null
          analysis_data?: Json | null
          anomaly_type?: string
          created_at?: string
          detected_at?: string
          deviation_percent?: number | null
          expected_emissions?: number | null
          id?: string
          location_lat?: number
          location_lng?: number
          severity?: string
          status?: string | null
          vessel_id?: string | null
        }
        Relationships: []
      }
      entity_compliance_flags: {
        Row: {
          adaptation_plan_year: number | null
          cdp_participant: boolean | null
          created_at: string
          documents: Json | null
          entity_id: string
          entity_type: string
          green_city_accord: boolean | null
          has_adaptation_plan: boolean | null
          id: string
          iso37120_certified: boolean | null
          secap_participant: boolean | null
          updated_at: string
        }
        Insert: {
          adaptation_plan_year?: number | null
          cdp_participant?: boolean | null
          created_at?: string
          documents?: Json | null
          entity_id: string
          entity_type: string
          green_city_accord?: boolean | null
          has_adaptation_plan?: boolean | null
          id?: string
          iso37120_certified?: boolean | null
          secap_participant?: boolean | null
          updated_at?: string
        }
        Update: {
          adaptation_plan_year?: number | null
          cdp_participant?: boolean | null
          created_at?: string
          documents?: Json | null
          entity_id?: string
          entity_type?: string
          green_city_accord?: boolean | null
          has_adaptation_plan?: boolean | null
          id?: string
          iso37120_certified?: boolean | null
          secap_participant?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      environmental_data: {
        Row: {
          created_at: string
          data_type: string
          id: string
          location_lat: number
          location_lng: number
          location_name: string | null
          metadata: Json | null
          quality_flag: string | null
          source: string
          timestamp: string
          unit: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          data_type: string
          id?: string
          location_lat: number
          location_lng: number
          location_name?: string | null
          metadata?: Json | null
          quality_flag?: string | null
          source: string
          timestamp: string
          unit: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          data_type?: string
          id?: string
          location_lat?: number
          location_lng?: number
          location_name?: string | null
          metadata?: Json | null
          quality_flag?: string | null
          source?: string
          timestamp?: string
          unit?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      environmental_incidents: {
        Row: {
          area_affected: number | null
          created_at: string
          description: string | null
          id: string
          incident_type: string
          location_lat: number
          location_lng: number
          metadata: Json | null
          reported_at: string
          resolved_at: string | null
          severity: string
          source: string
          status: string | null
        }
        Insert: {
          area_affected?: number | null
          created_at?: string
          description?: string | null
          id?: string
          incident_type: string
          location_lat: number
          location_lng: number
          metadata?: Json | null
          reported_at: string
          resolved_at?: string | null
          severity: string
          source: string
          status?: string | null
        }
        Update: {
          area_affected?: number | null
          created_at?: string
          description?: string | null
          id?: string
          incident_type?: string
          location_lat?: number
          location_lng?: number
          metadata?: Json | null
          reported_at?: string
          resolved_at?: string | null
          severity?: string
          source?: string
          status?: string | null
        }
        Relationships: []
      }
      erddap_datasets: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          data_quality: string | null
          dataset_id: string
          deployment_type: string | null
          id: string
          institution: string | null
          last_updated: string | null
          license: string | null
          platform_type: string | null
          spatial_coverage: Json | null
          summary: string | null
          temporal_coverage: Json | null
          title: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          data_quality?: string | null
          dataset_id: string
          deployment_type?: string | null
          id?: string
          institution?: string | null
          last_updated?: string | null
          license?: string | null
          platform_type?: string | null
          spatial_coverage?: Json | null
          summary?: string | null
          temporal_coverage?: Json | null
          title: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          data_quality?: string | null
          dataset_id?: string
          deployment_type?: string | null
          id?: string
          institution?: string | null
          last_updated?: string | null
          license?: string | null
          platform_type?: string | null
          spatial_coverage?: Json | null
          summary?: string | null
          temporal_coverage?: Json | null
          title?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      fisheries_data: {
        Row: {
          catch_area: string
          catch_count: number | null
          catch_weight: number | null
          created_at: string
          fishing_method: string | null
          id: string
          metadata: Json | null
          quarter: number | null
          source: string
          species: string
          stock_assessment: string | null
          timestamp: string
          vessel_country: string | null
          year: number
        }
        Insert: {
          catch_area: string
          catch_count?: number | null
          catch_weight?: number | null
          created_at?: string
          fishing_method?: string | null
          id?: string
          metadata?: Json | null
          quarter?: number | null
          source: string
          species: string
          stock_assessment?: string | null
          timestamp: string
          vessel_country?: string | null
          year: number
        }
        Update: {
          catch_area?: string
          catch_count?: number | null
          catch_weight?: number | null
          created_at?: string
          fishing_method?: string | null
          id?: string
          metadata?: Json | null
          quarter?: number | null
          source?: string
          species?: string
          stock_assessment?: string | null
          timestamp?: string
          vessel_country?: string | null
          year?: number
        }
        Relationships: []
      }
      fuel_prices: {
        Row: {
          availability: string | null
          created_at: string
          currency: string | null
          delivery_time_hours: number | null
          fuel_type: string
          id: string
          minimum_quantity_tonnes: number | null
          port_country: string
          port_name: string
          price_date: string
          price_per_tonne: number
          source: string
          supplier: string | null
        }
        Insert: {
          availability?: string | null
          created_at?: string
          currency?: string | null
          delivery_time_hours?: number | null
          fuel_type: string
          id?: string
          minimum_quantity_tonnes?: number | null
          port_country: string
          port_name: string
          price_date: string
          price_per_tonne: number
          source: string
          supplier?: string | null
        }
        Update: {
          availability?: string | null
          created_at?: string
          currency?: string | null
          delivery_time_hours?: number | null
          fuel_type?: string
          id?: string
          minimum_quantity_tonnes?: number | null
          port_country?: string
          port_name?: string
          price_date?: string
          price_per_tonne?: number
          source?: string
          supplier?: string | null
        }
        Relationships: []
      }
      intelligence_alerts: {
        Row: {
          affected_datasets: Json | null
          alert_type: string
          bbox: Json | null
          created_at: string | null
          description: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          notification_channels: Json | null
          resolved_at: string | null
          severity: string | null
          status: string | null
          title: string
          trigger_conditions: Json | null
          trigger_data: Json | null
          triggered_at: string | null
          updated_at: string | null
        }
        Insert: {
          affected_datasets?: Json | null
          alert_type: string
          bbox?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          notification_channels?: Json | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          title: string
          trigger_conditions?: Json | null
          trigger_data?: Json | null
          triggered_at?: string | null
          updated_at?: string | null
        }
        Update: {
          affected_datasets?: Json | null
          alert_type?: string
          bbox?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          notification_channels?: Json | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          title?: string
          trigger_conditions?: Json | null
          trigger_data?: Json | null
          triggered_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      market_data: {
        Row: {
          change_percent: number | null
          created_at: string
          currency: string
          exchange: string
          id: string
          market_cap: number | null
          price: number | null
          sector: string | null
          symbol: string
          timestamp: string
          volume: number | null
        }
        Insert: {
          change_percent?: number | null
          created_at?: string
          currency?: string
          exchange: string
          id?: string
          market_cap?: number | null
          price?: number | null
          sector?: string | null
          symbol: string
          timestamp: string
          volume?: number | null
        }
        Update: {
          change_percent?: number | null
          created_at?: string
          currency?: string
          exchange?: string
          id?: string
          market_cap?: number | null
          price?: number | null
          sector?: string | null
          symbol?: string
          timestamp?: string
          volume?: number | null
        }
        Relationships: []
      }
      municipalities: {
        Row: {
          basin: string
          coastal_length_km: number | null
          country_code: string
          created_at: string
          geometry: Json
          id: string
          name: string
          population: number | null
          updated_at: string
        }
        Insert: {
          basin?: string
          coastal_length_km?: number | null
          country_code?: string
          created_at?: string
          geometry: Json
          id?: string
          name: string
          population?: number | null
          updated_at?: string
        }
        Update: {
          basin?: string
          coastal_length_km?: number | null
          country_code?: string
          created_at?: string
          geometry?: Json
          id?: string
          name?: string
          population?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      oceanographic_observations: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          dataset_id: string
          depth_m: number | null
          id: string
          location_lat: number
          location_lng: number
          metadata: Json | null
          mission_id: string | null
          platform_id: string | null
          quality_flag: string | null
          source: string | null
          timestamp: string
          unit: string | null
          value: number | null
          variable_name: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          dataset_id: string
          depth_m?: number | null
          id?: string
          location_lat: number
          location_lng: number
          metadata?: Json | null
          mission_id?: string | null
          platform_id?: string | null
          quality_flag?: string | null
          source?: string | null
          timestamp: string
          unit?: string | null
          value?: number | null
          variable_name: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          dataset_id?: string
          depth_m?: number | null
          id?: string
          location_lat?: number
          location_lng?: number
          metadata?: Json | null
          mission_id?: string | null
          platform_id?: string | null
          quality_flag?: string | null
          source?: string | null
          timestamp?: string
          unit?: string | null
          value?: number | null
          variable_name?: string
        }
        Relationships: []
      }
      port_calls: {
        Row: {
          actual_cargo: string | null
          arrival_time: string | null
          cargo_discrepancy: boolean | null
          created_at: string
          customs_data: Json | null
          declared_cargo: string | null
          departure_time: string | null
          high_risk_port: boolean | null
          id: string
          port_country: string
          port_name: string
          vessel_id: string | null
        }
        Insert: {
          actual_cargo?: string | null
          arrival_time?: string | null
          cargo_discrepancy?: boolean | null
          created_at?: string
          customs_data?: Json | null
          declared_cargo?: string | null
          departure_time?: string | null
          high_risk_port?: boolean | null
          id?: string
          port_country: string
          port_name: string
          vessel_id?: string | null
        }
        Update: {
          actual_cargo?: string | null
          arrival_time?: string | null
          cargo_discrepancy?: boolean | null
          created_at?: string
          customs_data?: Json | null
          declared_cargo?: string | null
          departure_time?: string | null
          high_risk_port?: boolean | null
          id?: string
          port_country?: string
          port_name?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "port_calls_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      port_congestion: {
        Row: {
          average_waiting_time_hours: number | null
          berth_availability_percent: number | null
          congestion_level: string
          congestion_reason: string | null
          created_at: string
          estimated_delay_hours: number | null
          forecast_next_24h: string | null
          id: string
          industrial_action: boolean | null
          infrastructure_issues: boolean | null
          port_country: string
          port_name: string
          source: string
          timestamp: string
          vessels_waiting: number | null
          weather_factor: boolean | null
        }
        Insert: {
          average_waiting_time_hours?: number | null
          berth_availability_percent?: number | null
          congestion_level: string
          congestion_reason?: string | null
          created_at?: string
          estimated_delay_hours?: number | null
          forecast_next_24h?: string | null
          id?: string
          industrial_action?: boolean | null
          infrastructure_issues?: boolean | null
          port_country: string
          port_name: string
          source: string
          timestamp: string
          vessels_waiting?: number | null
          weather_factor?: boolean | null
        }
        Update: {
          average_waiting_time_hours?: number | null
          berth_availability_percent?: number | null
          congestion_level?: string
          congestion_reason?: string | null
          created_at?: string
          estimated_delay_hours?: number | null
          forecast_next_24h?: string | null
          id?: string
          industrial_action?: boolean | null
          infrastructure_issues?: boolean | null
          port_country?: string
          port_name?: string
          source?: string
          timestamp?: string
          vessels_waiting?: number | null
          weather_factor?: boolean | null
        }
        Relationships: []
      }
      port_performance: {
        Row: {
          cargo_type: string | null
          created_at: string
          id: string
          measurement_date: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          port_id: string
          source: string
          unit: string
          vessel_category: string | null
        }
        Insert: {
          cargo_type?: string | null
          created_at?: string
          id?: string
          measurement_date?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          port_id: string
          source: string
          unit: string
          vessel_category?: string | null
        }
        Update: {
          cargo_type?: string | null
          created_at?: string
          id?: string
          measurement_date?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          port_id?: string
          source?: string
          unit?: string
          vessel_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "port_performance_port_id_fkey"
            columns: ["port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
        ]
      }
      port_tariffs: {
        Row: {
          additional_fees: Json | null
          cargo_type: string | null
          created_at: string
          currency: string | null
          id: string
          port_id: string
          rate_per_unit: number
          service_type: string
          unit_type: string
          updated_at: string
          valid_from: string
          valid_until: string | null
          vessel_size_category: string | null
        }
        Insert: {
          additional_fees?: Json | null
          cargo_type?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          port_id: string
          rate_per_unit: number
          service_type: string
          unit_type: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          vessel_size_category?: string | null
        }
        Update: {
          additional_fees?: Json | null
          cargo_type?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          port_id?: string
          rate_per_unit?: number
          service_type?: string
          unit_type?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          vessel_size_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "port_tariffs_port_id_fkey"
            columns: ["port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
        ]
      }
      ports: {
        Row: {
          code: string
          contact_info: Json | null
          country: string
          created_at: string
          facilities: Json | null
          id: string
          location_lat: number
          location_lng: number
          name: string
          operating_hours: Json | null
          port_type: string
          updated_at: string
        }
        Insert: {
          code: string
          contact_info?: Json | null
          country: string
          created_at?: string
          facilities?: Json | null
          id?: string
          location_lat: number
          location_lng: number
          name: string
          operating_hours?: Json | null
          port_type?: string
          updated_at?: string
        }
        Update: {
          code?: string
          contact_info?: Json | null
          country?: string
          created_at?: string
          facilities?: Json | null
          id?: string
          location_lat?: number
          location_lng?: number
          name?: string
          operating_hours?: Json | null
          port_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          contact_email: string | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          contact_email?: string | null
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      regulatory_feeds: {
        Row: {
          content: Json | null
          created_at: string
          description: string | null
          effective_date: string | null
          id: string
          impact_level: string
          published_at: string
          regulation_type: string
          sectors: string[] | null
          source_authority: string
          title: string
          url: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string
          description?: string | null
          effective_date?: string | null
          id?: string
          impact_level: string
          published_at: string
          regulation_type: string
          sectors?: string[] | null
          source_authority: string
          title: string
          url?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string
          description?: string | null
          effective_date?: string | null
          id?: string
          impact_level?: string
          published_at?: string
          regulation_type?: string
          sectors?: string[] | null
          source_authority?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      regulatory_requirements: {
        Row: {
          compliance_deadline: string | null
          created_at: string
          description: string
          documentation_required: Json | null
          fees_eur: number | null
          id: string
          mandatory: boolean | null
          port_id: string
          requirement_type: string
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          compliance_deadline?: string | null
          created_at?: string
          description: string
          documentation_required?: Json | null
          fees_eur?: number | null
          id?: string
          mandatory?: boolean | null
          port_id: string
          requirement_type: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          compliance_deadline?: string | null
          created_at?: string
          description?: string
          documentation_required?: Json | null
          fees_eur?: number | null
          id?: string
          mandatory?: boolean | null
          port_id?: string
          requirement_type?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regulatory_requirements_port_id_fkey"
            columns: ["port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
        ]
      }
      sanctions_lists: {
        Row: {
          created_at: string
          effective_date: string
          entity_name: string
          entity_type: string
          expiry_date: string | null
          id: string
          imo_number: number | null
          last_verified: string | null
          sanction_authority: string
          sanction_reason: string | null
          sanction_type: string
          source_url: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          effective_date: string
          entity_name: string
          entity_type: string
          expiry_date?: string | null
          id?: string
          imo_number?: number | null
          last_verified?: string | null
          sanction_authority: string
          sanction_reason?: string | null
          sanction_type: string
          source_url?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          effective_date?: string
          entity_name?: string
          entity_type?: string
          expiry_date?: string | null
          id?: string
          imo_number?: number | null
          last_verified?: string | null
          sanction_authority?: string
          sanction_reason?: string | null
          sanction_type?: string
          source_url?: string | null
          status?: string | null
        }
        Relationships: []
      }
      satellite_detections: {
        Row: {
          ais_gap_detected: boolean | null
          created_at: string
          detection_confidence: number | null
          detection_time: string
          id: string
          image_url: string | null
          location_lat: number
          location_lng: number
          matched_ais_vessel_id: string | null
          metadata: Json | null
          satellite_source: string
          suspicious_score: number | null
          vessel_length_estimate: number | null
          vessel_width_estimate: number | null
        }
        Insert: {
          ais_gap_detected?: boolean | null
          created_at?: string
          detection_confidence?: number | null
          detection_time: string
          id?: string
          image_url?: string | null
          location_lat: number
          location_lng: number
          matched_ais_vessel_id?: string | null
          metadata?: Json | null
          satellite_source: string
          suspicious_score?: number | null
          vessel_length_estimate?: number | null
          vessel_width_estimate?: number | null
        }
        Update: {
          ais_gap_detected?: boolean | null
          created_at?: string
          detection_confidence?: number | null
          detection_time?: string
          id?: string
          image_url?: string | null
          location_lat?: number
          location_lng?: number
          matched_ais_vessel_id?: string | null
          metadata?: Json | null
          satellite_source?: string
          suspicious_score?: number | null
          vessel_length_estimate?: number | null
          vessel_width_estimate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "satellite_detections_matched_ais_vessel_id_fkey"
            columns: ["matched_ais_vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      shadow_fleet_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_data: Json | null
          alert_type: string
          created_at: string
          description: string | null
          id: string
          priority: string
          resolved_at: string | null
          status: string | null
          title: string
          vessel_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_data?: Json | null
          alert_type: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string | null
          title: string
          vessel_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_data?: Json | null
          alert_type?: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string | null
          title?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shadow_fleet_alerts_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_data: {
        Row: {
          course: number | null
          created_at: string
          destination: string | null
          draught: number | null
          eta: string | null
          heading: number | null
          id: string
          imo: number | null
          location_lat: number
          location_lng: number
          mmsi: number | null
          source: string
          speed: number | null
          status: string | null
          timestamp: string
          vessel_id: string
          vessel_name: string | null
          vessel_type: string | null
        }
        Insert: {
          course?: number | null
          created_at?: string
          destination?: string | null
          draught?: number | null
          eta?: string | null
          heading?: number | null
          id?: string
          imo?: number | null
          location_lat: number
          location_lng: number
          mmsi?: number | null
          source?: string
          speed?: number | null
          status?: string | null
          timestamp: string
          vessel_id: string
          vessel_name?: string | null
          vessel_type?: string | null
        }
        Update: {
          course?: number | null
          created_at?: string
          destination?: string | null
          draught?: number | null
          eta?: string | null
          heading?: number | null
          id?: string
          imo?: number | null
          location_lat?: number
          location_lng?: number
          mmsi?: number | null
          source?: string
          speed?: number | null
          status?: string | null
          timestamp?: string
          vessel_id?: string
          vessel_name?: string | null
          vessel_type?: string | null
        }
        Relationships: []
      }
      sts_transfers: {
        Row: {
          created_at: string
          distance_between_vessels: number | null
          duration_hours: number | null
          estimated_cargo_transferred: number | null
          id: string
          location_lat: number
          location_lng: number
          regulatory_compliance: string | null
          risk_assessment: string | null
          transfer_end: string | null
          transfer_start: string
          transfer_type: string | null
          vessel1_id: string | null
          vessel2_id: string | null
          weather_conditions: Json | null
        }
        Insert: {
          created_at?: string
          distance_between_vessels?: number | null
          duration_hours?: number | null
          estimated_cargo_transferred?: number | null
          id?: string
          location_lat: number
          location_lng: number
          regulatory_compliance?: string | null
          risk_assessment?: string | null
          transfer_end?: string | null
          transfer_start: string
          transfer_type?: string | null
          vessel1_id?: string | null
          vessel2_id?: string | null
          weather_conditions?: Json | null
        }
        Update: {
          created_at?: string
          distance_between_vessels?: number | null
          duration_hours?: number | null
          estimated_cargo_transferred?: number | null
          id?: string
          location_lat?: number
          location_lng?: number
          regulatory_compliance?: string | null
          risk_assessment?: string | null
          transfer_end?: string | null
          transfer_start?: string
          transfer_type?: string | null
          vessel1_id?: string | null
          vessel2_id?: string | null
          weather_conditions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "sts_transfers_vessel1_id_fkey"
            columns: ["vessel1_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sts_transfers_vessel2_id_fkey"
            columns: ["vessel2_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      suspicious_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          detected_at: string
          evidence: Json | null
          id: string
          investigated_by: string | null
          location_lat: number | null
          location_lng: number | null
          resolution_notes: string | null
          severity: string
          status: string | null
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          detected_at: string
          evidence?: Json | null
          id?: string
          investigated_by?: string | null
          location_lat?: number | null
          location_lng?: number | null
          resolution_notes?: string | null
          severity?: string
          status?: string | null
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          detected_at?: string
          evidence?: Json | null
          id?: string
          investigated_by?: string | null
          location_lat?: number | null
          location_lng?: number | null
          resolution_notes?: string | null
          severity?: string
          status?: string | null
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suspicious_activities_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      uwwtd_plants: {
        Row: {
          capacity_pe: number | null
          compliant: boolean | null
          created_at: string
          discharge_to_baltic: boolean | null
          id: string
          last_inspection: string | null
          location_lat: number | null
          location_lng: number | null
          municipality_id: string | null
          name: string
          plant_id: string
          tertiary_np_removal: boolean | null
          treatment_level: string | null
          updated_at: string
        }
        Insert: {
          capacity_pe?: number | null
          compliant?: boolean | null
          created_at?: string
          discharge_to_baltic?: boolean | null
          id?: string
          last_inspection?: string | null
          location_lat?: number | null
          location_lng?: number | null
          municipality_id?: string | null
          name: string
          plant_id: string
          tertiary_np_removal?: boolean | null
          treatment_level?: string | null
          updated_at?: string
        }
        Update: {
          capacity_pe?: number | null
          compliant?: boolean | null
          created_at?: string
          discharge_to_baltic?: boolean | null
          id?: string
          last_inspection?: string | null
          location_lat?: number | null
          location_lng?: number | null
          municipality_id?: string | null
          name?: string
          plant_id?: string
          tertiary_np_removal?: boolean | null
          treatment_level?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "uwwtd_plants_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      vessels: {
        Row: {
          built_year: number | null
          call_sign: string | null
          created_at: string
          flag_state: string | null
          gross_tonnage: number | null
          id: string
          imo_number: number | null
          insurance_company: string | null
          last_reflagging_date: string | null
          manager: string | null
          metadata: Json | null
          mmsi: number | null
          operator: string | null
          owner: string | null
          reflagging_count: number | null
          risk_score: number | null
          sanctions_status: string | null
          updated_at: string
          vessel_name: string
          vessel_type: string | null
        }
        Insert: {
          built_year?: number | null
          call_sign?: string | null
          created_at?: string
          flag_state?: string | null
          gross_tonnage?: number | null
          id?: string
          imo_number?: number | null
          insurance_company?: string | null
          last_reflagging_date?: string | null
          manager?: string | null
          metadata?: Json | null
          mmsi?: number | null
          operator?: string | null
          owner?: string | null
          reflagging_count?: number | null
          risk_score?: number | null
          sanctions_status?: string | null
          updated_at?: string
          vessel_name: string
          vessel_type?: string | null
        }
        Update: {
          built_year?: number | null
          call_sign?: string | null
          created_at?: string
          flag_state?: string | null
          gross_tonnage?: number | null
          id?: string
          imo_number?: number | null
          insurance_company?: string | null
          last_reflagging_date?: string | null
          manager?: string | null
          metadata?: Json | null
          mmsi?: number | null
          operator?: string | null
          owner?: string | null
          reflagging_count?: number | null
          risk_score?: number | null
          sanctions_status?: string | null
          updated_at?: string
          vessel_name?: string
          vessel_type?: string | null
        }
        Relationships: []
      }
      water_quality: {
        Row: {
          chlorophyll: number | null
          created_at: string
          depth: number | null
          id: string
          location_lat: number
          location_lng: number
          nitrates: number | null
          oxygen: number | null
          ph: number | null
          phosphates: number | null
          salinity: number | null
          source: string
          station_id: string
          station_name: string | null
          temperature: number | null
          timestamp: string
          turbidity: number | null
        }
        Insert: {
          chlorophyll?: number | null
          created_at?: string
          depth?: number | null
          id?: string
          location_lat: number
          location_lng: number
          nitrates?: number | null
          oxygen?: number | null
          ph?: number | null
          phosphates?: number | null
          salinity?: number | null
          source: string
          station_id: string
          station_name?: string | null
          temperature?: number | null
          timestamp: string
          turbidity?: number | null
        }
        Update: {
          chlorophyll?: number | null
          created_at?: string
          depth?: number | null
          id?: string
          location_lat?: number
          location_lng?: number
          nitrates?: number | null
          oxygen?: number | null
          ph?: number | null
          phosphates?: number | null
          salinity?: number | null
          source?: string
          station_id?: string
          station_name?: string | null
          temperature?: number | null
          timestamp?: string
          turbidity?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      backhaul_opportunities: {
        Row: {
          booking_urgency: string | null
          cargo_subtype: string | null
          cargo_type: string | null
          commodity_group: string | null
          consignee_company: string | null
          contract_duration_months: number | null
          created_at: string | null
          currency: string | null
          demand_level: string | null
          destination_region: string | null
          discharge_time_hours: number | null
          environmental_requirements: Json | null
          frequency: string | null
          id: string | null
          lead_time_days: number | null
          loading_time_hours: number | null
          max_vessel_size_dwt: number | null
          metadata: Json | null
          min_vessel_size_dwt: number | null
          opportunity_score: number | null
          origin_region: string | null
          port_destination: string | null
          port_origin: string | null
          rate_per_ton: number | null
          route_restrictions: Json | null
          seasonal_factor: number | null
          shipper_company: string | null
          spot_vs_contract: string | null
          total_value_eur: number | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
          vessel_type_required: string | null
          volume_tons: number | null
        }
        Insert: {
          booking_urgency?: never
          cargo_subtype?: string | null
          cargo_type?: string | null
          commodity_group?: string | null
          consignee_company?: string | null
          contract_duration_months?: number | null
          created_at?: string | null
          currency?: string | null
          demand_level?: string | null
          destination_region?: string | null
          discharge_time_hours?: number | null
          environmental_requirements?: Json | null
          frequency?: string | null
          id?: string | null
          lead_time_days?: number | null
          loading_time_hours?: number | null
          max_vessel_size_dwt?: number | null
          metadata?: Json | null
          min_vessel_size_dwt?: number | null
          opportunity_score?: never
          origin_region?: string | null
          port_destination?: string | null
          port_origin?: string | null
          rate_per_ton?: number | null
          route_restrictions?: Json | null
          seasonal_factor?: number | null
          shipper_company?: string | null
          spot_vs_contract?: string | null
          total_value_eur?: never
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          vessel_type_required?: string | null
          volume_tons?: number | null
        }
        Update: {
          booking_urgency?: never
          cargo_subtype?: string | null
          cargo_type?: string | null
          commodity_group?: string | null
          consignee_company?: string | null
          contract_duration_months?: number | null
          created_at?: string | null
          currency?: string | null
          demand_level?: string | null
          destination_region?: string | null
          discharge_time_hours?: number | null
          environmental_requirements?: Json | null
          frequency?: string | null
          id?: string | null
          lead_time_days?: number | null
          loading_time_hours?: number | null
          max_vessel_size_dwt?: number | null
          metadata?: Json | null
          min_vessel_size_dwt?: number | null
          opportunity_score?: never
          origin_region?: string | null
          port_destination?: string | null
          port_origin?: string | null
          rate_per_ton?: number | null
          route_restrictions?: Json | null
          seasonal_factor?: number | null
          shipper_company?: string | null
          spot_vs_contract?: string | null
          total_value_eur?: never
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          vessel_type_required?: string | null
          volume_tons?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "bidder" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["bidder", "admin"],
    },
  },
} as const
