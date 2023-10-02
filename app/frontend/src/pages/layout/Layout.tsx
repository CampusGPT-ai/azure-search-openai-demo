import { useState, useEffect } from "react";
import { Outlet, NavLink, Link, useOutletContext } from "react-router-dom";
import { Persona, Subtitle2 } from "@fluentui/react-components";
import seal from "../../assets/fsu-seal-3d-160x160.png";
import avatar from "../../assets/avatars/reinhold.png";
import { Image, ImageFit } from "@fluentui/react";

import styles from "./Layout.module.css";
import { ProfileModel, currentProfileApi } from "../../api";
import dylan from "../../assets/avatars/dylan.png";
import jamal from "../../assets/avatars/jamal.png";
import tiffany from "../../assets/avatars/tiffany.png";
//TODO: serve images from API
import { FluentProvider, teamsLightTheme, BrandVariants, Theme, createDarkTheme, createLightTheme } from "@fluentui/react-components";

const avatarImages: Record<string, string> = {
    dylan,
    jamal,
    tiffany
};
const demoTheme: BrandVariants = {
    10: "#020404",
    20: "#101A1D",
    30: "#152B32",
    40: "#173842",
    50: "#194653",
    60: "#195464",
    70: "#186276",
    80: "#167188",
    90: "#10809B",
    100: "#038FAE",
    110: "#389DB9",
    120: "#5CAAC3",
    130: "#79B7CC",
    140: "#93C5D6",
    150: "#ADD2DF",
    160: "#C6DFE9"
};

const lightTheme: Theme = {
    ...createLightTheme(demoTheme)
};

const darkTheme: Theme = {
    ...createDarkTheme(demoTheme)
};

const currentTheme: Theme = lightTheme;

//  darkTheme.colorBrandForeground1 = demoTheme[110];
//  darkTheme.colorBrandForeground2 = demoTheme[120];

const Layout = () => {
    /*
    fetch profile
    capture logged in user in state
    log it
    */
    const [loggedInUser, setLoggedInUser] = useState<ProfileModel | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    // TODO: this is a hack to get the current user loaded in the layout component; need to find a way to load it once in layout and then pass it down to the other components
    const makeCurrentUserApiRequest = async () => {
        setIsLoading(true);
        try {
            const result = await currentProfileApi();
            console.log("Current user: " + result);
            setLoggedInUser(result.profile);
            console.log("Loaded user in layout component: " + loggedInUser);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        makeCurrentUserApiRequest();
    }, []);

    useEffect(() => {
        console.log("detected change in loggedInUser in layout: " + loggedInUser?.full_name);
    }, [loggedInUser]);

    return (
        <FluentProvider theme={lightTheme}>
            <div className={styles.layout}>
                <header className={styles.header} role={"banner"}>
                    <div className={styles.headerContainer}>
                        <div
                            id="centerImage"
                            style={{ width: "60px", height: "60px", position: "fixed", left: "55%", top: "50px", transform: "translateX(-50%)", zIndex: 5 }}
                        >
                            <Image src={seal} alt="FSU seal" width={60} height={60} imageFit={ImageFit.cover} />
                        </div>

                        <Link to="/" className={styles.headerTitleContainer}>
                            <h3 className={styles.headerTitle}>Welcome to your co-pilot</h3>
                        </Link>

                        <nav>
                            <ul className={styles.headerNavList}>
                                <li>
                                    <NavLink to="/profile" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                        <div className={styles.profileBox}>
                                            <span className={styles.avatar}>{loggedInUser?.full_name}</span>

                                            {loggedInUser?.avatar ? (
                                                <img
                                                    src={avatarImages[loggedInUser.avatar]}
                                                    alt="User Avatar"
                                                    width={60}
                                                    height={60}
                                                    style={{ borderRadius: "50%" }}
                                                />
                                            ) : (
                                                <span>LOGIN </span>
                                            )}
                                        </div>
                                    </NavLink>
                                </li>
                                <li className={styles.headerNavLeftMargin}>
                                    <NavLink to="/" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                        Chat
                                    </NavLink>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </header>

                <Outlet />
            </div>
        </FluentProvider>
    );
};

export default Layout;
