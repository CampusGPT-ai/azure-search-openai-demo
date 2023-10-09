import { useState, useEffect, useContext, ContextType, useRef } from "react";
import { Outlet, NavLink, Link, useOutletContext } from "react-router-dom";
import seal from "../../assets/fsu-seal-3d-160x160.png";
import { Image, ImageFit } from "@fluentui/react";
import { Popover, PopoverTrigger, PopoverSurface } from "@fluentui/react-components";
import { CaretDown24Filled } from "@fluentui/react-icons";
import { UserContext, TopicContext } from "../../contextVariables";
import { ProfilePopover } from "../../components/ProfilePopover/ProfilePopover";

import styles from "./Layout.module.css";
import { InterestModel, ProfileModel, TopicModel, currentProfileApi, topicsAllApi } from "../../api";
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
    10: "#050202",
    20: "#221215",
    30: "#3B1B21",
    40: "#4F222B",
    50: "#642936",
    60: "#793041",
    70: "#84404E",
    80: "#90505C",
    90: "#9B606A",
    100: "#A67078",
    110: "#B08087",
    120: "#BB9096",
    130: "#C6A0A5",
    140: "#D0B1B5",
    150: "#DBC2C5",
    160: "#E5D3D5"
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
    const [showProfile, setShowProfile] = useState<boolean>(false);
    const [profilePopAnchor, setProfilePopAnchor] = useState<SVGSVGElement | null>(null);

    const makeCurrentUserApiRequest = async () => {
        console.log("logging in user for profile: " + selectedProfile); //this is logging "none"
        setIsLoading(true);
        try {
            const result = await currentProfileApi(selectedProfile);
            setLoggedInUser(result.profile);
        } catch (e) {
            console.log("no user logged in - keeping default profile with: " + user?.avatar);
        } finally {
            setIsLoading(false);
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

    useEffect(() => {
        setUser(user);
        setLoggedInUser(user);
        setShowProfile(false);
    }, [user]);

    type ContextType = { showProfile: boolean };
    const profilePopButtonRef = useRef(null);

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
                                    <div className={styles.profileBox}>

                                          {selectedProfile != "none" && loggedInUser?.avatar ? (
                                            <>
                                            <span className={styles.avatar}>{loggedInUser?.full_name}</span>

                                     
                                            
                                                {loggedInUser?.avatar && (
                                                    <>
                                                        <img
                                                            src={avatarImages[loggedInUser.avatar]}
                                                            alt="User Avatar"
                                                            width={50}
                                                            height={50}
                                                            style={{ borderRadius: "50%" }}
                                                        />
                                                        <CaretDown24Filled
                                                            ref={profilePopButtonRef}
                                                            style={{ marginLeft: "6px" }}
                                                            onClick={() => {
                                                                console.log("button ref" + profilePopButtonRef.current);
                                                                setProfilePopAnchor(profilePopButtonRef.current);
                                                                if (showProfile) setShowProfile(false);
                                                                else setShowProfile(true);
                                                            }}
                                                        />
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <NavLink
                                                to="/profile"
                                                className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}
                                            >
                                                <span>Click to login </span>
                                            </NavLink>
                                        )}
                                    </div>
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

                <Outlet context={{ showProfile, profilePopAnchor }} />
            </div>
        </FluentProvider>
    );
};

export function useShowProfile() {
    return useOutletContext<{ showProfile: boolean }>();
}

export function useProfilePopAnchor() {
    return useOutletContext<{ profilePopAnchor: SVGSVGElement }>();
}

export default Layout;
