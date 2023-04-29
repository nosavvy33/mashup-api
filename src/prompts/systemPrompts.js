const prompts = require('prompts');

const loopPromptsScript = [
    {
        type: 'confirm',
        name: 'continue',
        message: 'Do you want to create another playlist?',
    }
];

async function loopPrompt() {
    var confirm = await prompts(loopPromptsScript);
    return confirm;
}

module.exports = { loopPrompt }