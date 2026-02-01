import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ScheduleAndShiurim from '@/components/ScheduleAndShiurim';
import RoshBeitMidrash from '@/components/RoshBeitMidrash';
import RabbisSection from '@/components/RabbisSection';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <ScheduleAndShiurim />
        <RoshBeitMidrash />
        <RabbisSection />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
