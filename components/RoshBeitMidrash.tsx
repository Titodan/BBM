import Image from 'next/image';
import { rabbis } from '@/data/rabbis';

export default function RoshBeitMidrash() {
  const roshBeitMidrash = rabbis.find(r => r.isRosh);

  if (!roshBeitMidrash) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Rosh Beit Midrash
          </h2>
        </div>

        {/* Featured Rabbi Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-0">
            {/* Photo Section */}
            <div className="lg:col-span-2 bg-gradient-to-br from-secondary/10 to-accent/10 flex items-center justify-center p-8 lg:p-12">
              <div className="relative w-64 h-64 lg:w-72 lg:h-72 rounded-2xl overflow-hidden shadow-xl bg-primary/20 flex items-center justify-center">
                {roshBeitMidrash.photo ? (
                  <Image
                    src={roshBeitMidrash.photo}
                    alt={roshBeitMidrash.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary mb-2">
                      {roshBeitMidrash.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="text-sm text-primary/60">
                      Photo Coming Soon
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="lg:col-span-3 p-8 lg:p-12">
              {/* Name */}
              <h3 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                {roshBeitMidrash.name}
              </h3>

              {/* Bio */}
              <div className="prose prose-lg max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {roshBeitMidrash.bio}
                </p>
              </div>

              {/* Shiurim */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-primary/70 uppercase tracking-wide mb-3">
                  Shiurim
                </h4>
                <div className="flex flex-wrap gap-2">
                  {roshBeitMidrash.shiurim.map((shiur, idx) => (
                    <span
                      key={idx}
                      className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      {shiur}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact */}
              {roshBeitMidrash.email && (
                <div className="pt-6 border-t border-gray-200">
                  <a
                    href={`mailto:${roshBeitMidrash.email}`}
                    className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors font-medium"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {roshBeitMidrash.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
