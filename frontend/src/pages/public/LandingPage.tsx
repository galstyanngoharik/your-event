
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckSquare,
  Wallet,
  Users,
  Mail,
  Heart,
  MessageCircle,
  Store,
  X,
} from 'lucide-react';

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

export default function LandingPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedImage]);

  const openImage = (src: string) => setSelectedImage(src);

  const imageClass =
    'h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105';

  return (
    <div className="min-h-screen bg-[#FFF8F1] text-[#351018]">

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-[#351018]/10 bg-[#FFF8F1]/95 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="font-serif text-3xl font-bold">
            YourEvent
          </Link>

          <div className="hidden items-center gap-8 text-sm md:flex">
            <a href="#about" className="transition-colors hover:text-[#B77886]">
              About
            </a>
            <a href="#features" className="transition-colors hover:text-[#B77886]">
              Features
            </a>
            <a href="#roles" className="transition-colors hover:text-[#B77886]">
              Who It's For
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-full border border-[#351018] px-5 py-2 text-sm transition-all duration-300 hover:bg-[#351018] hover:text-white"
            >
              Log In
            </Link>

            <Link
              to="/register"
              className="hidden rounded-full bg-[#351018] px-5 py-2 text-sm text-white transition-all duration-300 hover:scale-105 hover:bg-[#57202C] sm:block"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-20 text-center">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-[#B77886]">
          Welcome to YourEvent
        </p>

        <h1 className="mx-auto max-w-4xl font-serif text-5xl leading-tight md:text-7xl">
          Plan. Create.
          <br />
          <span className="italic text-[#A96D79]">Celebrate.</span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#351018]/70 md:text-lg">
          YourEvent is an all-in-one platform for planning unforgettable
          events. From intimate gatherings to grand celebrations,
          bring every detail together in one beautiful place.
        </p>

        {/* CENTERED GET STARTED */}
        <div className="mt-9 flex justify-center">
          <Link
            to="/register"
            className="group inline-flex items-center gap-3 rounded-full bg-[#351018] px-9 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#57202C] hover:shadow-xl"
          >
            Get Started
            <ArrowRight
              size={19}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* HERO IMAGE - RECTANGULAR */}
        
{/* HERO IMAGES - THREE VERTICAL PHOTOS */}
        <div className="mt-16 grid grid-cols-3 gap-3 md:gap-6">
        {[
            '../images/hero1.jpeg',
            '../images/hero2.jpeg',
            '../images/hero3.jpeg',
        ].map((image, index) => (
            <button
            key={image}
            type="button"
            onClick={() => openImage(image)}
            aria-label={`Enlarge celebration photo ${index + 1}`}
            className="group aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-2xl shadow-xl"
            >
            <img
                src={image}
                //alt={`Elegant event inspiration ${index + 1}`}
                className={imageClass}
            />
            </button>
        ))}
        </div>

      </section>

      {/* ABOUT */}
      <section id="about" className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 md:grid-cols-2">
          {/* ABOUT IMAGE - RECTANGULAR */}
          <button
            type="button"
            onClick={() => openImage('../images/about.png')}
            aria-label="Enlarge event photo"
            className="group flex w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl bg-[#F5EFF0] shadow-lg"
          >
            <img
              src="/images/about.png"
              alt="Beautifully decorated event"
              className={imageClass}
            />
          </button>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#B77886]">
              What is YourEvent?
            </p>

            <h2 className="font-serif text-4xl leading-tight md:text-5xl">
              Everything you need
              <br />
              for your special day.
            </h2>

            <p className="mt-6 leading-8 text-[#351018]/70">
              Planning an event should feel exciting, not overwhelming.
              YourEvent helps you organize your ideas, manage important
              details, and turn your vision into reality.
            </p>

            <p className="mt-4 leading-8 text-[#351018]/70">
              Discover services, organize your budget, track tasks,
              invite guests, and communicate with providers — all
              from one convenient platform.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
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

      {/* ORGANIZERS & PROVIDERS */}
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

            <div className="overflow-hidden rounded-2xl bg-[#F2D9DC]">
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
                  to="/register"
                  className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#351018] px-6 py-3 text-sm transition-all duration-300 hover:bg-[#351018] hover:text-white"
                >
                  Join as a Provider <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="bg-[#351018] py-24 text-white">
        <div className="mx-auto flex max-w-7xl justify-center px-6">

          
        <div className="flex w-full max-w-3xl flex-col items-center justify-center text-center">
        <h2 className="w-full text-center font-serif text-4xl leading-tight md:text-5xl">
            Ready to Create
            <br />
            Something Beautiful?
        </h2>

        <p className="mx-auto mt-6 max-w-md leading-8 text-white/75">
            Join YourEvent today and turn your vision
            into a memorable experience.
        </p>

        <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#F2D9DC] px-8 py-4 font-medium text-[#351018] transition-all duration-300 hover:-translate-y-1 hover:bg-white"
        >
            Get Started <ArrowRight size={19} />
        </Link>
        </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#FFF8F1] px-6 py-8 text-center">
        <p className="font-serif text-2xl">YourEvent</p>
        <p className="mt-2 text-sm text-[#351018]/55">
          Every moment deserves to be unforgettable.
        </p>
      </footer>

      {/* IMAGE LIGHTBOX */}
      {selectedImage && (
        <div
          role="presentation"
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            aria-label="Close enlarged image"
            className="absolute right-6 top-6 rounded-full bg-white/15 p-3 text-white transition-colors hover:bg-white/30"
          >
            <X size={26} />
          </button>

          <img
            src={selectedImage}
            alt="Enlarged event photography"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
