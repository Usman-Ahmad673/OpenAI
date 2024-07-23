const express = require('express');
const { config } = require('dotenv');
// const { Configuration, OpenAIApi } = require('openai');
const {OpenAI} = require("openai");
const cors = require('cors');


config();

const app = express();
app.use(cors());
const port = process.env.PORT || 3034;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});




app.get('/ask-me', async (req, res) => {
    console.log('Messages : ',req.query.msg);
    const msg = req.query.msg
    const messages = [{
        role: 'system',
        // content : `Weather teller in fahrenheit and You have objects of messages ${msg} in which type is your answers now you should aware to you previous answer before answer to new question.`
                content : `You are math instructor and You have objects of messages ${msg} in which type is your answers now you should aware to you previous answer before answer to new question.`
    },{
        role: req.query.role,
        content : req.query.question
    },{
        role: 'assistant',
        content : `I want a response in json format like {response : "x = 5 y = 6 x + y = 11" }`
    }]
    
    console.log(messages);
    try {
        const chatCompletion = await openai.chat.completions.create({
            // messages: [{ role: "user", content: "Say this is a test" }],
            model: "gpt-3.5-turbo",
            messages,
            temperature: 0.5,
        });


        console.log(chatCompletion.choices[0].message.content);
    
      res.send(chatCompletion.choices[0].message.content);
    } catch (error) {
        res.status(500).send(error);
    }
    

// console.log(chatCompletion.choices[0].message.content);
});













//Function Calling

const getCurrentWeather = async (city, unit = "fahrenheit") => {
    const apiKey = process.env.Open_WEATHER_API_KEY;
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        // console.log('temp',data);
        if (!data.main || typeof data.main.temp === 'undefined') {
            throw new Error('Invalid data received from weather API');
        }
        console.log(JSON.stringify({ location: city, temperature: data.main.temp, unit: "celsius" }));
        return JSON.stringify({ location: city, temperature: data.main.temp, unit: "celsius" });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};


  
app.get('/function-calling', async (req, res) => {
    console.log('Messages : ',req.query.msg);
    const msg = req.query.msg
    const messages = [
      { role: "user", content: `${msg}?` },
    ];
    //define your functions inside the tools (their params or which params are compulsory)
    const tools = [
      {
        type: "function",
        function: {
          name: "get_current_weather",
          description: "Get the current weather in a given location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state, e.g. San Francisco or CA but exluce countries if added like Pakistan or their abbreviations PK",
              },
              unit: { type: "string", enum: ["celsius", "fahrenheit"] },
            },
            required: ["location"],
          },
        },
      },
    ];

    try {
        //pass the messages you got from api and tool which have all your functions
        //tool_choice auto means the model decide autmatically to run one or more functions, tool_choice also has value none if you dont want to run any function or by defining your function instead of auto or none to tell it to run only that function
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            tools: tools,
            tool_choice: "auto",
        });

        const responseMessage = response.choices[0].message;     //responseMessage is the response against your api which have role=assistant, content=null and tool_calls (array of objects against the cities in your api)
        console.log('chat open ai response', responseMessage);

        //check if the model wanted to call a function
        const toolCalls = responseMessage.tool_calls;
        console.log('toolcalls : ', toolCalls);
        if (toolCalls) {
            // Model call the function
            const availableFunctions = {
                get_current_weather: getCurrentWeather,
            };
            messages.push(responseMessage); // extend conversation with assistant's reply

            for (const toolCall of toolCalls) {
                const functionName = toolCall.function.name;
                const functionToCall = availableFunctions[functionName];
                const functionArgs = JSON.parse(toolCall.function.arguments);
                console.log('functionArgs.location : ',functionArgs.location); // show locations
                const functionResponse = await functionToCall(
                    functionArgs.location,
                    functionArgs.unit
                );

                messages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: functionResponse, // Ensure this is a string
                });
            }
            
            console.log('New messages : ',messages);
            const secondResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: messages,
            });

            res.send(secondResponse.choices[0].message.content);
        }
    } catch (error) {
        console.error('Error in runConversation:', error);
    }
}
)
