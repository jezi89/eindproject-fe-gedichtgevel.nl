import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {createSyncStoragePersister} from '@tanstack/query-sync-storage-persister';
import {AuthProvider} from './context/auth/AuthProvider';
import App from './App.jsx';
import queryClient from './services/api/queryClient.js';
import {GlobalErrorBoundary} from './components/ErrorBoundary/GlobalErrorBoundary.jsx';
import {RouterErrorBoundary} from './components/ErrorBoundary/RouterErrorBoundary.jsx';
import {ProtectedRoute} from './components/ProtectedRoute.jsx';

// Lazy load page components for code splitting
const HomePage = lazy(() => import('./pages/Home/HomePage.jsx').then(m => ({ default: m.HomePage })));
const DesignPage = lazy(() => import('./pages/Design/DesignPage.jsx').then(m => ({ default: m.DesignPage })));
const CollectionPage = lazy(() => import('./pages/Collections/CollectionPage.jsx').then(m => ({ default: m.CollectionPage })));
const AudioPage = lazy(() => import('./pages/Audio/AudioPage.jsx').then(m => ({ default: m.AudioPage })));
const AboutPage = lazy(() => import('./pages/About/AboutPage.jsx').then(m => ({ default: m.AboutPage })));
const AccountPage = lazy(() => import('./pages/Account/AccountPage.jsx').then(m => ({ default: m.AccountPage })));
const LoginAndSignupPage = lazy(() => import('./pages/Auth/LoginAndSignup/LoginAndSignupPage.jsx').then(m => ({ default: m.LoginAndSignupPage })));
const PasswordResetPage = lazy(() => import('./pages/Auth/PasswordResetPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPasswordPage.jsx'));
const AuthCallback = lazy(() => import('./pages/Auth/LoginAndSignup/AuthCallBack.jsx'));
const ContactPage = lazy(() => import('./pages/Contact/ContactPage.jsx').then(m => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('./pages/FAQ/FAQPage.jsx').then(m => ({ default: m.FAQPage })));
const TermsPage = lazy(() => import('./pages/Terms/TermsPage.jsx').then(m => ({ default: m.TermsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage.jsx').then(m => ({ default: m.NotFoundPage })));

// Loading fallback component
const PageLoader = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#666'
    }}>
        Laden...
    </div>
);



// Create persister for L2 cache (localStorage)
const localStoragePersister = createSyncStoragePersister({
    storage: window.localStorage,
    key: 'GEDICHTGEVEL_QUERY_CACHE', // Custom key for this app
});

const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        errorElement: <RouterErrorBoundary />,
        children: [
            {index: true, element: <Suspense fallback={<PageLoader/>}><HomePage/></Suspense>},
            {path: "designgevel", element: <Suspense fallback={<PageLoader/>}><DesignPage/></Suspense>},
            {path: "designgevel/:poemId", element: <Suspense fallback={<PageLoader/>}><DesignPage/></Suspense>},
            {path: "canvas", element: <Suspense fallback={<PageLoader/>}><DesignPage/></Suspense>},
            {path: "canvas/:poemId", element: <Suspense fallback={<PageLoader/>}><DesignPage/></Suspense>},
            {path: "spreekgevel", element: <Suspense fallback={<PageLoader/>}><AudioPage/></Suspense>},
            {path: "collectiegevel", element: <Suspense fallback={<PageLoader/>}><CollectionPage/></Suspense>},
            {path: "overmij", element: <Suspense fallback={<PageLoader/>}><AboutPage/></Suspense>},
            {path: "contact", element: <Suspense fallback={<PageLoader/>}><ContactPage/></Suspense>},
            {path: "hoedan", element: <Suspense fallback={<PageLoader/>}><FAQPage/></Suspense>},
            {path: "voorwaarden", element: <Suspense fallback={<PageLoader/>}><TermsPage/></Suspense>},

            // Auth routes
            {
                path: "account",
                element: (
                    <Suspense fallback={<PageLoader/>}>
                        <ProtectedRoute>
                            <AccountPage/>
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
            {path: "welkom", element: <Suspense fallback={<PageLoader/>}><LoginAndSignupPage/></Suspense>},
            {path: "login", element: <Suspense fallback={<PageLoader/>}><LoginAndSignupPage/></Suspense>},
            {path: "password-reset", element: <Suspense fallback={<PageLoader/>}><PasswordResetPage/></Suspense>},
            {path: "reset-password", element: <Suspense fallback={<PageLoader/>}><ResetPasswordPage/></Suspense>},

            // 404 catch-all route - must be last
            {path: "*", element: <Suspense fallback={<PageLoader/>}><NotFoundPage/></Suspense>},
        ],
    },
    // AuthCallback outside the main layout
    {path: "auth/callback", element: <Suspense fallback={<PageLoader/>}><AuthCallback/></Suspense>},
]);

import {ToastProvider} from './context/ui/ToastContext.jsx';

// ... existing imports ...

// Create the root element for React 19
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GlobalErrorBoundary>
            <PersistQueryClientProvider
                client={queryClient}
                persistOptions={{persister: localStoragePersister}}
            >
                <AuthProvider>
                    <ToastProvider>
                        <RouterProvider router={router}/>
                    </ToastProvider>
                </AuthProvider>
            </PersistQueryClientProvider>
        </GlobalErrorBoundary>
    </React.StrictMode>,
);