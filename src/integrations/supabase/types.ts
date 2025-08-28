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
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
