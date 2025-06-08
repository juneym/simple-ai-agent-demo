import * as readline from 'readline';
import { OpenAIService } from './services/openAIService';
import fs from 'fs';
import { SmartAgentService } from './services/smartAgentService';
import 'dotenv/config';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const llmApiKey = process.env.OPENAI_API_KEY
if (!llmApiKey) {
    console.error('Error: OPENAI_API_KEY environment variable is not set.');
    process.exit(1);
}

const smartAgent = new SmartAgentService(llmApiKey, 'gpt-4.1-nano')
const systemPrompt = 'Hi! I am your smart assistant! How can I help you today? ';

const askQuestion = () => {
    rl.question('\n\n' + systemPrompt + '\n', async (input) => {
        
        try {
            const aiResponse = await smartAgent.handleAgenticInteraction(input);
            console.log(`\nAI Response:\n${aiResponse}`);

        } catch (error) {
            console.error('Error:', (error as Error).message);
        } finally {
            askQuestion();
        }
    });
};

askQuestion();