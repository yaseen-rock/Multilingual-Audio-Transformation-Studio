# Multilingual-Audio-Transformation-Studio
The MP3 and Video to Translated Audio Converter is a web application that allows users to upload MP3 audio files or videos, convert the audio content to text, translate the text to a target language, and then convert the translated text back to audio. The app provides an interactive interface for users to easily upload files, select target languages, and download the converted audio output.

## Features

- Upload MP3 audio files or videos for conversion.
- Convert audio content to text using Google Cloud's Speech-to-Text API.
- Translate the text to a target language using the LibreTranslate API.
- Convert translated text back to audio using Google Cloud's Text-to-Speech API.
- Merge translated audio back into the video (for video uploads) using FFmpeg.
- Download the translated audio or the merged video with translated audio.

## Prerequisites

Before running the app, you'll need:

- Node.js and npm installed on your machine.
- Google Cloud credentials for the Speech-to-Text and Text-to-Speech APIs. Follow the [Google Cloud documentation](https://cloud.google.com/docs/authentication/getting-started) to set up and download your credentials.

## Getting Started

1. Clone this repository:

   ```bash
   git clone https://github.com/yaseen-rock/Multilingual-Audio-Transformation-Studio.git


   ```

2. Navigate to the project directory:

   ```bash
   cd Multilingual-Audio-Transformation-Studio
   ```

3. Install the backend dependencies:

   ```bash
   npm install
   ```

4. Set up your environment variables:

   Rename the `.env.example` file to `.env` and replace the placeholder values with your actual Google Cloud API credentials.

5. Start the backend server:

   ```bash
   npm start
   ```

6. Navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

8. Start the frontend using a live server:

   If you have the `live-server` package installed globally, you can run:

   ```bash
   live-server
   ```
   or you can use live server extension in vs code.
   Alternatively, you can use any other live server of your choice to serve the `index.html` file.

9. Open your browser and navigate to the provided local URL (usually `http://localhost:your_port`) to access the app.

 
## Usage

1. Upload an MP3 audio file or video using the respective "Upload & Convert" buttons.
2. Select a target language from the dropdown menu.
3. Click the "Upload & Convert" button to start the conversion process.
4. Once the conversion is complete, you can download the translated audio or the merged video with translated audio by clicking the "Download" buttons.

## Contributing

Contributions are welcome! If you have any suggestions or improvements, feel free to submit a pull request or create an issue.

## License

This project is licensed under the [MIT License](LICENSE).

---

You can customize this README template based on your project's specific details and requirements. Make sure to include any additional setup instructions or information that might be helpful for users and contributors.
