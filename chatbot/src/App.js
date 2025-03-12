import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_KEY = "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";

const App = () => {
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);  // 챗봇 팝업 상태 관리
  const [categoryData, setCategoryData] = useState([]);  // 카테고리 데이터
  const [visaInfoData, setVisaInfoData] = useState([]);  // 비자 정보 데이터
  const messagesRef = useRef(null);

  // JSON 파일을 로드하는 함수
  // const loadJsonFiles = async () => {
  //   try {
  //     // 카테고리 파일 불러오기
  //     const categoryResponse = await axios.get('/category.json');
  //     setCategoryData(categoryResponse.data);

  //     const visaFiles = await fetchVisaFiles();
  //     setVisaInfoData(visaFiles);  // 불러온 데이터 설정
  //   } catch (error) {
  //     console.error("Error loading JSON files:", error);
  //   }
  // };

  // crawling_data 폴더 내 모든 JSON 파일을 불러오는 함수
  const fetchVisaFiles = async () => {
    const visaFiles = [];
    const folder = '/crawling_data/';

    // 실제 JSON 파일 이름으로 수정 필요
    const files = [
      'city_service.json',  // 실제 파일명으로 변경
      'visa.json',  // 실제 파일명으로 변경
    ];

    // 파일을 순차적으로 불러오고 데이터를 처리
    for (let filename of files) {
      try {
        const response = await axios.get(`${folder}${filename}`);
        const data = response.data;

        if (Array.isArray(data)) {
          visaFiles.push(...data); // 배열인 경우 데이터 병합
        } else {
          visaFiles.push(data); // 객체인 경우 데이터 추가
        }
      } catch (error) {
        console.error(`Error fetching ${filename}:`, error);
      }
    }
    return visaFiles;
  };

  // 프롬프트 생성 함수
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

  // GPT에게 질문을 전송하기 전, 적합한 카테고리 찾기
  const determineCategory = (userMessage) => {
    // 카테고리를 선택하는 프롬프트 생성
    const prompt = createPrompt(userMessage, categoryData);

    // OpenAI API를 사용해 카테고리 결정
    return axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`, // 여기에 OpenAI API 키 입력
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

  // 유사한 항목을 찾는 함수 (카테고리와 title을 비교)
  const findSimilarEntry = (categoryValue) => {
    const categoryValueLower = categoryValue.toLowerCase();
    const threshold = 0.8;  // 유사도 기준

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

  // 두 문자열의 유사도를 계산하는 함수 (cosine 유사도)
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

  // 사용자가 메시지를 보낼 때 호출되는 함수
  const handleSendMessage = async () => {
    if (!userMessage || loading) return;

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    const newMessagesForSend = { role: 'user', content: userMessage };

    setMessages(newMessages);  // 메시지 상태 업데이트
    setLoading(true);

    // 메시지 전송 후 입력창 비우기 (setTimeout을 사용하여 처리)
    setTimeout(() => {
      setUserMessage('');
    }, 100);  // 100ms 뒤에 입력창 초기화


    try {
      const category = await determineCategory(userMessage);  // 카테고리 결정
      console.log("Category Determined:", category);

      // 유사한 항목을 찾아서 프롬프트에 포함시킴
      const matchingEntry = findSimilarEntry(category);

      const systemMessage = matchingEntry
        ? `Context: ${matchingEntry.content}\n\nInstruction: Provide an answer based on the above context if it answers the user's question. Otherwise, answer based on general knowledge.`
        : "No relevant context available. Provide a general answer.";

      const messagesForAPI = [
        { role: 'system', content: systemMessage },
        newMessagesForSend
      ];

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: messagesForAPI,
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`, // 여기에 OpenAI API 키 입력
          'Content-Type': 'application/json',
        }
      });

      const botMessage = response.data.choices[0].message.content;

      setMessages(prevMessages => [...prevMessages, { role: 'bot', content: botMessage }]);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      setMessages(prevMessages => [...prevMessages, { role: 'bot', content: '죄송합니다, 오류가 발생했습니다.' }]);
    } finally {
      setLoading(false);
    }
  };

  // 메시지가 변경될 때마다 대화창 맨 아래로 자동으로 스크롤
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // 챗봇 팝업 열기/닫기 함수
  const toggleChatVisibility = () => {
    setChatVisible(prevState => !prevState);
  };

  // 컴포넌트가 마운트될 때 JSON 파일 로드
  useEffect(() => {
    const loadJsonFiles = async () => {
      try {
        // 카테고리 파일 불러오기
        const categoryResponse = await axios.get('/category.json');
        setCategoryData(categoryResponse.data);

        const visaFiles = await fetchVisaFiles();
        setVisaInfoData(visaFiles);  // 불러온 데이터 설정
      } catch (error) {
        console.error("Error loading JSON files:", error);
      }
    };

    loadJsonFiles();  // 컴포넌트가 처음 로드될 때 JSON 파일 로드
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
                {message.role === 'bot' && (
                  <img src="/Offizielles_Logo_Stadt_Wolfsburg_2018.png" alt="Bot" className="profile-image" />
                )}
                <div className="message-content">{message.content}</div>
              </div>
            ))}
            {loading && <div className="loading">생각 중...</div>}
          </div>

          <div className="input-area">
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage() }}
              rows="3"
              placeholder="메시지를 입력하세요..."
              className="input-field"
            />
            <button onClick={handleSendMessage} disabled={loading} className="send-button">
              {loading ? '전송 중...' : '전송'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
