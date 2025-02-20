import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import StarIcon from '@material-ui/icons/StarBorder';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import {Backdrop, CircularProgress, Menu, MenuItem, Snackbar, withStyles} from "@material-ui/core";
import Copyright from "../copyright/CopyRight";
import {Link as RouterLink} from 'react-router-dom';
import axios from "axios";
import {HOST} from "../constant";
import {Alert, AlertTitle} from "@material-ui/lab";

const styles = theme => ({
    '@global': {
        ul: {
            margin: 0,
            padding: 0,
            listStyle: 'none',
        },
    },
    appBar: {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    toolbar: {
        flexWrap: 'wrap',
    },
    toolbarTitle: {
        flexGrow: 1,
    },
    link: {
        margin: theme.spacing(1, 1.5),
    },
    button: {
        margin: theme.spacing(0.5, 0.5),
    },
    heroContent: {
        padding: theme.spacing(8, 0, 6),
    },
    cardHeader: {
        backgroundColor:
            theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
    },
    cardPricing: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'baseline',
        marginBottom: theme.spacing(2),
    },
    footer: {
        borderTop: `1px solid ${theme.palette.divider}`,
        marginTop: theme.spacing(8),
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        [theme.breakpoints.up('sm')]: {
            paddingTop: theme.spacing(6),
            paddingBottom: theme.spacing(6),
        },
    },
    avatar: {
        color: '#fff',
        backgroundColor: 'green',
        marginLeft: theme.spacing(1),
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: 'black',
    },
});

const tiers = [
    {
        title: 'Free',
        price: '0',
        description: ['10 users included', '2 GB of storage', 'Help center access', 'Email support'],
        buttonText: 'Sign up for free',
        buttonVariant: 'outlined',
    },
    {
        title: 'Pro',
        subheader: 'Most popular',
        price: '15',
        description: [
            '20 users included',
            '10 GB of storage',
            'Help center access',
            'Priority email support',
        ],
        buttonText: 'Get started',
        buttonVariant: 'contained',
    },
    {
        title: 'Enterprise',
        price: '30',
        description: [
            '50 users included',
            '30 GB of storage',
            'Help center access',
            'Phone & email support',
        ],
        buttonText: 'Contact us',
        buttonVariant: 'outlined',
    },
];
const footers = [
    {
        title: 'Company',
        description: ['Team', 'History', 'Contact us', 'Locations'],
    },
    {
        title: 'Features',
        description: ['Cool stuff', 'Random feature', 'Team feature', 'Developer stuff', 'Another one'],
    },
    {
        title: 'Resources',
        description: ['Resource', 'Resource name', 'Another resource', 'Final resource'],
    },
    {
        title: 'Legal',
        description: ['Privacy policy', 'Terms of use'],
    },
];

class Pricing extends React.Component {
    constructor(props) {
        super(props);
        let redirect = false, redirectChangePassword = false;
        if (props.location.redirect)
            redirect = true;
        if (props.location.redirectChangePassword)
            redirectChangePassword = true;
        this.state = {
            username: null,
            anchorEl: null,
            loading: true,
            showSignInSuccess: redirect,
            showChangePasswordSuccess: redirectChangePassword,
        };
        this.getUser();
    }

