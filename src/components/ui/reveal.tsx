"use client";


import { motion, useReducedMotion } from "motion/react";
import type { HTMLAttributes, ReactNode } from "react";

type RevealProps = Pick<HTMLAttributes<HTMLElement>, "id" | "className" | "tabIndex" | "aria-labelledby"> & {
  children: ReactNode;
  as?: "div" | "header" | "section" | "footer";
  delay?: number;
  immediate?: boolean;
};

export function Reveal({ children, as = "div", delay = 0, immediate = false, ...props }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const Element = motion[as];
  const initial = reduceMotion ? false : { opacity: 0, y: 20 };
  const settle = { opacity: 1, y: 0 };
  const transition = { type: "spring" as const, bounce: 0, duration: 0.6, delay };
  return <Element {...props} data-site-reveal="" initial={initial} transition={transition}
    animate={immediate || reduceMotion ? settle : undefined}
    whileInView={immediate || reduceMotion ? undefined : settle}
    viewport={{ once: true, amount: 0.12, margin: "0px 0px -36px" }}>
    {children}
  </Element>;
}
