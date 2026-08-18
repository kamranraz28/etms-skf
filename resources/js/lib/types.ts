export type AppRole = "admin" | "procurement" | "approver" | "department_head" | "executive_director" | "counter_ed" | "scm_head" | "finance_head" | "line_manager" | "vendor";
export type VendorStatus = "pending" | "active" | "inactive" | "blacklisted";
export type TenderStatus = "open" | "closed" | "awarded";
export type PRStatus = "new" | "tendered";

export interface PRItem { name: string; qty: number; unit: string; }
export interface BidItemPrice { name: string; qty: number; unit: string; unit_price: number; }

export interface AuthUser {
  id: string; email: string; full_name: string;
  roles: AppRole[]; primary_role: AppRole | null;
}
export interface AppNotification {
  id: string;
  read_at: string | null;
  created_at: string;
  data: {
    type?: string;
    title?: string;
    message?: string;
    url?: string;
    [key: string]: any;
  };
}

export interface PageSharedProps {
  auth: { user: AuthUser | null };
  flash: { success?: string; error?: string };
  notifications?: AppNotification[] | null;
  unread_notifications?: number;
  [key: string]: any;
}
