import { Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMotion } from "./MotionProvider";

export function MotionSettings() {
  const { preference, setPreference } = useMotion();
  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" aria-label="Cài đặt chuyển động" title="Cài đặt chuyển động" className="h-11 w-9 rounded-none sm:w-11">
        <Accessibility className="h-5 w-5" strokeWidth={1.25} />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Chuyển động</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup value={preference} onValueChange={(value) => {
        if (value === "device" || value === "light" || value === "off") setPreference(value);
      }}>
        <DropdownMenuRadioItem value="device">Theo cài đặt thiết bị</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="light">Giảm hiệu ứng</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="off">Tắt hiệu ứng</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>;
}
