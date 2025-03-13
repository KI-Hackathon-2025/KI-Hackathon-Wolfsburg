import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_KEY = "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";

const App = () => {
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [visaInfoData, setVisaInfoData] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const messagesRef = useRef(null);


  /** File Upload */

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Wählen Sie eine Datei");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const response = await fetch("http://localhost:5050/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.text();
        setUploadMessage(result);
      } else {
        setUploadMessage("Dateiupload fehlgeschlagen");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadMessage("Server-Fehler");
    } finally {
      setUploading(false);
    }
  };


  /** Chat Bot */
  // Function to fetch all JSON files in the crawling_data folder
  const fetchVisaFiles = async () => {
    const visaFiles = [];
    const folder = '/crawling_data/';

    const files = [
      'city_service.json',
      'visa.json',
    ];

    for (let filename of files) {
      try {
        const response = await axios.get(`${folder}${filename}`);
        const data = response.data;

        if (Array.isArray(data)) {
          visaFiles.push(...data);  // Merge data if it's an array
        } else {
          visaFiles.push(data); // For objects, add data
        }
      } catch (error) {
        console.error(`Error fetching ${filename}:`, error);
      }
    }
    return visaFiles;
  };

  // Prompt generation functions
  const createPrompt = (userMessage, categoryData) => {
    const categories = categoryData.map(cat => cat.content).join(', ');
    return `
      You are given the following categories: ${categories}.
      Based on the following user query, determine the most relevant category.
      Return only the category value without any additional text.
      User Query: "${userMessage}"
      Category: 
    `;
  };

  // Find the right category before sending a question to a GPT
  const determineCategory = (userMessage) => {
    // Create a prompt to select a category
    const prompt = createPrompt(userMessage, categoryData);

    // Using the OpenAI API to determine categories
    return axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      }
    }).then(response => {
      const categoryResult = response.data.choices[0].message.content.trim();
      return categoryResult;
    }).catch(error => {
      console.error("Error determining category:", error);
      return null;
    });
  };

  // Functions to find similar items (compare category and title)
  const findSimilarEntry = (categoryValue) => {
    const categoryValueLower = categoryValue.toLowerCase();
    const threshold = 0.8;  // Similarity criteria

    const bestEntry = visaInfoData.reduce((best, entry) => {
      const title = entry.title.toLowerCase();
      const similarity = similarityScore(categoryValueLower, title);
      if (similarity > threshold && similarity > best.score) {
        return { entry, score: similarity };
      }
      return best;
    }, { entry: null, score: 0 });

    return bestEntry.entry;
  };

  // Function to calculate the similarity of two strings (cosine similarity)
  const similarityScore = (a, b) => {
    const aTokens = a.split(' ');
    const bTokens = b.split(' ');
    const allTokens = [...new Set([...aTokens, ...bTokens])];

    const vectorA = allTokens.map(token => aTokens.filter(a => a === token).length);
    const vectorB = allTokens.map(token => bTokens.filter(b => b === token).length);

    const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));

    return dotProduct / (magnitudeA * magnitudeB);
  };

  // Function called when a user sends a message
  const handleSendMessage = async () => {
    if (!userMessage || loading) return;

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    const newMessage = { role: 'user', content: userMessage };

    setMessages(newMessages);  // Update message status
    setLoading(true);

    setTimeout(() => {
      setUserMessage('');
    }, 100);  // 100ms


    try {
      const category = await determineCategory(userMessage);  // Decide on a category
      console.log("Category Determined:", category);

      // Find similar items and include them in the prompt
      const matchingEntry = findSimilarEntry(category);

      const systemMessage = matchingEntry
        ? `Context: ${matchingEntry.content}\n\nInstruction: Provide an answer based on the above context if it answers the user's question. and give the url of the content. url is : ${matchingEntry.url}`
        : "No relevant context available. Provide a general answer.";


      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          ...messages.map(msg => (Array.isArray(msg) ? msg[0] : msg)),
          newMessage,
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      const botMessage = response.data.choices[0].message.content;

      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: botMessage }]);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: 'Entschuldigung, es ist ein Fehler aufgetreten.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Automatically scroll to the bottom of the dialog whenever the message changes
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Chatbot popup open/close functions
  const toggleChatVisibility = () => {
    setChatVisible(prevState => !prevState);
  };

  // Loading JSON files when components are mounted
  useEffect(() => {
    const loadJsonFiles = async () => {
      try {
        // Importing category files
        const categoryResponse = await axios.get('/category.json');
        setCategoryData(categoryResponse.data);

        const visaFiles = await fetchVisaFiles();
        setVisaInfoData(visaFiles);
      } catch (error) {
        console.error("Error loading JSON files:", error);
      }
    };

    loadJsonFiles();  // Loading JSON files when components are first loaded
  }, []);

  return (
    <div className="App" style={{
      backgroundImage: `url('/page.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      height: '100vh',
    }}>
      <button className="chat-toggle-button" onClick={toggleChatVisibility}>
        💬
      </button>

      {chatVisible && (
        <div className="chat-window">
          <div className="chat-header">
            <button className="close-chat" onClick={toggleChatVisibility}>X</button>
          </div>

          <div className="messages" ref={messagesRef}>
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                {message.role === 'assistant' && (
                  <img src="/Offizielles_Logo_Stadt_Wolfsburg_2018.png" alt="bot" className="profile-image" />
                )}
                <div className="message-content">{message.content}</div>
              </div>
            ))}
            {loading && <div className="loading">Ich bin am Nachdenken...</div>}
          </div>

          <div className="input-area">
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage() }}
              rows="3"
              placeholder="Bitte Nachricht eingeben..."
              className="input-field"
            />
            <button onClick={handleSendMessage} disabled={loading} className="send-button">
              {loading ? 'Wird gesendet...' : 'Senden'}
            </button>
            <div>
              <input type="file" onChange={handleFileChange} />
              <button onClick={handleUpload} disabled={uploading}>
                {uploading ? "Wird hochgeladen..." : "Hochladen"}
              </button>

              {uploadMessage && <p>{uploadMessage}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
