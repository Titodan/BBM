import { daveningTimes } from '@/data/davening';
import { shiurim } from '@/data/shiurim';

export default function ScheduleAndShiurim() {
  // Group shiurim by time period
  const earlyMorning = shiurim.filter(s => s.id.includes('chabura'));
  const morningShiurim = shiurim.filter(s => 
    s.time.includes('AM') && !s.id.includes('chabura') && !s.isSpecial
  );
  const nightShiurim = shiurim.filter(s => 
    s.time.includes('PM') && !s.isSpecial
  );
  const specialWeekly = shiurim.filter(s => s.isSpecial);

  return (
    <section id="schedule" className="py-16 md:py-24 bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Daily Schedule
          </h2>
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto">
            Join us for davening and Torah learning throughout the day
          </p>
        </div>

        {/* Davening Times */}
        <div className="mb-12 md:mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-primary mb-6 md:mb-8 text-center">
            Davening Times
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {daveningTimes.map((davening) => (
              <div
                key={davening.id}
                className="bg-white rounded-xl shadow-lg p-6 md:p-8 border-2 border-secondary/20 hover:border-secondary transition-all duration-300"
              >
                <div className="text-center">
                  <h4 className="text-xl md:text-2xl font-bold text-primary mb-2">
                    {davening.name}
                  </h4>
                  <p className="text-lg md:text-xl font-semibold text-accent hebrew mb-3">
                    {davening.nameHebrew}
                  </p>
                  <div className="space-y-1">
                    {davening.times.map((time, idx) => (
                      <p key={idx} className="text-lg md:text-xl font-bold text-secondary">
                        {time}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Early Morning Chabura */}
        <div className="mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">
            Early Morning Chabura (2 Tracks)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            {earlyMorning.map((shiur) => (
              <ShiurCard key={shiur.id} shiur={shiur} />
            ))}
          </div>
        </div>

        {/* Morning Shiurim */}
        <div className="mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">
            Morning Shiurim
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {morningShiurim.map((shiur) => (
              <ShiurCard key={shiur.id} shiur={shiur} />
            ))}
          </div>
        </div>

        {/* Night Shiurim */}
        <div className="mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">
            Night Shiurim
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {nightShiurim.map((shiur) => (
              <ShiurCard key={shiur.id} shiur={shiur} />
            ))}
          </div>
        </div>

        {/* Special Weekly Shiurim */}
        <div className="mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">
            Special Weekly Shiurim
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {specialWeekly.map((shiur) => (
              <ShiurCard key={shiur.id} shiur={shiur} special />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ShiurCard({ shiur, special = false }: { shiur: any; special?: boolean }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-5 md:p-6 border-l-4 hover:shadow-xl transition-all duration-300 ${
        special ? 'border-accent' : 'border-secondary'
      }`}
    >
      {/* Title */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-lg md:text-xl font-bold text-primary flex-1">
            {shiur.title}
          </h4>
          {shiur.isNew && (
            <span className="bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">
              NEW
            </span>
          )}
        </div>
        {shiur.titleHebrew && (
          <p className="text-base md:text-lg text-accent font-semibold hebrew">
            {shiur.titleHebrew}
          </p>
        )}
      </div>

      {/* Rabbi */}
      <p className="text-sm md:text-base font-semibold text-secondary mb-2">
        {shiur.rabbi}
      </p>

      {/* Time */}
      <p className="text-base md:text-lg font-bold text-foreground mb-2">
        {special && shiur.dayOfWeek && (
          <span className="text-primary">{shiur.dayOfWeek} </span>
        )}
        {shiur.time}
      </p>

      {/* Topic/Location */}
      {shiur.topic && (
        <p className="text-sm text-foreground/70 italic mb-1">
          {shiur.topic}
        </p>
      )}
      {shiur.location && (
        <p className="text-xs md:text-sm text-foreground/60 mt-2">
          📍 {shiur.location}
        </p>
      )}

      {/* Days (for regular shiurim) */}
      {shiur.days && !special && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-foreground/60">
            {shiur.days.join(' • ')}
          </p>
        </div>
      )}
    </div>
  );
}
