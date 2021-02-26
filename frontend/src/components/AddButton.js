import React from "react";
import {Icon, IconButton} from "rsuite";

function AddButton() {
    return (
        <IconButton className="footer-btn" appearance="primary" icon={<Icon icon="plus"/>}
                    circle size="lg"/>
    )
}

export default AddButton;