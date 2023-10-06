import { useState, useEffect, useContext } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";

import seal from "../../assets/fsu-seal-3d-160x160.png";
import { Image, ImageFit } from "@fluentui/react";
import { UserContext, TopicContext } from "../../contextVariables";

import styles from "./Layout.module.css";
import { ProfileModel, currentProfileApi, topicsAllApi } from "../../api";
import dylan from "../../assets/avatars/dylan.png";
import jamal from "../../assets/avatars/jamal.png";
import tiffany from "../../assets/avatars/tiffany.png";
import reinhold from "../../assets/avatars/reinhold.png";
//TODO: serve images from API
import { FluentProvider, Theme, BrandVariants, createDarkTheme, createLightTheme } from "@fluentui/react-components";

const avatarImages: Record<string, string> = {
    dylan,
    jamal,
    tiffany,
    reinhold
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
    const { setUser } = useContext(UserContext);
    const { user } = useContext(UserContext);
    const { selectedProfile, setSelectedProfile } = useContext(UserContext);
    const { setTopics } = useContext(TopicContext);
    const [loggedInUser, setLoggedInUser] = useState<ProfileModel | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    const makeCurrentUserApiRequest = async () => {
        console.log("logging in user for profile: " + selectedProfile); //this is logging "none"
        if (selectedProfile !== "none") {
            setIsLoading(true);
            try {
                const result = await currentProfileApi();
                setLoggedInUser(result.profile);
            } catch (e) {
                console.log("no user logged in - keeping default profile with: " + user?.avatar);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const makeTopicApiRequest = async () => {
        setIsLoading(true);
        try {
            const result = await topicsAllApi();
            setTopics(result.topic);
            console.log("got topics from API: " + JSON.stringify(result));
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log("detected change in selected profile - reinitializing data");
        makeCurrentUserApiRequest();
        makeTopicApiRequest();
    }, [selectedProfile]);

    useEffect(() => {
        //console.log("detected change in loggedInUser in layout: " + loggedInUser?.full_name);
        setUser(loggedInUser);
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
                                            <span className={styles.avatar}>{user?.full_name}</span>

                                            {user?.avatar ? (
                                                <img src={avatarImages[user.avatar]} alt="User Avatar" width={60} height={60} style={{ borderRadius: "50%" }} />
                                            ) : (
                                                <span>Click to login </span>
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
