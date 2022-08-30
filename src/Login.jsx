import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, signInWithGoogle } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./Login.css";

const Login = () => {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        if (user) navigate("/Chat");
    }, [user, loading, navigate]);

    return (
        
        <div className="login">
            <div className="headerDiv">
                <h1 className="titleHeader">Quick Chat</h1>
            </div>
            <div className="login_container">
                <button className="login_btn login_google" onClick={signInWithGoogle}>
                    Login with Google
                </button>
                <div>
                    <p>Need a google account?<br />
                        Click <a href="https://accounts.google.com/signup/v2/webcreateaccount?flowName=GlifWebSignIn&flowEntry=SignUp" target="_blank" rel="noreferrer">here</a> to create one</p>
                </div>
            </div>
        </div>
    );
}

export default Login;