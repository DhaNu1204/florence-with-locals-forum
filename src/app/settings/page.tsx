"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  updateProfile,
  uploadAvatar,
  changePassword,
  exportUserData,
  requestAccountDeletion,
} from "@/app/actions/profile-actions";

export default function SettingsPage() {
  const { user, profile, isLoading, refreshProfile, signOut } = useAuth();
  const router = useRouter();

  console.log("Settings page render — isLoading:", isLoading, "user:", !!user, "profile:", !!profile, "username:", profile?.username);

  // Profile form state
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Avatar state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Email notifications state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [emailSaving, setEmailSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Export & delete state
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      setLocation(profile.location || "");
      setWebsite(profile.website || "");
      setEmailNotifications(profile.email_notifications ?? true);
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login?redirectTo=/settings");
    return null;
  }

  // User exists but profile is still loading or being auto-created
  if (!profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
        <p className="text-base text-dark-text/60">Setting up your profile...</p>
        <Button
          variant="secondary"
          className="mt-2"
          onClick={async () => {
            await refreshProfile();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      console.log("Settings: saving profile...");
      const formData = new FormData();
      formData.set("username", username);
      formData.set("full_name", fullName);
      formData.set("bio", bio);
      formData.set("location", location);
      formData.set("website", website);

      const result = await updateProfile(formData);
      console.log("Settings: updateProfile result:", result);
      if (result.error) {
        setProfileMessage({ type: "error", text: result.error });
      } else {
        setProfileMessage({ type: "success", text: "Profile updated successfully!" });
        await refreshProfile();
      }
    } catch (err) {
      console.error("Settings: handleProfileSubmit error:", err);
      setProfileMessage({ type: "error", text: "Failed to save profile. Please try again." });
    }
    setProfileSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setAvatarMessage(null);

    const formData = new FormData();
    formData.set("avatar", file);

    const result = await uploadAvatar(formData);
    if (result.error) {
      setAvatarMessage({ type: "error", text: result.error });
    } else {
      setAvatarMessage({ type: "success", text: "Avatar updated!" });
      await refreshProfile();
    }
    setAvatarUploading(false);
  };

  const handleEmailToggle = async () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    setEmailSaving(true);

    const formData = new FormData();
    formData.set("username", username);
    formData.set("full_name", fullName);
    formData.set("bio", bio);
    formData.set("location", location);
    formData.set("website", website);
    formData.set("email_notifications", String(newValue));

    await updateProfile(formData);
    setEmailSaving(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords don't match." });
      return;
    }
    setPasswordSaving(true);
    setPasswordMessage(null);

    const result = await changePassword(currentPassword, newPassword);
    if (result.error) {
      setPasswordMessage({ type: "error", text: result.error });
    } else {
      setPasswordMessage({ type: "success", text: "Password changed!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordSaving(false);
  };

  const handleExport = async () => {
    setExporting(true);
    const result = await exportUserData();
    if (result.data) {
      const blob = new Blob([result.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `florence-forum-data-${profile.username}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== profile.username) return;
    setDeleting(true);
    const result = await requestAccountDeletion();
    if (result.error) {
      setDeleting(false);
      return;
    }
    try {
      await signOut();
    } catch {
      // Ensure we still navigate even if signOut partially fails
    }
    router.refresh();
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-dark-text sm:text-3xl">
        Settings
      </h1>

      {/* Avatar section */}
      <section className="mt-8 rounded-lg bg-white p-6 shadow-sm ring-1 ring-light-stone">
        <h2 className="text-xl font-semibold text-dark-text">Profile Photo</h2>
        <div className="mt-4 flex items-center gap-6">
          <Avatar
            src={profile.avatar_url}
            name={profile.full_name || profile.username}
            size="xl"
          />
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-light-stone px-4 py-2.5 text-base font-medium text-dark-text/70 transition-colors hover:bg-light-stone">
              {avatarUploading ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={avatarUploading}
              />
            </label>
            <p className="mt-2 text-sm text-dark-text/40">
              JPG, PNG or GIF. Max 2MB.
            </p>
            {avatarMessage && (
              <p
                className={`mt-1 text-sm ${
                  avatarMessage.type === "error"
                    ? "text-red-600"
                    : "text-olive-green"
                }`}
              >
                {avatarMessage.text}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Profile form */}
      <section className="mt-6 rounded-lg bg-white p-6 shadow-sm ring-1 ring-light-stone">
        <h2 className="text-xl font-semibold text-dark-text">Profile Info</h2>
        <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-base font-medium text-dark-text/70">
              Username
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-base font-medium text-dark-text/70">
              Full Name
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className="mb-1 block text-base font-medium text-dark-text/70">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="w-full rounded-lg border border-light-stone px-3.5 py-2.5 text-base text-dark-text placeholder-dark-text/40 focus:border-terracotta/30 focus:outline-none focus:ring-1 focus:ring-terracotta/20"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-base font-medium text-dark-text/70">
                Location
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Florence, Italy"
              />
            </div>
            <div>
              <label className="mb-1 block text-base font-medium text-dark-text/70">
                Website
              </label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {profileMessage && (
            <p
              className={`text-base ${
                profileMessage.type === "error"
                  ? "text-red-600"
                  : "text-olive-green"
              }`}
            >
              {profileMessage.text}
            </p>
          )}

          <Button type="submit" isLoading={profileSaving}>
            Save Changes
          </Button>
        </form>
      </section>

      {/* Email Notifications */}
      <section className="mt-6 rounded-lg bg-white p-6 shadow-sm ring-1 ring-light-stone">
        <h2 className="text-xl font-semibold text-dark-text">
          Email Notifications
        </h2>
        <p className="mt-2 text-base text-dark-text/60">
          Receive email notifications when someone replies to your threads,
          mentions you, or likes your content.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={emailNotifications}
            disabled={emailSaving}
            onClick={handleEmailToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:ring-offset-2 disabled:opacity-50 ${
              emailNotifications ? "bg-terracotta" : "bg-dark-text/20"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                emailNotifications ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-base text-dark-text/70">
            {emailSaving
              ? "Saving..."
              : emailNotifications
                ? "Enabled"
                : "Disabled"}
          </span>
        </div>
      </section>

      {/* Password */}
      <section className="mt-6 rounded-lg bg-white p-6 shadow-sm ring-1 ring-light-stone">
        <h2 className="text-xl font-semibold text-dark-text">
          Change Password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-base font-medium text-dark-text/70">
              Current Password
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-base font-medium text-dark-text/70">
              New Password
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="mb-1 block text-base font-medium text-dark-text/70">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {passwordMessage && (
            <p
              className={`text-base ${
                passwordMessage.type === "error"
                  ? "text-red-600"
                  : "text-olive-green"
              }`}
            >
              {passwordMessage.text}
            </p>
          )}

          <Button type="submit" isLoading={passwordSaving}>
            Update Password
          </Button>
        </form>
      </section>

      {/* Data Export */}
      <section className="mt-6 rounded-lg bg-white p-6 shadow-sm ring-1 ring-light-stone">
        <h2 className="text-xl font-semibold text-dark-text">Your Data</h2>
        <p className="mt-2 text-base text-dark-text/60">
          Download a copy of all your data including profile, threads, replies,
          and photos.
        </p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={handleExport}
          isLoading={exporting}
        >
          Export Data (JSON)
        </Button>
      </section>

      {/* Danger zone */}
      <section className="mt-6 rounded-lg border-2 border-red-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-red-700">Danger Zone</h2>
        <p className="mt-2 text-base text-dark-text/60">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <Button
          variant="danger"
          className="mt-4"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Account
        </Button>
      </section>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        title="Delete Account"
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirm("");
        }}
      >
          <div className="space-y-4">
            <p className="text-base text-dark-text/70">
              This will permanently delete your account and anonymize all your
              content. This action <strong>cannot be undone</strong>.
            </p>
            <p className="text-base text-dark-text/70">
              Type <strong>{profile.username}</strong> to confirm:
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={profile.username}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                isLoading={deleting}
                disabled={deleteConfirm !== profile.username}
              >
                Delete My Account
              </Button>
            </div>
          </div>
        </Modal>
    </div>
  );
}
