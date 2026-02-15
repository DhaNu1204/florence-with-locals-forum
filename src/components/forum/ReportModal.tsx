"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { reportContent } from "@/app/actions/admin-actions";

interface ReportModalProps {
  contentType: "thread" | "post" | "photo" | "profile";
  contentId: string;
  trigger?: React.ReactNode;
}

export function ReportModal({ contentType, contentId, trigger }: ReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage(null);

    const result = await reportContent(contentType, contentId, reason);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Report submitted. Thank you for helping keep our community safe." });
      setReason("");
      setTimeout(() => setIsOpen(false), 2000);
    }
    setSubmitting(false);
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setIsOpen(true)} className="cursor-pointer">
          {trigger}
        </span>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="text-sm text-dark-text/30 transition-colors hover:text-red-500"
        >
          Report
        </button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setMessage(null);
          setReason("");
        }}
        title="Report Content"
      >
        <div className="space-y-4">
          <p className="text-base text-dark-text/70">
            Please describe why you&apos;re reporting this {contentType}. Our
            moderators will review your report.
          </p>

          <div>
            <label className="mb-1 block text-sm font-medium text-dark-text/50">
              Reason
            </label>
            <div className="mb-3 flex flex-wrap gap-2">
              {["Spam", "Harassment", "Inappropriate content", "Misinformation"].map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      setReason((r) => (r ? `${r}. ${preset}` : preset))
                    }
                    className="rounded-full border border-light-stone px-3.5 py-1.5 text-sm text-dark-text/60 transition-colors hover:bg-light-stone"
                  >
                    {preset}
                  </button>
                )
              )}
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue in detail (at least 10 characters)..."
              rows={3}
              className="w-full rounded-lg border border-light-stone px-3.5 py-2.5 text-base text-dark-text placeholder-dark-text/40 focus:border-terracotta/30 focus:outline-none focus:ring-1 focus:ring-terracotta/20"
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.type === "error" ? "text-red-600" : "text-olive-green"
              }`}
            >
              {message.text}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                setMessage(null);
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleSubmit}
              isLoading={submitting}
              disabled={reason.trim().length < 10}
            >
              Submit Report
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
