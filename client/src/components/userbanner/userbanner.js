import React from "react";


const Userbanner = (props) => {

    return (
        <div>
            <div className={props.iid} id="wrappercard">
                <p className="username">{props.username}</p>
                <p>{props.score}</p>
                <p className="message">{props.message}</p>
            </div>
        </div>
    )
}

export default Userbanner;