    getUser() {
        axios.get(HOST + '/users/me/',
            {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
                    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
                    'Authorization': localStorage.getItem('token'),
                }
            }).then(response => {
            console.log(response);
            this.setState({
                username: response['data']['username'],
                loading: false,
            });
        }).catch(error => {
            console.log(error.response);
            this.setState({
                loading: false,
            });
        });
    }

    handleOpenMenu(event) {
        this.setState({
            anchorEl: event.currentTarget,
        });
    }

    handleCloseMenu() {
        this.setState({
            anchorEl: null,
        });
    }

    handleSignOut() {
        localStorage.setItem('token', null);
        this.setState({
            username: null,
            anchorEl: null,
        });
    }

    handleCloseSignInSuccess() {
        this.setState({
            showSignInSuccess: false,
        });
    }

    handleCloseChangePasswordSuccess() {
        this.setState({
            showChangePasswordSuccess: false,
        });
    }

    render() {
        const {classes} = this.props;
        return (
            <React.Fragment>
                <CssBaseline/>
                <AppBar position="static" color="default" elevation={0} className={classes.appBar}>
                    <Toolbar className={classes.toolbar}>
                        <Typography variant="h6" color="inherit" noWrap className={classes.toolbarTitle}>
                            Company name
                        </Typography>
                        <nav>
                            <Link variant="button" color="textPrimary" href="#" className={classes.link}>
                                Features
                            </Link>
                            <Link variant="button" color="textPrimary" href="#" className={classes.link}>
                                Enterprise
                            </Link>
                            <Link variant="button" color="textPrimary" href="#" className={classes.link}>
                                Support
                            </Link>
                        </nav>
                        {
                            this.state.username != null &&
                            <>
                                <Button aria-controls="simple-menu" aria-haspopup="true"
                                        onClick={event => this.handleOpenMenu(event)}>
                                    <b>Xin chào, {this.state.username}</b>
                                </Button>
                                <Menu anchorEl={this.state.anchorEl}
                                      keepMounted
                                      open={Boolean(this.state.anchorEl)}
                                      onClose={() => this.handleCloseMenu()}
                                >
                                    <RouterLink to='/changepassword' style={{textDecoration: 'none'}}>
                                        <MenuItem>Đổi mật khẩu</MenuItem>
                                    </RouterLink>
                                    <MenuItem onClick={() => this.handleSignOut()}>Đăng xuất</MenuItem>
                                </Menu>
                            </>
                        }
                        {
                            this.state.username == null &&
                            <>
                                <Button href="/signin" color="primary" variant="outlined" className={classes.button}>
                                    Đăng nhập
                                </Button>
                                <Button href="/signup" color="primary" variant="outlined" className={classes.button}>
                                    Đăng ký
                                </Button>
                            </>
                        }
                    </Toolbar>
                </AppBar>
                {/* Hero unit */}
                <Container maxWidth="sm" component="main" className={classes.heroContent}>
                    <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
                        Pricing
                    </Typography>
                    <Typography variant="h5" align="center" color="textSecondary" component="p">
                        Quickly build an effective pricing table for your potential customers with this layout.
                        It&apos;s built with default Material-UI components with little customization.
                    </Typography>
                </Container>
                {/* End hero unit */}
                <Container maxWidth="md" component="main">
                    <Grid container spacing={5} alignItems="flex-end">
                        {tiers.map((tier) => (
                            // Enterprise card is full width at sm breakpoint
                            <Grid item key={tier.title} xs={12} sm={tier.title === 'Enterprise' ? 12 : 6} md={4}>
                                <Card>
                                    <CardHeader
                                        title={tier.title}
                                        subheader={tier.subheader}
                                        titleTypographyProps={{align: 'center'}}
                                        subheaderTypographyProps={{align: 'center'}}
                                        action={tier.title === 'Pro' ? <StarIcon/> : null}
                                        className={classes.cardHeader}
                                    />
                                    <CardContent>
                                        <div className={classes.cardPricing}>
                                            <Typography component="h2" variant="h3" color="textPrimary">
                                                ${tier.price}
                                            </Typography>
                                            <Typography variant="h6" color="textSecondary">
                                                /mo
                                            </Typography>
                                        </div>
                                        <ul>
                                            {tier.description.map((line) => (
                                                <Typography component="li" variant="subtitle1" align="center"
                                                            key={line}>
                                                    {line}
                                                </Typography>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardActions>
                                        <Button fullWidth variant={tier.buttonVariant} color="primary">
                                            {tier.buttonText}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
                {/* Footer */}
                <Container maxWidth="md" component="footer" className={classes.footer}>
                    <Grid container spacing={4} justify="space-evenly">
                        {footers.map((footer) => (
                            <Grid item xs={6} sm={3} key={footer.title}>
                                <Typography variant="h6" color="textPrimary" gutterBottom>
                                    {footer.title}
                                </Typography>
                                <ul>
                                    {footer.description.map((item) => (
                                        <li key={item}>
                                            <Link href="#" variant="subtitle1" color="textSecondary">
                                                {item}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </Grid>
                        ))}
                    </Grid>
                    <Box mt={5}>
                        <Copyright/>
                    </Box>
                </Container>
                {/* End footer */}

                {/*Alert*/}
                <Snackbar open={this.state.showSignInSuccess}
                          autoHideDuration={3000}
                          onClose={() => this.handleCloseSignInSuccess()}>
                    <Alert severity="success" onClose={() => this.handleCloseSignInSuccess()}>
                        <AlertTitle><b>Thành công</b></AlertTitle>
                        Đăng nhập thành công
                    </Alert>
                </Snackbar>
                <Snackbar open={this.state.showChangePasswordSuccess}
                          autoHideDuration={3000}
                          onClose={() => this.handleCloseChangePasswordSuccess()}>
                    <Alert severity="success" onClose={() => this.handleCloseChangePasswordSuccess()}>
                        <AlertTitle><b>Thành công</b></AlertTitle>
                        Đổi mật khẩu thành công
                    </Alert>
                </Snackbar>

                {/*Loading*/}
                <Backdrop className={classes.backdrop} open={this.state.loading}>
                    <CircularProgress color="inherit"/>
                </Backdrop>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(Pricing);