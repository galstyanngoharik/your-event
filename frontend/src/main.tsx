import React from 'react';
import ReactDOM from 'react-dom/client';

import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import { store } from './app/store';
import { router } from './app/router';

import './index.css';
import './styles/premium.css';
import { applyThemeScope } from './features/theme/themeScope';

applyThemeScope(router.state.location.pathname);
const unsubscribeThemeScope = router.subscribe(({ location }) => applyThemeScope(location.pathname));
if (import.meta.hot) import.meta.hot.dispose(unsubscribeThemeScope);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);