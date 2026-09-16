import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

// Imported through the package name rather than a relative path: this is the
// exact specifier a consuming project uses after
// `npm install github:imdreamrunner/astryx-information-maximalist-theme`, so the
// demo exercises the package's real `exports` contract. Here it resolves through
// the `file:..` dependency back to this repository's own `templates/`.
import InformationMaximalistPage from 'astryx-information-maximalist-theme/templates/information-maximalist.tsx';

const container = document.getElementById('root');
if (container == null) {
  throw new Error('Missing #root container');
}

createRoot(container).render(
  <StrictMode>
    <InformationMaximalistPage />
  </StrictMode>,
);
