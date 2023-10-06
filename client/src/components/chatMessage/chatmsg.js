import React from 'react'

const Chatmsg = (props) => {
    
    return (
        <>
            <p><span>{props.username} :  </span>{props.message}</p>
        </>
    )
}

export default Chatmsg;