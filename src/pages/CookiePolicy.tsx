import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background text-body-text">
      <Navbar />
      <main className="section-padding max-w-6xl mx-auto px-4 py-14">
        <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
        <p className="text-base text-muted-foreground mb-6">
          This Cookie Policy explains how Clearline Engineering uses cookies and similar tracking technologies when you visit our website.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences,
            understand how you use the site, and improve performance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">2. Types of Cookies We Use</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Essential cookies:</strong> Necessary for website functionality and security.
            </li>
            <li>
              <strong>Performance cookies:</strong> Help us analyze site usage and improve the user experience.
            </li>
            <li>
              <strong>Functional cookies:</strong> Remember user preferences and settings.
            </li>
            <li>
              <strong>Third-party cookies:</strong> Set by external services such as analytics providers to support our website features.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">3. How We Use Cookies</h2>
          <p className="mb-3">
            We use cookies to maintain your session, remember preferences, measure how the site performs, and tailor our content.
          </p>
          <p>
            Cookies also help us detect and prevent fraud, and secure our platform against unauthorized access.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">4. Managing Cookies</h2>
          <p className="mb-3">
            You can manage or disable cookies through your browser settings. Disabling certain cookies may affect the functionality of the website.
          </p>
          <p>
            For information on managing cookies in your browser, please consult the browser provider's support resources.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">5. Third-Party Services</h2>
          <p>
            We may allow third parties to collect information via cookies when you use our website. These third parties may include analytics providers,
            payment processors, and other service partners.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-3">6. Updates</h2>
          <p>
            We may revise this Cookie Policy from time to time. Updated versions will be posted on our website and will become effective when posted.
          </p>
        </section>

        <p className="text-sm text-muted-foreground">
          Disclaimer: This Cookie Policy is provided for informational purposes and is not legal advice. Consult legal counsel licensed in Massachusetts
          for guidance specific to your business and compliance obligations.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
