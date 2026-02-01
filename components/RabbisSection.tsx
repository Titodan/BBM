import Image from 'next/image';
import { rabbis } from '@/data/rabbis';

export default function RabbisSection() {
  // Get all rabbis except the Rosh Beit Hamidrash
  const otherRabbis = rabbis.filter(r => !r.isRosh);

  return (
    <section id="rabbis" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Our Rabbis
          </h2>
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto">
            Dedicated Torah scholars sharing their wisdom and knowledge
          </p>
        </div>

        {/* Rabbis Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {otherRabbis.map((rabbi) => (
            <div
              key={rabbi.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 hover:border-secondary hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Photo */}
              <div className="relative h-64 bg-gradient-to-br from-secondary/10 to-accent/10 overflow-hidden">
                {rabbi.photo ? (
                  <Image
                    src={rabbi.photo}
                    alt={rabbi.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary">
                        {rabbi.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Name */}
                <h3 className="text-xl md:text-2xl font-bold text-primary mb-3 text-center">
                  {rabbi.name}
                </h3>

                {/* Title */}
                {rabbi.title && (
                  <p className="text-sm text-secondary font-semibold mb-3 text-center">
                    {rabbi.title}
                  </p>
                )}

                {/* Shiurim */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-primary/70 uppercase tracking-wide mb-2 text-center">
                    Teaches
                  </h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {rabbi.shiurim.map((shiur, idx) => (
                      <span
                        key={idx}
                        className="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-xs font-semibold"
                      >
                        {shiur}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                {rabbi.bio && (
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    {rabbi.bio}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
