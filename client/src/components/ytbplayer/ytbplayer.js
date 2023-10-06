import React, { useEffect, useState, useRef } from 'react';

const YOUTUBE_API_KEY = 'AIzaSyBIeHriphT-A4SzDykXA-Vvo_87weQXgho';

function Ytbplayer({ videoId }) {
  const iframeRef = useRef(null);
  const [startTime, setStartTime] = useState(0);
  
  useEffect(() => {
    fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`)
      .then(response => response.json())
      .then(data => {
        const duration = data.items[0].contentDetails.duration;
        const videoDurationInSeconds = convertToSeconds(duration);
        
        const randomStart = Math.floor(Math.random() * (videoDurationInSeconds - 15));
        setStartTime(randomStart);
      });

    // Charge l'API YouTube IFrame si elle n'est pas déjà chargée
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const intervalCheck = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(intervalCheck);
        new window.YT.Player(iframeRef.current, {
          events: {
            'onStateChange': onPlayerStateChange
          }
        });
      }
    }, 100);

    function onPlayerStateChange(event) {
      if (event.data === window.YT.PlayerState.PLAYING) {
        event.target.getIframe().style.display = 'none';
      } else if (event.data === window.YT.PlayerState.ENDED) {
        event.target.getIframe().style.display = 'block';
      }
    }
  }, [videoId]);

  function convertToSeconds(duration) {
    const match = duration.match(/PT(\d+M)?(\d+S)?/);
    const minutes = (match[1] ? parseInt(match[1].replace('M', '')) : 0);
    const seconds = (match[2] ? parseInt(match[2].replace('S', '')) : 0);
    return minutes * 60 + seconds;
  }

  return (
    <div style={{ 
      overflow: 'hidden', 
      width: '560px', 
      height: '315px', 
      position: 'relative'
    }}>
      <iframe 
          ref={iframeRef}
          width="560" 
          height="400" 
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=0&enablejsapi=1&start=${startTime}&end=${startTime + 15}`}
          frameBorder="0"
          style={{ 
              position: 'absolute', 
              top: '-60px'
          }}
          title={`YouTube Video ${videoId}`}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen>
      </iframe>
    </div>
  );
}

export default Ytbplayer;