
import {DomWatcher} from '../lib/dom/dom-watcher';
import {VideoPlayer} from '../lib/dom/video-player';

export default class VideoPlayerSample {
  constructor() {
    let video = document.getElementById('video');
    let time = document.getElementById('time');

    let videoPlayer = new VideoPlayer(video, {
        rafCallback: ()=> {
            time.textContent = videoPlayer.getTime();
        }
    });

    console.log(videoPlayer);
    const watcher = new DomWatcher();

    videoPlayer.load();

    // Button 1
    watcher.add({
      element: document.getElementById('button1'),
      on: 'click',
      callback: (event) => {
          videoPlayer.play();
      },
      eventOptions: {passive: true},
    });


    watcher.add({
      element: document.getElementById('button2'),
      on: 'click',
      callback: (event) => {
          videoPlayer.pause();
      },
      eventOptions: {passive: true},
    });

    watcher.add({
      element: document.getElementById('button3'),
      on: 'click',
      callback: (event) => {
          videoPlayer.reset();
      },
      eventOptions: {passive: true},
    });


    watcher.add({
      element: document.getElementById('button4'),
      on: 'click',
      callback: (event) => {
          videoPlayer.playFromTo(5, 6);
      },
      eventOptions: {passive: true},
    });

  }

}