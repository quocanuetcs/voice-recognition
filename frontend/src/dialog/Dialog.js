import React from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from "@material-ui/core";

class ResultDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            result: null
        }
        this.onOpen = this.onOpen.bind(this);
    }

    componentDidMount() {
        this.props.onRef(this)
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    onOpen(result) {
        this.setState({
            open: true,
            result: result
        });
    }

    onClose() {
        this.setState({
            open: false
        });
    }

    render() {
        return (
            <Dialog open={this.state.open} onClose={() => this.onClose()}>
                <DialogTitle>
                    Result
                </DialogTitle>
                <DialogContent dividers>
                    <Typography gutterBottom variant='h5'>
                        The probability of the same person is
                    </Typography>
                    <Typography variant='h3'>
                        <div style={{textAlign: "center"}}><b>
                            {(this.state.result * 100).toFixed(2) + '%'}
                        </b></div>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => this.onClose()} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}

export default ResultDialog;