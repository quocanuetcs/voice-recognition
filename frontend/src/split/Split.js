import React from 'react';
import RecorderView from "../recorder/Recorder";
import './Split.css';
import {
    Backdrop,
    Button,
    Card,
    CardContent,
    CardHeader, CircularProgress,
    Container, createMuiTheme,
    CssBaseline, Divider,
    Grid,
    Snackbar,
    Typography,
    withStyles,
    ThemeProvider
} from "@material-ui/core";
import CompareIcon from '@material-ui/icons/Compare';
import RecordVoiceOverIcon from '@material-ui/icons/RecordVoiceOver';
import axios from 'axios';
import ResultDialog from "../dialog/Dialog";
import SchoolIcon from '@material-ui/icons/School';
import PeopleIcon from '@material-ui/icons/People';
import {Alert, AlertTitle} from "@material-ui/lab";
import HeaderBackground from '../static/header-background.png';

const theme = createMuiTheme({
    typography: {
        fontFamily: "'Open Sans', sans-serif"
    }
});

const styles = theme => ({
    heroContent: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(8, 0, 6),
        backgroundImage: `url(${HeaderBackground})`,
        backgroundSize: 'auto',
        backgroundRepeat: "no-repeat",
    },
    heroButtons: {
        marginTop: theme.spacing(4),
    },
    footer: {
        backgroundColor: "#292c2f",
        color: "white",
        padding: theme.spacing(1),
    },
    recorderIcon: {
        fontSize: 40
    },
    uploadButton: {
        backgroundColor: "#5cb85c",
        color: "white",
        '&:hover': {
            backgroundColor: "#009900",
        }
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    whiteTypography: {
        color: "white"
    },
    body: {
        backgroundColor: "#dbeef0"
    }
});

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center"
                    style={{color: "white", backgroundColor: "#242629"}}>
            {'Copyright © '}
            {new Date().getFullYear()}
        </Typography>
    );
}

class SplitView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blobs: [null, null],
            loading: false,
            showInputValidationAlert: false
        };
        this.updateBlob = this.updateBlob.bind(this);
    }

    updateBlob(recorderId, blob) {
        console.log('Update blobs:', blob);
        let newBlobs = this.state.blobs;
        newBlobs[recorderId - 1] = blob.blob;
        this.setState({
            blobs: newBlobs
        });
    }

    uploadMedia(callback) {
        if (this.state.blobs[0] == null || this.state.blobs[1] == null) {
            this.setState({
                showInputValidationAlert: true
            });
            return;
        }
        console.log('Upload media');
        const form = new FormData();
        form.append('files', this.state.blobs[0], 'first_audio.wav');
        form.append('files', this.state.blobs[1], 'second_audio.wav');
        this.setState({
            loading: true
        });
        axios.post('http://localhost:8000/comparespeaker/', form,
            {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
                    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
                    'Content-Type': 'multipart/form-data'
                }
            }
        ).then(response => {
            console.log('Result:', response['data']['same_speaker_probability']);
            this.setState({
                loading: false
            });
            callback(response['data']['same_speaker_probability']);
        });
    }

    onCloseInputValidationAlert() {
        this.setState({
            showInputValidationAlert: false
        });
    }

    render() {
        const {classes} = this.props;

        return (
            <ThemeProvider theme={theme}>
                <React.Fragment>
                    <CssBaseline/>
                    {/*Header*/}
                    <div className={classes.heroContent}>
                        <Container maxWidth="sm">
                            <Typography component="h1" variant="h2" align="center" gutterBottom>
                                <b>Voice recognition</b>
                            </Typography>
                            <Typography variant="h5" align="center" paragraph>
                                Given audio of two speakers, determine those audio are from a same person or not.
                            </Typography>
                            <div className={classes.heroButtons}>
                                <Grid container spacing={2} justify="center">
                                    <Grid item>
                                        <Button variant="contained" color="primary"
                                                onClick={() => window.open("https://github.com/NewLuminous/voice-recognition", "_blank")}>
                                            <b>Our Github repo</b>
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button variant="contained" color="secondary"
                                                onClick={() => window.open("https://github.com/NewLuminous/voice-recognition/blob/master/README.md", "_blank")}>
                                            <b>About contributors</b>
                                        </Button>
                                    </Grid>
                                </Grid>
                            </div>
                        </Container>
                    </div>
                    {/*Body*/}
                    <Container maxWidth='xl' className={classes.body}>
                        <br/>
                        <Grid container>
                            <Grid item xs>
                                <Card style={{backgroundColor: '#ffe6e6', height: "100%"}}>
                                    <CardHeader title={<b>First audio<Divider/></b>}
                                                titleTypographyProps={{variant: 'h3'}}
                                                avatar={<RecordVoiceOverIcon className={classes.recorderIcon}/>}/>
                                    <CardContent
                                        children={<RecorderView backgroundColor="#ffe6e6"
                                                                recorderId={1}
                                                                parentCallBack={this.updateBlob}/>}/>
                                </Card>
                            </Grid>
                            <Grid item xs>
                                <Card style={{backgroundColor: '#e6ffe6', height: "100%"}}>
                                    <CardHeader title={<b>Second audio<Divider/></b>}
                                                titleTypographyProps={{variant: 'h3'}}
                                                avatar={<RecordVoiceOverIcon className={classes.recorderIcon}/>}/>
                                    <CardContent
                                        children={<RecorderView backgroundColor="#e6ffe6"
                                                                recorderId={2}
                                                                parentCallBack={this.updateBlob}/>}/>
                                </Card>
                            </Grid>
                        </Grid>
                        <br/>
                        <div className='upload-button'>
                            <ResultDialog onRef={ref => (this.child = ref)}/>
                            <Button variant="contained"
                                    startIcon={<CompareIcon/>}
                                    className={classes.uploadButton}
                                    onClick={() => {
                                        this.uploadMedia(this.child.onOpen);
                                    }}>
                                <b>COMPARE</b>
                            </Button>
                        </div>
                        <br/><br/><br/>
                    </Container>
                    {/*Footer*/}
                    <footer className={classes.footer} style={{paddingBottom: 0}}>
                        <Grid container justify="center">
                            <Grid item xs={4}>
                                <Typography variant="h6" align="center" gutterBottom>
                                    <SchoolIcon fontSize="large"/><br/>
                                    University of Engineering and Technology - VNU<br/>
                                    Faculty of Computer Science<br/>
                                    Technology Workshop - INT3414 20
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="h6" align="center" component="p" gutterBottom>
                                    <PeopleIcon fontSize="large"/><br/>
                                    Quoc An Nguyen<br/>Quoc Hung Duong<br/>Minh Tan Nguyen
                                </Typography>
                            </Grid>
                        </Grid>
                        <Copyright/>
                    </footer>

                    {/*Alert*/}
                    <Snackbar open={this.state.showInputValidationAlert}
                              autoHideDuration={3000}
                              onClose={() => this.onCloseInputValidationAlert()}>
                        <Alert severity="error" onClose={() => this.onCloseInputValidationAlert()}>
                            <AlertTitle><b>Error</b></AlertTitle>
                            Input missing
                        </Alert>
                    </Snackbar>

                    {/*Loading*/}
                    <Backdrop className={classes.backdrop} open={this.state.loading}>
                        <CircularProgress color="inherit"/>
                    </Backdrop>
                </React.Fragment>
            </ThemeProvider>
        )
    }
}

export default withStyles(styles)(SplitView);