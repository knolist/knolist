import React from "react";

import {useAuth0} from "@auth0/auth0-react";
import {Button} from "rsuite";

const LoginButton = () => {
    const {loginWithRedirect} = useAuth0();
    return (
        <Button color="blue" appearance="ghost"
                onClick={() => loginWithRedirect()}>
            Log In
        </Button>
    );
};

const LogoutButton = () => {
    const {logout} = useAuth0();
    return (
        <Button color="red" appearance="ghost"
                onClick={() => {
                    localStorage.removeItem("curProject");
                    logout({
                        returnTo: window.location.origin,
                    });
                }}>
            Log Out
        </Button>
    );
};

const SignupButton = () => {
    const {loginWithRedirect} = useAuth0();
    return (
        <Button color="blue" appearance="ghost"
                onClick={() =>
                    loginWithRedirect({
                        screen_hint: "signup",
                    })
                }>
            Sign Up
        </Button>
    );
};

const AuthButton = () => {
    const {isAuthenticated, isLoading} = useAuth0();

    if (!isLoading && isAuthenticated) {
        return <LogoutButton/>
    } else if (!isLoading && !isAuthenticated) {
        return <LoginButton/>
    } else {
        return null;
    }
};

export default AuthButton;