import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background text-body-text">
      <Navbar />
      <main className="section-padding max-w-6xl mx-auto px-4 py-14">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-base text-muted-foreground mb-6">
          These Terms of Service govern your access to and use of the Clearline Engineering platform and services.
          By using our website or signing up for an account, you agree to these terms. This agreement is intended to be interpreted
          under the laws of the Commonwealth of Massachusetts.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>
            Your use of the Clearline Engineering website and services constitutes acceptance of these Terms of Service,
            our Privacy Policy, Cookie Policy, and any subsequent updates.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">2. Services</h2>
          <p className="mb-3">
            Clearline Engineering provides a business management platform tailored to engineering professionals,
            including project management, client administration, document storage, reporting, invoicing, and related insights.
          </p>
          <p>
            We may modify, suspend, or discontinue all or part of the services at any time, subject to applicable law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
          <p className="mb-3">
            You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.
          </p>
          <p>
            You agree to provide accurate and complete information and to notify us promptly of any unauthorized use.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">4. Payment and Subscription</h2>
          <p className="mb-3">
            Subscription fees, payment terms, and renewal practices are set forth at the time of purchase and in any applicable order form.
          </p>
          <p>
            All fees are non-refundable unless otherwise required by law. You agree to pay all applicable taxes in connection with your use of the services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">5. Acceptable Use</h2>
          <p className="mb-3">
            You may not use the services to store or transmit unlawful, infringing, or harmful content.
          </p>
          <p>
            You agree not to interfere with the security, availability, or integrity of our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">6. Intellectual Property</h2>
          <p className="mb-3">
            All intellectual property rights in the services and content provided by Clearline Engineering are owned or licensed by us.
          </p>
          <p>
            You are granted a limited, non-exclusive license to use the services for your internal business purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">7. Disclaimers and Limitations of Liability</h2>
          <p className="mb-3">
            Our services are provided "as is" and "as available" without warranties to the fullest extent permitted by law.
          </p>
          <p>
            To the maximum extent permitted by law, we are not liable for indirect, incidental, consequential, or punitive damages.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">8. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the Commonwealth of Massachusetts, without regard to conflict of laws principles.
            Any dispute arising under these Terms will be resolved in the state or federal courts located in Massachusetts.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-3">9. Changes</h2>
          <p>
            We may update these Terms from time to time. Continued use of the services after changes are posted constitutes acceptance of the updated Terms.
          </p>
        </section>

        <p className="text-sm text-muted-foreground">
          Disclaimer: This document is a general template and does not constitute legal advice. For a version tailored to your business and Massachusetts law,
          consult licensed counsel.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
