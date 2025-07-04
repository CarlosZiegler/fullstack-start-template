import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Eye,
  Languages,
  Monitor,
  Moon,
  Palette,
  Smartphone,
  Sun,
  Type,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    language: "en",
    fontSize: "medium",
    reducedMotion: false,
    highContrast: false,
    compactMode: false,
  });

  const handlePreferenceChange = (key: string, value: string | boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    // Here you would implement the actual API call to save preferences
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme
          </CardTitle>
          <CardDescription>
            Choose how the interface looks and feels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-3 gap-4"
          >
            <div className="flex flex-col space-y-2">
              <Label htmlFor="light" className="cursor-pointer">
                <div className="border-2 border-muted rounded-lg p-4 hover:border-border transition-colors">
                  <div className="space-y-2">
                    <div className="bg-background border rounded p-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        <div className="h-2 bg-foreground/20 rounded flex-1"></div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="h-2 bg-foreground/20 rounded w-3/4"></div>
                        <div className="h-2 bg-foreground/20 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <RadioGroupItem value="light" id="light" />
                  <span className="text-sm font-medium">Light</span>
                </div>
              </Label>
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="dark" className="cursor-pointer">
                <div className="border-2 border-muted rounded-lg p-4 hover:border-border transition-colors">
                  <div className="space-y-2">
                    <div className="bg-gray-950 border border-gray-800 rounded p-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-white" />
                        <div className="h-2 bg-white/20 rounded flex-1"></div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="h-2 bg-white/20 rounded w-3/4"></div>
                        <div className="h-2 bg-white/20 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <span className="text-sm font-medium">Dark</span>
                </div>
              </Label>
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="system" className="cursor-pointer">
                <div className="border-2 border-muted rounded-lg p-4 hover:border-border transition-colors">
                  <div className="space-y-2">
                    <div className="bg-gradient-to-r from-background to-gray-950 border rounded p-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <div className="h-2 bg-foreground/20 rounded flex-1"></div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="h-2 bg-foreground/20 rounded w-3/4"></div>
                        <div className="h-2 bg-foreground/20 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <RadioGroupItem value="system" id="system" />
                  <span className="text-sm font-medium">System</span>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Display Preferences
          </CardTitle>
          <CardDescription>
            Customize the display to your preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="font-size">Font Size</Label>
                <p className="text-sm text-muted-foreground">
                  Choose a comfortable reading size
                </p>
              </div>
              <Select
                value={preferences.fontSize}
                onValueChange={(value) =>
                  handlePreferenceChange("fontSize", value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use smaller spacing and condensed layout
                </p>
              </div>
              <Switch
                id="compact-mode"
                checked={preferences.compactMode}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("compactMode", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="reduced-motion">Reduced Motion</Label>
                <p className="text-sm text-muted-foreground">
                  Minimize animations and transitions
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={preferences.reducedMotion}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("reducedMotion", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="high-contrast">High Contrast</Label>
                <p className="text-sm text-muted-foreground">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={preferences.highContrast}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("highContrast", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Language & Region
          </CardTitle>
          <CardDescription>
            Set your language and regional preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="language">Language</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred language
              </p>
            </div>
            <Select
              value={preferences.language}
              onValueChange={(value) =>
                handlePreferenceChange("language", value)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
