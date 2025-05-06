"use client";

/*
    there is a dashboard where an admin can create a new video chat
    this starts the chat and dispays a link that can be sent
    a user can then click the link and be connected to the chat
    a third user can be an observer
    there may be a way to embed zoom or another existing solution with minimal changes
    (don't need anything custom)

*/

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import "./videoChat.css"

// Create a client component that uses useSearchParams
function VideoMeeting() {
    const searchParams = useSearchParams();
    const [meetingId, setMeetingId] = useState('');
    const [passcode, setPasscode] = useState('');
    const [userName, setUserName] = useState('Guest');
    const [zoomUrl, setZoomUrl] = useState('');
    
    useEffect(() => {
        // Only access searchParams in useEffect to avoid SSR issues
        const meetingIdParam = searchParams.get('meetingId');
        const passcodeParam = searchParams.get('passcode');
        const userNameParam = searchParams.get('userName') || 'Guest';
        
        setMeetingId(meetingIdParam || '');
        setPasscode(passcodeParam || '');
        setUserName(userNameParam);
        
        if (meetingIdParam) {
            // ex: http://localhost:3000/video-chat?meetingId=89030782658
            // http://localhost:3000/video-chat?meetingId=89030782658&passcode=h4LRMK
            setZoomUrl(`https://zoom.us/wc/${meetingIdParam}/join?pwd=${passcodeParam || ''}&name=${userNameParam}`);
        }
    }, [searchParams]);
    
    return (
        <div className="pt-16 pb-4">
            <div style={{height: "calc(100vh - 100px)", width: "100%", paddingLeft: "5px", paddingRight: "5px", paddingTop: "5px"}}>
            {meetingId && (
                <iframe
                    src={zoomUrl}
                    width="100%" 
                    height="100%"
                    allow="microphone; camera; fullscreen"
                    style={{ border: 'none' }}
                />
            )}
            {!meetingId && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center p-8 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">No Meeting ID Provided</h2>
                        <p className="mb-4">Please use a valid meeting link with a meeting ID parameter.</p>
                        <p className="text-sm text-gray-600">Example: /video-chat?meetingId=12345678901</p>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}

// Loading fallback component
function VideoMeetingLoading() {
    return (
        <div className="pt-16 pb-4">
            <div style={{height: "calc(100vh - 100px)", width: "100%"}} className="flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                    </div>
                    <p className="mt-2">Loading meeting...</p>
                </div>
            </div>
        </div>
    );
}

// Main page component with Suspense boundary
export default function VideoChat() {
    return (
        <Suspense fallback={<VideoMeetingLoading />}>
            <VideoMeeting />
        </Suspense>
    );
}