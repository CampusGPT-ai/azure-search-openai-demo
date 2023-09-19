import { Outlet, NavLink, Link } from "react-router-dom";
import { Persona } from "@fluentui/react-components";
import * as React from "react";
import type { PersonaProps } from "@fluentui/react-components";
import github from "../../assets/github.svg";

import styles from "./Layout.module.css";

const Layout = () => {
    return (
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
    );
};

export default Layout;
