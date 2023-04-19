# 🎶 Spotify Playlist Generation Script 🎧

This script generates a Spotify playlist based on the user's most listened tracks from multiple artists. The user can input multiple artists' names, and the script will create a new playlist containing up to 10 random tracks from each artist.

## 🖥️ Using the Executable File

For end users who do not wish to set up the script manually, you can provide an executable file that makes it easy to run the Spotify playlist generation script.

### Windows

1. Download the `spotify_playlist_generator.exe` file from the project's releases page.

2. Double-click on the `spotify_playlist_generator.exe` file to start the script.

3. Follow the on-screen prompts to authorize the app, input the artist names, and optionally provide a playlist name.

### macOS and Linux

1. Download the `spotify_playlist_generator` executable file from the project's releases page.

2. Open a terminal and navigate to the directory containing the downloaded executable file.

3. Make the file executable by running:

4. Start the script by running:

5. Follow the on-screen prompts to authorize the app, input the artist names, and optionally provide a playlist name.


## 🔧 Prerequisites

- Node.js (version 14 or higher)
- A Spotify Developer account
- A Spotify application with a registered `Client ID` and `Client Secret`

## 🚀 Setup

1. 📥 Clone the repository:


2. 📦 Install the required dependencies:


3. 🔑 Create a `.env` file based on the provided `.env.example` file, and fill in the required values:


Edit the `.env` file and add your `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.

4. ▶️ Run the script:


5. 🌐 Open the provided authorization URL in your web browser, log in to your Spotify account, and grant the necessary permissions.

6. 🔒 After authorizing the app, you will be redirected to another page notifying you authorization succeeded. The script will automatically handle the authorization process, so you can close the browser tab at this point.

7. 🎤 Enter the artist names (comma-separated) and the playlist name (optional) when prompted.

The script will fetch the top tracks from the specified artists and create a new playlist with a random selection of up to 10 tracks per artist.

## 📝 Logging

The script uses the `winston` logger to log messages to the console and a log file named `logs.txt`. Console logs only display messages with a level of 'info' and higher, while the log file includes messages with a level of 'debug' and higher.

## 📚 FAQ

### Why does the script ask for port 3000 to be opened?

The script requires port 3000 to be opened to set up a local web server for handling the Spotify OAuth 2.0 authentication process. This server listens for the redirect URI callback from Spotify after the user has authorized the app, allowing the script to receive the necessary access and refresh tokens.

### Is it safe to open port 3000 for this script?

Yes, it is safe to open port 3000 for this script. The local web server only listens for incoming connections from the Spotify OAuth 2.0 authentication process and does not serve any other content or expose any sensitive information. Once you've finished using the script, the local web server will be closed, and the port will no longer be in use.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
