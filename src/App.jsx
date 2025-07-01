import '@/App.scss';
import {Outlet, useLocation} from "react-router"; // Import Outlet
import NavBar from "@/layouts/NavBar/NavBar.jsx";
// import StatusBanner from "@/layouts/StatusBanner/StatusBanner.jsx";
// import styles from "@/styles/pageStylesTemp.module.css";


export default function App() {
    const location = useLocation();
    const isHomePage = location.pathname === "/"

    return (
        <div className="app">
            <NavBar/>
            <div className="app-content">
                <Outlet/> {/* Placeholder required to let React Router know where to render the child routes */}
            </div>
            {/*{isHomePage && <StatusBanner/>}*/}
        </div>
    );
}
