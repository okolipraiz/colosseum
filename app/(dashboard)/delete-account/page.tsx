import type { Metadata } from "next";
import Navbar from "@/components/dashboard/Navbar";
import DeleteAccountForm from "@/components/dashboard/DeleteAccountForm";
import { LegalSection } from "@/components/dashboard/LegalPageLayout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const baseUrl = "https://useforecast.cc";

export const metadata: Metadata = {
  title: "Delete Your Account - Forecast by anomaly",
  description:
    "How to delete your Forecast by anomaly account and what happens to your data.",
  alternates: {
    canonical: `${baseUrl}/delete-account`,
  },
  openGraph: {
    title: "Delete Your Account - Forecast by anomaly",
    description:
      "How to delete your Forecast by anomaly account and what happens to your data.",
    url: `${baseUrl}/delete-account`,
    siteName: "Forecast by anomaly",
  },
};

const DeleteAccountPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/markets"
          className="group inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all mb-10 text-sm font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Go back</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Delete Your Account
          </h1>
          <p className="text-slate-500 text-sm">
            How to permanently delete your Forecast by Anomaly account and
            data.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 sm:px-8 mb-8">
          <LegalSection heading="How to Request Deletion">
            <p>
              You can request deletion of your Forecast by Anomaly account in
              either of the following ways:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>
                Submit the form below with the email address registered to
                your account; or
              </li>
              <li>
                Email{" "}
                <a
                  href="mailto:support@anomalyforex.com?subject=Account%20Deletion%20Request"
                  className="underline text-white"
                >
                  support@anomalyforex.com
                </a>{" "}
                from your registered email address with the subject
                &quot;Account Deletion Request&quot;.
              </li>
            </ul>
            <p>
              Before requesting deletion, withdraw any remaining wallet
              balance and settle any open market positions — funds left in
              your wallet at the time of deletion may be forfeited.
            </p>
          </LegalSection>

          <LegalSection heading="What Gets Deleted">
            <p>
              Once your request is verified, we permanently delete or
              anonymize:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>Your profile information (name, email, phone, address);</li>
              <li>Your login credentials and account access;</li>
              <li>Your market activity history, portfolio, and leaderboard presence; and</li>
              <li>Saved payment recipients and notification preferences.</li>
            </ul>
          </LegalSection>

          <LegalSection heading="What We Retain, and Why">
            <p>
              As a platform that handles real-money wallet transactions, we
              are required to retain certain records even after account
              deletion, including deposit, withdrawal, and market
              settlement transactions, and any KYC/identity verification
              records collected. These are retained only as long as
              necessary to meet our legal, tax, and anti-fraud/AML
              obligations, after which they are deleted or fully
              anonymized. See our{" "}
              <Link href="/privacy" className="underline text-white">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
          </LegalSection>

          <LegalSection heading="Processing Time">
            <p>
              We aim to acknowledge deletion requests within 3 business days
              and complete verification and deletion within 30 days.
              Deletion is irreversible — once processed, your account and
              associated data (outside of the retained records described
              above) cannot be recovered.
            </p>
          </LegalSection>
        </div>

        <DeleteAccountForm />
      </main>

      <div className="my-30" />
    </div>
  );
};

export default DeleteAccountPage;
