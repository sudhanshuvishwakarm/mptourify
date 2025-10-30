import HomeAbout from '@/components/HomeAbout';
import HomeHero from '@/components/HomeHero';
import HomeMpOverview from '@/components/HomeMpOverview';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const h = useTranslations('HomePage');
  const n = useTranslations('Navigation');
  const colors = {
    saffron: '#F3902C',
    green: '#339966',
    skyBlue: '#33CCFF',
    white: '#FFFFFF',
    lightGray: '#FFF7EB',
    darkGray: '#333333'
  };
  return (
    <>
      <HomeHero/>
      <HomeAbout/>
      <HomeMpOverview/>
    </>
  );
}