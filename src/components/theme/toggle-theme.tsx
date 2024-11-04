"use client";

import * as React from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function ToggleTheme() {
  const { setTheme, theme: currentTheme } = useTheme();
  const [activeTheme, setActiveTheme] = React.useState(currentTheme);

  React.useEffect(() => {
    setActiveTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeChange = (newTheme: string) => {
    setActiveTheme(newTheme);
    setTheme(newTheme);
  };

  return (
    <div className="flex items-center justify-between w-full">
      <Label htmlFor="theme-toggle" className="text-sm font-medium">
        Theme
      </Label>
      <RadioGroup
        id="theme-toggle"
        value={activeTheme}
        onValueChange={handleThemeChange}
        className="flex items-center gap-2"
      >
        {[
          { value: "system", icon: Laptop },
          { value: "light", icon: Sun },
          { value: "dark", icon: Moon },
        ].map(({ value, icon: Icon }) => (
          <div key={value} className="flex items-center space-x-2">
            <RadioGroupItem value={value} id={value} className="sr-only" />
            <Label
              htmlFor={value}
              className={`flex items-center justify-center w-9 h-9 rounded-md cursor-pointer transition-colors ${
                activeTheme === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <Icon className="h-4 w-4" />
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
