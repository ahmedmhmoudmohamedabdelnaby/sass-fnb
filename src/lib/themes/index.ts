import React from "react";

// Fallback/Default Themes. These could be lazily loaded but per requirements, explicit mapped static files are preferred.
import DefaultTheme from "./default";
import ModernTheme from "./modern";

export const themes: Record<string, React.FC<any>> = {
  default: DefaultTheme,
  modern: ModernTheme,
};

export type ThemePreset = keyof typeof themes;
