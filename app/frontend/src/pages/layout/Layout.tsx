import { Outlet, NavLink, Link } from "react-router-dom";
import { Persona } from "@fluentui/react-components";

import github from "../../assets/github.svg";

import styles from "./Layout.module.css";

import { FluentProvider, teamsLightTheme, BrandVariants, Theme, createDarkTheme, createLightTheme } from "@fluentui/react-components";

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
    return (
        <FluentProvider theme={lightTheme}>
            <div className={styles.layout}>
                <header className={styles.header} role={"banner"}>
                    <div className={styles.headerContainer}>
                        <Link to="/" className={styles.headerTitleContainer}>
                            <h3 className={styles.headerTitle}>Welcome to your co-pilot</h3>
                        </Link>
                        <nav>
                            <ul className={styles.headerNavList}>
                                <li>
                                    <NavLink to="/profile" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                        Profile
                                    </NavLink>
                                </li>
                                <li className={styles.headerNavLeftMargin}>
                                    <NavLink to="/" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                        Chat
                                    </NavLink>
                                </li>
                            </ul>
                        </nav>
                        <Persona
                            textAlignment="center"
                            size="large"
                            name="Reinhold Staudinger"
                            avatar={{
                                image: {
                                    src: github
                                }
                            }}
                        />
                    </div>
                </header>

                <Outlet />
            </div>
        </FluentProvider>
    );
};

export default Layout;
