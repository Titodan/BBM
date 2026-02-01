import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-primary mb-8">Terms of Service</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-foreground/70 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p>Content coming soon...</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
