"use client";

import { Song } from "@/types";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { useEffect, useState } from "react";

import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import Slider from "./Slider";
import usePlayer from "@/hooks/usePlayer";
import useSound from "use-sound";

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const player = usePlayer();
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Yeni eklenen state'ler:
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  // Zaman formatlayıcı küçük yardımcı fonksiyon
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${paddedSeconds}`;
  };

  const onPlayNext = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const nextSong = player.ids[currentIndex + 1];

    if (!nextSong) {
      return player.setId(player.ids[0]);
    }

    player.setId(nextSong);
  };

  const onPlayPrevious = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const previousSong = player.ids[currentIndex - 1];

    if (!previousSong) {
      return player.setId(player.ids[player.ids.length - 1]);
    }

    player.setId(previousSong);
  };

  const [play, { pause, sound }] = useSound(songUrl, {
    volume: volume,
    onplay: () => setIsPlaying(true),
    onend: () => {
      setIsPlaying(false);
      onPlayNext();
    },
    onpause: () => setIsPlaying(false),
    format: "mp3",
  });

  // Ses yüklendiğinde çalma başlasın
  useEffect(() => {
    sound?.play();
    return () => {
      sound?.unload();
    };
  }, [sound]);

  // duration ve currentTime'ı düzenli olarak güncelle
  useEffect(() => {
    if (!sound) return;

    // Sesin total süresini alıyoruz
    setDuration(sound.duration() || 0);

    // 0.5sn'de bir currentTime güncelle
    const interval = setInterval(() => {
      if (sound) {
        setCurrentTime(sound.seek() as number);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [sound]);

  const handlePlay = () => {
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  };

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(1);
    } else {
      setVolume(0);
    }
  };

  // Slider'dan gelen currentTime değerini sese uygula (seek)
  const handleSeek = (value: number) => {
    setCurrentTime(value);
    sound?.seek(value);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 h-full">
      {/* Sol kısım: Şarkı bilgisi ve beğen butonu */}
      <div className="flex w-full justify-start">
        <div className="flex items-center gap-x-4">
          <MediaItem data={song} />
          <LikeButton songId={song.id} />
        </div>
      </div>

      {/* Orta kısım (mobil görünümde sadece Play/Pause) */}
      <div className="flex md:hidden col-auto w-full justify-end items-center">
        <div
          onClick={handlePlay}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-white p-1 cursor-pointer"
        >
          <Icon size={30} className="text-black" />
        </div>
      </div>

      {/* Orta kısım (desktop görünüm) */}
      <div className="hidden h-full md:flex flex-col items-center justify-center w-full max-w-[722px]">
        <div className="flex flex-row items-center gap-x-6 mb-2">
          <AiFillStepBackward
            onClick={onPlayPrevious}
            size={30}
            className="text-neutral-400 cursor-pointer hover:text-white transition"
          />
          <div
            onClick={handlePlay}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white p-1 cursor-pointer"
          >
            <Icon size={30} className="text-black" />
          </div>
          <AiFillStepForward
            onClick={onPlayNext}
            size={30}
            className="text-neutral-400 cursor-pointer hover:text-white transition"
          />
        </div>

        {/* İleri-geri sarma çubuğu + süreler */}
        <div className="flex flex-row items-center gap-x-2 w-full px-4">
          <span className="text-xs text-neutral-400">
            {formatTime(currentTime)}
          </span>
          <Slider
            // max: toplam süre
            max={duration}
            value={currentTime}
            onChange={(value) => handleSeek(value)}
          />
          <span className="text-xs text-neutral-400">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Sağ kısım: Volume */}
      <div className="hidden md:flex w-full justify-end pr-2">
        <div className="flex items-center gap-x-2 w-[120px]">
          <VolumeIcon
            onClick={toggleMute}
            size={34}
            className="cursor-pointer"
          />
          <Slider value={volume} onChange={(value) => setVolume(value)} />
        </div>
      </div>
    </div>
  );
};

export default PlayerContent;
