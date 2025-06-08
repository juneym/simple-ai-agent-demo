import axios from 'axios';

export class OpenAIService {
    private apiKey: string;
    private apiUrl: string;
    private modelName: string;

    constructor(apiKey: string, modelName: string) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.openai.com/v1/chat/completions'; // Example endpoint
        this.modelName = modelName;
    }

    public async makeAFriendlyWeatherMessage(data: any): Promise<string> {
        try {
            const userPrompt = "Generate a friendly weather message using Fahrenheit based on the following data: "
                + "\n\nWeather Data: " + JSON.stringify(data, null, 2)
                + "\n\nReturn only the message, no other text.";

            const response = await axios.post(this.apiUrl, {
                model: this.modelName,
                messages: [{ role: 'user', content: userPrompt }],
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error communicating with OpenAI: ` + error.message);
            } else {
                throw new Error('Error communicating with OpenAI: An unknown error occurred.');
            }
        }
    }

    public async parseZipCode(userInput: string): Promise<string> {
        try {
            const userPrompt = "Extract a valid US zip code from the following user message. "
                + "\n\nUser Message: " + userInput
                + "\n\nReturn only the zip code, no other text. "
                + "\n\nIf no zip code is found, return 'NO_ZIP'.";

            const response = await axios.post(this.apiUrl, {
                model: this.modelName,
                messages: [{ role: 'user', content: userPrompt }],
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error communicating with OpenAI: ` + error.message);
            } else {
                throw new Error('Error communicating with OpenAI: An unknown error occurred.');
            }
        }
    }

    public async handleAgenticInteraction(systemPrompt: string, userPrompt: string): Promise<string> {
        try {
            const response = await axios.post(this.apiUrl, {
                model: this.modelName,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                tools: [
                    {
                        name: "zipcode_parser_tool",
                        description: "Parses a US Zip code from a string"                    },
                    {
                        name: "weather_tool",
                        description: "Fetch weather data based on zip code.",
                        parameters: {
                            zip: "<zip_code>"
                        }
                    }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error communicating with OpenAI: ` + error.message);
            } else {
                throw new Error('Error communicating with OpenAI: An unknown error occurred.');
            }
        }
    }
}