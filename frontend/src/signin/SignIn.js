import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import {Snackbar, withStyles} from "@material-ui/core";
import Copyright from "../copyright/CopyRight";
import {Alert, AlertTitle} from "@material-ui/lab";
import axios from "axios";
import {Redirect} from "react-router-dom";
import Background from "../static/background.jpeg";
import config from '../config.json';

const styles = theme => ({
    root: {
        height: '100vh',
    },
    image: {
        backgroundImage: `url(${Background})`,
        backgroundRepeat: 'no-repeat',
        backgroundColor:
            theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    paper: {
        margin: theme.spacing(8, 4),
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
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
});

class SignIn extends React.Component {
    constructor(props) {
        super(props);
        let redirect = false;
        if (props.location.redirect)
            redirect = true;
        this.state = {
            username: '',
            password: '',
            error: {
                username: false,
                password: false,
            },
            helperText: {
                username: '',
                password: '',
            },
            showResponseAlert: false,
            showRegisterSuccess: redirect,
            redirect: false,
        }
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

    handleValidation() {
        let error = {
            username: false,
            password: false,
        };
        let helperText = {
            username: '',
            password: '',
        }
        let valid = true;
        if (this.state.username.trim().length === 0) {
            error.username = true;
            helperText.username = <>Chưa điền <b>Tên đăng nhập</b></>;
            valid = false;
        }
        if (this.state.password.length === 0) {
            error.password = true;
            helperText.password = <>Chưa điền <b>Mật khẩu</b></>;
            valid = false;
        }
        this.setState({
            error: error,
            helperText: helperText,
        });
        return valid;
    }

    handleCloseRegisterSuccess() {
        this.setState({
            showRegisterSuccess: false,
        });
    }

    handleCloseResponseAlert() {
        this.setState({
            showResponseAlert: false,
        });
    }

    handleSubmit() {
        if (this.handleValidation()) {
            const form = new FormData();
            form.append('username', this.state.username);
            form.append('password', this.state.password);
            axios.post(config.HOST + '/token/', form,
                {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
                        'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(response => {
                console.log(response);
                localStorage.setItem('token', response['data']['token_type'] + ' ' + response['data']['access_token']);
                this.setState({
                    redirect: true,
                });
            }).catch(error => {
                console.log(error.response);
                this.setState({
                    showResponseAlert: true,
                });
            });
        }
    }

    render() {
        const {classes} = this.props;
        if (this.state.redirect)
            return <Redirect to={{pathname: '/', redirect: true}}/>
        return (
            <React.Fragment>
                <Grid container component="main" className={classes.root}>
                    <CssBaseline/>
                    <Grid item xs={false} sm={4} md={7} className={classes.image}/>
                    <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                        <div className={classes.paper}>
                            <Avatar className={classes.avatar}>
                                <LockOutlinedIcon/>
                            </Avatar>
                            <Typography component="h1" variant="h5">
                                <b>Đăng nhập</b>
                            </Typography>
                            <form className={classes.form} noValidate>
                                <TextField
                                    error={this.state.error.username}
                                    helperText={this.state.helperText.username}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Tên đăng nhập"
                                    name="username"
                                    autoComplete="username"
                                    autoFocus
                                    onChange={event => this.handleChangeUsername(event)}
                                />
                                <TextField
                                    error={this.state.error.password}
                                    helperText={this.state.helperText.password}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Mật khẩu"
                                    type="password"
                                    id="password"
                                    autoComplete="password"
                                    onChange={event => this.handleChangePassword(event)}
                                />
                                <FormControlLabel
                                    control={<Checkbox value="remember" color="primary"/>}
                                    label="Lưu mật khẩu"
                                />
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    className={classes.submit}
                                    style={{marginLeft: 0}}
                                    onClick={() => this.handleSubmit()}
                                >
                                    <b>Đăng nhập</b>
                                </Button>
                                <Grid container justify="flex-end">
                                    <Grid item>
                                        <Link href="/signup" variant="body2">
                                            {"Chưa có tài khoản? Hãy đăng ký"}
                                        </Link>
                                    </Grid>
                                </Grid>
                                <Grid container justify="flex-end">
                                    <Grid item>
                                        <Link href="/" variant="body2">
                                            {"Quay về trang chủ"}
                                        </Link>
                                    </Grid>
                                </Grid>
                                <Box mt={5}>
                                    <Copyright/>
                                </Box>
                            </form>
                        </div>
                    </Grid>
                </Grid>
                {/*Alert*/}
                <Snackbar open={this.state.showRegisterSuccess}
                          autoHideDuration={3000}
                          onClose={() => this.handleCloseRegisterSuccess()}>
                    <Alert severity="success" onClose={() => this.handleCloseRegisterSuccess()}>
                        <AlertTitle><b>Thành công</b></AlertTitle>
                        Đăng ký tài khoản thành công
                    </Alert>
                </Snackbar>
                <Snackbar open={this.state.showResponseAlert}
                          autoHideDuration={3000}
                          onClose={() => this.handleCloseResponseAlert()}>
                    <Alert severity="error" onClose={() => this.handleCloseResponseAlert()}>
                        <AlertTitle><b>Lỗi</b></AlertTitle>
                        Đăng nhập thất bại
                    </Alert>
                </Snackbar>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(SignIn);