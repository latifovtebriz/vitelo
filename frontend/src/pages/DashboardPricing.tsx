import { redirectToCheckout } from '../lib/checkout';
import { useAuthStore } from '../stores/authStore';
import { logger } from '../lib/logger';
import DashboardLayout from '../components/DashboardLayout';
import { Check, Sparkles, Zap, Crown, CreditCard, ShieldCheck } from 'lucide-react';

const PLANS = [
  {
    tier: 'basic',
    name: 'Basic Plan',
    price: '$4.99',
    credits: 3,
    desc: 'Max 3 CVs + 3 Cover Letters',
    icon: CreditCard,
    color: 'from-blue-500 to-blue-600',
    features: [
      '3 ATS-Optimized CVs',
      '3 Custom Cover Letters',
      'Clean & Minimal Templates',
      'Clean HD PDF download (No watermark)',
      'Shareable Web CV Link & QR Code',
    ],
    popular: false,
  },
  {
    tier: 'pro',
    name: 'Pro Plan',
    price: '$7.99',
    credits: 5,
    desc: 'Max 5 CVs + 5 Cover Letters',
    icon: Zap,
    color: 'from-indigo-500 to-purple-600',
    features: [
      '5 Professional Resumes',
      '5 Tailored Cover Letters',
      'All Pro Templates (Berlin, Zurich, London)',
      '1-Click Job URL Tailoring & Scraper',
      'Deep ATS Audit & 1-Click Fix',
      'Priority Support',
    ],
    popular: true,
  },
  {
    tier: 'ultimate',
    name: 'Ultimate Career Pack',
    price: '$12.99',
    credits: 8,
    desc: 'Max 8 CVs + 8 Cover Letters',
    icon: Crown,
    color: 'from-purple-600 to-pink-600',
    features: [
      '8 Full-Featured Resumes',
      '8 Custom AI Cover Letters',
      'All Templates & Custom Color Palettes',
      'AI Multi-Language Translator (AZ/EN/TR/DE/RU)',
      'AI LinkedIn Profile Optimizer Pack',
      '5 Custom Mock Interview Q&As',
      'Salary Analyzer & Negotiation Guide',
    ],
    popular: false,
  },
];

export default function DashboardPricing() {
  const { user } = useAuthStore();

  const handleCheckout = (tier: string) => {
    logger.action('DashboardPricing', 'Initiated LemonSqueezy Checkout', {
      tier,
      user_email: user?.email,
    });
    redirectToCheckout(tier, user?.email);
  };

  return (
    <DashboardLayout activeKey="pricing">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> Secure LemonSqueezy Payments
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Upgrade Your Career Plan</h1>
        <p className="text-slate-500 max-w-lg mx-auto text-sm leading-relaxed">
          Choose the package that fits your job search targets. Single CV unlocks from $3.99, or select a value-packed bundle below.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
        {PLANS.map((plan) => (
          <div
            key={plan.tier}
            className={`relative bg-white rounded-3xl border shadow-sm flex flex-col justify-between overflow-hidden transition-all hover:shadow-xl ${
              plan.popular ? 'border-2 border-blue-600 ring-4 ring-blue-50' : 'border-slate-200'
            }`}
          >
            {plan.popular && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center text-xs font-black py-1.5 tracking-wider">
                ⭐ MOST POPULAR
              </div>
            )}

            <div className="p-6 sm:p-7 flex-1 flex flex-col">
              {/* Icon + name */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-md`}
                >
                  <plan.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{plan.name}</h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 inline-block mt-0.5">
                    {plan.desc}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-5 pb-4 border-b border-slate-100">
                <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                <span className="text-xs text-slate-500 font-semibold ml-1">/ bundle</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                type="button"
                onClick={() => handleCheckout(plan.tier)}
                className={`w-full py-3.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" /> Get {plan.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
