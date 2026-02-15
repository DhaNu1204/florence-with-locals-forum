"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import { truncate } from "@/lib/utils/truncate";
import {
  updateReportStatus,
  deleteContent,
  banUser,
} from "@/app/actions/admin-actions";
import { ReportStatus } from "@/types";

interface ReportRow {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  status: ReportStatus;
  moderator_notes: string | null;
  created_at: string;
  reporter: { id: string; username: string; avatar_url: string | null } | null;
}

interface ReportsClientProps {
  initialReports: ReportRow[];
  currentFilter?: ReportStatus;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#d97706",
  reviewed: "#2563eb",
  resolved: "#16a34a",
  dismissed: "#6b7280",
};

const TABS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Resolved", value: "resolved" },
  { label: "Dismissed", value: "dismissed" },
];

export function ReportsClient({ initialReports, currentFilter }: ReportsClientProps) {
  const [reports, setReports] = useState(initialReports);
  const [modalReport, setModalReport] = useState<ReportRow | null>(null);
  const [modalAction, setModalAction] = useState<"resolve" | "dismiss" | "ban" | null>(null);
  const [notes, setNotes] = useState("");
  const [banReason, setBanReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (reportId: string, status: ReportStatus, modNotes?: string) => {
    setLoading(true);
    const result = await updateReportStatus(reportId, status, modNotes);
    if (result.success) {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status, moderator_notes: modNotes || r.moderator_notes } : r))
      );
    }
    setLoading(false);
    setModalReport(null);
    setModalAction(null);
    setNotes("");
  };

  const handleDeleteContent = async (report: ReportRow) => {
    setLoading(true);
    const ct = report.content_type as "thread" | "post";
    await deleteContent(ct, report.content_id);
    await updateReportStatus(report.id, "resolved", "Content deleted by moderator.");
    setReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, status: "resolved" as ReportStatus } : r))
    );
    setLoading(false);
  };

  const handleBan = async () => {
    if (!modalReport || !banReason.trim()) return;
    setLoading(true);
    // We don't have the author ID from the report directly — resolve report
    await banUser(modalReport.content_id, banReason.trim());
    await updateReportStatus(modalReport.id, "resolved", `User banned: ${banReason}`);
    setReports((prev) =>
      prev.map((r) => (r.id === modalReport.id ? { ...r, status: "resolved" as ReportStatus } : r))
    );
    setLoading(false);
    setModalReport(null);
    setModalAction(null);
    setBanReason("");
  };

  return (
    <>
      {/* Tabs */}
      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-light-stone pb-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/reports?status=${tab.value}` : "/admin/reports"}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              (currentFilter ?? "") === tab.value
                ? "bg-terracotta text-white"
                : "text-dark-text/60 hover:bg-light-stone"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Reports list */}
      {reports.length === 0 ? (
        <div className="mt-8 rounded-lg bg-light-stone/50 p-8 text-center">
          <p className="text-sm text-dark-text/50">No reports found.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-lg border border-light-stone bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {report.reporter && (
                    <Avatar
                      src={report.reporter.avatar_url}
                      name={report.reporter.username}
                      size="sm"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-dark-text">
                      {report.reporter?.username ?? "Unknown"} reported a{" "}
                      <span className="font-semibold">{report.content_type}</span>
                    </p>
                    <p className="text-xs text-dark-text/40">
                      {formatRelativeTime(report.created_at)}
                    </p>
                  </div>
                </div>
                <Badge color={STATUS_COLORS[report.status]}>
                  {report.status}
                </Badge>
              </div>

              <div className="mt-3 rounded bg-light-stone/50 px-3 py-2 text-sm text-dark-text/70">
                {truncate(report.reason, 300)}
              </div>

              {report.moderator_notes && (
                <p className="mt-2 text-xs text-dark-text/50">
                  Mod notes: {report.moderator_notes}
                </p>
              )}

              {/* Actions */}
              {report.status === "pending" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleStatusUpdate(report.id, "reviewed")}
                    disabled={loading}
                  >
                    Mark Reviewed
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setModalReport(report);
                      setModalAction("resolve");
                    }}
                  >
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setModalReport(report);
                      setModalAction("dismiss");
                    }}
                  >
                    Dismiss
                  </Button>
                  {(report.content_type === "thread" || report.content_type === "post") && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteContent(report)}
                      disabled={loading}
                    >
                      Delete Content
                    </Button>
                  )}
                  {report.content_type === "profile" && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setModalReport(report);
                        setModalAction("ban");
                      }}
                    >
                      Ban User
                    </Button>
                  )}
                </div>
              )}

              {report.status === "reviewed" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setModalReport(report);
                      setModalAction("resolve");
                    }}
                  >
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setModalReport(report);
                      setModalAction("dismiss");
                    }}
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolve/Dismiss modal */}
      <Modal
        isOpen={!!modalReport && (modalAction === "resolve" || modalAction === "dismiss")}
        onClose={() => {
          setModalReport(null);
          setModalAction(null);
          setNotes("");
        }}
        title={modalAction === "resolve" ? "Resolve Report" : "Dismiss Report"}
      >
        <div className="space-y-4">
          <p className="text-sm text-dark-text/70">
            {modalAction === "resolve"
              ? "Add notes about how this report was resolved:"
              : "Add notes about why this report is being dismissed (optional):"}
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Moderator notes..."
            rows={3}
            className="w-full rounded-lg border border-light-stone px-3 py-2 text-sm text-dark-text placeholder-dark-text/40 focus:border-terracotta/30 focus:outline-none focus:ring-1 focus:ring-terracotta/20"
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setModalReport(null);
                setModalAction(null);
                setNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                modalReport &&
                handleStatusUpdate(
                  modalReport.id,
                  modalAction === "resolve" ? "resolved" : "dismissed",
                  notes || undefined
                )
              }
              isLoading={loading}
            >
              {modalAction === "resolve" ? "Resolve" : "Dismiss"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ban user modal */}
      <Modal
        isOpen={!!modalReport && modalAction === "ban"}
        onClose={() => {
          setModalReport(null);
          setModalAction(null);
          setBanReason("");
        }}
        title="Ban User"
      >
        <div className="space-y-4">
          <p className="text-sm text-dark-text/70">
            This will ban the reported user. Please provide a reason:
          </p>
          <textarea
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Ban reason..."
            rows={3}
            className="w-full rounded-lg border border-light-stone px-3 py-2 text-sm text-dark-text placeholder-dark-text/40 focus:border-terracotta/30 focus:outline-none focus:ring-1 focus:ring-terracotta/20"
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setModalReport(null);
                setModalAction(null);
                setBanReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleBan}
              isLoading={loading}
              disabled={!banReason.trim()}
            >
              Ban User
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
