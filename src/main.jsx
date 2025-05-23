import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.scss';
import App from './App.jsx';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {AuthProvider} from './context/auth/AuthProvider';

// Import Page Components
import {HomePage} from "./pages/Home/HomePage.jsx";
import {DesignPage} from "./pages/Design/DesignPage.jsx";
import {CollectionPage} from "../../../Eindopdracht-FE-old-REFERENCE/src/pages/Collections/CollectionPage.jsx";
import {AudioPage} from "./pages/Audio/AudioPage.jsx";
import {AboutPage} from "../../../Eindopdracht-FE-old-REFERENCE/src/pages/About/AboutPage.jsx";
import {AccountPage} from "./pages/Account/AccountPage.jsx";
import {LoginAndRegisterPage} from "./pages/LoginAndSignup/LoginAndRegisterPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx"; // Verify path
// Using createBrowserRouter for React Router v6.4+ because it allows for better data loading and route management
const router = createBrowserRouter([

    {
        path: "/",
        element: <App/>,
        children: [
            {
                index: true, // Homepage is default child route
                element: <HomePage/>
            },
            {
                path: "/designgevel",
                element: <DesignPage/>
            },
            {
                path: "/spreekgevel",
                element: <AudioPage/>
            },
            {
                path: "collectiegevel",
                element: <CollectionPage/>,
            },
            {
                path: "overmij",
                element: <AboutPage/>,
            },
            {
                path: "account",
                element: <ProtectedRoute><AccountPage/></ProtectedRoute>,
            },
            {
                path: "welkom",
                element: <LoginAndRegisterPage/>,
            },
            // Add other child routes here
        ],
    },
    // I can define other top-level routes here if App shouldn't be their layout
]);

// Create a root element for React to render into
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <RouterProvider router={router}/>
        </AuthProvider>
    </StrictMode>,
);
