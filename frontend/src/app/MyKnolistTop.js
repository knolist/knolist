import React from "react";
import knolistIcon from "../images/KNOLISTICON.png";
import { Input, Dropdown } from "rsuite";
import { GiHamburgerMenu } from "react-icons/gi"

function MyKnolistTop(props) {
  return (
    <div className="myknolist-top-container">
      <div>
        <img className="myknolist-top-header-img" src={knolistIcon} alt="Knolist" />
      </div>
      <div>
        <Input placeholder="Search MyKnolist" className="myknolist-top-input" />
      </div>
      <div>
        <Dropdown noCaret icon={<GiHamburgerMenu />}
          className="myknolist-top-dropdown"
          placement="bottomEnd">
          <Dropdown.Item>Settings</Dropdown.Item>
          <Dropdown.Item>Sign out</Dropdown.Item>
        </Dropdown>
      </div>
    </div>
  );
}

export default MyKnolistTop;