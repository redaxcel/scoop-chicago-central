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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contact_inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          coupon_code: string | null
          created_at: string
          current_usage: number | null
          description: string
          discount_amount: number | null
          discount_percent: number | null
          id: string
          is_active: boolean | null
          shop_id: string
          terms_conditions: string | null
          title: string
          updated_at: string
          usage_limit: number | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          current_usage?: number | null
          description: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          is_active?: boolean | null
          shop_id: string
          terms_conditions?: string | null
          title: string
          updated_at?: string
          usage_limit?: number | null
          valid_from?: string
          valid_until: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          current_usage?: number | null
          description?: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          is_active?: boolean | null
          shop_id?: string
          terms_conditions?: string | null
          title?: string
          updated_at?: string
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "ice_cream_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          event_date: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string | null
          registration_url: string | null
          shop_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          registration_url?: string | null
          shop_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          registration_url?: string | null
          shop_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "ice_cream_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      ice_cream_shops: {
        Row: {
          address: string
          amenities: string[] | null
          city: string
          created_at: string
          description: string | null
          facebook_url: string | null
          featured: boolean | null
          gallery_images: string[] | null
          hours: Json | null
          id: string
          image_url: string | null
          instagram_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          owner_email: string | null
          owner_name: string | null
          owner_profile_id: string | null
          phone: string | null
          pricing: Database["public"]["Enums"]["price_level"] | null
          state: string
          status: Database["public"]["Enums"]["shop_status"] | null
          twitter_url: string | null
          updated_at: string
          website_url: string | null
          zip_code: string | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          city?: string
          created_at?: string
          description?: string | null
          facebook_url?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          hours?: Json | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_email?: string | null
          owner_name?: string | null
          owner_profile_id?: string | null
          phone?: string | null
          pricing?: Database["public"]["Enums"]["price_level"] | null
          state?: string
          status?: Database["public"]["Enums"]["shop_status"] | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          city?: string
          created_at?: string
          description?: string | null
          facebook_url?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          hours?: Json | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_email?: string | null
          owner_name?: string | null
          owner_profile_id?: string | null
          phone?: string | null
          pricing?: Database["public"]["Enums"]["price_level"] | null
          state?: string
          status?: Database["public"]["Enums"]["shop_status"] | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ice_cream_shops_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          shop_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          shop_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          shop_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "ice_cream_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string
          created_at: string
          helpful_count: number | null
          id: string
          rating: number
          shop_id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          rating: number
          shop_id: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          rating?: number
          shop_id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "ice_cream_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_submissions: {
        Row: {
          address: string
          business_name: string
          city: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          notes: string | null
          state: string
          status: string | null
          website_url: string | null
          zip_code: string | null
        }
        Insert: {
          address: string
          business_name: string
          city?: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          state?: string
          status?: string | null
          website_url?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          business_name?: string
          city?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          state?: string
          status?: string | null
          website_url?: string | null
          zip_code?: string | null
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
      price_level: "$" | "$$" | "$$$" | "$$$$"
      shop_status: "active" | "pending" | "closed" | "suspended"
      user_role: "admin" | "moderator" | "user"
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
      price_level: ["$", "$$", "$$$", "$$$$"],
      shop_status: ["active", "pending", "closed", "suspended"],
      user_role: ["admin", "moderator", "user"],
    },
  },
} as const
