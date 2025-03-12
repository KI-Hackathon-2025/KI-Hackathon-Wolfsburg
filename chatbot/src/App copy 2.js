import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);  // 챗봇 팝업 상태 관리
  const [categoryData, setCategoryData] = useState([]);  // 카테고리 데이터를 상태로 관리

  const messagesRef = useRef(null);

  // 카테고리 데이터를 가져오기 (예시로 직접 JSON 데이터를 임포트한다고 가정)
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        // 실제로는 API로부터 카테고리 데이터를 받아와야 합니다.
        const response = await axios.get('/path/to/category.json');
        setCategoryData(response.data);
      } catch (error) {
        console.error('Failed to fetch category data:', error);
      }
    };

    fetchCategoryData();
  }, []);

  const handleSendMessage = async () => {
    if (!userMessage || loading) return;  // 로딩 중일 때는 전송하지 않도록 함

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);  // 메시지 상태 업데이트
    setLoading(true);

    // 메시지 전송 후 입력창 비우기 (setTimeout을 사용하여 처리)
    setTimeout(() => {
      setUserMessage('');
    }, 100);  // 100ms 뒤에 입력창 초기화

    try {
      // 카테고리 판별 후 OpenAI API 요청
      const categoryResult = await determineCategory(userMessage);

      // OpenAI API 호출
      const response = await openAIResponse(categoryResult, userMessage);

      // Flask 없이 바로 OpenAI에서 응답받은 메시지 처리
      const botMessage = response.data.choices[0].message.content;
      setMessages(prevMessages => [...prevMessages, { role: 'bot', content: botMessage }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [...prevMessages, { role: 'bot', content: '죄송합니다, 오류가 발생했습니다.' }]);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 판별 함수
  const determineCategory = async (userMessage) => {
    const categories = categoryData.map(cat => cat.content).join(", ");
    const prompt = `You are given the following categories: ${categories}.
    Based on the following user query, determine the most relevant category.
    Return only the category value without any additional text.
    
    User Query: "${userMessage}"
    Category:`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50
      }, {
        headers: {
          'Authorization': `Bearer YOUR_OPENAI_API_KEY`
        }
      });

      const categoryResult = response.data.choices[0].message.content.trim();
      return categoryResult;
    } catch (error) {
      console.error("Error determining category:", error);
      throw new Error('Error determining category');
    }
  };

  // OpenAI 응답 받기
  const openAIResponse = async (categoryResult, userMessage) => {
    const prompt = `
    Context: Based on the user query, provide a relevant response.
    Category: ${categoryResult}
    User Query: "${userMessage}"
    `;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer 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`
        }
      });

      return response;
    } catch (error) {
      console.error("Error from OpenAI:", error);
      throw new Error('Error getting OpenAI response');
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

  // 엔터키 전송 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 기본 엔터키 동작을 막음 (줄바꿈 방지)
      handleSendMessage(); // 메시지 전송 후 입력창 초기화
    }
  };

  return (
    <div className="App" style={{
      backgroundImage: `url('/page.png')`,  // public 폴더의 이미지 경로
      backgroundSize: 'cover',  // 배경 이미지 크기 조정
      backgroundPosition: 'center',  // 배경 이미지 위치
      backgroundAttachment: 'fixed',  // 스크롤 시 배경 고정
      height: '100vh',  // 화면 높이 100%
    }}>
      {/* 우측 하단 버튼 */}
      <button className="chat-toggle-button" onClick={toggleChatVisibility}>
        💬
      </button>

      {/* 팝업 대화창 */}
      {chatVisible && (
        <div className="chat-window">
          <div className="chat-header">
            <button className="close-chat" onClick={toggleChatVisibility}>
              X
            </button>
          </div>

          {/* 대화 내용 */}
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

          {/* 입력창 */}
          <div className="input-area">
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={handleKeyDown}  // 엔터키 입력 처리
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
