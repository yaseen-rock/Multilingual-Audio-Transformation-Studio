const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { SpeechClient } = require('@google-cloud/speech');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios').default;
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

// Configure multer to handle file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize the Google Cloud clients for speech-to-text, text-to-speech, and translation
const speechClient = new SpeechClient();
const textToSpeechClient = new TextToSpeechClient();


// LibreTranslate API endpoint
const LIBRETRANSLATE_URL = 'https://libretranslate.com/translate';

// Function to convert video to audio using ffmpeg
function convertVideoToAudio(videoPath, callback) {
  const outputPath = 'uploads/audio_output.mp3';
  ffmpeg(videoPath)
    .noVideo()
    .audioCodec('libmp3lame')
    .output(outputPath)
    .on('end', () => {
      callback(outputPath);
    })
    .run();
}

// Function to merge audio into video using ffmpeg
function mergeAudioToVideo(videoPath, audioPath, outputFilePath, callback) {
  ffmpeg()
    .input(videoPath)
    .input(audioPath)
    .outputOptions('-c:v copy')
    .outputOptions('-c:a aac')
    .outputOptions('-strict experimental')
    .outputOptions('-map 0:v:0')
    .outputOptions('-map 1:a:0')
    .output(outputFilePath)
    .on('end', () => {
      callback(outputFilePath);
    })
    .run();
}

// Upload audio file or video file and convert to text
app.post('/upload', upload.single('mediaFile'), async (req, res) => {
  try {
    let text = '';
    const mediaType = req.file.mimetype.split('/')[0];

    if (mediaType === 'audio') {
      const audioBytes = fs.readFileSync(req.file.path);

      const audio = {
        content: audioBytes.toString('base64'),
      };

      const request = {
        audio: audio,
        config: {
          encoding: 'MP3',
          sampleRateHertz: 44100,
          languageCode: 'en-US', // Replace with desired language code
        },
      };

      const [response] = await speechClient.recognize(request);

      text = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    } else if (mediaType === 'video') {
      convertVideoToAudio(req.file.path, async audioPath => {
        const audioBytes = fs.readFileSync(audioPath);

        const audio = {
          content: audioBytes.toString('base64'),
        };

        const request = {
          audio: audio,
          config: {
            encoding: 'MP3',
            sampleRateHertz: 44100,
            languageCode: 'en-US', // Replace with desired language code
          },
        };

        const [response] = await speechClient.recognize(request);

        text = response.results
          .map(result => result.alternatives[0].transcript)
          .join('\n');

        // Delete the temporary audio file
        fs.unlinkSync(audioPath);

        // Send the response
        res.send(text);
      });
      return;
    } else {
      res.status(400).send('Unsupported media type');
      return;
    }

    res.send(text);
  } catch (err) {
    console.error('Error uploading and converting media:', err);
    res.status(500).send('Error uploading and converting media');
  }
});

// Translate text using LibreTranslate
app.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    // Make a POST request to the LibreTranslate API
    const response = await axios.post(LIBRETRANSLATE_URL, {
      q: text,
      source: 'en', // Replace with the source language code if needed
      target: targetLanguage,
    });

    const translatedText = response.data.translatedText;
    res.send(translatedText);
  } catch (err) {
    console.error('Error translating text:', err);
    res.status(500).send('Error translating text');
  }
});

// Convert translated text to audio
app.post('/convert-to-audio', async (req, res) => {
    try {
      const { text, targetLanguage, ancientLanguage } = req.body;
  
      // Use Google Text-to-Speech API to synthesize speech in the selected target language
      const targetTtsRequest = {
        input: { text: text },
        voice: { languageCode: targetLanguage, ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
      };
  
      // Use Google Text-to-Speech API to synthesize speech in the selected ancient language (Latin in this example)
      const ancientTtsRequest = {
        input: { text: text },
        voice: { languageCode: ancientLanguage, ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
      };
  
      const [targetTtsResponse, ancientTtsResponse] = await Promise.all([
        textToSpeechClient.synthesizeSpeech(targetTtsRequest),
        textToSpeechClient.synthesizeSpeech(ancientTtsRequest),
      ]);
  
      const targetAudioContent = targetTtsResponse.audioContent;
      const ancientAudioContent = ancientTtsResponse.audioContent;
  
      const targetAudioFileName = 'translated_audio.mp3';
      const ancientAudioFileName = 'ancient_audio.mp3';
  
      fs.writeFileSync(targetAudioFileName, targetAudioContent, 'binary');
      fs.writeFileSync(ancientAudioFileName, ancientAudioContent, 'binary');
  
      res.send({ targetAudioFileName, ancientAudioFileName });
    } catch (err) {
      console.error('Error converting text to audio:', err);
      res.status(500).send('Error converting text to audio');
    }
  });

// Merge translated audio back into the video
app.post('/merge-audio-to-video', async (req, res) => {
  const { videoPath, translatedAudioPath } = req.body;

  try {
    const mergedVideoPath = 'uploads/translated_video_output.mp4';

    mergeAudioToVideo(videoPath, translatedAudioPath, mergedVideoPath, outputPath => {
      res.send(mergedVideoPath);
    });
  } catch (err) {
    console.error('Error merging audio to video:', err);
    res.status(500).send('Error merging audio to video');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
