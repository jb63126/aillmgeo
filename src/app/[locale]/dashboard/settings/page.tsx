"use client";

import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Download,
} from "lucide-react";

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [analysisCompleteNotifications, setAnalysisCompleteNotifications] =
    useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  // Privacy settings
  const [dataRetention, setDataRetention] = useState("30");
  const [shareUsageData, setShareUsageData] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
        setEmail(session.user.email || "");
        setFullName(session.user.user_metadata?.full_name || "");
      }
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        setEmail(session.user.email || "");
        setFullName(session.user.user_metadata?.full_name || "");
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        },
      });

      if (error) {
        console.error("Error updating profile:", error);
        alert("Error updating profile");
      } else {
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      // In a real app, this would call an API to delete the account
      alert(
        "Account deletion functionality coming soon. Please contact support to delete your account."
      );
    }
  };

  const handleExportData = () => {
    // Get all FlowQL data from localStorage
    const keys = Object.keys(localStorage);
    const flowqlKeys = keys.filter((key) => key.startsWith("flowql_"));

    const exportData = {
      user: {
        email: user?.email,
        full_name: user?.user_metadata?.full_name,
      },
      analyses: flowqlKeys.map((key) => ({
        key,
        data: JSON.parse(localStorage.getItem(key) || "{}"),
      })),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flowql-data-export.json";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your account preferences and application settings
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important updates
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Analysis Complete</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your analysis is finished
              </p>
            </div>
            <input
              type="checkbox"
              checked={analysisCompleteNotifications}
              onChange={(e) =>
                setAnalysisCompleteNotifications(e.target.checked)
              }
              className="h-4 w-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly performance summaries
              </p>
            </div>
            <input
              type="checkbox"
              checked={weeklyReports}
              onChange={(e) => setWeeklyReports(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Privacy & Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dataRetention">Data Retention Period</Label>
            <select
              id="dataRetention"
              value={dataRetention}
              onChange={(e) => setDataRetention(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
              <option value="forever">Forever</option>
            </select>
            <p className="text-xs text-muted-foreground">
              How long to keep your analysis data stored locally
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Share Usage Data</Label>
              <p className="text-sm text-muted-foreground">
                Help improve FlowQL by sharing anonymous usage statistics
              </p>
            </div>
            <input
              type="checkbox"
              checked={shareUsageData}
              onChange={(e) => setShareUsageData(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Subscription & Billing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Subscription & Billing</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Current Plan</h4>
              <p className="text-sm text-muted-foreground">Free Plan</p>
            </div>
            <Badge variant="secondary">Free</Badge>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <Button variant="outline" disabled>
              Upgrade to Pro
            </Button>
            <Button variant="outline" disabled>
              View Billing History
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Billing and subscription management coming soon
          </p>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            <CardTitle>Data Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Export Your Data</h4>
            <p className="text-sm text-muted-foreground">
              Download all your analysis data and account information
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={handleExportData}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
          <div>
            <h4 className="font-medium">Clear Local Data</h4>
            <p className="text-sm text-muted-foreground">
              Remove all stored analysis data from your browser
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to clear all local data? This cannot be undone."
                  )
                ) {
                  const keys = Object.keys(localStorage);
                  const flowqlKeys = keys.filter((key) =>
                    key.startsWith("flowql_")
                  );
                  flowqlKeys.forEach((key) => localStorage.removeItem(key));
                  alert("Local data cleared successfully!");
                }
              }}
            >
              Clear Local Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-2">
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Deleting your account will permanently remove all your data and
            cannot be undone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
