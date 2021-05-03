import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'

import Image from 'next/image';

import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0); // tempo em segundos

  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    togglePlay,
    setPlayingState,
    playPrevious,
    playNext,
    hasPrevious,
    hasNext,
    isLooping,
    toggleLoop,
    toggleShuffle,
    isShuffling,
    clearPlayerState,
  } = usePlayer();

  const episode = episodeList[currentEpisodeIndex];

  // Play/Pause
  useEffect(() => {
    // validando
    if (!audioRef.current) {
      return;
    }
    // play/pause
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying])

  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener("timeupdate", () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    })
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if(hasNext) {
      playNext();
    } else {
      clearPlayerState();
    }
  }

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora" />
        <strong>Tocando agora</strong>
      </header>

      { episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit="cover"
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>

          <div className={styles.slider}>
            {episode ? (
              <Slider
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff ' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>

          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {/*{episode && ... } só executa se for true
          {episode || ... } só executa se for false*/}
        {episode && (
          <audio
            ref={audioRef}
            src={episode.url}
            autoPlay
            loop={isLooping}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onEnded={handleEpisodeEnded}
            // dispara assim que o player conseguiu carregar os dados do episódio
            onLoadedMetadata={setupProgressListener}
          />
        )}

        <div className={styles.buttons}>
          <button type="button" onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ''}
            disabled={!episode || episodeList.length === 1}>
            <img src="/shuffle.svg" alt="Embaralhar" />
          </button>

          <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
            <img src="/play-previous.svg" alt="Tocar anterior" />
          </button>

          <button
            type="button"
            onClick={() => togglePlay()}
            className={styles.playButton}
            disabled={!episode}
          >
            {isPlaying
              ? <img src="/pause.svg" alt="Pausar" />
              : <img src="/play.svg" alt="Tocar" />
            }

          </button>

          <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
            <img src="/play-next.svg" alt="Tocar próxima" />
          </button>

          <button
            type="button"
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ''}
            disabled={!episode}
          >
            <img src="/repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>
    </div>
  )
}