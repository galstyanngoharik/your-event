import LandingHeader from '../../components/landing/LandingHeader';
import LandingFeatures from '../../components/landing/LandingFeatures';
import LandingRoles from '../../components/landing/LandingRoles';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  X,
} from 'lucide-react';

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
    <div className="ye-ui ye-landing min-h-screen bg-[#FFF8F1] text-[#351018]">

      {/* NAVBAR */}
      <LandingHeader />

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
      <section id="about" className="bg-[#351018] py-24 text-white">
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
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-white">
              What is YourEvent?
            </p>

            <h2 className="font-serif text-4xl leading-tight md:text-5xl">
              Everything you need
              <br />
              for your special day.
            </h2>

            <p className="mt-6 leading-8 text-white">
              Planning an event should feel exciting, not overwhelming.
              YourEvent helps you organize your ideas, manage important
              details, and turn your vision into reality.
            </p>

            <p className="mt-4 leading-8 text-white">
              Discover services, organize your budget, track tasks,
              invite guests, and communicate with providers — all
              from one convenient platform.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <LandingFeatures />

      {/* ORGANIZERS & PROVIDERS */}
      <LandingRoles openImage={openImage} />

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
