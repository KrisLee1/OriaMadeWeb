import {createContext, useContext, type RefObject} from "react";

export type WalkthroughBindings = {
  clipboard: RefObject<string>;
  copyScene: boolean;
  surface: RefObject<HTMLDivElement | null>;
  automatic: RefObject<boolean>;
  draft: RefObject<((value: string, cursor: number) => void) | null>;
  tag: RefObject<((value: string) => void) | null>;
};

export const WalkthroughContext = createContext<WalkthroughBindings | null>(null);
export const useWalkthrough = () => useContext(WalkthroughContext);
