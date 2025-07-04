import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth/auth-client";
import type { AuthClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { Calendar, Camera, Check, Globe, Mail, User } from "lucide-react";
import { useState } from "react";

interface EnhancedUserProfileProps {
  session: AuthClient["$Infer"]["Session"]["session"] | null | undefined;
}

export function EnhancedUserProfile({ session }: EnhancedUserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    bio: "I own a computer.",
    location: "",
    website: "https://shadcn.com",
  });

  const handleSave = () => {
    // Here you would implement the actual save logic
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      bio: "I own a computer.",
      location: "",
      website: "https://shadcn.com",
    });
    setIsEditing(false);
  };

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            Please sign in to view your profile
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Profile Information</span>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          Update your profile information and public display preferences.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={session.user.image || "#"}
                alt={session.user.name || "User"}
                className="object-cover"
              />
              <AvatarFallback className="text-lg">
                {session.user.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button
                variant="outline"
                size="icon"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{session.user.name}</h3>
              <Badge
                variant={session.user.emailVerified ? "default" : "secondary"}
              >
                {session.user.emailVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {session.user.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Member since {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={isEditing ? formData.name : session.user.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Your display name"
            />
            <p className="text-sm text-muted-foreground">
              This is your public display name. It can be your real name or a
              pseudonym. You can only change this once every 30 days.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Your email address"
            />
            <p className="text-sm text-muted-foreground">
              You can manage verified email addresses in your email settings.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Tell us a little bit about yourself"
              className="min-h-[80px]"
            />
            <p className="text-sm text-muted-foreground">
              You can @mention other users and organizations to link to them.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                disabled={!isEditing}
                placeholder="City, Country"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="https://yourwebsite.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        {!isEditing && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Profile Statistics</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold">4</div>
                <div className="text-sm text-muted-foreground">
                  Organizations
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">42</div>
                <div className="text-sm text-muted-foreground">
                  Contributions
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
