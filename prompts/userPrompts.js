const prompts = require('prompts');

const playlistCreationPromptsScript = [
    {
        type: 'list',
        name: 'artistNames',
        message: 'Enter the artist names (comma-separated):',
        separator: ','
    },
    {
        type: 'text',
        name: 'playlistName',
        message: 'Enter the playlist name (leave empty for a default name):',
    },
];

module.exports.playlistCreationPrompt = async () => {
    await prompts(playlistCreationPromptsScript)
}

