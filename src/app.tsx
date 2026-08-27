import { useState, useEffect } from 'preact/hooks';
import { Navbar } from './pages/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DocsPage } from './pages/DocsPage';
import { UiLabPage } from './pages/UiLabPage';
import { ReactNextGuidePage } from './pages/ReactNextGuidePage';
import './pages/pages.css';

type Route = '/' | '/docs' | '/ui-lab' | '/react-next-guide';

function getRoute(): Route {
  const hash = window.location.hash || '#/';
  if (hash === '#/' || hash === '#') return '/';
  if (hash.startsWith('#/ui-lab')) return '/ui-lab';
  if (hash.startsWith('#/react-next-guide')) return '/react-next-guide';
  if (hash.startsWith('#/home')) return '/';
  if (hash.startsWith('#/docs')) return '/docs';
  return '/';
}

export function App() {
  const [route, setRoute] = useState<Route>(getRoute());
  const [hash, setHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRoute());
      setHash(window.location.hash || '#/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <div class="page-shell">
      <div class="page-bg" />
      <Navbar currentHash={hash} />

      {route === '/' && <LandingPage />}
      {route === '/ui-lab' && <UiLabPage />}
      {route === '/docs' && <DocsPage />}
      {route === '/react-next-guide' && <ReactNextGuidePage />}
    </div>
  );
}
