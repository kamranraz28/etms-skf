export type AppRole = "admin" | "procurement" | "approver" | "vendor";
export type VendorStatus = "pending" | "active" | "inactive" | "blacklisted";
export type TenderStatus = "open" | "closed" | "awarded";
export type PRStatus = "new" | "tendered";

export interface PRItem { name: string; qty: number; unit: string; }
export interface BidItemPrice { name: string; qty: number; unit: string; unit_price: number; }

export interface AuthUser {
  id: string; email: string; full_name: string;
  roles: AppRole[]; primary_role: AppRole | null;
}
export interface PageSharedProps {
  auth: { user: AuthUser | null };
  flash: { success?: string; error?: string };
  [key: string]: any;
}
