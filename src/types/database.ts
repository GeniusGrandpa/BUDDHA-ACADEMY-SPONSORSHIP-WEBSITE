export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Role = 'super_admin' | 'admin' | 'finance_manager' | 'teacher' | 'donor' | 'volunteer' | 'public_user'
export type ProfileStatus = 'active' | 'inactive' | 'suspended' | 'banned'
export type DonationStatus = 'pending' | 'processing' | 'payment_received' | 'verified' | 'completed' | 'failed' | 'rejected' | 'cancelled' | 'received' | 'pledged'
export type VerificationStatus = 'pending_verification' | 'verified' | 'rejected'
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
          phone_code: string | null
          country: string
          role: Role
          avatar_url: string | null
          bio: string | null
          status: ProfileStatus
          last_login_at: string | null
          login_attempts: number
          last_activity_at: string | null
          avatar_updated_at: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          phone_code?: string | null
          country?: string
          role?: Role
          avatar_url?: string | null
          bio?: string | null
          status?: ProfileStatus
          last_login_at?: string | null
          login_attempts?: number
          last_activity_at?: string | null
          avatar_updated_at?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          phone_code?: string | null
          country?: string
          role?: Role
          avatar_url?: string | null
          bio?: string | null
          status?: ProfileStatus
          last_login_at?: string | null
          login_attempts?: number
          last_activity_at?: string | null
          avatar_updated_at?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          name: string
          name_ne: string | null
          age: number
          grade: string
          class_section: string | null
          photo_url: string | null
          bio: string
          bio_ne: string | null
          family_background: string | null
          family_background_ne: string | null
          hobbies: string[] | null
          hobbies_ne: string[] | null
          dream_career: string | null
          dream_career_ne: string | null
          education_goals: string | null
          education_goals_ne: string | null
          achievements: string[] | null
          achievements_ne: string[] | null
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
          name_ne?: string | null
          age: number
          grade: string
          class_section?: string | null
          photo_url?: string | null
          bio: string
          bio_ne?: string | null
          family_background?: string | null
          family_background_ne?: string | null
          hobbies?: string[] | null
          hobbies_ne?: string[] | null
          dream_career?: string | null
          dream_career_ne?: string | null
          education_goals?: string | null
          education_goals_ne?: string | null
          achievements?: string[] | null
          achievements_ne?: string[] | null
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
          name_ne?: string | null
          age?: number
          grade?: string
          class_section?: string | null
          photo_url?: string | null
          bio?: string
          bio_ne?: string | null
          family_background?: string | null
          family_background_ne?: string | null
          hobbies?: string[] | null
          hobbies_ne?: string[] | null
          dream_career?: string | null
          dream_career_ne?: string | null
          education_goals?: string | null
          education_goals_ne?: string | null
          achievements?: string[] | null
          achievements_ne?: string[] | null
          gallery_urls?: string[] | null
          date_of_birth?: string | null
          enrolled_date?: string | null
          sponsorship_status?: 'available' | 'partially_sponsored' | 'fully_sponsored'
          sponsorship_amount?: number
          current_sponsorship?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          id: string
          donor_id: string
          student_id: string | null
          amount: number
          frequency: 'one-time' | 'monthly' | 'annual'
          status: DonationStatus
          verification_status: string | null
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
          verification_status?: string | null
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
          verification_status?: string | null
          message?: string | null
          transaction_id?: string | null
          payment_method?: string | null
          payment_session_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'donations_donor_id_fkey',
            columns: ['donor_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'donations_student_id_fkey',
            columns: ['student_id'],
            referencedRelation: 'students',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'donations_verified_by_fkey',
            columns: ['verified_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'sponsorships_donor_id_fkey',
            columns: ['donor_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'sponsorships_student_id_fkey',
            columns: ['student_id'],
            referencedRelation: 'students',
            referencedColumns: ['id'],
          },
        ]
      }
      news: {
        Row: {
          id: string
          title: string
          title_ne: string | null
          slug: string | null
          category: 'updates' | 'events' | 'impact'
          content: string
          content_ne: string | null
          excerpt: string
          excerpt_ne: string | null
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
          title_ne?: string | null
          slug?: string | null
          category?: 'updates' | 'events' | 'impact'
          content: string
          content_ne?: string | null
          excerpt: string
          excerpt_ne?: string | null
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
          title_ne?: string | null
          slug?: string | null
          category?: 'updates' | 'events' | 'impact'
          content?: string
          content_ne?: string | null
          excerpt?: string
          excerpt_ne?: string | null
          image_url?: string | null
          tags?: string[] | null
          published?: boolean
          published_at?: string
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'news_updated_by_fkey',
            columns: ['updated_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
      }
      gallery_items: {
        Row: {
          id: string
          type: 'photo' | 'video' | 'testimonial'
          title: string
          title_ne: string | null
          caption: string | null
          caption_ne: string | null
          url: string
          thumbnail_url: string | null
          author: string | null
          author_ne: string | null
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
          title_ne?: string | null
          caption?: string | null
          caption_ne?: string | null
          url: string
          thumbnail_url?: string | null
          author?: string | null
          author_ne?: string | null
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
          title_ne?: string | null
          caption?: string | null
          caption_ne?: string | null
          url?: string
          thumbnail_url?: string | null
          author?: string | null
          author_ne?: string | null
          category?: string
          is_featured?: boolean
          is_published?: boolean
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'gallery_items_uploaded_by_fkey',
            columns: ['uploaded_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: 'donation_allocations_donation_id_fkey',
            columns: ['donation_id'],
            referencedRelation: 'donations',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: 'sponsorship_timeline_sponsorship_id_fkey',
            columns: ['sponsorship_id'],
            referencedRelation: 'sponsorships',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'certificates_user_id_fkey',
            columns: ['user_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'certificates_donation_id_fkey',
            columns: ['donation_id'],
            referencedRelation: 'donations',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'certificates_sponsorship_id_fkey',
            columns: ['sponsorship_id'],
            referencedRelation: 'sponsorships',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'login_history_user_id_fkey',
            columns: ['user_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: 'teacher_assignments_teacher_id_fkey',
            columns: ['teacher_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'teacher_assignments_student_id_fkey',
            columns: ['student_id'],
            referencedRelation: 'students',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'student_progress_student_id_fkey',
            columns: ['student_id'],
            referencedRelation: 'students',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'student_progress_teacher_id_fkey',
            columns: ['teacher_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'attendance_records_student_id_fkey',
            columns: ['student_id'],
            referencedRelation: 'students',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'attendance_records_teacher_id_fkey',
            columns: ['teacher_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: []
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: 'role_permissions_role_id_fkey',
            columns: ['role_id'],
            referencedRelation: 'roles',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'role_permissions_permission_id_fkey',
            columns: ['permission_id'],
            referencedRelation: 'permissions',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey',
            columns: ['user_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'user_roles_role_id_fkey',
            columns: ['role_id'],
            referencedRelation: 'roles',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'user_roles_assigned_by_fkey',
            columns: ['assigned_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'user_sessions_user_id_fkey',
            columns: ['user_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey',
            columns: ['user_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey',
            columns: ['user_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'volunteer_assignments_volunteer_id_fkey',
            columns: ['volunteer_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'volunteer_assignments_assigned_by_fkey',
            columns: ['assigned_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
          is_automated: boolean
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
          is_automated?: boolean
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
          is_automated?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
          idempotency_key: string | null
          status: string
          verification_status: string | null
          verified_by: string | null
          verified_at: string | null
          verification_notes: string | null
          approved_by: string | null
          approved_at: string | null
          approval_notes: string | null
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
          idempotency_key?: string | null
          status?: string
          verification_status?: string | null
          verified_by?: string | null
          verified_at?: string | null
          verification_notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          approval_notes?: string | null
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
          status?: string
          verification_status?: string | null
          verified_by?: string | null
          verified_at?: string | null
          verification_notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          approval_notes?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payment_sessions_donation_id_fkey',
            columns: ['donation_id'],
            referencedRelation: 'donations',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'payment_sessions_donor_id_fkey',
            columns: ['donor_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'payment_sessions_student_id_fkey',
            columns: ['student_id'],
            referencedRelation: 'students',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'payment_sessions_verified_by_fkey',
            columns: ['verified_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'payment_verifications_payment_session_id_fkey',
            columns: ['payment_session_id'],
            referencedRelation: 'payment_sessions',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'payment_verifications_verified_by_fkey',
            columns: ['verified_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'payment_receipts_payment_session_id_fkey',
            columns: ['payment_session_id'],
            referencedRelation: 'payment_sessions',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'payment_receipts_donation_id_fkey',
            columns: ['donation_id'],
            referencedRelation: 'donations',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'payment_audit_logs_payment_session_id_fkey',
            columns: ['payment_session_id'],
            referencedRelation: 'payment_sessions',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'payment_audit_logs_actor_id_fkey',
            columns: ['actor_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'teacher_reports_student_id_fkey',
            columns: ['student_id'],
            referencedRelation: 'students',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'teacher_reports_teacher_id_fkey',
            columns: ['teacher_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'activities_user_id_fkey',
            columns: ['user_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
      }
      pages: {
        Row: {
          id: string
          slug: string
          title: string
          title_ne: string | null
          content: Json
          content_ne: Json | null
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
          title_ne?: string | null
          content?: Json
          content_ne?: Json | null
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
          title_ne?: string | null
          content?: Json
          content_ne?: Json | null
          blocks?: Json | null
          seo?: Json | null
          published?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pages_updated_by_fkey',
            columns: ['updated_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
      }
      page_blocks: {
        Row: {
          id: string
          page_id: string
          block_type: string
          title: string
          content: Json
          settings: Json
          sort_order: number
          is_visible: boolean
          is_draft: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page_id: string
          block_type: string
          title: string
          content?: Json
          settings?: Json
          sort_order?: number
          is_visible?: boolean
          is_draft?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          block_type?: string
          title?: string
          content?: Json
          settings?: Json
          sort_order?: number
          is_visible?: boolean
          is_draft?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'page_blocks_page_id_fkey',
            columns: ['page_id'],
            referencedRelation: 'pages',
            referencedColumns: ['id'],
          },
        ]
      }
      homepage_sections: {
        Row: {
          id: string
          section_key: string
          title: string
          title_ne: string | null
          subtitle: string | null
          subtitle_ne: string | null
          content: Json
          content_ne: Json | null
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
          title_ne?: string | null
          subtitle?: string | null
          subtitle_ne?: string | null
          content?: Json
          content_ne?: Json | null
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
          title_ne?: string | null
          subtitle?: string | null
          subtitle_ne?: string | null
          content?: Json
          content_ne?: Json | null
          is_active?: boolean
          sort_order?: number
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'homepage_sections_updated_by_fkey',
            columns: ['updated_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
      }
      videos: {
        Row: {
          id: string
          title: string
          title_ne: string | null
          url: string
          video_type: 'youtube' | 'upload' | 'vimeo'
          thumbnail_url: string | null
          description: string | null
          description_ne: string | null
          category: string
          is_featured: boolean
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          title_ne?: string | null
          url: string
          video_type?: 'youtube' | 'upload' | 'vimeo'
          thumbnail_url?: string | null
          description?: string | null
          description_ne?: string | null
          category?: string
          is_featured?: boolean
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          title_ne?: string | null
          url?: string
          video_type?: 'youtube' | 'upload' | 'vimeo'
          thumbnail_url?: string | null
          description?: string | null
          description_ne?: string | null
          category?: string
          is_featured?: boolean
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'videos_uploaded_by_fkey',
            columns: ['uploaded_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
      }
      faqs: {
        Row: {
          id: string
          question: string
          question_ne: string | null
          answer: string
          answer_ne: string | null
          category: string
          sort_order: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          question_ne?: string | null
          answer: string
          answer_ne?: string | null
          category?: string
          sort_order?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          question_ne?: string | null
          answer?: string
          answer_ne?: string | null
          category?: string
          sort_order?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_stories: {
        Row: {
          id: string
          title: string
          title_ne: string | null
          student_name: string
          student_name_ne: string | null
          content: string
          content_ne: string | null
          image_url: string | null
          quote: string | null
          quote_ne: string | null
          achievements: string[] | null
          achievements_ne: string[] | null
          is_published: boolean
          featured: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          title_ne?: string | null
          student_name: string
          student_name_ne?: string | null
          content: string
          content_ne?: string | null
          image_url?: string | null
          quote?: string | null
          quote_ne?: string | null
          achievements?: string[] | null
          achievements_ne?: string[] | null
          is_published?: boolean
          featured?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          title_ne?: string | null
          student_name?: string
          student_name_ne?: string | null
          content?: string
          content_ne?: string | null
          image_url?: string | null
          quote?: string | null
          quote_ne?: string | null
          achievements?: string[] | null
          achievements_ne?: string[] | null
          is_published?: boolean
          featured?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_library: {
        Row: {
          id: string
          url: string
          file_name: string
          file_size: number | null
          mime_type: string | null
          alt_text: string | null
          alt_text_ne: string | null
          folder: string | null
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
          alt_text_ne?: string | null
          folder?: string | null
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
          alt_text_ne?: string | null
          folder?: string | null
          is_published?: boolean
          uploaded_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'media_library_uploaded_by_fkey',
            columns: ['uploaded_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'security_events_user_id_fkey',
            columns: ['user_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'email_logs_user_id_fkey',
            columns: ['user_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'volunteer_events_created_by_fkey',
            columns: ['created_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'volunteer_event_signups_event_id_fkey',
            columns: ['event_id'],
            referencedRelation: 'volunteer_events',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'volunteer_event_signups_volunteer_id_fkey',
            columns: ['volunteer_id'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'content_versions_created_by_fkey',
            columns: ['created_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          type: string
          link_url: string | null
          link_text: string | null
          is_active: boolean
          is_dismissible: boolean
          starts_at: string | null
          ends_at: string | null
          sort_order: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          type?: string
          link_url?: string | null
          link_text?: string | null
          is_active?: boolean
          is_dismissible?: boolean
          starts_at?: string | null
          ends_at?: string | null
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: string
          link_url?: string | null
          link_text?: string | null
          is_active?: boolean
          is_dismissible?: boolean
          starts_at?: string | null
          ends_at?: string | null
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'announcements_created_by_fkey',
            columns: ['created_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
      }
      design_settings: {
        Row: {
          id: string
          branding: Json
          colors: Json
          typography: Json
          layout: Json
          component_styles: Json
          tokens: Json
          config: Json
          draft: Json | null
          is_published: boolean
          published_at: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branding: Json
          colors: Json
          typography: Json
          layout: Json
          component_styles: Json
          tokens: Json
          config: Json
          draft?: Json | null
          is_published?: boolean
          published_at?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branding?: Json
          colors?: Json
          typography?: Json
          layout?: Json
          component_styles?: Json
          tokens?: Json
          config?: Json
          draft?: Json | null
          is_published?: boolean
          published_at?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'design_settings_updated_by_fkey',
            columns: ['updated_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
      }
      section_visibility: {
        Row: {
          id: string
          section_key: string
          section_name: string
          is_visible: boolean
          description: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_key: string
          section_name: string
          is_visible?: boolean
          description?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_key?: string
          section_name?: string
          is_visible?: boolean
          description?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'section_visibility_updated_by_fkey',
            columns: ['updated_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
      }
      theme_presets: {
        Row: {
          id: string
          name: string
          description: string | null
          preview_url: string | null
          branding: Json
          colors: Json
          typography: Json
          layout: Json
          component_styles: Json
          tokens: Json
          config: Json
          is_default: boolean
          sort_order: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          preview_url?: string | null
          branding: Json
          colors: Json
          typography: Json
          layout: Json
          component_styles: Json
          tokens: Json
          config: Json
          is_default?: boolean
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          preview_url?: string | null
          branding?: Json
          colors?: Json
          typography?: Json
          layout?: Json
          component_styles?: Json
          tokens?: Json
          config?: Json
          is_default?: boolean
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'theme_presets_created_by_fkey',
            columns: ['created_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
      }
      website_config: {
        Row: {
          id: string
          key: string
          label: string
          value: Json
          is_active: boolean
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          label: string
          value: Json
          is_active?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          label?: string
          value?: Json
          is_active?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'website_config_updated_by_fkey',
            columns: ['updated_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
      }
      navigation_items: {
        Row: {
          id: string
          parent_id: string | null
          location: string
          label: string
          label_ne: string | null
          description_ne: string | null
          url: string | null
          route: string | null
          icon: string | null
          target: string
          sort_order: number
          is_visible: boolean
          is_cta: boolean
          cta_style: string | null
          requires_auth: boolean
          roles: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id?: string | null
          location: string
          label: string
          label_ne?: string | null
          description_ne?: string | null
          url?: string | null
          route?: string | null
          icon?: string | null
          target?: string
          sort_order?: number
          is_visible?: boolean
          is_cta?: boolean
          cta_style?: string | null
          requires_auth?: boolean
          roles?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string | null
          location?: string
          label?: string
          label_ne?: string | null
          description_ne?: string | null
          url?: string | null
          route?: string | null
          icon?: string | null
          target?: string
          sort_order?: number
          is_visible?: boolean
          is_cta?: boolean
          cta_style?: string | null
          requires_auth?: boolean
          roles?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'navigation_items_parent_id_fkey',
            columns: ['parent_id'],
            referencedRelation: 'navigation_items',
            referencedColumns: ['id'],
          },
        ]
      }
      partners: {
        Row: {
          id: string
          name: string
          logo_url: string
          website_url: string | null
          partner_type: string
          description: string | null
          sort_order: number
          is_visible: boolean
          is_featured: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url: string
          website_url?: string | null
          partner_type?: string
          description?: string | null
          sort_order?: number
          is_visible?: boolean
          is_featured?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string
          website_url?: string | null
          partner_type?: string
          description?: string | null
          sort_order?: number
          is_visible?: boolean
          is_featured?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'partners_created_by_fkey',
            columns: ['created_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          site_name: string
          tagline: string
          logo_url: string | null
          favicon_url: string | null
          theme_primary_color: string
          theme_secondary_color: string
          contact_email: string
          contact_phone: string
          contact_address: string
          social_facebook: string | null
          social_instagram: string | null
          social_twitter: string | null
          social_youtube: string | null
          social_linkedin: string | null
          seo_default_title: string
          seo_default_description: string
          seo_default_image: string | null
          announcement_enabled: boolean
          announcement_text: string | null
          announcement_type: string
          maintenance_mode: boolean
          maintenance_message: string | null
          donation_default_currency: string
          donation_min_amount: number
          donation_max_amount: number
          footer_description: string
          footer_copyright: string
          footer_nonprofit_text: string
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_name: string
          tagline: string
          logo_url?: string | null
          favicon_url?: string | null
          theme_primary_color?: string
          theme_secondary_color?: string
          contact_email: string
          contact_phone: string
          contact_address: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          social_linkedin?: string | null
          seo_default_title?: string
          seo_default_description?: string
          seo_default_image?: string | null
          announcement_enabled?: boolean
          announcement_text?: string | null
          announcement_type?: string
          maintenance_mode?: boolean
          maintenance_message?: string | null
          donation_default_currency?: string
          donation_min_amount?: number
          donation_max_amount?: number
          footer_description?: string
          footer_copyright?: string
          footer_nonprofit_text?: string
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_name?: string
          tagline?: string
          logo_url?: string | null
          favicon_url?: string | null
          theme_primary_color?: string
          theme_secondary_color?: string
          contact_email?: string
          contact_phone?: string
          contact_address?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          social_linkedin?: string | null
          seo_default_title?: string
          seo_default_description?: string
          seo_default_image?: string | null
          announcement_enabled?: boolean
          announcement_text?: string | null
          announcement_type?: string
          maintenance_mode?: boolean
          maintenance_message?: string | null
          donation_default_currency?: string
          donation_min_amount?: number
          donation_max_amount?: number
          footer_description?: string
          footer_copyright?: string
          footer_nonprofit_text?: string
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'site_settings_updated_by_fkey',
            columns: ['updated_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
      }
      legal_pages: {
        Row: {
          id: string
          type: 'privacy_policy' | 'terms_conditions' | 'cookie_policy' | 'donation_policy'
          title: string
          title_ne: string | null
          slug: string
          content_ne: string | null
          meta_title: string
          meta_title_ne: string | null
          meta_description: string
          meta_description_ne: string | null
          status: 'draft' | 'published' | 'hidden'
          effective_date: string | null
          last_reviewed_at: string | null
          published_at: string | null
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'privacy_policy' | 'terms_conditions' | 'cookie_policy' | 'donation_policy'
          title: string
          title_ne?: string | null
          slug: string
          content_ne?: string | null
          meta_title?: string
          meta_title_ne?: string | null
          meta_description?: string
          meta_description_ne?: string | null
          status?: 'draft' | 'published' | 'hidden'
          effective_date?: string | null
          last_reviewed_at?: string | null
          published_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'privacy_policy' | 'terms_conditions' | 'cookie_policy' | 'donation_policy'
          title?: string
          title_ne?: string | null
          slug?: string
          content_ne?: string | null
          meta_title?: string
          meta_title_ne?: string | null
          meta_description?: string
          meta_description_ne?: string | null
          status?: 'draft' | 'published' | 'hidden'
          effective_date?: string | null
          last_reviewed_at?: string | null
          published_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'legal_pages_created_by_fkey',
            columns: ['created_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'legal_pages_updated_by_fkey',
            columns: ['updated_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
      }
      legal_page_sections: {
        Row: {
          id: string
          legal_page_id: string
          heading: string
          heading_ne: string | null
          content: string
          content_ne: string | null
          sort_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          legal_page_id: string
          heading: string
          heading_ne?: string | null
          content?: string
          content_ne?: string | null
          sort_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          legal_page_id?: string
          heading?: string
          heading_ne?: string | null
          content?: string
          content_ne?: string | null
          sort_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'legal_page_sections_legal_page_id_fkey',
            columns: ['legal_page_id'],
            referencedRelation: 'legal_pages',
            referencedColumns: ['id'],
          },
        ]
      }
      legal_page_versions: {
        Row: {
          id: string
          legal_page_id: string
          version_number: number
          snapshot: Json
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          legal_page_id: string
          version_number: number
          snapshot: Json
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          legal_page_id?: string
          version_number?: number
          snapshot?: Json
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'legal_page_versions_legal_page_id_fkey',
            columns: ['legal_page_id'],
            referencedRelation: 'legal_pages',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'legal_page_versions_created_by_fkey',
            columns: ['created_by'],
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      get_donor_dashboard_stats: {
        Args: { p_donor_id: string }
        Returns: {
          totalDonated: number
          totalDonations: number
          activeSponsorships: number
          totalSponsorships: number
          monthlyRecurring: number
          firstDonationDate: string | null
          lastDonationDate: string | null
        }
      }
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
        Relationships: []
      }
      cancel_payment_session: {
        Args: { p_session_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_user_id: string
          p_action: string
          p_entity_type: string
          p_entity_id?: string | null
          p_changes?: Record<string, unknown> | null
          p_metadata?: Record<string, unknown> | null
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_event_type: string
          p_user_id?: string | null
          p_severity?: string
          p_metadata?: Record<string, unknown> | null
        }
        Returns: string
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_type: string
          p_title: string
          p_message?: string | null
          p_data?: Record<string, unknown> | null
        }
        Returns: string
      }
      get_donor_allocations: {
        Args: { p_donor_id: string }
        Returns: {
          student_id: string
          student_name: string
          allocated_amount: number
          percentage: number
        }[]
      }
      reset_design_settings: {
        Args: Record<string, never>
        Returns: {
          id: string
          branding: Json
          colors: Json
          typography: Json
          layout: Json
          component_styles: Json
          tokens: Json
          config: Json
          draft: Json | null
          is_published: boolean
          published_at: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
      }
      admin_update_user_status: {
        Args: { target_user_id: string; new_status: string }
        Returns: void
      }
      increment_event_volunteers: {
        Args: { p_event_id: string }
        Returns: void
      }
      decrement_event_volunteers: {
        Args: { p_event_id: string }
        Returns: void
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
export type LegalPage = Database['public']['Tables']['legal_pages']['Row']
export type LegalPageSection = Database['public']['Tables']['legal_page_sections']['Row']
export type LegalPageVersion = Database['public']['Tables']['legal_page_versions']['Row']

