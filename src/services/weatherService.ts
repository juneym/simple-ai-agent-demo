class WeatherService {
    private apiUrl: string;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    async getWeatherByZip(zip: string): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/get-weather?zip=${zip}`);
            //console.log(`[DEBUG] Fetching weather data from: ${this.apiUrl}/get-weather?zip=${zip}`);
            const rawResponse = await response.text();
            //console.log(`[DEBUG] Raw HTTP response: ${rawResponse}`);
            if (!response.ok) {
                throw new Error(`Error fetching weather data: ${response.statusText}`);
            }
            const data = JSON.parse(rawResponse);
            const weatherData = data.find((entry: any) => entry.zip_code === zip);
            if (weatherData) {
                return weatherData;
            } else {
                return "NO_WEATHER_DATA_FOR_ZIP";
            }
        } catch (error) {
            console.error(error);
            throw new Error('Failed to fetch weather data');
        }
    }
}

export default WeatherService;