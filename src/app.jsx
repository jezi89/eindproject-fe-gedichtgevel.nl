import './App.css';
import {Outlet, useLocation} from "react-router-dom"; // Import Outlet
import NavBar from "./layouts/NavBar/NavBar.jsx";
// import StatusBanner from "@/layouts/StatusBanner/StatusBanner.jsx";
import styles from "@/styles/pageStylesTemp.module.css";


function App() {
    const location = useLocation();
    const isHomePage = location.pathname === "/"

    return (
        <div className={"AppLayoutStyles"}>
            <NavBar/>
            <div className={styles.pageContainer}>
                <Outlet/> // Placeholder required to let React Router know where to render the child routes
            </div>
            {/*{isHomePage && <StatusBanner/>}*/}
        </div>
    );
}
