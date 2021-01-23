import React from "react";
import horizontalLogo from "../images/horizontal_main.png";
import SearchBar from "../components/SearchBar.js";
import { Navbar, FlexboxGrid, Dropdown, Icon } from "rsuite";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

/*
  Renders header logo, search bar, settings/logout

  Changes in sorting/search bar changes state in parent component (Page)
*/
function Header(props) {
  const { logout } = useAuth0();

  if (props.showSearch) {
    return (
      <Navbar style={{ padding: "0 10px", borderBottom: ".1px solid #ededf0" }}>
        <FlexboxGrid justify="space-between" align="middle">
          <Link to="/my-projects">
            <Navbar.Header>
              <img className="limit-height" src={horizontalLogo} alt="Knolist" />
            </Navbar.Header>
          </Link>
          <FlexboxGrid.Item colspan={13}>
            <FlexboxGrid>
              <FlexboxGrid.Item><SearchBar width={"40vw"} setSearchQuery={props.setSearchQuery} /></FlexboxGrid.Item>
              <FlexboxGrid.Item>
                <Dropdown title={"Sort by: " + props.sortCriterion} activeKey={props.sortCriterion}>
                  <Dropdown.Item
                    eventKey="Newest"
                    onSelect={() => props.setSortCriterion("Newest")}>
                    Newest
                </Dropdown.Item>
                  <Dropdown.Item
                    eventKey="Oldest"
                    onSelect={() => props.setSortCriterion("Oldest")}>
                    Oldest
                </Dropdown.Item>
                  <Dropdown.Item
                    eventKey="A-Z"
                    onSelect={() => props.setSortCriterion("A-Z")}>
                    A-Z
                </Dropdown.Item>
                  <Dropdown.Item
                    eventKey="Z-A"
                    onSelect={() => props.setSortCriterion("Z-A")}>
                    Z-A
                </Dropdown.Item>
                </Dropdown>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item>
            <Dropdown noCaret icon={<Icon icon="user" size={"lg"} />} placement="bottomEnd">
              <Link to="/settings"><Dropdown.Item componentClass="span">Settings</Dropdown.Item></Link>
              <Dropdown.Item onClick={() => {
                logout({
                  returnTo: window.location.origin,
                });
              }}>Log out</Dropdown.Item>
            </Dropdown>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </Navbar>
    );
  } else {
    return (
      <Navbar style={{ padding: "0 10px", borderBottom: ".1px solid #ededf0" }}>
        <FlexboxGrid justify="space-between" align="middle">
          <Link to="/my-projects">
            <Navbar.Header>
              <img className="limit-height" src={horizontalLogo} alt="Knolist" />
            </Navbar.Header>
          </Link>
          <FlexboxGrid.Item>
            <Dropdown noCaret icon={<Icon icon="user" size={"lg"} />} placement="bottomEnd">
              <Link to="/settings"><Dropdown.Item componentClass="span">Settings</Dropdown.Item></Link>
              <Dropdown.Item onClick={() => {
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
}

export default Header;