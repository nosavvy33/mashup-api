const prompts = require('prompts');

const loopPromptsScript = [
    {
        type: 'confirm',
        name: 'continue',
        message: 'Do you want to create another playlist?',
    }
];

module.exports.loopPrompt = async () => {
    await prompts(loopPromptsScript);
}