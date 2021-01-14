import React from "react";

import LoginButton from "./login-button";
import LogoutButton from "./logout-button";

import { useAuth0 } from "@auth0/auth0-react";

const AuthenticationButton = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (!isLoading && isAuthenticated) {
    return <LogoutButton />
  } else if (!isLoading && !isAuthenticated) {
    return <LoginButton />
  } else {
    return null;
  }
};

export default AuthenticationButton;