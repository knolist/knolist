import React from "react";
import {Whisper, Tooltip, Icon, IconButton, Table, Modal} from 'rsuite';

const { Column, HeaderCell, Cell } = Table;
const data = [{ id: 1, name: 'foobar', email: 'foobar@xxx.com' }];

class SharedProject extends React.Component {

 //   generateTable() {

//}

    render() {
        return (
            <Modal show={this.props.showSharedProject} onHide={() => this.props.setShowSharedProject(false)}>
                <Modal.Header>
                    <Modal.Title>
                        Shared settings for project name.
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table height={400} data={data}>
                        <Column width={70} align="center" fixed>
                            <HeaderCell>User #</HeaderCell>
                            <Cell dataKey="id" />
                        </Column>
                        <Column width={200} fixed>
                            <HeaderCell>Name</HeaderCell>
                            <Cell dataKey="name" />
                        </Column>
                        <Column width={200}>
                            <HeaderCell>Email</HeaderCell>
                            <Cell dataKey="email" />
                        </Column>
                    </Table>
                </Modal.Body>

            </Modal>

);
    // render() {
    //     return ( 
    //         <div>
    //             <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Share Project</Tooltip>}
    //                                  placement="bottom">
    //                  <IconButton icon={<Icon icon="share-alt"/>} size="lg">
    //                  </IconButton>
    //             </Whisper>
    //         </div>

    //     )
    // };
    }
}
export default SharedProject;