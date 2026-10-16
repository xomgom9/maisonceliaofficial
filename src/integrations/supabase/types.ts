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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_path: string | null
          is_visible: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          is_visible?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          is_visible?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_path: string | null
          is_visible: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          is_visible?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          is_visible?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          actor_id: string | null
          after_qty: number
          before_qty: number
          created_at: string
          delta: number
          id: string
          order_id: string | null
          reason: string
          variant_id: string
        }
        Insert: {
          actor_id?: string | null
          after_qty: number
          before_qty: number
          created_at?: string
          delta: number
          id?: string
          order_id?: string | null
          reason: string
          variant_id: string
        }
        Update: {
          actor_id?: string | null
          after_qty?: number
          before_qty?: number
          created_at?: string
          delta?: number
          id?: string
          order_id?: string | null
          reason?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_attempts: {
        Row: {
          attempt_no: number
          created_at: string
          error: string | null
          http_status: number | null
          id: string
          ok: boolean
          outbox_id: string
        }
        Insert: {
          attempt_no: number
          created_at?: string
          error?: string | null
          http_status?: number | null
          id?: string
          ok: boolean
          outbox_id: string
        }
        Update: {
          attempt_no?: number
          created_at?: string
          error?: string | null
          http_status?: number | null
          id?: string
          ok?: boolean
          outbox_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_attempts_outbox_id_fkey"
            columns: ["outbox_id"]
            isOneToOne: false
            referencedRelation: "notification_outbox"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_outbox: {
        Row: {
          attempts: number
          created_at: string
          event_key: string
          event_type: string
          id: string
          last_error: string | null
          locked_at: string | null
          max_attempts: number
          message_id: string | null
          next_retry_at: string
          order_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["outbox_status"]
        }
        Insert: {
          attempts?: number
          created_at?: string
          event_key: string
          event_type: string
          id?: string
          last_error?: string | null
          locked_at?: string | null
          max_attempts?: number
          message_id?: string | null
          next_retry_at?: string
          order_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["outbox_status"]
        }
        Update: {
          attempts?: number
          created_at?: string
          event_key?: string
          event_type?: string
          id?: string
          last_error?: string | null
          locked_at?: string | null
          max_attempts?: number
          message_id?: string | null
          next_retry_at?: string
          order_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["outbox_status"]
        }
        Relationships: [
          {
            foreignKeyName: "notification_outbox_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color: string
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          size: string
          sku: string
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          color: string
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          size: string
          sku: string
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          color?: string
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          size?: string
          sku?: string
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          actor_id: string | null
          created_at: string
          field: string
          from_value: string | null
          id: string
          note: string | null
          order_id: string
          to_value: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          field: string
          from_value?: string | null
          id?: string
          note?: string | null
          order_id: string
          to_value: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          field?: string
          from_value?: string | null
          id?: string
          note?: string | null
          order_id?: string
          to_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          access_token: string
          address: string
          cancel_reason: string | null
          created_at: string
          customer_name: string
          customer_note: string | null
          discount: number
          email: string | null
          id: string
          idempotency_key: string
          internal_note: string | null
          order_number: string
          payment_method: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          province: string
          shipping_fee: number
          shipping_method: string
          status: Database["public"]["Enums"]["order_status"]
          stock_released: boolean
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string
          address: string
          cancel_reason?: string | null
          created_at?: string
          customer_name: string
          customer_note?: string | null
          discount?: number
          email?: string | null
          id?: string
          idempotency_key: string
          internal_note?: string | null
          order_number?: string
          payment_method: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone: string
          province: string
          shipping_fee?: number
          shipping_method: string
          status?: Database["public"]["Enums"]["order_status"]
          stock_released?: boolean
          subtotal: number
          total: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          address?: string
          cancel_reason?: string | null
          created_at?: string
          customer_name?: string
          customer_note?: string | null
          discount?: number
          email?: string | null
          id?: string
          idempotency_key?: string
          internal_note?: string | null
          order_number?: string
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string
          province?: string
          shipping_fee?: number
          shipping_method?: string
          status?: Database["public"]["Enums"]["order_status"]
          stock_released?: boolean
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_records: {
        Row: {
          actor_id: string | null
          amount: number
          created_at: string
          id: string
          kind: string
          method: string
          note: string | null
          order_id: string
        }
        Insert: {
          actor_id?: string | null
          amount: number
          created_at?: string
          id?: string
          kind: string
          method: string
          note?: string | null
          order_id: string
        }
        Update: {
          actor_id?: string | null
          amount?: number
          created_at?: string
          id?: string
          kind?: string
          method?: string
          note?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          product_id: string
        }
        Insert: {
          category_id: string
          product_id: string
        }
        Update: {
          category_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_collections: {
        Row: {
          collection_id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          collection_id: string
          product_id: string
          sort_order?: number
        }
        Update: {
          collection_id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_collections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          alt: string | null
          color: string | null
          created_at: string
          height: number | null
          id: string
          is_cover: boolean
          kind: string
          product_id: string
          sort_order: number
          storage_path: string
          width: number | null
        }
        Insert: {
          alt?: string | null
          color?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_cover?: boolean
          kind?: string
          product_id: string
          sort_order?: number
          storage_path: string
          width?: number | null
        }
        Update: {
          alt?: string | null
          color?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_cover?: boolean
          kind?: string
          product_id?: string
          sort_order?: number
          storage_path?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string
          created_at: string
          id: string
          is_active: boolean
          low_stock_threshold: number
          price: number | null
          product_id: string
          reserved: number
          size: string
          sku: string
          sort_order: number
          stock_on_hand: number
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          is_active?: boolean
          low_stock_threshold?: number
          price?: number | null
          product_id: string
          reserved?: number
          size: string
          sku: string
          sort_order?: number
          stock_on_hand?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          low_stock_threshold?: number
          price?: number | null
          product_id?: string
          reserved?: number
          size?: string
          sku?: string
          sort_order?: number
          stock_on_hand?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          care: string | null
          code: string
          compare_at_price: number | null
          created_at: string
          description: string | null
          fit: string | null
          id: string
          material: string | null
          name: string
          price: number
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          share_image_path: string | null
          short_description: string | null
          size_chart: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          care?: string | null
          code: string
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          fit?: string | null
          id?: string
          material?: string | null
          name: string
          price: number
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          share_image_path?: string | null
          short_description?: string | null
          size_chart?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          care?: string | null
          code?: string
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          fit?: string | null
          id?: string
          material?: string | null
          name?: string
          price?: number
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          share_image_path?: string | null
          short_description?: string | null
          size_chart?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          bank_info: string | null
          bank_transfer_enabled: boolean
          free_shipping_threshold: number | null
          id: boolean
          shipping_fee: number
          telegram_customer_fields: string[]
          telegram_enabled: boolean
          updated_at: string
        }
        Insert: {
          bank_info?: string | null
          bank_transfer_enabled?: boolean
          free_shipping_threshold?: number | null
          id?: boolean
          shipping_fee?: number
          telegram_customer_fields?: string[]
          telegram_enabled?: boolean
          updated_at?: string
        }
        Update: {
          bank_info?: string | null
          bank_transfer_enabled?: boolean
          free_shipping_threshold?: number | null
          id?: boolean
          shipping_fee?: number
          telegram_customer_fields?: string[]
          telegram_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_orders: { Args: { _user_id: string }; Returns: boolean }
      can_manage_products: { Args: { _user_id: string }; Returns: boolean }
      claim_first_owner: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      owner_exists: { Args: never; Returns: boolean }
      product_is_public: { Args: { _pid: string }; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "product_manager" | "order_manager"
      order_status:
        | "new"
        | "confirmed"
        | "packing"
        | "shipped"
        | "completed"
        | "cancelled"
      outbox_status: "pending" | "processing" | "sent" | "failed"
      payment_status:
        | "unpaid"
        | "pending"
        | "paid"
        | "partially_refunded"
        | "refunded"
      product_status: "draft" | "published" | "archived"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["owner", "product_manager", "order_manager"],
      order_status: [
        "new",
        "confirmed",
        "packing",
        "shipped",
        "completed",
        "cancelled",
      ],
      outbox_status: ["pending", "processing", "sent", "failed"],
      payment_status: [
        "unpaid",
        "pending",
        "paid",
        "partially_refunded",
        "refunded",
      ],
      product_status: ["draft", "published", "archived"],
    },
  },
} as const
