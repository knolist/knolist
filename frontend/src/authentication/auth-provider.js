import React from "react";
import { useHistory } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

const KnolistAuthProvider = ({ children }) => {
  const domain = 'knolist.us.auth0.com';
  const clientId = 'pBu5uP4mKTQgBttTW13N0wCVgsx90KMi';
  const audience = 'knolist';

  const history = useHistory();

  const onRedirectCallback = (appState) => {
    history.push(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      redirectUri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
      audience={audience}
    >
      {children}
    </Auth0Provider>
  );
};

export default KnolistAuthProvider;