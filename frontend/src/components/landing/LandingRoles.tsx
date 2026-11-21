import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function LandingRoles({ openImage }: { openImage: (source: string) => void }) {
  return (
    <section id="roles" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#B77886]">
            One Platform, Two Possibilities
          </p>

          <h2 className="font-serif text-4xl md:text-5xl">
            Designed Around You
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-[#351018] text-white">
            
          <button
          type="button"
          onClick={() => openImage('../../images/organizer.png')}
          aria-label="Enlarge organizer photo"
          className="group flex h-[420px] w-full cursor-zoom-in items-center justify-center overflow-hidden bg-[#351018]"
          >
          <img
              src="../../images/organizer.png"
              alt="Event organizer inspiration"
              className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
          />
          </button>


            <div className="p-8">
              <h3 className="font-serif text-3xl">
                For Organizers
              </h3>

              <p className="mt-4 leading-7 text-white/75">
                Create memorable events, discover the right
                services, manage your budget and guest list,
                and keep every detail under control.
              </p>

              <Link
                to="/register"
                className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-sm transition-all duration-300 hover:bg-white hover:text-[#351018]"
              >
                Start Planning <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div data-theme-preserve className="overflow-hidden rounded-2xl bg-[#F2D9DC] text-[#351018]">
            <button
              type="button"
              onClick={() => openImage('../../images/provider.png')}
              aria-label="Enlarge provider photo"
                className="group flex h-[420px] w-full cursor-zoom-in items-center justify-center overflow-hidden bg-[#351018]"
            >
              <img
                src="../../images/provider.png"
                alt="Creative event service provider"
                className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </button>

            <div className="p-8">
              <h3 className="font-serif text-3xl">
                For Service Providers
              </h3>

              <p className="mt-4 leading-7 text-[#351018]/75">
                Showcase your services, connect with potential
                clients, share your expertise, and grow your
                business through meaningful opportunities.
              </p>

              <Link
                to="/register?role=provider"
                className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#351018] px-6 py-3 text-sm transition-all duration-300 hover:bg-[#351018] hover:text-white"
              >
                Join as a Provider <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
