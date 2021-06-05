import './App.css';
import React from 'react';
import SignUp from "../signup/SignUp";
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import SignIn from "../signin/SignIn";
import Pricing from "../dashboard/Dashboard";
import ChangePassword from "../change-password/ChangePassword";


function App() {
    return (
        <BrowserRouter>
            <Switch>
                {/*<Route exact path="/">*/}
                {/*    <Pricing/>*/}
                {/*</Route>*/}
                {/*<Route path="/signup">*/}
                {/*    <SignUp/>*/}
                {/*</Route>*/}
                {/*<Route path="/signin">*/}
                {/*    <SignIn/>*/}
                {/*</Route>*/}
                {/*<Route path="/changepassword">*/}
                {/*    <ChangePassword/>*/}
                {/*</Route>*/}
                <Route exact path="/" component={Pricing}/>
                <Route exact path="/signup" component={SignUp}/>
                <Route exact path="/signin" component={SignIn}/>
                <Route exact path="/changepassword" component={ChangePassword}/>
                <Route render={() => <Redirect to={{pathname: "/"}}/>}/>
            </Switch>
        </BrowserRouter>
    );
}

export default App;