import {
  Cookie,
  Database,
  FileText,
  HardDrive,
  Mail,
  RefreshCw,
  Server,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const icons = {
  document: FileText,
  database: Database,
  settings: Settings,
  mail: Mail,
  server: Server,
  cookies: Cookie,
  storage: HardDrive,
  person: UserRound,
  updates: RefreshCw,
  shield: ShieldCheck,
};
export type PolicyIconName = keyof typeof icons;

export function PolicyIcon({
  name,
  size = 24,
}: {
  name: PolicyIconName;
  size?: number;
}) {
  const Icon = icons[name];
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}
