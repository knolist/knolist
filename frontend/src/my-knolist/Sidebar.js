import React from "react";
import { Sidenav, Icon, Nav } from "rsuite";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div style={{ width: "17vw", borderRight: "1px solid gray" }}>
      <Sidenav defaultOpenKeys={['3', '4']} activeKey="1"
        style={{ height: "100vh", fontFamily: "Poppins", paddingTop: "4vh", backgroundColor: "white" }}>
        <Sidenav.Body>
          <Nav style={{ color: "#ffffff" }}>
            <Nav.Item eventKey="1" icon={<Icon icon="project" />}>
              My Projects
            </Nav.Item>
            <NavLink to="/shared">
              <Nav.Item eventKey="2" icon={<Icon icon="people-group" />}>
                Shared with me
              </Nav.Item>
            </NavLink>
            <NavLink to="/archive">
              <Nav.Item eventKey="3" icon={<Icon icon="archive" />}>
                Archived
              </Nav.Item>
            </NavLink>
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </div>
  );
}

export default Sidebar;