"use client";

/*
    there is a dashboard where an admin can create a new video chat
    this starts the chat and dispays a link that can be sent
    a user can then click the link and be connected to the chat
    a third user can be an observer
    there may be a way to embed zoom or another existing solution with minimal changes
    (don't need anything custom)

*/

import { useSearchParams } from 'next/navigation'; // Changed from useRouter
import "./videoChat.css"

export default function VideoChat(){
    
    const searchParams = useSearchParams();
    const meetingId = searchParams.get('meetingId');
    const passcode = searchParams.get('passcode');
    const userName = searchParams.get('userName') || 'Guest';
    // ex: http://localhost:3000/video-chat?meetingId=89030782658
    // http://localhost:3000/video-chat?meetingId=89030782658&passcode=h4LRMK
    const zoomUrl = `https://zoom.us/wc/${meetingId}/join?pwd=${passcode}&name=${userName}`;
    // const zoomUrl = `https://zoom.us/wc/${meetingId}/join?pwd=${passcode}&name=${userName}&embedded=true`;

    
    return (
        <>
            <div className="pt-16 pb-4"> 
                <div style={{height: "calc(100vh - 100px)", width: "100%", paddingLeft: "5px", paddingRight: "5px", paddingTop: "5px"}}>
                {/* <div>meetingId {meetingId}</div>
                <div>passcode {passcode}</div>
                <div>userName {userName}</div>
                <div>zoomUrl {zoomUrl}</div> */}
                <iframe
                    src={zoomUrl}
                    width="100%" 
                    height="100%"
                    allow="microphone; camera; fullscreen"
                    style={{ border: 'none' }}
                />
                </div>
            </div>
        </>
    )

}