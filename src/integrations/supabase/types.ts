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
      ais_positions: {
        Row: {
          callsign: string | null
          cog: number | null
          created_at: string | null
          draught: number | null
          geom: unknown | null
          heading: number | null
          imo: number | null
          lat: number
          lon: number
          mmsi: number
          nav_status: string | null
          sog: number | null
          source: string | null
          ts: string
          vessel_name: string | null
          vessel_type: string | null
        }
        Insert: {
          callsign?: string | null
          cog?: number | null
          created_at?: string | null
          draught?: number | null
          geom?: unknown | null
          heading?: number | null
          imo?: number | null
          lat: number
          lon: number
          mmsi: number
          nav_status?: string | null
          sog?: number | null
          source?: string | null
          ts: string
          vessel_name?: string | null
          vessel_type?: string | null
        }
        Update: {
          callsign?: string | null
          cog?: number | null
          created_at?: string | null
          draught?: number | null
          geom?: unknown | null
          heading?: number | null
          imo?: number | null
          lat?: number
          lon?: number
          mmsi?: number
          nav_status?: string | null
          sog?: number | null
          source?: string | null
          ts?: string
          vessel_name?: string | null
          vessel_type?: string | null
        }
        Relationships: []
      }
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
      cache_entries: {
        Row: {
          created_at: string
          data: Json
          expires_at: string
          id: string
          key: string
        }
        Insert: {
          created_at?: string
          data: Json
          expires_at: string
          id?: string
          key: string
        }
        Update: {
          created_at?: string
          data?: Json
          expires_at?: string
          id?: string
          key?: string
        }
        Relationships: []
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
      eez_zones: {
        Row: {
          country: string | null
          created_at: string | null
          geom: unknown | null
          id: string
          name: string
          properties: Json | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          geom?: unknown | null
          id?: string
          name: string
          properties?: Json | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          geom?: unknown | null
          id?: string
          name?: string
          properties?: Json | null
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
      ports_context: {
        Row: {
          country: string | null
          created_at: string | null
          geom: unknown | null
          id: string
          name: string
          port_type: string | null
          properties: Json | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          geom?: unknown | null
          id?: string
          name: string
          port_type?: string | null
          properties?: Json | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          geom?: unknown | null
          id?: string
          name?: string
          port_type?: string | null
          properties?: Json | null
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
      sar_detections: {
        Row: {
          acq_time: string
          confidence: number | null
          created_at: string | null
          est_length_m: number | null
          geom: unknown | null
          id: string
          lat: number
          lon: number
          match_confidence: number | null
          match_distance_m: number | null
          matched_mmsi: number | null
          rcs_db: number | null
          scene_id: string
        }
        Insert: {
          acq_time: string
          confidence?: number | null
          created_at?: string | null
          est_length_m?: number | null
          geom?: unknown | null
          id?: string
          lat: number
          lon: number
          match_confidence?: number | null
          match_distance_m?: number | null
          matched_mmsi?: number | null
          rcs_db?: number | null
          scene_id: string
        }
        Update: {
          acq_time?: string
          confidence?: number | null
          created_at?: string | null
          est_length_m?: number | null
          geom?: unknown | null
          id?: string
          lat?: number
          lon?: number
          match_confidence?: number | null
          match_distance_m?: number | null
          matched_mmsi?: number | null
          rcs_db?: number | null
          scene_id?: string
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
      shadow_fleet_alerts_v2: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_time: string
          created_at: string | null
          details: Json | null
          detection_id: string | null
          geom: unknown | null
          id: string
          mmsi: number | null
          priority: number | null
          score: number | null
          status: string | null
          summary: string
          type: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_time?: string
          created_at?: string | null
          details?: Json | null
          detection_id?: string | null
          geom?: unknown | null
          id?: string
          mmsi?: number | null
          priority?: number | null
          score?: number | null
          status?: string | null
          summary: string
          type: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_time?: string
          created_at?: string | null
          details?: Json | null
          detection_id?: string | null
          geom?: unknown | null
          id?: string
          mmsi?: number | null
          priority?: number | null
          score?: number | null
          status?: string | null
          summary?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "shadow_fleet_alerts_v2_detection_id_fkey"
            columns: ["detection_id"]
            isOneToOne: false
            referencedRelation: "sar_detections"
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
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
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
      vessel_tracks_cache: {
        Row: {
          last_lat: number | null
          last_lon: number | null
          last_position_time: string | null
          mmsi: number
          predicted_lat: number | null
          predicted_lon: number | null
          prediction_uncertainty: number | null
          status: string | null
          track_points: Json | null
          updated_at: string | null
        }
        Insert: {
          last_lat?: number | null
          last_lon?: number | null
          last_position_time?: string | null
          mmsi: number
          predicted_lat?: number | null
          predicted_lon?: number | null
          prediction_uncertainty?: number | null
          status?: string | null
          track_points?: Json | null
          updated_at?: string | null
        }
        Update: {
          last_lat?: number | null
          last_lon?: number | null
          last_position_time?: string | null
          mmsi?: number
          predicted_lat?: number | null
          predicted_lon?: number | null
          prediction_uncertainty?: number | null
          status?: string | null
          track_points?: Json | null
          updated_at?: string | null
        }
        Relationships: []
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
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
        Returns: string
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      cleanup_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
          | { column_name: string; schema_name: string; table_name: string }
          | { column_name: string; table_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: string
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { format?: string; geom: unknown }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; rel?: number }
          | { geom: unknown; maxdecimaldigits?: number; rel?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; options?: string; radius: number }
          | { geom: unknown; quadsegs: number; radius: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { dm?: number; dx: number; dy: number; dz?: number; geom: unknown }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { font?: Json; letters: string }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { from_proj: string; geom: unknown; to_proj: string }
          | { from_proj: string; geom: unknown; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "bidder" | "admin"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
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
