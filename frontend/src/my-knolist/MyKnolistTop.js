import React from "react";
import knolistIcon from "../images/KNOLISTICON.png";
import { Input, Dropdown, Icon } from "rsuite";

function MyKnolistTop(props) {
  return (
    <div className="myknolist-top-container">
      <div>
        <img className="myknolist-top-header-img" src={knolistIcon} alt="Knolist" />
      </div>
      <div>
        <Input placeholder="Search My Knolist" className="myknolist-top-input" style={{fontFamily:"Poppins"}}/>
      </div>
      <div>
        <Dropdown noCaret icon={<Icon icon="bars" />}
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