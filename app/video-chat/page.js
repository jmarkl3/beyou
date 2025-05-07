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
import { useState, useEffect, useRef, Suspense } from 'react';
import "./videoChat.css"
import isMobile from 'ismobile';

// Create a client component that uses useSearchParams
function VideoMeeting() {
    const searchParams = useSearchParams();
    const [meetingId, setMeetingId] = useState('');
    const [passcode, setPasscode] = useState('');
    const [secondaryPassword, setSecondaryPassword] = useState('');
    const [userName, setUserName] = useState('Guest');
    const [zoomUrl, setZoomUrl] = useState('');
    const [directZoomUrl, setDirectZoomUrl] = useState('');
    const handleRef = useRef(null);
    
    // Handle drag functionality for mobile scrolling
    useEffect(() => {
        const handleElement = handleRef.current;
        if (!handleElement) return;
        
        let startY = 0;
        let scrolling = false;
        
        const handleTouchStart = (e) => {
            startY = e.touches[0].clientY;
            scrolling = true;
        };
        
        const handleTouchMove = (e) => {
            if (!scrolling) return;
            const currentY = e.touches[0].clientY;
            const deltaY = startY - currentY;
            window.scrollBy(0, deltaY);
            startY = currentY;
            e.preventDefault();
        };
        
        const handleTouchEnd = () => {
            scrolling = false;
        };
        
        handleElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        handleElement.addEventListener('touchmove', handleTouchMove, { passive: false });
        handleElement.addEventListener('touchend', handleTouchEnd);
        
        return () => {
            handleElement.removeEventListener('touchstart', handleTouchStart);
            handleElement.removeEventListener('touchmove', handleTouchMove);
            handleElement.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);
    
    useEffect(() => {
        // Only access searchParams in useEffect to avoid SSR issues
        const meetingIdParam = searchParams.get('meetingId');
        const passcodeParam = searchParams.get('passcode');
        const secondaryPasswordParam = searchParams.get('secondaryPassword');
        const userNameParam = searchParams.get('userName') || 'Guest';
        
        setMeetingId(meetingIdParam || '');
        setPasscode(passcodeParam || '');
        setSecondaryPassword(secondaryPasswordParam || '');
        setUserName(userNameParam);
        
        if (meetingIdParam) {
            // ex: http://localhost:3000/video-chat?meetingId=89030782658
            // http://localhost:3000/video-chat?meetingId=89030782658&passcode=h4LRMK
            setZoomUrl(`https://zoom.us/wc/${meetingIdParam}/join?pwd=${passcodeParam || ''}&name=${userNameParam}`);
            
            // Set direct Zoom URL with secondary password for the 'Audio not working?' button
            setDirectZoomUrl(`https://app.zoom.us/wc/${meetingIdParam}/join?fromPWA=1&pwd=${secondaryPasswordParam || passcodeParam || ''}`);
        }
    }, [searchParams]);
    
    // Apply conditional styling based on device type
    const wrapperStyle = isMobile ? { height: 'calc(100vh - 60px)' } : {};
    
    return (
        <div className="video-chat-wrapper" style={wrapperStyle}>
            <div className="video-content">
            {meetingId && (
                <>
                    <div className="video-container">
                        <iframe
                            src={zoomUrl}
                            width="100%" 
                            height="100%"
                            allow="microphone; camera; fullscreen"
                            style={{ border: 'none' }}
                        />
                        <div className="handle-container" ref={handleRef}>
                            <div className="handle-line"></div>
                            <div className="handle-line"></div>
                            <div className="handle-line"></div>
                        </div>
                    </div>
                    <div className="audio-troubleshoot-button">
                        <a 
                            href={directZoomUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-zoom-audio"
                        >
                            Audio not working? Open in Zoom
                        </a>
                    </div>
                </>
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
    // Apply conditional styling based on device type
    const wrapperStyle = isMobile ? { height: 'calc(100vh - 60px)' } : {};
    
    return (
        <div className="video-chat-wrapper" style={wrapperStyle}>
            <div className="video-content flex items-center justify-center">
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