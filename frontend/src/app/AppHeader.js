import React from 'react';
import {
    Checkbox, CheckboxGroup, Divider, Dropdown, FlexboxGrid, Icon, IconButton, Navbar,
    Tooltip, Whisper
} from "rsuite";
import { Link } from "react-router-dom";

import horizontalLogo from "../images/horizontal_main.png";
import SearchBar from "../components/SearchBar.js";

function AppHeader(props) {
    return (
        <Navbar style={{ padding: "0 10px" }}>
            <FlexboxGrid justify="space-between" align="middle">
                <Link to="/my-projects">
                    <Navbar.Header>
                        <img className="limit-height" src={horizontalLogo} alt="Knolist" />
                    </Navbar.Header>
                </Link>
                <div className="center-header-title">
                    {
                        props.curProject === null ?
                            null :
                            <span style={{
                                fontWeight: "bold",
                                fontSize: "2em"
                            }}>{props.curProject.title}</span>

                    }
                </div>
                <FlexboxGrid.Item>
                    <FlexboxGrid>
                        <SearchAndFilter searchQuery={props.searchQuery} setSearchQuery={props.setSearchQuery}
                            updateFilters={props.updateFilters} />
                        <BibButton setShowBib={props.setShowBib} />
                    </FlexboxGrid>
                </FlexboxGrid.Item>
            </FlexboxGrid>
        </Navbar>
    );
}

class BibButton extends React.Component {
    render() {
        return (
            <FlexboxGrid.Item>
                <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Bibliography</Tooltip>}
                    placement="bottomEnd">
                    <IconButton onClick={() => this.props.setShowBib(true)} icon={<Icon icon="book" />} />
                </Whisper>
            </FlexboxGrid.Item>
        );
    }
}

class SearchAndFilter extends React.Component {
    constructor(props) {
        super(props);
        // TODO: make backend endpoint to return the filter categories
        const filterCategories = [
            "Title",
            "URL",
            "Page Content",
            "Highlights",
            "Notes"
        ];
        this.state = {
            indeterminate: false,
            checkAll: true,
            value: filterCategories,
            filterCategories: filterCategories
        };
    }

    handleCheckAll = (value, checked) => {
        const nextValue = checked ? this.state.filterCategories : [];
        this.setState({
            value: nextValue,
            indeterminate: false,
            checkAll: checked
        });
        this.sendFilters(nextValue);
    }

    handleChange = (value) => {
        this.setState({
            value: value,
            indeterminate: value.length > 0 && value.length < this.state.filterCategories.length,
            checkAll: value.length === this.state.filterCategories.length
        });
        this.sendFilters(value);
    }

    sendFilters = (value) => {
        this.props.updateFilters(value);
    }

    render() {
        return (
            <FlexboxGrid>
                <FlexboxGrid.Item>
                    <SearchBar width={250} searchQuery={this.props.searchQuery}
                        setSearchQuery={this.props.setSearchQuery} updateFilters={this.props.updateFilters} />
                </FlexboxGrid.Item>
                <FlexboxGrid.Item>
                    <FilterDropdown indeterminate={this.state.indeterminate} checkAll={this.state.checkAll}
                        value={this.state.value} filterCategories={this.state.filterCategories}
                        handleCheckAll={this.handleCheckAll} handleChange={this.handleChange} />
                </FlexboxGrid.Item>
            </FlexboxGrid>
        );
    }
}

function FilterDropdown(props) {
    return (
        <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Search Filters</Tooltip>}
            placement="bottomEnd">
            <Dropdown placement="bottomEnd" renderTitle={() => <IconButton icon={<Icon icon="filter" />} />}>
                <div style={{ width: 200 }}>
                    <Checkbox indeterminate={props.indeterminate} checked={props.checkAll}
                        onChange={props.handleCheckAll}>
                        Select all
                    </Checkbox>
                    <Divider style={{ margin: "5px 0" }} />
                    <CheckboxGroup name="checkboxList" value={props.value}
                        onChange={props.handleChange}>
                        {props.filterCategories.map(filter => {
                            return <Checkbox key={filter} value={filter}>{filter}</Checkbox>
                        })}
                    </CheckboxGroup>
                </div>
            </Dropdown>
        </Whisper>
    );
}

export default AppHeader;