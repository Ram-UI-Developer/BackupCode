import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faPaperPlane, faComments, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Button, Form, InputGroup } from "react-bootstrap";
import { useSelector } from "react-redux";
import { extractScreenName, formatLabel, normalizePath, normalizeWord } from "./CurrencyFormate";
import { chatbtserv, getAllTemplates, uploadTemplate } from "../Services/OtherServices";

const Chatbot = () => {
  const userDetails = useSelector((state) => state.user.userDetails);
  let moduleNames =
    userDetails &&
    userDetails.menus &&
    userDetails["menus"].map((modules) =>
      modules.screenDTOs.map((e) => e.path)
    );
  let listPaths = moduleNames ? moduleNames.flat() : [];

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      type: "text",
      text: `Hi, ${!userDetails.firstName ? "" : userDetails.firstName} how can I help you?`,
    },
  ]);

  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  // ✅ NEW: Inactivity Timer Setup
  const inactivityTimerRef = useRef(null);
  const [inactivityPromptShown, setInactivityPromptShown] = useState(false);
  const [closeAfterNoTimeout, setCloseAfterNoTimeout] = useState(null);

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      if (isOpen && !inactivityPromptShown) {   // 👈 only when chat is open
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            type: "options",
            text: "Are you still there? Do you want to continue...",
            options: [
              { label: "Yes", icon: faCheck },   // 👈 added icon
              { label: "No", icon: faTimes },
            ],
          },
        ]);
        setInactivityPromptShown(true);
      }
    }, 10000); // 10 seconds
  };


  useEffect(() => {
    if (inputText && closeAfterNoTimeout) {
      clearTimeout(closeAfterNoTimeout);
      setCloseAfterNoTimeout(null);
    }
  }, [inputText, closeAfterNoTimeout]);

  useEffect(() => {
    if (isOpen) {
      resetInactivityTimer();
      setInactivityPromptShown(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      resetInactivityTimer();
      setInactivityPromptShown(false);
    }
  }, [messages, inputText]);



  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const voiceCommand = event.results[0][0].transcript.toLowerCase();
      processCommand(voiceCommand);
    };
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, []);

  const handleMessageSend = (e) => {
    if (e) e.preventDefault();
    if (inputText.trim()) {
      processCommand(inputText.trim().toLowerCase());
      setInputText("");
    } else {
      if (recognitionRef.current) {
        if (isListening) {
          recognitionRef.current.stop();
        } else {
          try {
            recognitionRef.current.start();
          } catch {
            console.warn("Recognition already started");
          }
        }
      }
    }
  };

  const findRoute = (command) => {
    const normalized = normalizeWord(command);
    return listPaths.filter((r) => normalizePath(r).includes(normalized));
  };

  const processCommand = (command) => {
    // user message first
    setMessages((prev) => [...prev, { sender: "user", type: "text", text: command }]);
    // trigger API
    onMessageHandler(command);
    resetInactivityTimer();
    setInactivityPromptShown(false);
  };

  const onMessageHandler = (message) => {
    chatbtserv({ body: { query: message, pathList: listPaths } })
      .then((res) => {
        setMessages((prev) => {
          const updated = [
            ...prev,
            { sender: "bot", type: "text", text: res.body, url: res.url, relatedquestions: res.relatedQuestions },
          ];

          // 🚫 Only run navigation logic if response is not "We could not find"
          if (!res.body.toLowerCase().includes("we could not")) {
            const lowerCommand = extractScreenName(message, listPaths);
            const matchedRoutes = findRoute(lowerCommand);

            if (matchedRoutes.length === 1) {
              if (location.pathname === matchedRoutes[0]) {
                return [...updated, { sender: "bot", type: "text", text: `You’re currently on the requested page.` }];
              }
              navigate(matchedRoutes[0]);
              return [...updated, { sender: "bot", type: "text", text: `Navigating to ${message}` }];
            } else if (matchedRoutes.length > 1) {
              const options = matchedRoutes.map((r) => ({ path: r, label: r.replace(/^\//, "") }));
              return [...updated, { sender: "bot", type: "options", text: `I found multiple "${message}" pages. Please choose:`, options }];
            } else if (lowerCommand.includes("home") || lowerCommand.includes("dashboard")) {
              navigate("/");
              return [...updated, { sender: "bot", type: "text", text: "Going back to Dashboard" }];
            }
          }
          return updated;
        });
      })
      .catch((err) => console.log(err));
  };

  const handlePopupClose = () => {
    setIsOpen(false);

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    setMessages([
      {
        sender: "bot",
        type: "text",
        text: `Hi, ${!userDetails.firstName ? "" : userDetails.firstName} how can I help you?`,
      },
    ]);
    setInputText("");
  };


  const [toastMsg, setToastMsg] = useState("");
  const [toastColor, setToastColor] = useState("#28a745");
  const fileInputRef = useRef(null);

  const onFileUploadHandler = (e) => {
    const file = e.target.files[0];
    let template = new FormData();
    file && template.append('file', file);
    uploadTemplate({
      entity: 'chatbot',
      body: template,
    })
      .then((res) => {
        setToastColor("#28a745");
        setToastMsg(res.message);
        setTimeout(() => setToastMsg(""), 3000);
      })
      .catch((err) => {
        setToastColor("#dc3545");
        setToastMsg(err.message);
      });
    setTimeout(() => setToastMsg(""), 3000);
    e.target.value = "";
  };

  const onFileDownHandler = async () => {
    try {
      const response = await getAllTemplates({ entity: 'chatbot' });
      if (response.status == 200) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "faq_import_template.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
        setToastMsg("Template downloaded successfully");
        setToastColor("#28a745");
      }
    } catch (err) {
      setToastMsg("Download failed");
      setToastColor("#dc3545");
    }
    setTimeout(() => setToastMsg(""), 3000);
  };
  const [isMinimized, setIsMinimized] = useState(false);
  const handleMinimize = (e) => {
    e.stopPropagation();
    setIsMinimized((prev) => !prev); // toggle between minimized / expanded
  };

  const buttonRef = useRef(null)             // <-- added
  const [chatStyle, setChatStyle] = useState(null) // <-- added (computed position)

  const computeChatPosition = () => {
    const btn = buttonRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const padding = 8
    const width = 340
    const height = 420

    // prefer render above the button else below; keep within viewport horizontally
    let top = rect.top - height - padding
    if (top < 8) top = rect.bottom + padding

    let left = rect.left + rect.width - width // align right edge of panel to icon
    if (left < 8) left = 8
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8

    setChatStyle({
      position: "fixed",
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${width}px`,
      maxHeight: `${height}px`,
      zIndex: 99999
    })
  }

  useEffect(() => {
    if (isOpen) computeChatPosition()
  }, [isOpen])

  useEffect(() => {
    const onResize = () => { if (isOpen) computeChatPosition() }
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onResize, true)
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onResize, true)
    }
  }, [isOpen])

  return (
    <>
      {toastMsg && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: toastColor, color: "#fff", padding: "8px 24px",
          borderRadius: "6px", zIndex: 9999, boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
        }}>
          {toastMsg}
        </div>
      )}
      {!isOpen && (
        <span ref={buttonRef} style={{ display: "inline-block" }}> {/* <-- wrapper with ref */}
          <Button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              resetInactivityTimer();
              setInactivityPromptShown(false);
              // compute position after open
              setTimeout(() => computeChatPosition(), 0);
            }}
            className=""
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: "50%",
              padding: 7
            }}
          >
            <FontAwesomeIcon icon={faComments} size="lg" />
          </Button>
        </span>
      )}

      {isOpen && (
        <div
          className={`chatbot-container ${isMinimized ? "minimized" : ""}`}
          style={{
            // merge computed chatStyle with some defaults
            ...(chatStyle || { position: "fixed", bottom: 60, right: 12, width: 320 }),
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="chatbot-header" title={isMinimized ? "Expand" : "Minimize"} onClick={(e) => {
            if (e.target.closest(".no-close")) return; // Prevent closing
            handleMinimize(e);
          }} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <div style={{ fontWeight: "bold", color: "blue" }}>
              Workshine Assist
            </div>
            {userDetails.organizationId == null && (
              <>
                <img title="Download Template" src="/dist/Images/downIcon.png" onClick={(e) => {
                  e.stopPropagation(); // ✅ Stop event from reaching header
                  onFileDownHandler();
                }}
                  className="no-close"
                  height={33} style={{ cursor: "pointer" }} />
                <img title="Upload File" className="no-close" src="/dist/Images/uploadIcon.png" height={33}
                  style={{ marginLeft: "-25px", cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current && fileInputRef.current.click(); }} />
                <input type="file" accept=".xlsx" ref={fileInputRef} className="no-close"
                  style={{ display: "none" }}
                  onClick={(e) => e.stopPropagation()} onChange={onFileUploadHandler} />
              </>
            )}
            {/* <img
             
              style={{
                width: 20,
                height: 20,
                cursor: "pointer",
                marginLeft: "auto",
                marginRight: 10,
              }}
              src={isMinimized ? "/dist/Images/upArrow.png" : "/dist/Images/downArrow.png"}
              title={isMinimized ? "Expand" : "Minimize"}
            /> */}
            <img onClick={handlePopupClose} style={{ width: 30, height: 30, cursor: "pointer" }}
              src="/dist/Images/crossx.png" />
          </div>
          {!isMinimized && (
            <>
              <div className="chatbot-messages">
                {messages.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: "12px" }}>
                    <div style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
                      {(!msg.type || msg.type === "text") && (
                        <span className="chat-message" style={{
                          background: msg.sender === "user" ? "#ec7931ff" : "#e5e5ea",
                          borderRadius: msg.sender === "user" ? "18px 0px 18px 18px" : "0px 18px 18px 18px"
                        }}>
                          {msg.text}
                          {msg.relatedquestions && msg.relatedquestions.length > 0 && (
                            <>
                              <br />
                              <div style={{ fontSize: "0.75rem", marginTop: "10px" }}>Related Questions:</div>
                              <div style={{ fontSize: "0.75rem", textAlign: "left" }}>
                                {msg.relatedquestions.map((question, index) => (
                                  <div style={{ color: "#007bff", textDecoration: "underline", fontSize: "0.75rem" }}
                                    key={index}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      onMessageHandler(question);
                                      setMessages((prev) => [...prev, {
                                        sender: "user", type: "text", text: question,
                                      }]);
                                    }}
                                  >
                                    {question}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          {msg.url && (
                            <>
                              <div style={{ marginTop: "2px", fontSize: "0.75rem" }}>{!msg.url ? "" : "Here’s a video :"}</div>
                              <div style={{ marginTop: "2px", fontSize: "0.75rem" }}>
                                <a href="#" style={{
                                  color: "#007bff", textDecoration: "underline", wordBreak: "break-all"
                                }}
                                  onClick={e => {
                                    e.preventDefault();
                                    const ytMatch = msg.url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
                                    if (ytMatch) {
                                      const embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
                                      setMessages(prev => [...prev, { sender: "bot", type: "video", url: embedUrl }]);
                                    } else {
                                      window.open(msg.url, "_blank", "noopener,noreferrer");
                                    }
                                  }}
                                >
                                  {msg.url}
                                </a>
                              </div>
                            </>
                          )}
                        </span>
                      )}
                      {msg.type === "video" && (
                        <iframe width="240" height="135" src={msg.url} title="Video"
                          frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen style={{ borderRadius: "10px", marginTop: "6px", display: "block" }} />
                      )}
                      {msg.type === "options" && (
                        <div className="options-container">
                          <span className="option-text">{msg.text}</span>
                          <ul className="list-unstyled">
                            {msg.options.map((opt, i) => (
                              <li key={i} style={{ marginBottom: "6px" }}>
                                <a href="#" onClick={(e) => {
                                  e.preventDefault();
                                  const label = opt.label.toLowerCase();
                                  if (label === "yes") {
                                    setMessages((prev) => [
                                      ...prev,
                                      { sender: "user", type: "text", text: "Yes" },
                                      { sender: "bot", type: "text", text: "Great! How can I help you further" },
                                    ]);
                                    resetInactivityTimer();
                                    setInactivityPromptShown(false);
                                    return;
                                  }
                                  if (label === "no") {
                                    setMessages((prev) => [
                                      ...prev,
                                      { sender: "user", type: "text", text: "No" },
                                      { sender: "bot", type: "text", text: "Okay, closing the chat. Have a great day!" },
                                    ]);
                                    const timeout = setTimeout(() => {
                                      handlePopupClose();
                                      setCloseAfterNoTimeout(null);
                                    }, 5000); // 5 sec delay before closing

                                    setCloseAfterNoTimeout(timeout);
                                    return;
                                  }
                                  if (location.pathname === opt.path) {
                                    if (!messages.some(msg => msg.text && msg.text.includes("We could not"))) {
                                      setMessages((prev) => [
                                        ...prev,
                                        { sender: "bot", type: "text", text: "You’re currently on the requested page." },
                                      ]);
                                      return;
                                    }
                                  }
                                  navigate(opt.path);
                                  setMessages((prev) => [
                                    ...prev,
                                    { sender: "user", type: "text", text: formatLabel(opt.label) },
                                    { sender: "bot", type: "text", text: `Navigating to ${formatLabel(opt.label)}...` },
                                  ]);
                                }} className="option-link">
                                  {formatLabel(opt.label)}
                                  {opt.icon && <FontAwesomeIcon icon={opt.icon} style={{ marginLeft: 6 }} />}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleMessageSend} style={{ padding: 5 }}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    style={{ height: 34 }}
                    placeholder="Type or speak..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <Button
                    type={inputText.trim() ? "submit" : "button"}
                    onClick={inputText.trim() ? undefined : handleMessageSend}
                  >
                    <FontAwesomeIcon
                      icon={inputText.trim() ? faPaperPlane : faMicrophone}
                      className={isListening ? "text-danger" : ""}
                    />
                  </Button>
                </InputGroup>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;
