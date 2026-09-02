"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Droplets,
  FlaskConical,
  ScrollText,
  Wallet,
  Warehouse,
  Users,
  CreditCard,
  MessageSquareText,
  Percent,
  BarChart3,
  ShieldAlert,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";

export const ADMIN_MODULES = [
  { key: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
  { key: "orders", label: "Orders", href: "/orders", icon: Package },
  { key: "fragrances", label: "Fragrances", href: "/fragrances", icon: Droplets },
  { key: "bottles", label: "Bottles", href: "/bottles", icon: FlaskConical },
  { key: "packaging", label: "Packaging", href: "/packaging", icon: ScrollText },
  { key: "pricing", label: "Pricing", href: "/pricing", icon: Wallet },
  { key: "inventory", label: "Inventory", href: "/inventory", icon: Warehouse },
  { key: "customers", label: "Customers", href: "/customers", icon: Users },
  { key: "payments", label: "Payments", href: "/payments", icon: CreditCard },
  { key: "whatsapp", label: "WhatsApp", href: "/whatsapp", icon: MessageSquareText },
  { key: "promotions", label: "Promotions", href: "/promotions", icon: Percent },
  { key: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
  { key: "audit", label: "Audit Logs", href: "/audit", icon: ShieldAlert },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings },
] as const;

export function AdminSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="text-lg font-semibold tracking-tight">ATLASE</span>
          <span className="text-xs text-muted-foreground">Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {ADMIN_MODULES.map((m) => (
                <SidebarMenuItem key={m.key}>
                  <SidebarMenuButton
                    render={
                      <Link href={m.href} />
                    }
                    tooltip={m.label}
                  >
                    <m.icon className="size-4" />
                    <span>{m.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* logout handled in shell */}
      </SidebarFooter>
    </Sidebar>
  );
}