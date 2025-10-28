import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function HomePage() {
  const h = useTranslations('HomePage');
  const n = useTranslations('Navigation');
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>{h('title')}</h1>
      <p>{h('description')}</p>
      <p>{n('home')}</p>

    </div>
  );
}