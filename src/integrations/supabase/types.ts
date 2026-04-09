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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          client_email: string
          client_name: string
          consultation_type: string
          created_at: string
          end_time: string
          engineer_id: string
          id: string
          notes: string | null
          reminder_24h_sent: boolean
          reminder_48h_sent: boolean
          scheduled_date: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          client_email: string
          client_name: string
          consultation_type?: string
          created_at?: string
          end_time: string
          engineer_id: string
          id?: string
          notes?: string | null
          reminder_24h_sent?: boolean
          reminder_48h_sent?: boolean
          scheduled_date: string
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_email?: string
          client_name?: string
          consultation_type?: string
          created_at?: string
          end_time?: string
          engineer_id?: string
          id?: string
          notes?: string | null
          reminder_24h_sent?: boolean
          reminder_48h_sent?: boolean
          scheduled_date?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          consultation_type: string
          created_at: string
          day_of_week: number
          duration_minutes: number
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          consultation_type?: string
          created_at?: string
          day_of_week: number
          duration_minutes?: number
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          consultation_type?: string
          created_at?: string
          day_of_week?: number
          duration_minutes?: number
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_signatures: {
        Row: {
          created_at: string
          document_id: string
          id: string
          ip_address: string | null
          signed_at: string | null
          signer_email: string
          signer_name: string
          signing_token: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          ip_address?: string | null
          signed_at?: string | null
          signer_email: string
          signer_name: string
          signing_token?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          ip_address?: string | null
          signed_at?: string | null
          signer_email?: string
          signer_name?: string
          signing_token?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          project_id: string | null
          signature_status: string
          storage_path: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          category?: string
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          project_id?: string | null
          signature_status?: string
          storage_path: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          category?: string
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          project_id?: string | null
          signature_status?: string
          storage_path?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          client_email: string
          client_name: string
          created_at: string
          currency: string
          due_date: string
          id: string
          invoice_number: string
          line_items: Json
          notes: string | null
          paid_at: string | null
          payment_terms: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_payment_link_id: string | null
          stripe_payment_link_url: string | null
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_email: string
          client_name: string
          created_at?: string
          currency?: string
          due_date: string
          id?: string
          invoice_number: string
          line_items?: Json
          notes?: string | null
          paid_at?: string | null
          payment_terms?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_link_id?: string | null
          stripe_payment_link_url?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_email?: string
          client_name?: string
          created_at?: string
          currency?: string
          due_date?: string
          id?: string
          invoice_number?: string
          line_items?: Json
          notes?: string | null
          paid_at?: string | null
          payment_terms?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_link_id?: string | null
          stripe_payment_link_url?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pe_stamps: {
        Row: {
          created_at: string
          discipline: string
          expiration_date: string
          id: string
          is_default: boolean
          label: string
          license_number: string
          stamp_file_path: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discipline: string
          expiration_date: string
          id?: string
          is_default?: boolean
          label?: string
          license_number: string
          stamp_file_path: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discipline?: string
          expiration_date?: string
          id?: string
          is_default?: boolean
          label?: string
          license_number?: string
          stamp_file_path?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          provider: string | null
          source: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          provider?: string | null
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          provider?: string | null
          source?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          conversion_date: string | null
          created_at: string | null
          credit_applied: boolean | null
          id: string
          referred_email: string | null
          referred_id: string | null
          referrer_id: string
          signup_date: string | null
        }
        Insert: {
          conversion_date?: string | null
          created_at?: string | null
          credit_applied?: boolean | null
          id?: string
          referred_email?: string | null
          referred_id?: string | null
          referrer_id: string
          signup_date?: string | null
        }
        Update: {
          conversion_date?: string | null
          created_at?: string | null
          credit_applied?: boolean | null
          id?: string
          referred_email?: string | null
          referred_id?: string | null
          referrer_id?: string
          signup_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      template_purchases: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          download_expires_at: string | null
          download_url: string | null
          id: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          template_name: string
          template_slug: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          download_expires_at?: string | null
          download_url?: string | null
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          template_name: string
          template_slug: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          download_expires_at?: string | null
          download_url?: string | null
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          template_name?: string
          template_slug?: string
          user_id?: string
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
