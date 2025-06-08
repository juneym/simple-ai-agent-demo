import axios from 'axios';
import WeatherService from './weatherService';


export class SmartAgentService {
    private apiKey: string;
    private apiUrl: string;
    private modelName: string;

    constructor(apiKey: string, modelName: string) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.modelName = modelName;
    }



    /**
     * Generates a friendly weather message based on the provided weather data.
     * @param weatherData The weather data to generate the message from.
     * @returns A friendly weather message.
     * @throws {Error} If there is an error communicating with the OpenAI API.
     */
    private async getFriendlyWeatherMessage(zip: string, userPrompt: string): Promise<string> {
        try {

            const weatherService = new WeatherService('https://mp6c02dee9ef0803dfc7.free.beeceptor.com');
            const weatherData = await weatherService.getWeatherByZip(zip);
            if (weatherData === "NO_WEATHER_DATA_FOR_ZIP") {
                return "No weather data found for the provided zip code.";
            }

            const systemPrompt = "Generate a friendly weather message using farenheit based on the following data and original user prompt: "
                             + "\n\nWeather Data: " + JSON.stringify(weatherData, null, 2)  
                             + "\n\nOriginal User Prompt: " + userPrompt 
                             + "\n\nReturn only the message, no other text. ";

            const response = await axios.post(this.apiUrl, {
                model: this.modelName, 
                messages: [{ role: 'system', content: systemPrompt }],
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error communicating with OpenAI: ` + (error as Error).message);
            } else {
                throw new Error('Error communicating with OpenAI: An unknown error occurred.');
            }
        }
    }


    /**
     * Generates a joke based on the provided theme using the OpenAI API.
     * @param jokeTheme The theme for the joke.
     * @returns A joke string.
     * @throws {Error} If there is an error communicating with the OpenAI API.
     */
    private async getNextJoke(jokeTheme: string): Promise<string> {
        try {
            const systemPrompt = "Generate a friendly and safe jokes for ages 10 year or older. The joke should be based on the following theme: "
                             + "\n\nJoke Theme: " + jokeTheme
                             + "\n\nReturn only the joke, no other text. ";  

            const response = await axios.post(this.apiUrl, {
                model: this.modelName, 
                messages: [{ role: 'system', content: systemPrompt }],
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error communicating with OpenAI: ` + (error as Error).message);
            } else {
                throw new Error('Error communicating with OpenAI: An unknown error occurred.');
            }
        }        
    }


    /**
     * Handles agentic interactions by processing user prompts and invoking tools as needed.
     * @param userPrompt The user's input prompt.
     * @returns A response string that may include tool invocation results.
     * @throws {Error} If there is an error communicating with the OpenAI API or processing the request.
     */
    public async handleAgenticInteraction(userPrompt: string): Promise<string> {
        try {

            const systemPrompt = 'You are a friendly smart assistant that is always willing to help limited to the tools you have available in the payload.'
                + 'Rules:\n'
                + '1. if a tool or function is not available to answer the user’s request, respond with a polite refusal explaining that you can only help with the available tools.'
                + '2. Do not use general knowledge or make up information, only use the tools available to you.'
                + '3. Always rely strickly on the inputs, outputs and documentations of the tools available to you.'
                + '4. Do not make up or speculate'


            const requestPayload = {
                model: this.modelName,
                messages: [
                    { role: 'user', content: userPrompt }, 
                    {role: 'system', content: systemPrompt} 
                ],
                functions: [
                    {
                        name: "weather_tool",
                        description: "Fetch weather data based on zip code or city",
                        parameters: {
                            type: "object",
                            properties: {
                                zip: { type: "string", description: "The zip code or city to fetch weather for" }
                            },
                            required: ["zip"]
                        }
                    },
                    {
                        name: "jokedb_tool",
                        description: "Generate fun, safe jokes for all ages.",
                        parameters: {
                            type: "object",
                            properties: {
                                joke_theme: { type: "string", description: "Generate a joke based on specific theme" }
                            },
                            required: ["joke_theme"]
                        }
                    }
                ]
            };

            //console.log("Request Payload:", JSON.stringify(requestPayload, null, 2));

            const response = await axios.post(this.apiUrl, requestPayload, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            const responseData = response.data;
            //console.log("Response Data:", JSON.stringify(responseData, null, 2));

            let finalResponse = "";

            // Process multiple tool function calls dynamically
            for (const choice of responseData.choices) {
                const functionCall = choice.message.function_call;
                if (functionCall) {
                    const { name, arguments: args } = functionCall;
                    //console.log(`Tool Invoked: ${name}`);
                    //console.log(`Tool Arguments: ${args}`);

                    switch (name) {
                        case "weather_tool":
                            const zip = JSON.parse(args).zip;
                            finalResponse += await this.getFriendlyWeatherMessage(zip, userPrompt) + "\n";
                            break;
                        case "jokedb_tool":
                            finalResponse += await this.getNextJoke(JSON.parse(args).joke_theme) + "\n";
                            break;
                        default:
                            //console.log(`Unknown tool invoked: ${name}`);
                            finalResponse += `Unknown tool invoked: ${name}\n`;
                            break;
                    }
                } else {
                    // If no tool is invoked, append the assistant's response
                    finalResponse += choice.message.content + "\n";
                }
            }

            return finalResponse.trim();
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error communicating with OpenAI: ${error.message}`);
            } else {
                throw new Error('Error communicating with OpenAI: An unknown error occurred.');
            }
        }
    }
}