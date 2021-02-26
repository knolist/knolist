import React from 'react';
import {Icon, Input, InputGroup} from "rsuite";

function SearchBar(props) {
    return (
        <InputGroup style={{width: props.width}}>
            <Input placeholder="Search through your project"
            value={props.searchQuery}
            onInput={e => props.setSearchQuery(e.target.value)}
            />
            <InputGroup.Button>
                <Icon icon="search"/>
            </InputGroup.Button>
        </InputGroup>
    );
}

export default SearchBar;