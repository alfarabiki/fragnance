import { signOut } from "@/lib/actions";
import { getUser } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

export default async function UserMenu() {
  const user = await getUser();

  if (!user) {
    return (
      <a
        href="/login"
        className="inline-flex h-8 items-center rounded-md border border-input px-3 text-sm hover:bg-muted"
      >
        Masuk
      </a>
    );
  }

  const email = user.email ?? "admin@atlase.id";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-sm">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {(email[0]?.toUpperCase() ?? "A")}
        </span>
        <span className="hidden text-sm sm:inline">{email}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Akun Admin</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="size-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}