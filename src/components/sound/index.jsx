import React, { useState, useEffect, useRef } from "react";

import "./index.scss";

function Sound({
  source,
  simultaneous = 2,
  interval = 1000,
  loop = false,
  onInteract,
}) {
  const [audioObjects, setAudioObjects] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const soundQueue = useRef([]);
  const intervalRef = useRef(null);

  // Preload audio files
  useEffect(() => {
    const loadAudio = async (src) => {
      return new Promise((resolve, reject) => {
        try {
          const audio = new Audio(src);
          audio.oncanplaythrough = () => resolve(audio);
          audio.onerror = () => {
            console.error(`Failed to load audio: ${src}`);
            reject(new Error(`Failed to load audio: ${src}`));
          };
        } catch (error) {
          console.error(`Error creating Audio object: ${src}`, error);
          reject(error);
        }
      });
    };

    const sources = Array.isArray(source) ? source : [source];
    Promise.all(
      sources.map((src) =>
        loadAudio(src).catch((error) => {
          console.error(error);
          return null;
        })
      )
    ).then((loadedAudios) => {
      const validAudios = loadedAudios.filter((audio) => audio !== null);
      setAudioObjects(validAudios);
      soundQueue.current = validAudios.map((_, index) => index);
    });
  }, [source]);

  // Function to play sounds from the queue
  const playSounds = () => {
    if (soundQueue.current.length === 0 || isPlaying || !audioObjects.length) {
      return;
    }

    setIsPlaying(true);
    const soundsToPlayIndices = soundQueue.current.splice(0, simultaneous);
    const soundObjectsToPlay = soundsToPlayIndices
      .map((index) => audioObjects[index])
      .filter((sound) => sound); // Filter out any undefined sounds

    if (soundObjectsToPlay.length === 0) {
      setIsPlaying(false);
      return;
    }

    let playedCount = 0;
    soundObjectsToPlay.forEach((sound) => {
      try {
        sound.currentTime = 0;
        sound.play().catch((error) => {
          console.error("Error playing sound:", error);
          playedCount++;
          if (playedCount === soundObjectsToPlay.length) {
            setIsPlaying(false);
          }
        });

        sound.onended = () => {
          playedCount++;
          if (playedCount === soundObjectsToPlay.length) {
            setIsPlaying(false);
            if (loop) {
              soundQueue.current.push(...soundsToPlayIndices);
            }
          }
        };
      } catch (error) {
        console.error("Error setting up sound:", error);
        playedCount++;
        if (playedCount === soundObjectsToPlay.length) {
          setIsPlaying(false);
        }
      }
    });
  };

  // Add useEffect for interval handling
  useEffect(() => {
    if (!showPopup && loop) {
      intervalRef.current = setInterval(playSounds, interval);
      return () => clearInterval(intervalRef.current);
    }
  }, [showPopup, loop, interval]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleButtonClick = () => {
    if (onInteract) {
      onInteract(true);
    }
    setShowPopup(false);
    playSounds();
  };

  useEffect(() => {
    console.log("Audio objects:", audioObjects);
    console.log("Sound queue:", soundQueue.current);
  }, [audioObjects]);

  return (
    <div>
      {showPopup && (
        <div className="prompt">
          <p>This project uses sound.</p>
          <p>Ensure your volume is set to a moderate level.</p>
          <button onClick={handleButtonClick}>Agree</button>
        </div>
      )}
    </div>
  );
}

export default Sound;
