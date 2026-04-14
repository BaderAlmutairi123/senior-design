export interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "user";
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
