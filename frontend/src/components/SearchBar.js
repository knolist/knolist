import React from 'react';
import { Dropdown, Icon, Input, InputGroup } from "rsuite";


function SearchBar(props) {
  let listItems = [];
  if (props.results && props.results.length !== 0 && props.searchQuery !== '') {
    listItems = props.results.map((d) => <li key={d.title}>{d.title}</li>);
  }
  return (
    <InputGroup style={{ width:props.width }}>
        <Input placeholder="Search through your project" 
      value={props.searchQuery}
      onInput={e => props.setSearchQuery(e.target.value)}
      />
      <InputGroup.Button>
        <Icon icon="search" />
      </InputGroup.Button>
    </InputGroup>
  );
}

export default SearchBar;