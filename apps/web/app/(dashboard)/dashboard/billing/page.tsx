import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserTier, FLAG_LIMITS } from '@/lib/tier';
import { getDb, flags, projects, eq, count } from '@featurekit/db';
import { PLANS } from '@/lib/stripe';
import BillingActions from './billing-actions';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const tier = await getUserTier(session.user.id);
  const db = getDb();
  const userProjects = await db.select().from(projects).where(eq(projects.userId, session.user.id));
  const flagLimit = FLAG_LIMITS[tier];

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">Billing</h1>

      {/* Current Plan */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-sm text-gray-400">Current Plan</div>
            <div className="text-2xl font-bold text-white capitalize mt-1">{tier}</div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            tier === 'free' ? 'bg-gray-800 text-gray-300' : 'bg-violet-900/40 text-violet-300'
          }`}>
            {tier === 'free' ? 'Free' : `$${PLANS[tier as 'pro' | 'business'].price}/mo`}
          </div>
        </div>
        <div className="text-sm text-gray-400">
          Flags: {flagLimit === Infinity ? 'Unlimited' : `${flagLimit} per project`} · 
          Projects: {userProjects.length}
        </div>
      </div>

      {/* Upgrade Options */}
      {tier === 'free' && (
        <div className="grid grid-cols-2 gap-4">
          {(['pro', 'business'] as const).map((planKey) => {
            const plan = PLANS[planKey];
            return (
              <div key={planKey} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="font-bold text-white text-lg capitalize">{planKey}</div>
                <div className="text-3xl font-bold text-violet-400 mt-2">${plan.price}<span className="text-base font-normal text-gray-400">/mo</span></div>
                <ul className="mt-4 space-y-2 text-sm text-gray-400">
                  <li>✅ Unlimited flags</li>
                  <li>✅ Unlimited projects</li>
                  <li>✅ Targeting rules</li>
                  {planKey === 'business' && <li>✅ Priority support</li>}
                </ul>
                <BillingActions tier={planKey} />
              </div>
            );
          })}
        </div>
      )}

      {tier !== 'free' && (
        <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-6 text-green-300">
          ✅ You&apos;re on the {tier} plan — unlimited flags & projects!
        </div>
      )}
    </div>
  );
}
