import React from "react";

import makeHttpRequest from "../services/HttpRequest";

class RaiseLevelButton extends React.Component {
    buttonAction = () => {
        const cur = this.props.curClusterView;
        if (cur.parent_cluster === null) this.props.setCurClusterView(null);
        else {
            const endpoint = "/clusters/" + this.props.curClusterView.parent_cluster;
            makeHttpRequest(endpoint).then(response => {
                this.props.setCurClusterView(response.body.cluster);
            })
        }
    }

    render() {
        const divStyle = {
            display: 'block',
            width: '100px',
            height: '100px',
            borderStyle: 'solid',
            borderWidth: '0 0 150px 150px', /* adjust for size of triangle */
            borderColor: 'transparent transparent transparent #3498FF',
            position: 'fixed',
            top: 55,
            left: 0,
            zIndex: 99999,
            color: 'white',
            cursor: 'pointer'
        }
        const textStyle = {
            position: 'absolute',
            top: '30px',
            width: '80px',
            left: '-140px',
            fontFamily: 'Apple-System',
            transform: 'rotate(-45deg)',
            color: 'white',
            textAlign: 'center',
            display: 'block',
            userSelect: 'none'
        }

        if (this.props.curClusterView === null) return null;

        return (
            <div style={divStyle} onClick={this.buttonAction}>
                <span style={textStyle}>
                    To previous level
                </span>
            </div>
        )
    }
}

export default RaiseLevelButton