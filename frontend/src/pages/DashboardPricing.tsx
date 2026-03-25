import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import { Check, Sparkles, Zap, Crown, CreditCard } from 'lucide-react';

const PLANS = [
  {
    tier: 'basic',
    name: 'Basic',
    price: '$4.99',
    desc: '1 credit — Unlock a single CV',
    icon: CreditCard,
    color: 'from-blue-500 to-blue-600',
    features: ['Clean HD PDF download', 'No watermark', 'ATS-optimized format', 'Email support'],
    popular: false,
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '$7.99',
    desc: '1 credit — CV + Cover Letter',
    icon: Zap,
    color: 'from-indigo-500 to-purple-600',
    features: ['Everything in Basic', 'AI Cover Letter', 'Job-matched tailoring', 'Priority support', 'Multiple templates'],
    popular: true,
  },
  {
    tier: 'ultimate',
    name: 'Ultimate',
    price: '$12.99',
    desc: '1 credit — CV + CL + Interview',
    icon: Crown,
    color: 'from-amber-500 to-orange-600',
    features: ['Everything in Pro', '5 Interview Q&A', 'Salary insights', 'Resume distribution', 'Dedicated support', 'Lifetime access'],
    popular: false,
  },
];

export default function DashboardPricing() {
  const handleCheckout = async (tier: string) => {
    try {
      const res = await api.get(`/billing/checkout/${tier}`);
      window.location.href = res.data.checkout_url;
    } catch (err) {
      console.error('Checkout failed', err);
      alert('Checkout is temporarily unavailable. Please try again later.');
    }
  };

  return (
    <DashboardLayout activeKey="pricing">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Upgrade Your Career</h1>
        <p className="text-slate-500 max-w-lg mx-auto">Choose the plan that suits you. Each credit unlocks full access to your AI-generated documents and career tools.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {PLANS.map(plan => (
          <div key={plan.tier} className={`relative bg-white rounded-2xl border shadow-sm flex flex-col overflow-hidden transition-shadow hover:shadow-lg ${plan.popular ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'}`}>
            {plan.popular && (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center text-xs font-bold py-1.5">
                ⭐ MOST POPULAR
              </div>
            )}

            <div className="p-6 flex-1 flex flex-col">
              {/* Icon + name */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                  <plan.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{plan.name}</h3>
                  <p className="text-xs text-slate-400">{plan.desc}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-5">
                <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="text-sm text-slate-400 ml-1">/ credit</span>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button onClick={() => handleCheckout(plan.tier)}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${plan.popular
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-md'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}>
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> Buy {plan.name}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-8 mt-10 text-sm text-slate-400">
        <span>🔒 Secure checkout</span>
        <span>💳 Powered by Stripe</span>
        <span>⚡ Instant delivery</span>
      </div>
    </DashboardLayout>
  );
}
