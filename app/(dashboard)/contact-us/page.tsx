import ContactUsForm from "@/components/dashboard/ContactUsForm";
import Navbar from "@/components/dashboard/Navbar";
import { ArrowLeft, MessageSquare, Mail, Phone } from "lucide-react";
import Link from "next/link";

const contactMethods = [
  {
    icon: MessageSquare,
    label: "Discord",
    detail:
      "Before you send us a mail or call, have you considered creating a ticket? I promise we would respond faster.",
    badge: "Recommended",
    href: "https://discord.gg/E2vSkASeY7",
    external: true,
  },
  {
    icon: Mail,
    label: "Mail",
    detail: "support@anomalyforex.com",
    badge: null,
    href: "mailto:support@anomalyforex.com",
    external: true,
  },
  {
    icon: Phone,
    label: "Phone",
    detail: "+234 90 1360 5375",
    badge: null,
    href: "tel:+2349013605375",
    external: true,
  },
];

const ContactUsPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all mb-10 text-sm font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Go back</span>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Contact Us
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — contact method cards */}
          <div className="flex flex-col gap-4">
            {contactMethods.map(
              ({ icon: Icon, label, detail, badge, href, external }) => {
                const Wrapper = external
                  ? ({
                      children,
                      ...props
                    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
                      children: React.ReactNode;
                    }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    )
                  : ({
                      children,
                      ...props
                    }: {
                      children: React.ReactNode;
                      href: string;
                      className: string;
                    }) => <Link {...props}>{children}</Link>;

                return (
                  <Wrapper
                    key={label}
                    href={href}
                    className="flex items-start gap-4 p-5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all group"
                  >
                    <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm">
                          {label}
                        </span>
                        {badge && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-black">
                            {badge}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {detail}
                      </p>
                    </div>
                  </Wrapper>
                );
              },
            )}
          </div>

          {/* Right — contact form */}
          <ContactUsForm />
        </div>
      </main>

      <div className="my-30" />
    </div>
  );
};

export default ContactUsPage;
