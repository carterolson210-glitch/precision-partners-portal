import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-body-text">
      <Navbar />
      <main className="section-padding max-w-6xl mx-auto px-4 py-14">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-base text-muted-foreground mb-6">
          This Privacy Policy describes how Clearline Engineering, LLC ("we", "us", or "our") collects,
          uses, discloses, and protects personal information in connection with our website and services.
          This policy is intended to meet the privacy requirements of Massachusetts and applicable federal law.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="mb-3">
            We collect information you provide directly, such as account details, contact information,
            billing data, and project information. We also collect usage data automatically, including
            device identifiers, IP address, browser type, and pages visited.
          </p>
          <p>
            When you use our services, we may collect personal data from you, your employees, contractors,
            clients, and other users associated with your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">2. How We Use Information</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To provide, maintain, and improve our services.</li>
            <li>To authenticate and manage user accounts.</li>
            <li>To communicate with you about your account, support requests, and service updates.</li>
            <li>To comply with legal obligations and protect our rights.</li>
            <li>To personalize our service and improve system performance.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">3. Sharing and Disclosure</h2>
          <p className="mb-3">
            We may share personal information with service providers, vendors, and partners who perform services on our behalf,
            including payment processors, customer support providers, hosting providers, and analytics services.
          </p>
          <p>
            We do not sell personal information. We may disclose personal information if required by law,
            to protect our rights, or in connection with a business transfer such as a merger or sale.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">4. Cookies and Tracking</h2>
          <p className="mb-3">
            We use cookies, web beacons, and similar technologies to provide and protect our services,
            understand usage patterns, and deliver a better user experience. For more detail, see our
            Cookie Policy.
          </p>
          <p>
            You can manage cookies through your browser settings and opt out of certain tracking tools.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
          <p className="mb-3">
            Massachusetts residents may have rights under state and federal law, including the right to access,
            correct, or delete certain personal information and to request information about our data practices.
          </p>
          <p>
            To exercise these rights, contact us at privacy@clearlineengineering.com.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">6. Security</h2>
          <p>
            We implement reasonable administrative, technical, and physical safeguards designed to protect personal information.
            However, no system can be fully secure. If we become aware of a breach affecting your data, we will notify you
            as required by applicable law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">7. Governing Law</h2>
          <p>
            This Privacy Policy is governed by the laws of the Commonwealth of Massachusetts and applicable federal law.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-3">8. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. The revised policy will be effective when posted on our website.
          </p>
        </section>

        <p className="text-sm text-muted-foreground">
          Disclaimer: This Privacy Policy is provided for general informational purposes only and is not legal advice.
          For advice tailored to your business and Massachusetts law, consult licensed legal counsel.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
