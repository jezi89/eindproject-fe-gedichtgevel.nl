import React from 'react';
import ReactDOM from 'react-dom/client';
// Using createBrowserRouter for React Router v6.4+ because it allows for better data loading and route management
import {createBrowserRouter, RouterProvider} from 'react-router';
import {AuthProvider} from './context/auth/AuthProvider';
import App from './App.jsx';

// Import Page Components
import {HomePage} from './pages/Home/HomePage.jsx';
import {DesignPage} from './pages/Design/DesignPage.jsx';
import {CollectionPage} from './pages/Collections/CollectionPage.jsx';
import {AudioPage} from './pages/Audio/AudioPage.jsx';
import {AboutPage} from './pages/About/AboutPage.jsx';
import {AccountPage} from './pages/Account/AccountPage.jsx';
import {LoginAndSignupPage} from './pages/Auth/LoginAndSignup/LoginAndSignupPage.jsx';
import PasswordResetPage from './pages/Auth/PasswordResetPage.jsx';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage.jsx';
import AuthCallback from './pages/Auth/LoginAndSignup/AuthCallback.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>,
        children: [
            {index: true, element: <HomePage/>},
            {path: 'designgevel', element: <DesignPage/>},
            {path: 'spreekgevel', element: <AudioPage/>},
            {path: 'collectiegevel', element: <CollectionPage/>},
            {path: 'overmij', element: <AboutPage/>},

            // Add other child routes here

            {
                path: 'account',
                element: <ProtectedRoute><AccountPage/></ProtectedRoute>
            },
            {path: 'welkom', element: <LoginAndSignupPage/>},
            {path: 'login', element: <LoginAndSignupPage/>},
            {path: 'password-reset', element: <PasswordResetPage/>},
            {path: 'reset-password', element: <ResetPasswordPage/>},
        ]
        // I can define other top-level routes here if App shouldn't be their layout
    },
    // AuthCallback outside the main layout
    {path: 'auth/callback', element: <AuthCallback/>},
]);
// TODO checken of dit React 18+ of React 19 syntax specifiek is
// Create the root element for React 18+
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <RouterProvider router={router}/>
        </AuthProvider>
    </React.StrictMode>,
);