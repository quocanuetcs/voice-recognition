import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import {Backdrop, CircularProgress, Paper, Snackbar, withStyles} from "@material-ui/core";
import Copyright from "../copyright/CopyRight";
import axios from "axios";
import {Alert, AlertTitle} from "@material-ui/lab";
import {Redirect} from 'react-router-dom';
import config from '../config.json';
import Background from '../static/background.jpeg';
//record
import {RecordState} from "audio-react-recorder";
import RecorderView from "../recorder/Recorder";

const styles = theme => ({
    paper: {
        marginTop: theme.spacing(8),
        marginBottom: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    button: {
        margin: '0 auto',
        display: "flex"
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: 'black',
    },
    background: {
        height: '100vh',
        backgroundImage: `url(${Background})`,
        backgroundRepeat: 'no-repeat',
        backgroundColor:
            theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    }
});

class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lastName: '',
            firstName: '',
            username: '',
            password: '',
            reenterPassword: '',
            blob: null,
            error: {
                lastName: false,
                firstName: false,
                username: false,
                password: false,
                reenterPassword: false,
            },
            helperText: {
                lastName: '',
                firstName: '',
                username: '',
                password: '',
                reenterPassword: '',
            },
            recorderState: {
                recordState: RecordState.START,
            },
            redirect: false,
            showStartButton: true,
            showStopButton: false,
            showResetButton: false,
            showInputValidationAlert: false,
            showResponseAlert: false,
            loading: false,
        };
        this.handleStopRecording = this.handleStopRecording.bind(this);
    }

    handleChangeLastName(event) {
        this.setState({
            lastName: event.target.value,
        });
    }

    handleChangeFirstName(event) {
        this.setState({
            firstName: event.target.value,
        });
    }

    handleChangeUsername(event) {
        this.setState({
            username: event.target.value,
        });
    }

    handleChangePassword(event) {
        this.setState({
            password: event.target.value,
        });
    }

    handleChangeReenterPassword(event) {
        this.setState({
            reenterPassword: event.target.value,
        });
    }

    handleStopRecording(recorderId, blob) {
        console.log('Handle stop recording');
        console.log(blob);
        this.setState({
            blob: blob,
        });
    }

    handleCloseInputValidationAlert() {
        this.setState({
            showInputValidationAlert: false,
        });
    }

    handleCloseResponseAlert() {
        this.setState({
            showResponseAlert: false,
        });
    }

    handleValidation() {
        let error = {
            lastName: false,
            firstName: false,
            username: false,
            password: false,
            reenterPassword: false,
        };
        let helperText = {
            lastName: '',
            firstName: '',
            username: '',
            password: '',
            reenterPassword: '',
        }
        let valid = true;
        if (this.state.lastName.trim() === '') {
            error.lastName = true;
            helperText.lastName = <>Chưa điền <b>Họ</b></>;
            valid = false;
        }
        if (this.state.firstName.trim() === '') {
            error.firstName = true;
            helperText.firstName = <>Chưa điền <b>Tên và tên đệm</b></>;
            valid = false;
        }
        if (this.state.username.length < 8 || !this.state.username.match(/^[0-9a-z]+$/)) {
            error.username = true;
            helperText.username = <><b>Tên đăng nhập</b> tối thiểu 8 ký tự<br/>Chỉ bảo gồm ký tự chữ và số</>;
            valid = false;
        }
        if (!this.state.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/)) {
            error.password = true;
            helperText.password = <>
                <b>Mật khẩu</b> có số lượng ký tự nằm trong khoảng [6-20]<br/>
                Có ít nhất 1 chữ cái in thường, 1 chữ cái in hoa và 1 chữ số
            </>;
            valid = false;
        }
        if (this.state.reenterPassword !== this.state.password) {
            error.reenterPassword = true;
            helperText.reenterPassword = <>Mật khẩu chưa khớp</>;
            valid = false;
        }
        if (this.state.blob == null) {
            this.setState({
                showInputValidationAlert: true
            });
        }
        this.setState({
            error: error,
            helperText: helperText,
        });
        return valid;
    }

    handleSubmit() {
        this.setState({
            loading: true,
        });
        if (this.handleValidation()) {
            const form = new FormData();
            form.append('voiceprint', this.state.blob.blob, 'audio.wav');
            form.append('username', this.state.username);
            form.append('password', this.state.password);
            axios.post(config.HOST + '/signup/', form,
                {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
                        'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(response => {
                console.log(response);
                this.setState({
                    redirect: true,
                    loading: false,
                });
            }).catch(error => {
                console.log(error.response);
                this.setState({
                    showResponseAlert: true,
                    loading: false,
                });
            });
        }
    }

    render() {
        const {classes} = this.props;
        if (localStorage.getItem('token') !== 'null')
            return <Redirect to="/"/>
        if (this.state.redirect)
            return <Redirect to={{pathname: "/signin", redirect: true}}/>
        return (
            <React.Fragment>
                <Grid container className={classes.background} justify='center'>
                    <Paper className={classes.paper} elevation={20}>
                        <Container component="main" maxWidth="sm">
                            <CssBaseline/>
                            <div className={classes.paper}>
                                <Avatar className={classes.avatar}>
                                    <LockOutlinedIcon/>
                                </Avatar>
                                <Typography component="h1" variant="h5">
                                    <b>Đăng ký tài khoản</b>
                                </Typography>
                                <form className={classes.form} noValidate>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                error={this.state.error.lastName}
                                                helperText={this.state.helperText.lastName}
                                                autoComplete="lastName"
                                                name="lastName"
                                                variant="outlined"
                                                required
                                                fullWidth
                                                id="lastName"
                                                label="Họ"
                                                autoFocus
                                                onChange={event => this.handleChangeLastName(event)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                error={this.state.error.firstName}
                                                helperText={this.state.helperText.firstName}
                                                autoComplete="firstName"
                                                name="firstName"
                                                variant="outlined"
                                                required
                                                fullWidth
                                                id="firstName"
                                                label="Tên và tên đệm"
                                                onChange={event => this.handleChangeFirstName(event)}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                error={this.state.error.username}
                                                helperText={this.state.helperText.username}
                                                autoComplete="username"
                                                name="username"
                                                variant="outlined"
                                                required
                                                fullWidth
                                                id="username"
                                                label="Tên đăng nhập"
                                                onChange={event => this.handleChangeUsername(event)}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                error={this.state.error.password}
                                                helperText={this.state.helperText.password}
                                                autoComplete="password"
                                                name="password"
                                                variant="outlined"
                                                required
                                                fullWidth
                                                type="password"
                                                id="password"
                                                label="Mật khẩu"
                                                onChange={event => this.handleChangePassword(event)}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                error={this.state.error.reenterPassword}
                                                helperText={this.state.helperText.reenterPassword}
                                                autoComplete="reenter-password"
                                                name="reenter-password"
                                                variant="outlined"
                                                required
                                                fullWidth
                                                type="password"
                                                id="reenter-password"
                                                label="Xác nhận mật khẩu"
                                                onChange={event => this.handleChangeReenterPassword(event)}
                                            />
                                        </Grid>
                                        {/*record*/}
                                        <Grid item xs={12}>
                                            <h5>Ghi âm câu nói sau (dùng để xác thực nâng cao):</h5>
                                            <h6 style={{fontSize: 20, textAlign: 'center'}}>
                                                <b>Tôi xác nhận các thông tin trên hoàn toàn chính xác</b>
                                            </h6>
                                            <RecorderView backgroundColor="#e6ffe6"
                                                          recorderId={2}
                                                          parentCallBack={this.handleStopRecording}/>
                                        </Grid>
                                    </Grid>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        className={classes.submit}
                                        style={{marginLeft: 0}}
                                        onClick={() => this.handleSubmit()}
                                    >
                                        <b>Đăng ký</b>
                                    </Button>
                                    <Grid container justify="flex-end">
                                        <Grid item>
                                            <Link href="/signin" variant="body2">
                                                Đã có tài khoản? Hãy đăng nhập
                                            </Link>
                                        </Grid>
                                    </Grid>
                                    <Grid container justify="flex-end">
                                        <Grid item>
                                            <Link href="/" variant="body2">
                                                Quay về trang chủ
                                            </Link>
                                        </Grid>
                                    </Grid>
                                </form>
                            </div>
                            <Box mt={5}>
                                <Copyright/>
                            </Box>

                            {/*Alert*/}
                            <Snackbar open={this.state.showInputValidationAlert}
                                      autoHideDuration={3000}
                                      onClose={() => this.handleCloseInputValidationAlert()}>
                                <Alert severity="error" onClose={() => this.handleCloseInputValidationAlert()}>
                                    <AlertTitle><b>Lỗi</b></AlertTitle>
                                    Chưa ghi âm giọng nói
                                </Alert>
                            </Snackbar>
                            <Snackbar open={this.state.showResponseAlert}
                                      autoHideDuration={3000}
                                      onClose={() => this.handleCloseResponseAlert()}>
                                <Alert severity="error" onClose={() => this.handleCloseResponseAlert()}>
                                    <AlertTitle><b>Lỗi</b></AlertTitle>
                                    Tên đăng nhập đã tồn tại
                                </Alert>
                            </Snackbar>

                            {/*Loading*/}
                            <Backdrop className={classes.backdrop} open={this.state.loading}>
                                <CircularProgress color="inherit"/>
                            </Backdrop>
                        </Container>
                    </Paper>
                </Grid>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(SignUp);