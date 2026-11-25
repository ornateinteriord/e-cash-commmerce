import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  InputBase,
  IconButton,
  Avatar,
  CircularProgress,
  List,
  ListItem,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import GroupIcon from '@mui/icons-material/Group';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import CloseIcon from '@mui/icons-material/Close';
import EmojiPicker from 'emoji-picker-react';
import { useImageKitUpload } from '../../../api/Chat/chatService';
import * as api from '../../../api/Api';
import { toast } from 'react-toastify';
import moment from 'moment';

const THEME_COLOR = '#2c8786';
const BG_COLOR = '#efeae2';

export default function AdminChat() {
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const uploadMutation = useImageKitUpload();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sentMessages]);

  useEffect(() => {
    const fetchBroadcasts = async () => {
      try {
        const response: any = await api.get(`/chat/messages/GLOBAL_BROADCAST`);
        if (response.success) {
          setSentMessages(response.data);
        }
      } catch (error: any) {
        console.error("Failed to fetch broadcast messages:", error);
        toast.error(`Error fetching messages: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    };
    fetchBroadcasts();
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    setLoading(true);
    try {
      await api.post('/chat/message/send', { roomId: 'GLOBAL_BROADCAST', text: messageText, messageType: 'text' });
      // Let the fetch handle updates or optionally optimistic update
      // Since it's sent to the same room, we can just push it locally
      const newMsg = {
        _id: Date.now().toString(),
        text: messageText,
        messageType: 'text',
        createdAt: new Date().toISOString(),
        senderName: 'Admin',
        senderId: 'ADMIN_1',
      };
      
      setSentMessages(prev => [...prev, newMsg]);
      setMessageText("");
      setShowEmojiPicker(false);
      toast.success("Broadcast message sent successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiClick = (emojiObject: any) => {
    setMessageText(prev => prev + emojiObject.emoji);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const messageType = isImage ? 'image' : 'file';

    const uploadToast = toast.loading("Uploading...");
    
    uploadMutation.mutate(file, {
      onSuccess: async (data: any) => {
        toast.dismiss(uploadToast);
        
        const payload = {
          roomId: 'GLOBAL_BROADCAST',
          text: "",
          messageType,
          imageUrl: data.url,
          fileName: data.name,
          fileSize: data.size
        };

        try {
          await api.post('/chat/message/send', payload);
          const newMsg = {
            _id: Date.now().toString(),
            text: "",
            messageType,
            imageUrl: data.url,
            fileName: data.name,
            createdAt: new Date().toISOString(),
            senderName: 'Admin',
          };
          setSentMessages(prev => [...prev, newMsg]);
          toast.success("Broadcast file sent successfully!");
        } catch (error: any) {
          toast.error(error?.response?.data?.message || 'Failed to send broadcast');
        }
      },
      onError: () => {
        toast.dismiss(uploadToast);
        toast.error("File upload failed");
      }
    });
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: 'audio/webm' });
        
        stream.getTracks().forEach(track => track.stop());

        const uploadToast = toast.loading("Uploading voice message...");
        uploadMutation.mutate(audioFile, {
          onSuccess: async (data: any) => {
            toast.dismiss(uploadToast);
            
            const payload = { 
              roomId: 'GLOBAL_BROADCAST',
              text: "",
              messageType: 'audio',
              imageUrl: data.url, 
              fileName: 'Voice Message',
              fileSize: data.size
            };

            try {
              await api.post('/chat/message/send', payload);
              const newMsg = {
                _id: Date.now().toString(),
                text: "",
                messageType: 'audio',
                imageUrl: data.url,
                fileName: 'Voice Message',
                createdAt: new Date().toISOString(),
                senderName: 'Admin',
              };
              setSentMessages(prev => [...prev, newMsg]);
              toast.success("Voice message broadcasted!");
            } catch (error: any) {
              toast.error(error?.response?.data?.message || "Failed to broadcast voice message");
            }
          },
          onError: () => {
            toast.dismiss(uploadToast);
            toast.error("Failed to upload voice message");
          }
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Microphone access denied or not available");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{
      height: { xs: 'calc(100vh - 58px)', md: 'calc(100vh - 64px)' },
      mt: { xs: '58px', md: '64px' },
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Paper 
        elevation={0} 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          borderRadius: 0,
          bgcolor: '#fff'
        }}
      >
        {/* Chat Header */}
        <Box sx={{ 
          p: 2, 
          bgcolor: '#074571ff', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2 
        }}>
          <Avatar sx={{ bgcolor: 'white', color: THEME_COLOR }}>
            <GroupIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              All Users
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Broadcast to everyone
            </Typography>
          </Box>
        </Box>

        {/* Chat Messages Area */}
        <Box sx={{ 
          flex: 1, 
          bgcolor: BG_COLOR, 
          overflowY: 'auto', 
          p: 2,
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
        }}>
          {sentMessages.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', opacity: 0.5, flexDirection: 'column' }}>
              <GroupIcon sx={{ fontSize: 60, mb: 2 }} />
              <Typography>Messages you send here will be broadcasted to all users.</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {sentMessages.map((msg) => (
                <ListItem 
                  key={msg._id} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    mb: 2, 
                    px: 0 
                  }}
                >
                  <Box sx={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 1.5, 
                        bgcolor: '#e3f2fd', 
                        borderRadius: '16px 0 16px 16px',
                        position: 'relative',
                        wordBreak: 'break-word'
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {msg.messageType === 'image' && msg.imageUrl && (
                          <Box sx={{ mb: 1 }}>
                            <img src={msg.imageUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: '6px' }} />
                          </Box>
                        )}
                        {msg.messageType === 'file' && msg.imageUrl && (
                          <Box sx={{ mb: 1, p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                            <AttachFileIcon fontSize="small" sx={{ mr: 1, color: '#54656f' }} />
                            <Typography variant="body2" component="a" href={msg.imageUrl} target="_blank" rel="noopener noreferrer" sx={{ color: THEME_COLOR, textDecoration: 'none' }}>
                              {msg.fileName || "Download File"}
                            </Typography>
                          </Box>
                        )}
                        {msg.messageType === 'audio' && msg.imageUrl && (
                          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                            <audio controls src={msg.imageUrl} style={{ height: '40px', outline: 'none' }} />
                          </Box>
                        )}
                        {msg.text && (
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {msg.text}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, color: '#667781', fontSize: '0.7rem' }}>
                        {moment(msg.createdAt).format('LT')}
                      </Typography>
                    </Paper>
                  </Box>
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
          )}
        </Box>

        {/* Message Input Area */}
        <Box sx={{ p: '8px 12px', bgcolor: '#f0f2f5', display: 'flex', alignItems: 'center', gap: 0.5, position: 'relative' }}>
          {showEmojiPicker && (
            <Paper elevation={3} sx={{ position: 'absolute', bottom: '60px', left: '12px', zIndex: 100, borderRadius: '8px', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', bgcolor: '#f0f2f5', p: 0.5 }}>
                <IconButton size="small" onClick={() => setShowEmojiPicker(false)}><CloseIcon fontSize="small" /></IconButton>
              </Box>
              <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} />
            </Paper>
          )}

          <IconButton size="small" onClick={() => setShowEmojiPicker(!showEmojiPicker)} sx={{ color: '#54656f', p: 0.5 }}>
            <InsertEmoticonIcon />
          </IconButton>
          
          <IconButton size="small" onClick={() => fileInputRef.current?.click()} sx={{ color: '#54656f', p: 0.5 }}>
            <AttachFileIcon />
          </IconButton>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />

          <Box sx={{ flexGrow: 1, bgcolor: '#ffffff', borderRadius: '8px', px: 2, py: 0.5, display: 'flex', alignItems: 'center' }}>
            {isRecording ? (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', height: '40px' }}>
                <GraphicEqIcon sx={{ color: '#d32f2f', animation: 'pulse 1s infinite alternate', mr: 2 }} />
                <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 600 }}>Recording...</Typography>
                <style>{`@keyframes pulse { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0.5; transform: scale(1.1); } }`}</style>
              </Box>
            ) : (
              <InputBase
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type a broadcast message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{ py: 1, fontSize: '15px' }}
              />
            )}
          </Box>

          {messageText.trim() ? (
            <IconButton size="small" color="primary" onClick={handleSendMessage} disabled={loading} sx={{ bgcolor: THEME_COLOR, color: 'white', '&:hover': { bgcolor: '#206362' }, p: 1 }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
            </IconButton>
          ) : (
            <IconButton size="small" onClick={isRecording ? handleStopRecording : handleStartRecording} disabled={loading} sx={{ bgcolor: isRecording ? '#d32f2f' : THEME_COLOR, color: 'white', '&:hover': { bgcolor: isRecording ? '#b71c1c' : '#206362' }, p: 1 }}>
              {isRecording ? <StopIcon fontSize="small" /> : <MicIcon fontSize="small" />}
            </IconButton>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
