import React from 'react';
import {Icon, Nav} from "rsuite";

function View(props) {
    return (
        <Nav>
            <Nav.Item icon={<Icon icon="home" />}>Home</Nav.Item>
            <Nav.Item>News</Nav.Item>
            <Nav.Item>Solutions</Nav.Item>
            <Nav.Item>Products</Nav.Item>
            <Nav.Item>About</Nav.Item>
        </Nav>
    );
}

export default View;