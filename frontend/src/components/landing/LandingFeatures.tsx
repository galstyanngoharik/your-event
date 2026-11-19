import { CalendarDays, CheckSquare, Wallet, Users, Mail, Heart, MessageCircle, Store } from 'lucide-react';

const features = [
  {
    title: 'Events',
    description: 'Create and manage your special events.',
    icon: CalendarDays,
  },
  {
    title: 'Tasks',
    description: 'Stay organized every step of the way.',
    icon: CheckSquare,
  },
  {
    title: 'Budget',
    description: 'Keep track of your event expenses.',
    icon: Wallet,
  },
  {
    title: 'Guests',
    description: 'Manage your guest list with ease.',
    icon: Users,
  },
  {
    title: 'Invitations',
    description: 'Send invitations and collect RSVPs.',
    icon: Mail,
  },
  {
    title: 'Favorites',
    description: 'Save the services you love.',
    icon: Heart,
  },
  {
    title: 'Specialists',
    description: 'Find the right professionals for your event.',
    icon: Store,
  },
  {
    title: 'Messages',
    description: 'Connect with service providers.',
    icon: MessageCircle,
  },
];

export default function LandingFeatures() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#B77886]">
            Made for Every Moment
          </p>

          <h2 className="font-serif text-4xl md:text-5xl">
            All the Tools for a Perfect Event
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-[#351018]/65">
            Everything you need to plan, organize, and celebrate
            with confidence.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-[#351018]/5 bg-white p-7 text-center shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2D9DC] transition-transform duration-300 group-hover:scale-110">
                  <Icon size={27} strokeWidth={1.5} />
                </div>

                <h3 className="font-serif text-xl">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#351018]/65">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
