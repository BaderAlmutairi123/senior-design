export interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "user";
  onboarded: boolean;
  created_at: string;
}

export interface OrganizationInvite {
  id: string;
  organization_id: string;
  code: string;
  created_by: string | null;
  expires_at: string | null;
  max_uses: number;
  uses: number;
  is_active: boolean;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserOrganization {
  id: string;
  user_id: string;
  organization_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
}

export interface OrganizationScenario {
  id: string;
  organization_id: string;
  scenario_id: string;
  assigned_by: string | null;
  assigned_at: string;
}

export interface OrganizationMember {
  user_id: string;
  email: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
}
