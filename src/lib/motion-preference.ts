export type MotionPreference = "device" | "light" | "off";
export type MotionMode = "full" | "light" | "off";

export function resolveMotionMode(preference: MotionPreference, deviceReduced: boolean): MotionMode {
  if (preference === "off") return "off";
  if (deviceReduced || preference === "light") return "light";
  return "full";
}