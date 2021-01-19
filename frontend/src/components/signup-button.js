import React from "react";
import {Button} from "rsuite";
import {useAuth0} from "@auth0/auth0-react";

const SignupButton = () => {
    const {loginWithRedirect} = useAuth0();
    return (
        <Button color="blue" appearance="ghost"
                onClick={() =>
                    loginWithRedirect({
                        screen_hint: "signup",
                    })
                }
        >
            Sign Up
        </Button>
    );
};

export default SignupButton;
