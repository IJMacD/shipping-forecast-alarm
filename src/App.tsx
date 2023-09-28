import { MutableRefObject, useEffect, useRef, useState } from 'react'
import dashjs from 'dashjs';
import './App.css'
import { useNow } from './useNow';

const sourceURL = 'https://a.files.bbci.co.uk/ms6/live/3441A116-B12E-4D2F-ACA8-C1984642FA4B/audio/simulcast/dash/nonuk/pc_hd_abr_v2/aks/bbc_radio_fourfm.mpd';
const scheduleURL = 'https://ess.api.bbci.co.uk/schedules?serviceId=bbc_radio_fourfm';

interface ScheduleItem {
  brand: {
    title: string;
  };
  episode: {
    id: string;
    title: string;
  };
  published_time: {
    start: string;
    end: string;
  }
}

function App() {
  const videoRef: MutableRefObject<HTMLVideoElement|null> = useRef(null);
  const now = useNow();

  const schedule = useSchedule();

  const upcomingSchedule = schedule.filter(item => +new Date(item.published_time.end) > now);

  const nextEpisode: ScheduleItem|null = upcomingSchedule[0];

  const isPlaying = nextEpisode && +new Date(nextEpisode.published_time.start) < now;

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      var player = dashjs.MediaPlayer().create();
      player.initialize(videoRef.current, sourceURL, true);

      return () => player.destroy();
    }
  }, [isPlaying]);

  return (
    <>
      <video ref={videoRef} controls style={{display:"none"}} />
      {
        isPlaying ?
        <h1>Shipping Forecast Live</h1> :
        nextEpisode && <EpisodeCountdown item={nextEpisode} now={now} />
      }
    </>
  )
}

export default App

function EpisodeCountdown ({ item, now }: { item: ScheduleItem, now: number }) {
  const startDate = new Date(item.published_time.start);
  const delta = +startDate - now;

  const hours = Math.floor(delta / 3_600_000);
  const minutes = Math.floor((delta / 60_000) % 60);
  const seconds = Math.floor((delta / 1000) % 60);

  return (
    <div>
      <h1>Next Shipping Forecast: {startDate.toLocaleString()}</h1>
      <p style={{fontSize:"5em"}}>In {hours}:{minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}</p>
    </div>
  )
}

function useSchedule () {
  const [ schedule, setSchedule ] = useState([] as ScheduleItem[]);

  function update () {
    fetch(`https://proxy.cors.sh/${scheduleURL}`, {
      headers: {
        'x-cors-api-key': 'temp_0b634c6f1bc90be689e5ef4ee74d303d'
      }
    })
    .then(r => r.json())
    .then(d => {
      const items = d.items.filter((item: ScheduleItem) => item.brand.title === "Shipping Forecast");
      setSchedule(items);
    });
  }

  useEffect(() => {
    update();

    const id = setInterval(update, 3_600_000);
    return () => clearInterval(id);
  }, []);

  return schedule;
}