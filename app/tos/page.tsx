import type { Metadata } from "next";
import LegalPageLayout, {
  LegalSection,
} from "@/components/dashboard/LegalPageLayout";

const baseUrl = "https://useforecast.cc";

export const metadata: Metadata = {
  title: "Terms of Service - Forecast by anomaly",
  description:
    "The terms and conditions governing your use of Forecast by anomaly.",
  alternates: {
    canonical: `${baseUrl}/tos`,
  },
  openGraph: {
    title: "Terms of Service - Forecast by anomaly",
    description:
      "The terms and conditions governing your use of Forecast by anomaly.",
    url: `${baseUrl}/tos`,
    siteName: "Forecast by anomaly",
  },
};

const TosPage = () => {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="May 1, 2026">
      <LegalSection heading="1. Agreement to Terms">
        <p>
          These Terms of Service (&quot;Terms&quot;) form a binding agreement
          between you and Forecast by Anomaly (&quot;Forecast&quot;,
          &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) governing your
          access to and use of the useforecast.cc website, mobile
          experience, and related services (collectively, the
          &quot;Platform&quot;). By creating an account, depositing funds, or
          otherwise using the Platform, you confirm that you have read,
          understood, and agree to be bound by these Terms and our{" "}
          <a href="/privacy" className="underline text-white">
            Privacy Policy
          </a>
          . If you do not agree, do not use the Platform.
        </p>
      </LegalSection>

      <LegalSection heading="2. Eligibility">
        <p>To use the Platform, you must:</p>
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          <li>Be at least 18 years old;</li>
          <li>
            Have the legal capacity to enter into a binding contract in your
            jurisdiction;
          </li>
          <li>
            Not be located in, or a citizen or resident of, any jurisdiction
            where participation in prediction markets or similar
            skill-and-forecast based platforms is prohibited by law; and
          </li>
          <li>
            Not have been previously suspended or removed from the Platform.
          </li>
        </ul>
        <p>
          You are solely responsible for determining whether your use of the
          Platform is lawful in your jurisdiction. We reserve the right to
          request identity or age verification (KYC) at any time and to
          restrict or terminate access where eligibility cannot be confirmed.
        </p>
      </LegalSection>

      <LegalSection heading="3. Your Account">
        <p>
          You must provide accurate, current, and complete information when
          registering, and keep it up to date. You are responsible for
          safeguarding your login credentials and for all activity that
          occurs under your account. Notify us immediately at{" "}
          <a
            href="mailto:support@anomalyforex.com"
            className="underline text-white"
          >
            support@anomalyforex.com
          </a>{" "}
          if you suspect unauthorized use of your account. You may only hold
          and operate one account; duplicate or shared accounts may be
          suspended.
        </p>
      </LegalSection>

      <LegalSection heading="4. How Markets Work">
        <p>
          Markets on the Platform are created and configured by Forecast
          (including administrators). Each market has defined outcomes, a
          resolution source or criteria, and a closing time, all of which are
          displayed on the market page before you participate.
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          <li>
            When you take a position in a market, the corresponding amount is
            debited from your wallet balance and held until the market
            resolves.
          </li>
          <li>
            Markets are resolved based on publicly verifiable outcomes or the
            criteria stated on the market page. Resolution decisions made in
            good faith and in accordance with the stated criteria are final.
          </li>
          <li>
            A market may be voided or cancelled (for example, due to
            ambiguous outcomes, data unavailability, or manifest error), in
            which case committed funds for that market are returned to your
            wallet.
          </li>
          <li>
            Odds, prices, and payouts shown on the Platform are dynamic and
            may change up until a market closes.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Wallet, Deposits & Withdrawals">
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          <li>
            Funds deposited into your Platform wallet are held for the
            purpose of participating in markets and are not a bank deposit
            or investment product.
          </li>
          <li>
            Withdrawals are processed to the payment method or account you
            provide and may be subject to identity verification, minimum
            amounts, processing times, and applicable fees, as displayed at
            the time of the transaction.
          </li>
          <li>
            We may delay, limit, or decline a deposit or withdrawal where
            required to comply with law, prevent fraud, or investigate
            suspicious activity.
          </li>
          <li>
            You are responsible for the accuracy of the payment details you
            provide. We are not liable for funds lost due to incorrect
            information supplied by you.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="6. Referrals & Affiliate Program">
        <p>
          Where available, referral or affiliate rewards are earned in
          accordance with the terms displayed within the Platform at the
          time. We may adjust, withhold, or reclaim rewards obtained through
          fraudulent, abusive, or self-referral activity, or through
          violation of these Terms.
        </p>
      </LegalSection>

      <LegalSection heading="7. Prohibited Conduct">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          <li>
            Manipulate or attempt to manipulate a market&apos;s outcome,
            pricing, or resolution;
          </li>
          <li>
            Use bots, scripts, or automated means to interact with the
            Platform without our written consent;
          </li>
          <li>
            Create multiple accounts, exploit bugs, or engage in wash
            trading, collusion, or other unfair trading practices;
          </li>
          <li>
            Use the Platform for money laundering, terrorist financing, or
            any other unlawful purpose;
          </li>
          <li>
            Circumvent or attempt to circumvent identity verification,
            geographic, or account restrictions; or
          </li>
          <li>
            Interfere with the security, integrity, or availability of the
            Platform.
          </li>
        </ul>
        <p>
          Violation of this section may result in suspension or termination
          of your account and forfeiture of funds obtained through the
          violation, in addition to any other remedies available to us.
        </p>
      </LegalSection>

      <LegalSection heading="8. Risk Disclosure">
        <p>
          Participating in markets involves financial risk. Outcomes are
          uncertain, and you may lose some or all of the funds you commit to
          a market. Past performance, leaderboard standing, or historical
          trends are not indicative of future results. You should only
          commit funds you can afford to lose and participate responsibly.
        </p>
      </LegalSection>

      <LegalSection heading="9. Fees">
        <p>
          We may charge fees on deposits, withdrawals, or market
          participation. Applicable fees are disclosed to you within the
          Platform before you confirm a transaction. We may change our fee
          structure prospectively by updating the Platform.
        </p>
      </LegalSection>

      <LegalSection heading="10. Intellectual Property">
        <p>
          The Platform, including its branding, design, software, and
          content, is owned by or licensed to Forecast and is protected by
          intellectual property laws. You are granted a limited,
          non-exclusive, non-transferable license to access and use the
          Platform for its intended purpose. You may not copy, modify,
          distribute, or create derivative works from the Platform without
          our prior written consent.
        </p>
      </LegalSection>

      <LegalSection heading="11. Suspension & Termination">
        <p>
          We may suspend or terminate your access to the Platform, with or
          without notice, if we reasonably believe you have violated these
          Terms, engaged in fraudulent or unlawful activity, or posed a risk
          to the Platform or other users. Upon termination not related to
          fraud or violation of these Terms, any available wallet balance
          will be returned to you, subject to standard withdrawal
          verification.
        </p>
      </LegalSection>

      <LegalSection heading="12. Disclaimers">
        <p>
          The Platform is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis, without warranties of any kind, whether
          express or implied, including warranties of merchantability,
          fitness for a particular purpose, or non-infringement. We do not
          warrant that the Platform will be uninterrupted, error-free, or
          secure.
        </p>
      </LegalSection>

      <LegalSection heading="13. Limitation of Liability">
        <p>
          To the fullest extent permitted by law, Forecast and its
          officers, employees, and affiliates will not be liable for any
          indirect, incidental, special, consequential, or punitive damages,
          or for any loss of funds, profits, or data arising from your use
          of the Platform. Our aggregate liability for any claim arising out
          of these Terms will not exceed the amount you deposited into your
          wallet in the ninety (90) days preceding the claim.
        </p>
      </LegalSection>

      <LegalSection heading="14. Indemnification">
        <p>
          You agree to indemnify and hold Forecast harmless from any claims,
          losses, liabilities, and expenses (including legal fees) arising
          from your use of the Platform, your violation of these Terms, or
          your violation of any law or third-party right.
        </p>
      </LegalSection>

      <LegalSection heading="15. Changes to These Terms">
        <p>
          We may update these Terms from time to time. Where changes are
          material, we will provide reasonable notice, such as an in-app
          notification or an update to the &quot;Last updated&quot; date
          above. Continued use of the Platform after changes take effect
          constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection heading="16. Governing Law & Disputes">
        <p>
          These Terms are governed by the laws of the Federal Republic of
          Nigeria, without regard to conflict of law principles. Any dispute
          arising out of or relating to these Terms or the Platform will
          first be addressed through good-faith negotiation via our support
          channels, and if unresolved, will be subject to the exclusive
          jurisdiction of the courts of Nigeria.
        </p>
      </LegalSection>

      <LegalSection heading="17. Contact Us">
        <p>
          Questions about these Terms can be sent to{" "}
          <a
            href="mailto:support@anomalyforex.com"
            className="underline text-white"
          >
            support@anomalyforex.com
          </a>{" "}
          or via our{" "}
          <a
            href="/contact-us"
            className="underline text-white"
          >
            contact page
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default TosPage;
