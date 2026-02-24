export interface Database {
  public: {
    Tables: {
      sensors: {
        Row: {
          id: string;
          name: string;
          type: string;
          location: string;
          status: string;
          calibration_date: string;
          accuracy_rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          location: string;
          status?: string;
          calibration_date?: string;
          accuracy_rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          location?: string;
          status?: string;
          calibration_date?: string;
          accuracy_rating?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      sensor_readings: {
        Row: {
          id: string;
          sensor_id: string;
          pol_percentage: number;
          brix: number | null;
          moisture_content: number | null;
          temperature: number | null;
          flow_rate: number | null;
          quality_score: number;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sensor_id: string;
          pol_percentage: number;
          brix?: number | null;
          moisture_content?: number | null;
          temperature?: number | null;
          flow_rate?: number | null;
          quality_score?: number;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sensor_id?: string;
          pol_percentage?: number;
          brix?: number | null;
          moisture_content?: number | null;
          temperature?: number | null;
          flow_rate?: number | null;
          quality_score?: number;
          timestamp?: string;
          created_at?: string;
        };
      };
      calibration_records: {
        Row: {
          id: string;
          sensor_id: string;
          lab_pol_value: number;
          sensor_pol_value: number;
          deviation: number;
          calibrated_by: string;
          notes: string | null;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sensor_id: string;
          lab_pol_value: number;
          sensor_pol_value: number;
          calibrated_by: string;
          notes?: string | null;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sensor_id?: string;
          lab_pol_value?: number;
          sensor_pol_value?: number;
          calibrated_by?: string;
          notes?: string | null;
          timestamp?: string;
          created_at?: string;
        };
      };
      system_alerts: {
        Row: {
          id: string;
          sensor_id: string;
          alert_type: string;
          severity: string;
          message: string;
          acknowledged: boolean;
          acknowledged_by: string | null;
          acknowledged_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sensor_id: string;
          alert_type: string;
          severity?: string;
          message: string;
          acknowledged?: boolean;
          acknowledged_by?: string | null;
          acknowledged_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sensor_id?: string;
          alert_type?: string;
          severity?: string;
          message?: string;
          acknowledged?: boolean;
          acknowledged_by?: string | null;
          acknowledged_at?: string | null;
          created_at?: string;
        };
      };
      production_batches: {
        Row: {
          id: string;
          batch_number: string;
          start_time: string;
          end_time: string | null;
          avg_pol: number | null;
          total_tonnage: number | null;
          quality_grade: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_number: string;
          start_time: string;
          end_time?: string | null;
          avg_pol?: number | null;
          total_tonnage?: number | null;
          quality_grade?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_number?: string;
          start_time?: string;
          end_time?: string | null;
          avg_pol?: number | null;
          total_tonnage?: number | null;
          quality_grade?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
