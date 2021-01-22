import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Switch } from "react-router";
import Page from "./my-knolist/Page.js";
import Settings from "./my-knolist/Settings.js";

import App from './app/App.js';
import KnolistAuthProvider from "./authentication/auth-provider";

ReactDOM.render(
    <Router>
        <Switch>
            <KnolistAuthProvider>
                <Route exact path="/">
                    <App />
                </Route>
                <Route path="/my-projects">
                    <Page url={"/my-projects"} />
                </Route>
                <Route path="/shared">
                    <Page url={"/shared"} />
                </Route>
                <Route path="/archived">
                    <Page url={"/archived"} />
                </Route>
                <Route path="/settings">
                    <Settings />
                </Route>
            </KnolistAuthProvider>
        </Switch>
    </Router>,
    document.getElementById('root')
);