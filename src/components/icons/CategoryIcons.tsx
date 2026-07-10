import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  BookOpen,
  Box,
  Brush,
  Car,
  ClipboardList,
  HardHat,
  Headphones,
  LayoutGrid,
  Monitor,
  Package,
  PartyPopper,
  Shirt,
  Smartphone,
  Sprout,
  UserRound,
  Wrench,
  MapPin,
  CircleDot,
} from "lucide-react";

export type CategoryIconKey =
  | "grid"
  | "clipboard"
  | "user"
  | "headset"
  | "hardhat"
  | "brush"
  | "wrench"
  | "monitor"
  | "book"
  | "party"
  | "phone"
  | "sofa"
  | "car"
  | "shirt"
  | "ball"
  | "plant"
  | "box"
  | "pin"
  /** @deprecated aliases mantidos para metas antigas */
  | "sparkles"
  | "briefcase"
  | "bag"
  | "crane"
  | "broom";

const CATEGORY_ICON_MAP: Record<CategoryIconKey, LucideIcon> = {
  grid: LayoutGrid,
  sparkles: LayoutGrid,
  clipboard: ClipboardList,
  user: UserRound,
  briefcase: UserRound,
  headset: Headphones,
  hardhat: HardHat,
  crane: HardHat,
  brush: Brush,
  broom: Brush,
  wrench: Wrench,
  monitor: Monitor,
  book: BookOpen,
  party: PartyPopper,
  phone: Smartphone,
  sofa: Armchair,
  car: Car,
  shirt: Shirt,
  ball: CircleDot,
  plant: Sprout,
  box: Box,
  bag: Package,
  pin: MapPin,
};

export function CategoryIcon({
  name,
  className = "h-6 w-6",
}: {
  name: CategoryIconKey;
  className?: string;
}) {
  const Icon = CATEGORY_ICON_MAP[name] ?? MapPin;
  return (
    <Icon
      className={className}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}
