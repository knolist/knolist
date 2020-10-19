import React from 'react';
import ReactDOM from 'react-dom';
import {Button} from 'rsuite';

import './index.css';
// import default style
import 'rsuite/dist/styles/rsuite-default.css';

function App() {
    return <Button>Hello World</Button>;
}

ReactDOM.render(<App/>, document.getElementById('root'));