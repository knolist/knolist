import React, { useState } from "react";
import Header from "./Header.js"
import Sidebar from "./Sidebar.js";
import { Input, Toggle, Divider, Button, Grid, Row, Col, Dropdown } from "rsuite";

function Settings() {
  const [activeKey, setActiveKey] = useState("Medium");

  return (
    <div>
      <Header showSearch={false} />
      <Sidebar />
      <div id="myknolist-main-container">
        <div style={{ width: "50%" }}>
          <Grid>
            <Row>
              <Col xs={2} style={{ paddingTop: "1vh", fontWeight: "bold" }}>Full Name</Col>
              <Col xs={6}><Input placeholder="John Doe" /></Col>
            </Row>
            <Row style={{ marginTop: "2vh" }}>
              <Col xs={2} style={{ paddingTop: "1vh", fontWeight: "bold" }}>Email</Col>
              <Col xs={6}><Input placeholder="johndoe@gmail.com" /></Col>
            </Row>
            <Row style={{ marginTop: "2vh" }}>
              <Col xs={2} style={{ paddingTop: "1vh", fontWeight: "bold" }}>Password</Col>
              <Col xs={6}><Button appearance="default" size="sm">Change</Button></Col>
            </Row>
            <Divider />
            <Row style={{ marginTop: "2vh" }}>
              <Col xs={2} style={{ paddingTop: ".5vh", fontWeight: "bold" }}>Dark Mode</Col>
              <Col xs={6}><Toggle /></Col>
            </Row>
            <Row style={{ marginTop: "2vh" }}>
              <Col xs={2} style={{ paddingTop: "1.1vh", fontWeight: "bold" }}>Text Size</Col>
              <Col xs={6}>
                <Dropdown title={activeKey} appearance="default">
                  <Dropdown.Item onSelect={() => setActiveKey("Small")}>Small</Dropdown.Item>
                  <Dropdown.Item onSelect={() => setActiveKey("Medium")}>Medium</Dropdown.Item>
                  <Dropdown.Item onSelect={() => setActiveKey("Large")}>Large</Dropdown.Item>
                </Dropdown>
              </Col>
            </Row>
          </Grid>
          <Button style={{marginTop:"4vh"}} appearance="primary">Save</Button>
        </div>
      </div>
    </div >
  );
}

export default Settings;