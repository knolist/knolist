import React from "react";

function RaiseLevelButton(props) {
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
        zindex: 99999,
        color: 'white',
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

    function renderButton() {
        if (props.isRoot) {
            return null
        } else {
            return (
                <div style={divStyle} onClick={() => console.log("asdf")}>
                    <span style={textStyle}>
                        To project root
                    </span>
                </div>
            )
        }
    }

    return (
        renderButton()
    )
}

export default RaiseLevelButton