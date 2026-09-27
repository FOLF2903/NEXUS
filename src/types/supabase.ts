import { Campana } from '../types';

export type SupabaseRole = 'host' | 'dm' | 'player';

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  created_at?: string;
}

export interface CloudCampaignWithRole {
  campana: Campana;
  role: SupabaseRole;
  isHost: boolean;
  memberCount?: number;
}

export interface CampaignMember {
  id: string;
  campaign_id: string;
  user_id: string;
  role: SupabaseRole;
  joined_at: string;
  profile?: UserProfile | null;
}

export interface CampaignInvite {
  id: string;
  campaign_id: string;
  created_by?: string;
  token: string;
  role: 'dm' | 'player';
  expires_at: string;
  used_at?: string | null;
  used_by?: string | null;
  created_at: string;
}

export interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

export type StorageDataSource = 'local' | 'cloud';
