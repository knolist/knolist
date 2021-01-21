import React from "react";
import horizontalLogo from "../images/horizontal_main.png";
import SearchBar from "../components/SearchBar.js";
import { Navbar, FlexboxGrid, Dropdown, Icon } from "rsuite";
import { useAuth0 } from "@auth0/auth0-react";

function Header() {
    const { logout } = useAuth0();

    return (
        <Navbar style={{ padding: "0 10px", borderBottom: ".1px solid #ededf0" }}>
            <FlexboxGrid justify="space-between" align="middle">
                <Navbar.Header>
                    <img className="limit-height" src={horizontalLogo} alt="Knolist" />
                </Navbar.Header>
                <FlexboxGrid.Item colspan={12}>
                    <FlexboxGrid>
                        <FlexboxGrid.Item><SearchBar width={"40vw"} /></FlexboxGrid.Item>
                        <FlexboxGrid.Item>
                            <Dropdown title="Sort by">
                                <Dropdown.Item>Newest</Dropdown.Item>
                                <Dropdown.Item>Oldest</Dropdown.Item>
                                <Dropdown.Item>A-Z</Dropdown.Item>
                                <Dropdown.Item>Z-A</Dropdown.Item>
                            </Dropdown>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item>
                    <Dropdown noCaret icon={<Icon icon="user" size={"lg"} />} placement="bottomEnd">
                        <Dropdown.Item>Settings</Dropdown.Item>
                        <Dropdown.Item onClick={() => {
                            localStorage.removeItem("curProject");
                            logout({
                                returnTo: window.location.origin,
                            });
                        }}>Log out</Dropdown.Item>
                    </Dropdown>
                </FlexboxGrid.Item>
            </FlexboxGrid>
        </Navbar>
    );
}

export default Header;