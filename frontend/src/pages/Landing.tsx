import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Vitelo
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Log In</Link>
                <Link to="/register" className="h-9 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-7xl mb-6">
            Build your <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">AI-powered</span> career
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10">
            Vitelo generates highly optimized CVs to pass ATS parsers, creates custom Cover Letters, and preps you for interviews automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/generate" className="w-full sm:w-auto h-12 inline-flex items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              Generate CV for Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Pricing Section */}
      <section className="py-24 bg-slate-50/50 border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-4 text-muted-foreground text-lg">Start for free. Upgrade when you're ready to download your perfect CV.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Tier */}
            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm flex flex-col p-6">
              <h3 className="text-xl font-bold">Basic</h3>
              <p className="text-sm text-muted-foreground mt-2">Just the essentials for a great resume.</p>
              <div className="mt-4 text-4xl font-extrabold">$3<span className="text-xl font-medium text-muted-foreground">/cv</span></div>
              <ul className="mt-8 space-y-3 flex-1">
                {['High-res PDF Download', 'No watermarks', 'ATS-optimized formatting', 'AI CV writing'].map(feature => (
                  <li key={feature} className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-3 flex-shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Tier */}
            <div className="rounded-2xl border-2 border-primary bg-card text-card-foreground shadow-lg flex flex-col p-6 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                🔥 Most Popular
              </div>
              <h3 className="text-xl font-bold">Pro</h3>
              <p className="text-sm text-muted-foreground mt-2">Perfect for active job seekers.</p>
              <div className="mt-4 text-4xl font-extrabold">$5.99<span className="text-xl font-medium text-muted-foreground">/cv</span></div>
              <ul className="mt-8 space-y-3 flex-1">
                {['Everything in Basic', 'Custom Cover Letter generation', 'Matching tone to job description'].map(feature => (
                  <li key={feature} className="flex items-center text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-3 flex-shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Ultimate Tier */}
            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm flex flex-col p-6">
              <h3 className="text-xl font-bold">Ultimate</h3>
              <p className="text-sm text-muted-foreground mt-2">The complete interview preparation package.</p>
              <div className="mt-4 text-4xl font-extrabold">$8.99<span className="text-xl font-medium text-muted-foreground">/cv</span></div>
              <ul className="mt-8 space-y-3 flex-1">
                {['Everything in Pro', '5 Custom Interview Q&As', 'Comprehensive Job Match analysis'].map(feature => (
                  <li key={feature} className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-3 flex-shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
