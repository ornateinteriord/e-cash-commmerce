import React, { useState } from 'react';
import { Message } from '../../hooks/useChatSocket';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Download, FileText, Volume2 } from 'lucide-react';
import { styled } from '@mui/material/styles';
import ImageLightbox from './ImageLightbox';

interface MessageBubbleProps {
    message: Message;
    isSent: boolean;
    showAvatar?: boolean;
    showTimestamp?: boolean;
}

const SentBubble = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
    borderRadius: '16px',
    borderBottomRightRadius: '4px',
    background: 'linear-gradient(135deg, #00C853 0%, #00E676 100%)',
    color: '#FFFFFF',
    maxWidth: '70%',
    minWidth: 'fit-content',
    wordBreak: 'break-word',
    boxShadow: theme.shadows[1],
}));

const ReceivedBubble = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
    borderRadius: '16px',
    borderBottomLeftRadius: '4px',
    backgroundColor: '#0a2558',
    color: '#ffffff',
    maxWidth: '70%',
    minWidth: 'fit-content',
    wordBreak: 'break-word',
    boxShadow: theme.shadows[1],
    border: '1px solid #E2E8F0',
}));

const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isSent,
    showTimestamp = true,
}) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const formatTime = (date: Date | string) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return '';
        }
    };

    const handleDownload = async (url: string, fileName: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || 'download.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (e) {
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName || 'download.png';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const BubbleComponent = isSent ? SentBubble : ReceivedBubble;
    const isImage = message.messageType === 'image' && message.imageUrl;
    const isFile = message.messageType === 'file' && message.imageUrl;

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isSent ? 'flex-end' : 'flex-start',
                    mb: 1,
                    px: 1,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isSent ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                    }}
                >
                    <BubbleComponent elevation={1}>
                        {isImage && (
                            <Box
                                sx={{
                                    mb: message.text ? 1 : 0,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    '&:hover .download-btn': {
                                        opacity: 1,
                                    },
                                }}
                                onClick={() => setLightboxOpen(true)}
                            >
                                <Box
                                    component="img"
                                    src={message.imageUrl}
                                    alt="Image"
                                    sx={{
                                        maxWidth: '100%',
                                        maxHeight: 250,
                                        borderRadius: 1,
                                        display: 'block',
                                        transition: 'transform 0.2s ease',
                                        '&:hover': {
                                            transform: 'scale(1.02)',
                                        },
                                    }}
                                />
                                <IconButton
                                    className="download-btn"
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(message.imageUrl!, message.text?.includes('Eshopy-P2P:') || message.text?.includes('Ecash-P2P:') || message.text?.includes('BMS-P2P:') || message.imageUrl?.includes('qrserver') ? 'P2P_QR_Code.png' : 'chat_image.png');
                                    }}
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        left: 8,
                                        opacity: 0,
                                        transition: 'opacity 0.2s ease, background-color 0.2s ease',
                                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                                        color: '#ffffff',
                                        p: 0.8,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                        '&:hover': {
                                            bgcolor: 'rgba(0, 0, 0, 0.85)',
                                            color: '#0284C7',
                                        },
                                    }}
                                >
                                    <Download size={16} />
                                </IconButton>
                            </Box>
                        )}

                        {message.messageType === 'audio' && message.imageUrl && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1,
                                    mb: message.text ? 1 : 0,
                                    borderRadius: 1,
                                    bgcolor: isSent ? 'rgba(5, 9, 22, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                    minWidth: 200,
                                }}
                            >
                                <Volume2 size={20} color={isSent ? "#050916" : "#FFD700"} />
                                <audio
                                    controls
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                    }}
                                    src={message.imageUrl}
                                />
                            </Box>
                        )}

                        {isFile && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    p: 1,
                                    mb: message.text ? 1 : 0,
                                    borderRadius: 1,
                                    bgcolor: isSent ? 'rgba(5, 9, 22, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: isSent ? 'rgba(5, 9, 22, 0.15)' : 'rgba(255, 215, 0, 0.2)',
                                        color: isSent ? '#050916' : '#FFD700',
                                    }}
                                >
                                    <FileText size={20} />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        noWrap
                                        sx={{ fontWeight: 500, color: isSent ? '#050916' : '#fff' }}
                                    >
                                        {message.fileName || 'Document'}
                                    </Typography>
                                    {message.fileSize && (
                                        <Typography
                                            variant="caption"
                                            sx={{ color: isSent ? 'rgba(5, 9, 22, 0.7)' : 'rgba(255, 255, 255, 0.7)' }}
                                        >
                                            {formatFileSize(message.fileSize)}
                                        </Typography>
                                    )}
                                </Box>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDownload(message.imageUrl!, message.fileName || 'document')}
                                    sx={{
                                        color: isSent ? '#050916' : '#FFD700',
                                        '&:hover': {
                                            bgcolor: isSent ? 'rgba(5, 9, 22, 0.15)' : 'rgba(255, 215, 0, 0.1)',
                                        },
                                    }}
                                >
                                    <Download size={18} />
                                </IconButton>
                            </Box>
                        )}

                        {message.text && (
                            <Typography
                                variant="body2"
                                sx={{
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: 1.5,
                                    display: 'inline',
                                }}
                            >
                                {message.text}
                            </Typography>
                        )}

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                mt: 0.5,
                                justifyContent: isSent ? 'flex-end' : 'flex-start',
                            }}
                        >
                            {showTimestamp && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '10px',
                                        color: isSent ? 'rgba(5, 9, 22, 0.7)' : 'rgba(255, 255, 255, 0.6)',
                                    }}
                                >
                                    {formatTime(message.createdAt)}
                                </Typography>
                            )}

                            {isSent && (
                                <Box sx={{ display: 'flex', color: 'rgba(5, 9, 22, 0.7)' }}>
                                    {message.isRead ? (
                                        <CheckCheck size={12} />
                                    ) : (
                                        <Check size={12} />
                                    )}
                                </Box>
                            )}
                        </Box>
                    </BubbleComponent>
                </Box>
            </Box>

            {message.imageUrl && (
                <ImageLightbox
                    open={lightboxOpen}
                    imageUrl={message.imageUrl}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </>
    );
};

export default MessageBubble;
