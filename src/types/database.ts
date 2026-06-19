export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Role = 'super_admin' | 'admin' | 'finance_manager' | 'teacher' | 'donor' | 'volunteer' | 'public_user'
export type ProfileStatus = 'active' | 'inactive' | 'suspended' | 'banned'
export type DonationStatus = 'pending' | 'processing' | 'verified' | 'completed' | 'failed' | 'rejected' | 'cancelled'
export type AllocationCategory = 'Educational Materials' | 'Student Meals' | 'School Supplies' | 'Uniform Support' | 'Events & Activities' | 'Operations'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          country: string
          role: Role
          avatar_url: string | null
          bio: string | null
          status: ProfileStatus
          last_login_at: string | null
          login_attempts: number
          last_activity_at: string | null
          avatar_updated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          country?: string
          role?: Role
          avatar_url?: string | null
          bio?: string | null
          status?: ProfileStatus
          last_login_at?: string | null
          login_attempts?: number
          last_activity_at?: string | null
          avatar_updated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          country?: string
          role?: Role
          avatar_url?: string | null
          bio?: string | null
          status?: ProfileStatus
          last_login_at?: string | null
          login_attempts?: number
          last_activity_at?: string | null
          avatar_updated_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          name: string
          age: number
          grade: string
          class_section: string | null
          photo_url: string | null
          bio: string
          family_background: string | null
          hobbies: string[] | null
          dream_career: string | null
          education_goals: string | null
          achievements: string[] | null
          gallery_urls: string[] | null
          date_of_birth: string | null
          enrolled_date: string | null
          sponsorship_status: 'available' | 'partially_sponsored' | 'fully_sponsored'
          sponsorship_amount: number
          current_sponsorship: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          age: number
          grade: string
          class_section?: string | null
          photo_url?: string | null
          bio: string
          family_background?: string | null
          hobbies?: string[] | null
          dream_career?: string | null
          education_goals?: string | null
          achievements?: string[] | null
          gallery_urls?: string[] | null
          date_of_birth?: string | null
          enrolled_date?: string | null
          sponsorship_status?: 'available' | 'partially_sponsored' | 'fully_sponsored'
          sponsorship_amount?: number
          current_sponsorship?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number
          grade?: string
          class_section?: string | null
          photo_url?: string | null
          bio?: string
          family_background?: string | null
          hobbies?: string[] | null
          dream_career?: string | null
          education_goals?: string | null
          achievements?: string[] | null
          gallery_urls?: string[] | null
          date_of_birth?: string | null
          enrolled_date?: string | null
          sponsorship_status?: 'available' | 'partially_sponsored' | 'fully_sponsored'
          sponsorship_amount?: number
          current_sponsorship?: number
          created_at?: string
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          donor_id: string
          student_id: string | null
          amount: number
          frequency: 'one-time' | 'monthly' | 'annual'
          status: DonationStatus
          message: string | null
          transaction_id: string | null
          payment_method: string | null
          payment_session_id: string | null
          verified_at: string | null
          verified_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donor_id: string
          student_id?: string | null
          amount: number
          frequency?: 'one-time' | 'monthly' | 'annual'
          status?: DonationStatus
          message?: string | null
          transaction_id?: string | null
          payment_method?: string | null
          payment_session_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donor_id?: string
          student_id?: string | null
          amount?: number
          frequency?: 'one-time' | 'monthly' | 'annual'
          status?: DonationStatus
          message?: string | null
          transaction_id?: string | null
          payment_method?: string | null
          payment_session_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sponsorships: {
        Row: {
          id: string
          donor_id: string
          student_id: string
          amount: number
          status: 'active' | 'paused' | 'ended'
          start_date: string
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donor_id: string
          student_id: string
          amount: number
          status?: 'active' | 'paused' | 'ended'
          start_date?: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donor_id?: string
          student_id?: string
          amount?: number
          status?: 'active' | 'paused' | 'ended'
          start_date?: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      news: {
        Row: {
          id: string
          title: string
          slug: string | null
          category: 'updates' | 'events' | 'impact'
          content: string
          excerpt: string
          image_url: string | null
          tags: string[] | null
          published: boolean
          published_at: string
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug?: string | null
          category?: 'updates' | 'events' | 'impact'
          content: string
          excerpt: string
          image_url?: string | null
          tags?: string[] | null
          published?: boolean
          published_at?: string
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string | null
          category?: 'updates' | 'events' | 'impact'
          content?: string
          excerpt?: string
          image_url?: string | null
          tags?: string[] | null
          published?: boolean
          published_at?: string
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gallery_items: {
        Row: {
          id: string
          type: 'photo' | 'video' | 'testimonial'
          title: string
          caption: string | null
          url: string
          thumbnail_url: string | null
          author: string | null
          category: string
          is_featured: boolean
          is_published: boolean
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'photo' | 'video' | 'testimonial'
          title: string
          caption?: string | null
          url: string
          thumbnail_url?: string | null
          author?: string | null
          category?: string
          is_featured?: boolean
          is_published?: boolean
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'photo' | 'video' | 'testimonial'
          title?: string
          caption?: string | null
          url?: string
          thumbnail_url?: string | null
          author?: string | null
          category?: string
          is_featured?: boolean
          is_published?: boolean
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          subject: string
          message: string
          status: 'unread' | 'read' | 'replied'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          subject: string
          message: string
          status?: 'unread' | 'read' | 'replied'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          subject?: string
          message?: string
          status?: 'unread' | 'read' | 'replied'
          created_at?: string
        }
      }
      donation_allocations: {
        Row: {
          id: string
          donation_id: string
          category: AllocationCategory
          allocation_percentage: number
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          donation_id: string
          category: AllocationCategory
          allocation_percentage: number
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          donation_id?: string
          category?: AllocationCategory
          allocation_percentage?: number
          amount?: number
          created_at?: string
        }
      }
      donation_goals: {
        Row: {
          id: string
          title: string
          description: string | null
          target_amount: number
          raised_amount: number
          donor_count: number
          icon: string | null
          color: string | null
          category: string
          is_active: boolean
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          target_amount: number
          raised_amount?: number
          donor_count?: number
          icon?: string | null
          color?: string | null
          category?: string
          is_active?: boolean
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          target_amount?: number
          raised_amount?: number
          donor_count?: number
          icon?: string | null
          color?: string | null
          category?: string
          is_active?: boolean
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          author_name: string
          author_role: string
          content: string
          quote: string | null
          avatar_url: string | null
          is_published: boolean
          is_featured: boolean
          testimonial_type: 'donor' | 'teacher' | 'student' | 'volunteer'
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_name: string
          author_role: string
          content: string
          quote?: string | null
          avatar_url?: string | null
          is_published?: boolean
          is_featured?: boolean
          testimonial_type?: 'donor' | 'teacher' | 'student' | 'volunteer'
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_name?: string
          author_role?: string
          content?: string
          quote?: string | null
          avatar_url?: string | null
          is_published?: boolean
          is_featured?: boolean
          testimonial_type?: 'donor' | 'teacher' | 'student' | 'volunteer'
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_type: 'activity' | 'celebration' | 'program' | 'sports' | 'volunteer' | 'function'
          date: string
          time: string | null
          location: string | null
          image_url: string | null
          gallery_urls: string[] | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_type?: 'activity' | 'celebration' | 'program' | 'sports' | 'volunteer' | 'function'
          date: string
          time?: string | null
          location?: string | null
          image_url?: string | null
          gallery_urls?: string[] | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_type?: 'activity' | 'celebration' | 'program' | 'sports' | 'volunteer' | 'function'
          date?: string
          time?: string | null
          location?: string | null
          image_url?: string | null
          gallery_urls?: string[] | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sponsorship_timeline: {
        Row: {
          id: string
          sponsorship_id: string
          event_type: 'started' | 'donation' | 'report' | 'achievement' | 'milestone' | 'update' | 'renewal'
          title: string
          description: string | null
          icon: string | null
          event_date: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          sponsorship_id: string
          event_type: 'started' | 'donation' | 'report' | 'achievement' | 'milestone' | 'update' | 'renewal'
          title: string
          description?: string | null
          icon?: string | null
          event_date?: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          sponsorship_id?: string
          event_type?: 'started' | 'donation' | 'report' | 'achievement' | 'milestone' | 'update' | 'renewal'
          title?: string
          description?: string | null
          icon?: string | null
          event_date?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          certificate_type: 'donation_receipt' | 'thank_you' | 'sponsorship_appreciation' | 'volunteer'
          title: string
          amount: number | null
          donation_id: string | null
          sponsorship_id: string | null
          pdf_url: string | null
          issued_date: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          certificate_type: 'donation_receipt' | 'thank_you' | 'sponsorship_appreciation' | 'volunteer'
          title: string
          amount?: number | null
          donation_id?: string | null
          sponsorship_id?: string | null
          pdf_url?: string | null
          issued_date?: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          certificate_type?: 'donation_receipt' | 'thank_you' | 'sponsorship_appreciation' | 'volunteer'
          title?: string
          amount?: number | null
          donation_id?: string | null
          sponsorship_id?: string | null
          pdf_url?: string | null
          issued_date?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      login_history: {
        Row: {
          id: string
          user_id: string
          ip_address: string | null
          user_agent: string | null
          device_info: string | null
          location: string | null
          status: 'success' | 'failed' | 'suspicious'
          failure_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ip_address?: string | null
          user_agent?: string | null
          device_info?: string | null
          location?: string | null
          status?: 'success' | 'failed' | 'suspicious'
          failure_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ip_address?: string | null
          user_agent?: string | null
          device_info?: string | null
          location?: string | null
          status?: 'success' | 'failed' | 'suspicious'
          failure_reason?: string | null
          created_at?: string
        }
      }
      impact_metrics: {
        Row: {
          id: string
          month: string
          meals_funded: number
          books_distributed: number
          uniforms_provided: number
          students_supported: number
          attendance_rate: number | null
          created_at: string
        }
        Insert: {
          id?: string
          month: string
          meals_funded?: number
          books_distributed?: number
          uniforms_provided?: number
          students_supported?: number
          attendance_rate?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          month?: string
          meals_funded?: number
          books_distributed?: number
          uniforms_provided?: number
          students_supported?: number
          attendance_rate?: number | null
          created_at?: string
        }
      }
      teacher_assignments: {
        Row: {
          id: string
          teacher_id: string
          student_id: string
          subject: string | null
          assigned_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          student_id: string
          subject?: string | null
          assigned_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          student_id?: string
          subject?: string | null
          assigned_at?: string
        }
      }
      student_progress: {
        Row: {
          id: string
          student_id: string
          teacher_id: string
          subject: string
          grade: string | null
          attendance: number | null
          notes: string | null
          report_card_url: string | null
          achievement: string | null
          recorded_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          teacher_id: string
          subject: string
          grade?: string | null
          attendance?: number | null
          notes?: string | null
          report_card_url?: string | null
          achievement?: string | null
          recorded_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          teacher_id?: string
          subject?: string
          grade?: string | null
          attendance?: number | null
          notes?: string | null
          report_card_url?: string | null
          achievement?: string | null
          recorded_at?: string
          updated_at?: string
        }
      }
      attendance_records: {
        Row: {
          id: string
          student_id: string
          teacher_id: string
          date: string
          status: 'present' | 'absent' | 'late' | 'excused'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          teacher_id: string
          date: string
          status: 'present' | 'absent' | 'late' | 'excused'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          teacher_id?: string
          date?: string
          status?: 'present' | 'absent' | 'late' | 'excused'
          notes?: string | null
          created_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          level: number
          is_system: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          level?: number
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          level?: number
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      permissions: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          group_name: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          group_name: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          group_name?: string
          created_at?: string
        }
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          permission_id: string
          created_at: string
        }
        Insert: {
          id?: string
          role_id: string
          permission_id: string
          created_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          permission_id?: string
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          assigned_by: string | null
          assigned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role_id: string
          assigned_by?: string | null
          assigned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role_id?: string
          assigned_by?: string | null
          assigned_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          ip_address: string | null
          user_agent: string | null
          device_info: Json | null
          location: string | null
          is_active: boolean
          last_activity: string
          created_at: string
          expired_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          ip_address?: string | null
          user_agent?: string | null
          device_info?: Json | null
          location?: string | null
          is_active?: boolean
          last_activity?: string
          created_at?: string
          expired_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          ip_address?: string | null
          user_agent?: string | null
          device_info?: Json | null
          location?: string | null
          is_active?: boolean
          last_activity?: string
          created_at?: string
          expired_at?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          changes: Json | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          changes?: Json | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          changes?: Json | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string | null
          data: Json | null
          read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          data?: Json | null
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          data?: Json | null
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      volunteer_assignments: {
        Row: {
          id: string
          volunteer_id: string
          event_name: string
          description: string | null
          role: string | null
          start_date: string
          end_date: string | null
          status: 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          hours_logged: number | null
          notes: string | null
          assigned_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          volunteer_id: string
          event_name: string
          description?: string | null
          role?: string | null
          start_date: string
          end_date?: string | null
          status?: 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          hours_logged?: number | null
          notes?: string | null
          assigned_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          volunteer_id?: string
          event_name?: string
          description?: string | null
          role?: string | null
          start_date?: string
          end_date?: string | null
          status?: 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          hours_logged?: number | null
          notes?: string | null
          assigned_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_settings: {
        Row: {
          id: string
          gateway_name: string
          gateway_display_name: string
          gateway_description: string | null
          qr_image_url: string | null
          account_name: string
          account_number: string
          instructions: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gateway_name: string
          gateway_display_name?: string
          gateway_description?: string | null
          qr_image_url?: string | null
          account_name: string
          account_number: string
          instructions?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gateway_name?: string
          gateway_display_name?: string
          gateway_description?: string | null
          qr_image_url?: string | null
          account_name?: string
          account_number?: string
          instructions?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      payment_sessions: {
        Row: {
          id: string
          donation_id: string | null
          donor_id: string
          gateway: string
          amount: number
          frequency: string
          student_id: string | null
          message: string | null
          transaction_id: string | null
          payment_reference: string | null
          idempotency_key: string | null
          screenshots: string[] | null
          status: string
          verified_by: string | null
          verified_at: string | null
          verification_notes: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donation_id?: string | null
          donor_id: string
          gateway: string
          amount: number
          frequency?: string
          student_id?: string | null
          message?: string | null
          transaction_id?: string | null
          payment_reference?: string | null
          idempotency_key?: string | null
          screenshots?: string[] | null
          status?: string
          verified_by?: string | null
          verified_at?: string | null
          verification_notes?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donation_id?: string
          gateway?: string
          amount?: number
          transaction_id?: string | null
          screenshots?: string[] | null
          status?: string
          verified_by?: string | null
          verified_at?: string | null
          verification_notes?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_verifications: {
        Row: {
          id: string
          payment_session_id: string
          verified_by: string | null
          action: string
          notes: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          payment_session_id: string
          verified_by?: string | null
          action: string
          notes?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          payment_session_id?: string
          verified_by?: string | null
          action?: string
          notes?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      payment_receipts: {
        Row: {
          id: string
          payment_session_id: string
          donation_id: string
          receipt_number: string
          receipt_data: Json
          generated_at: string
        }
        Insert: {
          id?: string
          payment_session_id: string
          donation_id: string
          receipt_number: string
          receipt_data?: Json
          generated_at?: string
        }
        Update: {
          id?: string
          payment_session_id?: string
          donation_id?: string
          receipt_number?: string
          receipt_data?: Json
          generated_at?: string
        }
      }
      payment_audit_logs: {
        Row: {
          id: string
          payment_session_id: string | null
          action: string
          actor_id: string | null
          actor_role: string | null
          details: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          payment_session_id?: string | null
          action: string
          actor_id?: string | null
          actor_role?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          payment_session_id?: string | null
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
      teacher_reports: {
        Row: {
          id: string
          student_id: string
          teacher_id: string
          title: string
          summary: string | null
          subject: string | null
          grade_achieved: string | null
          attendance_rate: number | null
          achievements: string[]
          areas_for_improvement: string[]
          teacher_notes: string | null
          report_card_url: string | null
          report_date: string
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          teacher_id: string
          title: string
          summary?: string | null
          subject?: string | null
          grade_achieved?: string | null
          attendance_rate?: number | null
          achievements?: string[]
          areas_for_improvement?: string[]
          teacher_notes?: string | null
          report_card_url?: string | null
          report_date?: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          teacher_id?: string
          title?: string
          summary?: string | null
          subject?: string | null
          grade_achieved?: string | null
          attendance_rate?: number | null
          achievements?: string[]
          areas_for_improvement?: string[]
          teacher_notes?: string | null
          report_card_url?: string | null
          report_date?: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string | null
          activity_type: string
          title: string
          description: string | null
          metadata: Json | null
          entity_type: string | null
          entity_id: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          activity_type: string
          title: string
          description?: string | null
          metadata?: Json | null
          entity_type?: string | null
          entity_id?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          activity_type?: string
          title?: string
          description?: string | null
          metadata?: Json | null
          entity_type?: string | null
          entity_id?: string | null
          is_public?: boolean
          created_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: Json
          blocks: Json | null
          seo: Json | null
          published: boolean
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content?: Json
          blocks?: Json | null
          seo?: Json | null
          published?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: Json
          blocks?: Json | null
          seo?: Json | null
          published?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      homepage_sections: {
        Row: {
          id: string
          section_key: string
          title: string
          subtitle: string | null
          content: Json
          is_active: boolean
          sort_order: number
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_key: string
          title: string
          subtitle?: string | null
          content?: Json
          is_active?: boolean
          sort_order?: number
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_key?: string
          title?: string
          subtitle?: string | null
          content?: Json
          is_active?: boolean
          sort_order?: number
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          url: string
          video_type: 'youtube' | 'upload' | 'vimeo'
          thumbnail_url: string | null
          description: string | null
          category: string
          is_featured: boolean
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          url: string
          video_type?: 'youtube' | 'upload' | 'vimeo'
          thumbnail_url?: string | null
          description?: string | null
          category?: string
          is_featured?: boolean
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          url?: string
          video_type?: 'youtube' | 'upload' | 'vimeo'
          thumbnail_url?: string | null
          description?: string | null
          category?: string
          is_featured?: boolean
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          category: string
          sort_order: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          category?: string
          sort_order?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          category?: string
          sort_order?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      student_stories: {
        Row: {
          id: string
          title: string
          student_name: string
          content: string
          image_url: string | null
          quote: string | null
          achievements: string[] | null
          is_published: boolean
          featured: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          student_name: string
          content: string
          image_url?: string | null
          quote?: string | null
          achievements?: string[] | null
          is_published?: boolean
          featured?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          student_name?: string
          content?: string
          image_url?: string | null
          quote?: string | null
          achievements?: string[] | null
          is_published?: boolean
          featured?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      media_library: {
        Row: {
          id: string
          url: string
          file_name: string
          file_size: number | null
          mime_type: string | null
          alt_text: string | null
          is_published: boolean
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          file_name: string
          file_size?: number | null
          mime_type?: string | null
          alt_text?: string | null
          is_published?: boolean
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          url?: string
          file_name?: string
          file_size?: number | null
          mime_type?: string | null
          alt_text?: string | null
          is_published?: boolean
          uploaded_by?: string | null
          created_at?: string
        }
      }
      security_events: {
        Row: {
          id: string
          event_type: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          metadata: Json | null
          severity: 'info' | 'warning' | 'critical'
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          severity?: 'info' | 'warning' | 'critical'
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          severity?: 'info' | 'warning' | 'critical'
          created_at?: string
        }
      }
      email_logs: {
        Row: {
          id: string
          user_id: string | null
          email_to: string
          email_type: string
          subject: string
          body: string | null
          status: string
          error_message: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email_to: string
          email_type: string
          subject: string
          body?: string | null
          status?: string
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email_to?: string
          email_type?: string
          subject?: string
          body?: string | null
          status?: string
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
      }
      volunteer_events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string
          event_time: string | null
          location: string | null
          max_volunteers: number
          current_volunteers: number
          required_skills: string[] | null
          responsibilities: string[] | null
          category: string
          image_url: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date: string
          event_time?: string | null
          location?: string | null
          max_volunteers?: number
          current_volunteers?: number
          required_skills?: string[] | null
          responsibilities?: string[] | null
          category?: string
          image_url?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          location?: string | null
          max_volunteers?: number
          current_volunteers?: number
          required_skills?: string[] | null
          responsibilities?: string[] | null
          category?: string
          image_url?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      volunteer_event_signups: {
        Row: {
          id: string
          event_id: string
          volunteer_id: string
          status: string
          attended: boolean
          hours_logged: number | null
          notes: string | null
          checked_in_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          volunteer_id: string
          status?: string
          attended?: boolean
          hours_logged?: number | null
          notes?: string | null
          checked_in_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          volunteer_id?: string
          status?: string
          attended?: boolean
          hours_logged?: number | null
          notes?: string | null
          checked_in_at?: string | null
          created_at?: string
        }
      }
      content_versions: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          entity_slug: string | null
          version_number: number
          title: string
          content: Json | null
          published: boolean | null
          created_by: string | null
          created_at: string
          restored_at: string | null
          restore_notes: string | null
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          entity_slug?: string | null
          version_number?: number
          title: string
          content?: Json | null
          published?: boolean | null
          created_by?: string | null
          created_at?: string
          restored_at?: string | null
          restore_notes?: string | null
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          entity_slug?: string | null
          version_number?: number
          title?: string
          content?: Json | null
          published?: boolean | null
          created_by?: string | null
          created_at?: string
          restored_at?: string | null
          restore_notes?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      get_my_role: {
        Args: Record<string, never>
        Returns: string
      }
      admin_update_role: {
        Args: { target_user_id: string; new_role: string }
        Returns: void
      }
      create_payment_session: {
        Args: { p_donation_id: string; p_gateway: string; p_amount: number }
        Returns: string
      }
      initiate_payment_checkout: {
        Args: {
          p_amount: number
          p_frequency: string
          p_gateway: string
          p_idempotency_key: string | null
          p_message: string | null
          p_student_id: string | null
        }
        Returns: {
          success: boolean
          payment_id: string | null
          checkout_url: string | null
          message: string | null
          session_id?: string | null
          transaction_id?: string | null
        }
      }
      cancel_payment_session: {
        Args: { p_session_id: string }
        Returns: boolean
      }
      submit_payment_confirmation: {
        Args: {
          p_session_id: string
          p_screenshots: string[]
          p_payment_reference?: string | null
        }
        Returns: boolean
      }
      verify_payment: {
        Args: { p_session_id: string; p_status: string; p_notes: string }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Donation = Database['public']['Tables']['donations']['Row']
export type Sponsorship = Database['public']['Tables']['sponsorships']['Row']
export type News = Database['public']['Tables']['news']['Row']
export type GalleryItem = Database['public']['Tables']['gallery_items']['Row']
export type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row']
export type DonationGoal = Database['public']['Tables']['donation_goals']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type SponsorshipTimeline = Database['public']['Tables']['sponsorship_timeline']['Row']
export type Certificate = Database['public']['Tables']['certificates']['Row']
export type LoginHistory = Database['public']['Tables']['login_history']['Row']
export type ImpactMetric = Database['public']['Tables']['impact_metrics']['Row']
export type TeacherAssignment = Database['public']['Tables']['teacher_assignments']['Row']
export type StudentProgress = Database['public']['Tables']['student_progress']['Row']
export type AttendanceRecord = Database['public']['Tables']['attendance_records']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type SecurityEvent = Database['public']['Tables']['security_events']['Row']
export type VolunteerAssignment = Database['public']['Tables']['volunteer_assignments']['Row']
export type PaymentSetting = Database['public']['Tables']['payment_settings']['Row']
export type PaymentSession = Database['public']['Tables']['payment_sessions']['Row']
export type PaymentVerification = Database['public']['Tables']['payment_verifications']['Row']
export type PaymentReceipt = Database['public']['Tables']['payment_receipts']['Row']
export type PaymentAuditLog = Database['public']['Tables']['payment_audit_logs']['Row']
export type DonationAllocation = Database['public']['Tables']['donation_allocations']['Row']
export type Page = Database['public']['Tables']['pages']['Row']
export type HomepageSection = Database['public']['Tables']['homepage_sections']['Row']
export type Video = Database['public']['Tables']['videos']['Row']
export type Faq = Database['public']['Tables']['faqs']['Row']
export type StudentStory = Database['public']['Tables']['student_stories']['Row']
export type MediaItem = Database['public']['Tables']['media_library']['Row']
export type TeacherReport = Database['public']['Tables']['teacher_reports']['Row']
export type ActivityRow = Database['public']['Tables']['activities']['Row']
export type EmailLog = Database['public']['Tables']['email_logs']['Row']
export type VolunteerEvent = Database['public']['Tables']['volunteer_events']['Row']
export type VolunteerEventSignup = Database['public']['Tables']['volunteer_event_signups']['Row']
export type ContentVersion = Database['public']['Tables']['content_versions']['Row']
