const API_URL = 'http://localhost:3000';

    let translatedAudioUrl = '';
    let translatedVideoUrl = '';

    async function uploadAudio() {
        const fileInput = document.getElementById('audioFileInput');
        const targetLanguage = document.getElementById('targetLanguage').value;
    
        const formData = new FormData();
        formData.append('mediaFile', fileInput.files[0]); // Use the same field name 'mediaFile' for audio
    
        try {
          const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const text = response.data;
          translateText(text, targetLanguage);
        } catch (error) {
          console.error('Error uploading and converting audio:', error);
        }
      }
    
      async function uploadVideo() {
        const fileInput = document.getElementById('videoFileInput');
        const targetLanguage = document.getElementById('videoTargetLanguage').value;
    
        const formData = new FormData();
        formData.append('mediaFile', fileInput.files[0]); // Use the same field name 'mediaFile' for video
    
        try {
          const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const text = response.data;
          translateText(text, targetLanguage, true);
        } catch (error) {
          console.error('Error uploading and converting video:', error);
        }
      }

    async function translateText(text, targetLanguage, isVideo = false) {
      try {
        const response = await axios.post(`${API_URL}/translate`, {
          text: text,
          targetLanguage: targetLanguage,
        });
        const translatedText = response.data;
        convertTextToAudio(translatedText, isVideo);
      } catch (error) {
        console.error('Error translating text:', error);
      }
    }

    async function convertTextToAudio(translatedText, targetLanguage, ancientLanguage, isVideo = false) {
        try {
          const response = await axios.post(`${API_URL}/convert-to-audio`, {
            text: translatedText,
            targetLanguage: targetLanguage,
            ancientLanguage: ancientLanguage,
          });
          const { targetAudioFileName, ancientAudioFileName } = response.data;
    
          if (isVideo) {
            translatedVideoUrl = `${API_URL}/${targetAudioFileName}`;
            translatedAncientAudioUrl = `${API_URL}/${ancientAudioFileName}`;
            showVideoPlayer();
            showAncientAudioPlayer(); // Display the ancient audio player for video case
          } else {
            translatedAudioUrl = `${API_URL}/${targetAudioFileName}`;
            showAudioPlayer();
            hideAncientAudioPlayer(); // Hide the ancient audio player for audio case
          }
        } catch (error) {
          console.error('Error converting text to audio:', error);
        }
      }

    async function downloadAudio() {
      if (translatedAudioUrl) {
        const a = document.createElement('a');
        a.href = translatedAudioUrl;
        a.download = 'translated_audio.mp3';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }

    async function downloadVideo() {
      if (translatedVideoUrl) {
        mergeAudioToVideo();
      }
    }

    async function mergeAudioToVideo() {
      if (!translatedVideoUrl || !translatedAudioUrl) {
        console.error('Translated video or audio URL not available.');
        return;
      }

      try {
        const response = await axios.post(`${API_URL}/merge-audio-to-video`, {
          videoPath: translatedVideoUrl,
          translatedAudioPath: translatedAudioUrl,
        });

        const mergedVideoUrl = `${API_URL}/${response.data}`;
        downloadMergedVideo(mergedVideoUrl);
      } catch (error) {
        console.error('Error merging audio to video:', error);
      }
    }

    async function downloadMergedVideo(videoUrl) {
      if (videoUrl) {
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = 'translated_video.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }

    function showAudioPlayer() {
      const audioPlayer = document.getElementById('translatedAudioPlayer');
      audioPlayer.src = translatedAudioUrl;
      audioPlayer.style.display = 'block';
      hideVideoPlayer();
    }

    function showVideoPlayer() {
      const videoPlayer = document.getElementById('translatedVideoPlayer');
      videoPlayer.src = translatedVideoUrl;
      videoPlayer.style.display = 'block';
      hideAudioPlayer();
    }

    function hideAudioPlayer() {
      const audioPlayer = document.getElementById('translatedAudioPlayer');
      audioPlayer.pause();
      audioPlayer.src = '';
      audioPlayer.style.display = 'none';
    }

    function hideVideoPlayer() {
      const videoPlayer = document.getElementById('translatedVideoPlayer');
      videoPlayer.pause();
      videoPlayer.src = '';
      videoPlayer.style.display = 'none';
    }