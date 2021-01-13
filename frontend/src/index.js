import React from 'react';
import ReactDOM from 'react-dom';
import App from './app/App.js';
import { BrowserRouter as Router } from 'react-router-dom';
import KnolistAuthProvider from "./authentication/auth-provider";

ReactDOM.render(
    <Router>
        <KnolistAuthProvider>
            <App/>
        </KnolistAuthProvider>
    </Router>, 
    document.getElementById('root')
);