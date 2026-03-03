"use client";
import { useCallback } from "react";
import { useWebHaptics } from "web-haptics/react";
import type { HapticInput, TriggerOptions } from "web-haptics";

export function useHapticFeedback() {
  const { trigger, cancel, isSupported } = useWebHaptics();
  const haptic = useCallback(
    (input?: HapticInput, options?: TriggerOptions) => {
      trigger(input, options);
    },
    [trigger]
  );
  return { haptic, cancel, isSupported };
}
