import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Image, Send, X, Mic, Square, Trash2, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const emojiPickerRef = useRef(null);
  
  const { sendMessage, selectedUser } = useChatStore();
  const { socket } = useAuthStore();
  const typingTimeoutRef = useRef(null);

  // Close emoji picker on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const discardAudio = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleTyping = (e) => {
    setText(e.target.value);

    if (socket && selectedUser) {
      socket.emit("typing", { receiverId: selectedUser._id });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { receiverId: selectedUser._id });
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() && !imagePreview && !audioBlob) return;

    if (socket && selectedUser) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }

    let audioBase64 = null;
    if (audioBlob) {
      audioBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(audioBlob);
      });
    }

    await sendMessage({
      text: text.trim(),
      image: imagePreview,
      audio: audioBase64,
    });

    setText("");
    setImagePreview(null);
    setShowEmojiPicker(false);
    discardAudio();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 bg-cards border-t border-borders mt-auto relative">
      {imagePreview && !isRecording && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-borders shadow-sm"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-cards border border-borders flex items-center justify-center cursor-pointer hover:bg-danger text-text-main hover:text-white transition-colors"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {audioBlob && !isRecording && (
        <div className="mb-3 flex items-center gap-3 bg-borders/50 p-2 rounded-lg border border-borders max-w-sm">
          <audio src={URL.createObjectURL(audioBlob)} controls className="h-8 max-w-[200px]" />
          <button
            onClick={discardAudio}
            className="p-2 rounded-full hover:bg-danger/20 text-danger transition-colors cursor-pointer"
            title="Discard audio"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {isRecording ? (
        <div className="flex items-center gap-4 bg-borders/30 rounded-lg p-2 border border-borders">
          <div className="flex items-center gap-2 flex-1 pl-2">
            <div className="w-3 h-3 rounded-full bg-danger animate-pulse" />
            <span className="font-mono text-sm font-medium">{formatTime(recordingTime)}</span>
          </div>
          <button
            onClick={stopRecording}
            className="p-3 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors shadow-sm cursor-pointer"
          >
            <Square className="w-5 h-5 fill-white" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
          <div className="flex-1 flex gap-2 relative">
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors cursor-pointer"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="w-5 h-5" />
            </button>
            <input
              type="text"
              className="w-full bg-background border border-borders rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="Type a message..."
              value={text}
              onChange={handleTyping}
              disabled={!!audioBlob}
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 z-50 shadow-2xl" ref={emojiPickerRef}>
                <EmojiPicker 
                  onEmojiClick={handleEmojiClick} 
                  theme="auto"
                  searchDisabled={false}
                  skinTonesDisabled={true}
                  lazyLoadEmojis={true}
                />
              </div>
            )}
            
            {!audioBlob && (
              <button
                type="button"
                className={`p-3 rounded-lg border border-borders flex items-center justify-center transition-colors cursor-pointer ${
                  imagePreview ? "text-primary border-primary bg-primary/10" : "text-muted hover:text-text-main hover:bg-borders bg-background"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {!text.trim() && !imagePreview && !audioBlob ? (
            <button
              type="button"
              onClick={startRecording}
              className="p-3 text-muted border border-borders rounded-lg hover:bg-borders hover:text-text-main transition-colors shadow-sm cursor-pointer bg-background"
              title="Record Voice Message"
            >
              <Mic className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              className="p-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default MessageInput;
