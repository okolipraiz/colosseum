"use client";

import React, { useState } from "react";
import { toast } from "sonner";

type SubmitProps = {
  target: { name: string; value: string };
};

const DeleteAccountForm = () => {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    reason: "",
  });

  const handleInputChange = (e: SubmitProps) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!confirmed) {
      toast.error("Please confirm you understand this action before submitting.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.anomalyforex.com/contact_us/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullname: formData.fullname,
            email: formData.email,
            subject: "Account Deletion Request",
            body: `Account deletion requested via useforecast.cc/delete-account.\n\nRegistered phone number: ${
              formData.phone || "Not provided"
            }\n\nReason: ${formData.reason || "Not provided"}`,
          }),
        },
      );

      if (response.ok) {
        toast.success(
          "Deletion request received. We'll email you to confirm and complete the process.",
          {
            action: {
              label: "Close",
              onClick: () => console.log("Undo"),
            },
          },
        );
        setFormData({ fullname: "", email: "", phone: "", reason: "" });
        setConfirmed(false);
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message || "Something went wrong!"}`, {
          action: {
            label: "Close",
            onClick: () => console.log("Undo"),
          },
        });
      }
    } catch (error) {
      console.error("Error submitting the deletion request:", error);
      toast.error(`Failed to send the request. Please try again.`, {
        action: {
          label: "Close",
          onClick: () => console.log("Undo"),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="rounded-xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-5"
      onSubmit={handleSubmit}
    >
      <h2 className="text-white font-bold text-lg">Request Account Deletion</h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-300">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Full Name"
            name="fullname"
            value={formData.fullname}
            onChange={handleInputChange}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-300">
            Registered Email
          </label>
          <input
            type="email"
            placeholder="The email address on your account"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-300">
            Registered Phone Number{" "}
            <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <input
            type="tel"
            placeholder="+234..."
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-300">
            Reason <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <textarea
            name="reason"
            rows={4}
            value={formData.reason}
            onChange={handleInputChange}
            placeholder="Let us know why you're leaving (optional)"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-white/30 transition-colors resize-none"
          />
        </div>

        <label className="flex items-start gap-3 text-sm text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-white"
          />
          <span>
            I understand that this action is irreversible, that I should
            withdraw any remaining wallet balance beforehand, and that some
            transaction records may be retained as described above for legal
            and regulatory purposes.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-red-700 text-white font-extrabold text-sm py-3.5 hover:bg-red-500 active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-60"
        >
          {loading ? "Submitting, Please wait..." : "Submit Deletion Request"}
        </button>
      </div>
    </form>
  );
};

export default DeleteAccountForm;
