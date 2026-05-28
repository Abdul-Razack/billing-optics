import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/user";
import { ShieldCheck, User as UserIcon, Activity } from "lucide-react";

export function RoleBadge({ role }: { role: UserRole }) {
  switch (role) {
    case "ADMIN":
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100"><ShieldCheck className="mr-1 h-3 w-3" /> Admin</Badge>;
    case "OPTOMETRIST":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Activity className="mr-1 h-3 w-3" /> Optometrist</Badge>;
    case "CASHIER":
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><UserIcon className="mr-1 h-3 w-3" /> Cashier</Badge>;
    default:
      return null;
  }
}
