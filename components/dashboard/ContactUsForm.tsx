"use client";

import React, { useState } from "react";
import { toast } from "sonner";

type SubmitProps = {
  target: { name: string; value: string };
};

const ContactUsForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    subject: "",
    body: "",
  });

  const handleInputChange = (e: SubmitProps) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.anomalyforex.com/contact_us/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        // Handle success
        toast.success(
          "Message sent successfully, we would respond as soon as possible!",
          {
            action: {
              label: "Close",
              onClick: () => console.log("Undo"),
            },
          },
        );
        setFormData({ fullname: "", email: "", subject: "", body: "" });
      } else {
        // Handle error
        const errorData = await response.json();

        toast.error(`Error: ${errorData.message || "Something went wrong!"}`, {
          action: {
            label: "Close",
            onClick: () => console.log("Undo"),
          },
        });
      }
    } catch (error) {
      console.error("Error submitting the form:", error);

      toast.error(`Failed to send the message. Please try again.`, {
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
      <h2 className="text-white font-bold text-lg">
        Drop us a line and we will revert shortly
      </h2>

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
          <label className="text-sm font-semibold text-slate-300">Email</label>
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-300">
            Subject
          </label>
          <input
            type="text"
            placeholder="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-300">Body</label>
          <textarea
            name="body"
            rows={5}
            value={formData.body}
            onChange={handleInputChange}
            required
            placeholder="Enter your message"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-white/30 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-white text-black font-extrabold text-sm py-3.5 hover:bg-slate-200 active:scale-[0.98] transition-all uppercase tracking-widest"
        >
          {loading ? "Submitting, Please wait..." : "Submit Message"}
        </button>
      </div>
    </form>
  );
};

export default ContactUsForm;
