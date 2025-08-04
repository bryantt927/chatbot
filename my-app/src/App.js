import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, useMemo} from "react";
import './App.css';
import {
    Button,
    Box,
    Container,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import MicIcon from '@mui/icons-material/Mic';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SendIcon from "@mui/icons-material/Send";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import GradientIcon from '@mui/icons-material/Gradient';
import axios from 'axios';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import Toolbar from '@mui/material/Toolbar';
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import ProfessorView from "./pages/ProfessorView";

// =============================================
// GLOBAL CONSTANTS / MOCK DATA
// =============================================
const mockMessages = [
    {
        role: 'assistant',
        content: 'Please select a chatbot to start the conversation.',
        text: 'Please select a chatbot to start the conversation.'
    },
];

// =============================================
// THEME DEFINITIONS
// Multiple theme variants for different user preferences
// =============================================
const createAppTheme = (mode) => {
    const themes = {
        light: {
            palette: {
                mode: 'light',
                primary: {
                    main: '#D32F2F', // Red
                    dark: '#B71C1C',
                    light: '#EF5350',
                },
                secondary: {
                    main: '#000000', // Black
                    dark: '#424242',
                    light: '#757575',
                },
                background: {
                    default: '#ffffff', // White background
                    paper: '#ffffff',
                },
                text: {
                    primary: '#000000', // Default text color is black
                    secondary: '#424242',
                },
                error: {
                    main: '#D32F2F',
                },
                success: {
                    main: '#4CAF50',
                },
                warning: {
                    main: '#FF9800',
                },
            },
        },
        dark: {
            palette: {
                mode: 'dark',
                primary: {
                    main: '#D32F2F', // Brighter red for dark mode
                    dark: '#D32F2F',
                    light: '#FF8A80',
                },
                secondary: {
                    main: '#ffffff', // White for contrast
                    dark: '#E0E0E0',
                    light: '#ffffff',
                },
                background: {
                    default: '#121212', // Dark background
                    paper: '#1E1E1E',
                },
                text: {
                    primary: '#ffffff', // White text
                    secondary: '#B0B0B0',
                },
                error: {
                    main: '#FF5252',
                },
                success: {
                    main: '#69F0AE',
                },
                warning: {
                    main: '#FFB74D',
                },
            },
        },
        gradient: {
            palette: {
                mode: 'light',
                primary: {
                    main: '#E91E63', // Pink
                    dark: '#AD1457',
                    light: '#F06292',
                },
                secondary: {
                    main: '#FF5722', // Red-orange
                    dark: '#D84315',
                    light: '#FF8A65',
                },
                background: {
                    default: '#FFE0E6', // Light pink base
                    paper: '#ffffff',
                },
                text: {
                    primary: '#2D1B69', // Dark purple for contrast
                    secondary: '#6A1B9A',
                },
                error: {
                    main: '#E91E63',
                },
                success: {
                    main: '#4CAF50',
                },
                warning: {
                    main: '#FF9800',
                },
            },
        },
    };

    return createTheme({
        ...themes[mode],
        typography: {
            fontFamily: 'Roboto, sans-serif',
            h4: {
                fontWeight: 500,
            },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        transition: 'all 0.3s ease',
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        transition: 'all 0.3s ease',
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderWidth: '1px',
                            },
                            '&:hover fieldset': {
                                borderWidth: '1px',
                            },
                            '&.Mui-focused fieldset': {
                                borderWidth: '2px',
                                borderColor: 'primary.main', // Keeps MUI's styled border
                                boxShadow: 'none',
                            },
                        },
                    },
                },
            },
        },
    });
};
// =============================================
// THEME SWITCHER COMPONENT
// =============================================
const ThemeSwitcher = ({ currentTheme, onThemeChange }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ mr: 1, fontWeight: 500 }}>
                Theme:
            </Typography>
            <ToggleButtonGroup
                value={currentTheme}
                exclusive
                onChange={(event, newTheme) => {
                    if (newTheme !== null) {
                        onThemeChange(newTheme);
                    }
                }}
                size="small"
                sx={{
                    '& .MuiToggleButton-root': {
                        px: 1.5,
                        py: 0.5,
                        border: 'none',
                        borderRadius: '8px !important',
                        mx: 0.5,
                        transition: 'all 0.3s ease',
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                        },
                    },
                }}
            >
                <ToggleButton value="light" aria-label="light mode">
                    <LightModeIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="dark" aria-label="dark mode">
                    <DarkModeIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="gradient" aria-label="gradient mode">
                    <GradientIcon fontSize="small" />
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
};
ThemeSwitcher.propTypes = {
    currentTheme: PropTypes.string.isRequired,
    onThemeChange: PropTypes.func.isRequired,
};



// =============================================
// CONVERSATION HISTORY DIALOG COMPONENT
// =============================================
const ConversationHistoryDialog = React.memo(({ showHistory, setShowHistory, conversationHistory }) => {
    return (
        <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="md" fullWidth>
            <DialogTitle>
                Conversation History ({conversationHistory.length} messages)
            </DialogTitle>
            <DialogContent>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {conversationHistory.length === 0 ? (
                        <Typography>No conversation history found.</Typography>
                    ) : (
                        conversationHistory.map((conv, index) => (
                            <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="primary">
                                    User:
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    {conv.user}
                                </Typography>
                                <Typography variant="subtitle2" color="secondary">
                                    Assistant:
                                </Typography>
                                <Typography variant="body2">
                                    {conv.assistant}
                                </Typography>
                            </Box>
                        ))
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setShowHistory(false)}>Close</Button>
            </DialogActions>
        </Dialog>
    );
});


ConversationHistoryDialog.propTypes = {
    showHistory: PropTypes.bool.isRequired,
    setShowHistory: PropTypes.func.isRequired,
    conversationHistory: PropTypes.array.isRequired,
};

// =============================================
// PASSWORD DIALOG COMPONENT
// =============================================
const PasswordDialog = ({ open, onClose, onAuthenticate, error }) => {
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        // Check the password against the one from the .env file
        if (password === process.env.REACT_APP_PROFESSOR_PASSWORD) {
            onAuthenticate(true);
            onClose();
        } else {
            onAuthenticate(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="password-dialog-title">
            <DialogTitle id="password-dialog-title">Professor Access Required</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="password"
                    label="Password"
                    type="password"
                    fullWidth
                    variant="standard"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    error={!!error}
                    helperText={error}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Submit</Button>
            </DialogActions>
        </Dialog>
    );
};

PasswordDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onAuthenticate: PropTypes.func.isRequired,
    error: PropTypes.string,
};

// =============================================
// PROTECTED ROUTE COMPONENT
// =============================================
const ProtectedRoute = ({ isAuthenticated, onAuthRequired, children }) => {
    useEffect(() => {
        if (!isAuthenticated) {
            onAuthRequired(); // Trigger the password dialog if not authenticated
        }
    }, [isAuthenticated, onAuthRequired]);

    // Render the children (the protected page) only if authenticated
    return isAuthenticated ? children : null;
};

ProtectedRoute.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    onAuthRequired: PropTypes.func.isRequired,
    children: PropTypes.element.isRequired,
};

// =============================================
// EMAIL TRANSCRIPT DIALOG COMPONENT
// =============================================
const EmailTranscriptDialog = React.memo((props) => {
    const {
        showEmailModal,
        setShowEmailModal,
        setEmailStatus,
        handleSendTranscript,
        selectedChatbot,
        chatbotConfigs
    } = props;

    const [studentName, setStudentName] = useState('');
    const [professorEmail, setProfessorEmail] = useState('');
    const [professorName, setProfessorName] = useState('');
    const [extraNote, setExtraNote] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const statusRef = useRef(null);

    useEffect(() => {
        if (showEmailModal) {
            const storedStudentName = localStorage.getItem('studentName');
            const storedStudentEmail = localStorage.getItem('studentEmail');
            if (storedStudentName) {
                setStudentName(storedStudentName);
            }
            if (storedStudentEmail) {
                setStudentEmail(storedStudentEmail);
            }
            setEmailStatus('');
        }
    }, [showEmailModal, setEmailStatus]);

    // useEffect to scroll when emailStatus changes so student sees the status message
    useEffect(() => {
        if (props.emailStatus && statusRef.current) {
            statusRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' }); // Use 'block: end' to ensure it's at the bottom
        }
    }, [props.emailStatus]);


    const currentChatbotName = selectedChatbot && chatbotConfigs[selectedChatbot]
        ? chatbotConfigs[selectedChatbot].name
        : 'General Chatbot';

    const defaultEmailMessage = `
Hi ${professorName || '...'},

Here is ${studentName || 'Student Name'}'s transcript for chatbot ${currentChatbotName} on ${new Date().toLocaleString()}.

Thanks
`;

    return (
        <Dialog open={showEmailModal} onClose={() => { setShowEmailModal(false); setEmailStatus(''); }} maxWidth="sm" fullWidth>
            <DialogTitle>Send Transcript</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            margin="dense"
                            id="studentName"
                            label="Your Name (for the email)"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={studentName}
                            onChange={(e) => {
                                setStudentName(e.target.value);
                                localStorage.setItem('studentName', e.target.value);
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            margin="dense"
                            id="studentEmail"
                            label="Your Email"
                            type="email"
                            fullWidth variant="outlined"
                            value={studentEmail}
                            onChange={(e) => {
                                setStudentEmail(e.target.value);
                                localStorage.setItem('studentEmail', e.target.value);
                            }}
                            required />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            margin="dense"
                            id="professorName"
                            label="Instructor's Name (Include Prefix if needed)"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={professorName}
                            onChange={(e) => setProfessorName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            margin="dense"
                            id="professorEmail"
                            label="Instructor's Email"
                            type="email"
                            fullWidth
                            variant="outlined"
                            value={professorEmail}
                            onChange={(e) => setProfessorEmail(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            Default Message:
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'background.default', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                            {defaultEmailMessage}
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            margin="dense"
                            id="extraNote"
                            label="Extra Note (Optional)"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            value={extraNote}
                            onChange={(e) => setExtraNote(e.target.value)}
                            placeholder="Add any additional notes for your instructor here..."
                        />
                    </Grid>
                </Grid>
                {props.emailStatus && (
                    <Typography
                        ref={statusRef}
                        variant="h6"
                        sx={{ 
                            mt: 2, 
                            fontSize: '2.0rem',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            color: props.emailStatus.includes('Failed') ? 'error.main' : 'success.main' 
                        }}
                    >
                        {props.emailStatus}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => { setShowEmailModal(false); setEmailStatus(''); }}>Close</Button>
                <Button
                    onClick={() => {
                        console.log('Sending transcript with:', { studentName, studentEmail, professorEmail, professorName, extraNote });
                        handleSendTranscript(studentName, studentEmail, professorEmail, professorName, extraNote);
                    }}
                    variant="contained"
                    color="primary"
                >
                    Send Email
                </Button>
            </DialogActions>
        </Dialog>
    );
});

EmailTranscriptDialog.propTypes = {
    showEmailModal: PropTypes.bool.isRequired,
    setShowEmailModal: PropTypes.func.isRequired,
    emailStatus: PropTypes.string.isRequired,
    setEmailStatus: PropTypes.func.isRequired,
    handleSendTranscript: PropTypes.func.isRequired,
    selectedChatbot: PropTypes.string.isRequired,
    chatbotConfigs: PropTypes.object.isRequired,
};

// =============================================
// PLAY AUDIO FUNCTION
// =============================================
const playAudio = (audioUrl) => {
    if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    }
};

// =============================================
// STYLED COMPONENTS
// =============================================
const UserMessage = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: '12px 26px 12px 22px',
    borderRadius: '16px 16px 0 16px',
    maxWidth: '70%',
    fontSize: '0.95rem',
    lineHeight: 1.4,
    transition: 'all 0.3s ease',
    margin: '8px 0',
    position: 'relative',
}));

const MessageWrapper = styled('div')(({ theme, align }) => ({
    display: 'flex',
    marginBottom: theme.spacing(1),
    justifyContent: align === 'user' ? 'flex-end' : 'flex-start',
}));

const AgentMessage = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[700],
    color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.white,
    padding: '12px 26px 12px 22px',
    borderRadius: '16px 16px 16px 0',
    maxWidth: '70%',
    fontSize: '0.95rem',
    lineHeight: 1.4,
    transition: 'all 0.3s ease',
    margin: '8px 0',
    position: 'relative',
}));

// =============================================
// CHAT MESSAGES DISPLAY COMPONENT
// =============================================
const ChatMessages = React.memo(React.forwardRef(({ messages, playAudio, generateTTSAudio, setMessages }, ref) => {
    const theme = useTheme();
    const bottomRef = useRef(null);

    useEffect(() => {
        // This prevents scrolling when `messages` is just `mockMessages` on initial load.
        if (messages.length > 1 || (messages.length === 1 && messages[0] !== mockMessages[0])) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]); 

    // Expose the internal scrollToBottom function via the ref
    useImperativeHandle(ref, () => ({
        scrollToBottom: () => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }));


    const handlePlayAudio = async (message, index) => {
        if (!message.audioUrl) {
            const audioUrl = await generateTTSAudio(message.text);
            if (audioUrl) {
                setMessages(prevMessages => {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[index] = {
                        ...updatedMessages[index],
                        audioUrl: audioUrl
                    };
                    return updatedMessages;
                });
                playAudio(audioUrl);
            }
        } else {
            playAudio(message.audioUrl);
        }
    };

    return (
        <Container>
            <Box sx={{
                width: '100%',
                mt: 4,
                maxHeight: 300,
                minHeight: 300,
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: (theme) => `${theme.palette.primary.main} transparent`,
                '&::-webkit-scrollbar': {
                    width: '8px',
                    borderRadius: '16px',
                    backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: (theme) => theme.palette.primary.main,
                    borderRadius: '16px',
                    border: '2px solid transparent',
                    backgroundClip: 'padding-box',
                    transition: 'background-color 0.3s ease',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: (theme) => theme.palette.primary.dark,
                },
                }}>
                <Paper elevation={0} sx={{ 
                    padding: 2, 
                    backgroundColor: 'transparent',
                    borderRadius: 2,
                    boxShadow: 'none'
                }}>
                    <List>
                        {messages.map((message, index) => (
                            <ListItem key={index} sx={{ padding: 0 }}>
                                <ListItemText
                                    sx={{ margin: 0 }}
                                    primary={
                                        <MessageWrapper align={message.role}>
                                            {message.role === 'user' ? (
                                                <UserMessage theme={theme}>
                                                    {message.text}
                                                    {message.audioUrl && (
                                                        <IconButton
                                                            size="small"
                                                            sx={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                right: 8,
                                                                transform: 'translateY(-50%)',
                                                                color: 'inherit',
                                                                opacity: 0.8,
                                                                '&:hover': { opacity: 1 }
                                                            }}
                                                            onClick={() => playAudio(message.audioUrl)}
                                                        >
                                                            <VolumeUpIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </UserMessage>
                                            ) : (
                                                <AgentMessage theme={theme}>
                                                    {message.text}
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: '50%',
                                                            right: 8,
                                                            transform: 'translateY(-50%)',
                                                            color: 'inherit',
                                                            opacity: 0.8,
                                                            '&:hover': { opacity: 1 }
                                                        }}
                                                        onClick={() => handlePlayAudio(message, index)}
                                                    >
                                                        <VolumeUpIcon fontSize="small" />
                                                    </IconButton>
                                                </AgentMessage>
                                            )}
                                        </MessageWrapper>
                                    }
                                />
                            </ListItem>
                        ))}
                        <div ref={bottomRef}/>
                    </List>
                </Paper>
            </Box>
        </Container>
    );
}))

ChatMessages.propTypes = {
    playAudio: PropTypes.func.isRequired,
    messages: PropTypes.array.isRequired,
    generateTTSAudio: PropTypes.func.isRequired,
    setMessages: PropTypes.func.isRequired,
};

// =============================================
// PROMPT EDITOR COMPONENT (FOR PROFESSORS) - V2
// This component allows creating new prompts and editing existing ones,
// with a two-step dropdown selection: Language -> Chatbot.
// =============================================


const PromptEditor = () => {
    // --- State Variables (all useState hooks must be here) ---
    const [allPrompts, setAllPrompts] = useState({});
    const [availableLanguages, setAvailableLanguages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedPromptTitle, setSelectedPromptTitle] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        name: '',
        language: '',
        level: '',
        initialText: '',
        prompt: ''
    });
    const [statusMessage, setStatusMessage] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    // NEW DELETE CODE ADDITION: State for Delete Dialog
    // These two lines MUST be here at the top with your other useState calls
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [promptToDelete, setPromptToDelete] = useState(null); // This holds the name of the prompt to be deleted


    // --- Helper Functions (like getUniqueLanguages) ---
    const getUniqueLanguages = (configs) => {
        const languages = Object.values(configs).map(config => config.language);
        return [...new Set(languages)].sort();
    };


    // =============================================
    // FETCH PROMPTS FUNCTION (Refactored: Outside useEffect, using useCallback)
    // This is now a standalone function that can be called by useEffect or confirmDelete
    // =============================================
    const fetchPrompts = useCallback(async () => {
        try {
            const response = await axios.get(`/api/data`);
            setAllPrompts(response.data);
            setAvailableLanguages(getUniqueLanguages(response.data));
        } catch (error) {
            console.error("Failed to fetch prompts:", error);
            setStatusMessage("Error: Could not load existing prompts.");
        }
    }, []); // Empty dependency array if getUniqueLanguages is also stable


    // --- useEffect to call fetchPrompts on component mount ---
    // This useEffect now just calls the defined fetchPrompts function
    useEffect(() => {
        fetchPrompts();
    }, [fetchPrompts]); // Add fetchPrompts to dependency array to satisfy ESLint hooks rule


    // --- Filtered Prompts (derived state) ---
    const getFilteredPrompts = () => {
        if (!selectedLanguage) return {};
        return Object.fromEntries(
            Object.entries(allPrompts).filter(([, config]) =>
                config.language === selectedLanguage
            )
        );
    };


    // =============================================
    // NEW DELETE CODE ADDITION: DELETE PROMPT FUNCTIONS
    // These functions MUST be here, after state and fetchPrompts
    // =============================================
    const handleDeletePrompt = (promptName) => { // This name matches the one in your JSX now
        setPromptToDelete(promptName);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        setOpenDeleteDialog(false); // Close the dialog immediately
        if (!promptToDelete) return; // promptToDelete is now defined
        console.log("Frontend attempting to delete prompt:", promptToDelete);
        try {
            const response = await axios.post('/api/delete_prompt', {
                prompt_name: promptToDelete,
            });

            if (response.data.success) {
                setStatusMessage(`Prompt "${promptToDelete}" deleted successfully!`); // Use setStatusMessage for feedback
                // Update PromptEditor's state to reflect deletion
                if (selectedPromptTitle === promptToDelete) { // Use selectedPromptTitle here
                    setSelectedPromptTitle(''); // Clear the editor's selected prompt
                    setIsEditMode(false); // Exit edit mode
                    // Reset the form data, keeping the current language
                    setFormData({
                        title: '',
                        name: '',
                        language: selectedLanguage, // Use selectedLanguage for consistency
                        level: '',
                        initialText: '',
                        prompt: ''
                    });
                }
                fetchPrompts(); // Call PromptEditor's fetchPrompts to refresh the dropdown/list
            } else {
                setStatusMessage(`Error deleting prompt: ${response.data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting prompt:', error);
            setStatusMessage('Failed to delete prompt. Please check console for details.');
        } finally {
            setPromptToDelete(null); // Clear the prompt to delete
        }
    };

    const cancelDelete = () => {
        setOpenDeleteDialog(false);
        setPromptToDelete(null);
    };


    // --- Handlers for Form and Dropdowns ---
    const handleLanguageChange = (event) => {
        const lang = event.target.value;
        setSelectedLanguage(lang);

        // Reset subsequent selections and the form
        setSelectedPromptTitle('');
        setIsEditMode(false);
        setFormData({
            title: '',
            name: '',
            language: lang, // Pre-fill the language field for a better UX when creating new prompts
            level: '',
            initialText: '',
            prompt: ''
        });
        setStatusMessage('');
    };

    const handleSelectPrompt = (event) => {
        const title = event.target.value;
        setSelectedPromptTitle(title);

        if (title && allPrompts[title]) {
            // If an existing prompt is selected, enter edit mode and fill the form
            setIsEditMode(true);
            setFormData({ title, ...allPrompts[title] });
            setStatusMessage(`Editing prompt: ${title}`);
        } else {
            // If "Create New" is selected, clear the form but keep the pre-filled language
            setIsEditMode(false);
            setFormData(prev => ({
                title: '',
                name: '',
                language: prev.language, // Keep the language from the first dropdown
                level: '',
                initialText: '',
                prompt: ''
            }));
            setStatusMessage('');
        }
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatusMessage('Saving...');

        const url = isEditMode
            ? `/api/update_prompt` // URL for updating
            : `/api/save_prompt`;  // URL for creating

        try {
            const response = await axios.post(url, formData);
            setStatusMessage(`Success: ${response.data.message}`);

            // Refresh the list of prompts after saving to ensure UI is up-to-date
            fetchPrompts(); // Call the refactored fetchPrompts

            // If a new prompt was created, set it as the selected item
            if (!isEditMode) {
                setSelectedPromptTitle(formData.title);
                setIsEditMode(true);
            }

        } catch (error) {
            const errorMessage = error.response?.data?.error || 'An unknown error occurred.';
            console.error("Failed to save prompt:", error);
            setStatusMessage(`Error: ${errorMessage}`);
        }
    };


    // --- JSX Return ---
    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Professor Prompt Editor</Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel id="language-select-label">1. Select Language</InputLabel>
                        <Select
                            labelId="language-select-label"
                            label="1. Select Language"
                            value={selectedLanguage}
                            onChange={handleLanguageChange}
                        >
                            {availableLanguages.map((lang) => (
                                <MenuItem key={lang} value={lang}>
                                    {lang}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    {/* The second dropdown only appears after a language is selected */}
                    {selectedLanguage && (
                        <FormControl fullWidth>
                            <InputLabel id="prompt-select-label">2. Select Prompt to Edit or Create New</InputLabel>
                            <Select
                                labelId="prompt-select-label"
                                label="2. Select Prompt to Edit or Create New"
                                value={selectedPromptTitle}
                                onChange={handleSelectPrompt}
                            >
                                <MenuItem value=""><em>-- Create a New Prompt in {selectedLanguage} --</em></MenuItem>
                                {Object.keys(getFilteredPrompts()).map((title) => (
                                    <MenuItem key={title} value={title}>Edit: {title}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </Grid>
            </Grid>

            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, opacity: selectedLanguage ? 1 : 0.5, pointerEvents: selectedLanguage ? 'auto' : 'none' }}>
                <Typography variant="h5" gutterBottom>{isEditMode ? `Editing: ${formData.title}` : (selectedLanguage ? `Create New ${selectedLanguage} Prompt` : 'Select a Language to Begin')}</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            name="title"
                            label="Title (Unique Identifier)"
                            value={formData.title}
                            onChange={handleFormChange}
                            fullWidth
                            required
                            // Title field is disabled when editing an existing prompt
                            disabled={isEditMode}
                            helperText={isEditMode ? "The title cannot be changed in edit mode." : "This must be a unique title for the chatbot."}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField name="name" label="Chatbot Name (e.g., Yoko Ono)" value={formData.name} onChange={handleFormChange} fullWidth required />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField name="language" label="Language" value={formData.language} onChange={handleFormChange} fullWidth required disabled />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField name="level" label="Level (e.g., Genki L17)" value={formData.level} onChange={handleFormChange} fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField name="initialText" label="Initial Greeting from Chatbot" value={formData.initialText} onChange={handleFormChange} fullWidth multiline rows={2} required />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField name="prompt" label="System Prompt (Instructions for the AI)" value={formData.prompt} onChange={handleFormChange} fullWidth multiline rows={6} required />
                    </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary" size="large">
                            {isEditMode ? 'Update Prompt' : 'Save New Prompt'}
                        </Button>

                        {/* NEW DELETE CODE ADDITION: Delete Button */}
                        {/* Only show delete button if a prompt is currently selected for editing */}
                        {selectedPromptTitle && ( // Changed from selectedPrompt to selectedPromptTitle
                            <Button
                                variant="contained"
                                color="error" // Use error color for delete actions
                                onClick={() => handleDeletePrompt(selectedPromptTitle)} // Call the correctly named function
                                sx={{ ml: 2 }} // Margin left for spacing
                            >
                                Delete Prompt
                            </Button>
                        )}
                    </Grid>
                </Grid>
                {statusMessage && (
                    <Typography
                        variant="body1"
                        sx={{
                            mt: 2,
                            fontWeight: 'bold',
                            color: statusMessage.startsWith('Error') ? 'error.main' : 'success.main'
                        }}
                    >
                        {statusMessage}
                    </Typography>
                )}
            </Paper>

            {/* NEW DELETE CODE ADDITION: Delete Confirmation Dialog */}
            {/* This Dialog must be within the PromptEditor's return statement */}
            <Dialog
                open={openDeleteDialog}
                onClose={cancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete the prompt: "<strong>{promptToDelete}</strong>"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openDeleteDialog}
                onClose={cancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete the prompt: "<strong>{promptToDelete}</strong>"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

// =============================================
// MAIN APP COMPONENT
// =============================================
function App(props) {
    const LANGUAGE_MAP = useMemo(() => ({
        English: 'en',
        Japanese: 'ja',
        Chinese: 'zh',
        Russian: 'ru',
        Arabic: 'ar',
        German: 'de',
        Vietnamese: 'vi',
        Korean: 'ko',
        Spanish: 'es',
        French: 'fr',
    }), []);

    // Theme state
    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('appTheme') || 'light';
    });

    // States for professor authentication
    const [isProfessorAuthenticated, setIsProfessorAuthenticated] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const [message, setMessage] = useState("");
    const [audioFile, setAudioFile] = useState(null);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
    const [selectedChatbot, setSelectedChatbot] = useState("");
    const [userToken, setUserToken] = useState(null);
    const [conversationLength, setConversationLength] = useState(0);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [chatbotConfigs, setChatbotConfigs] = useState({});
    const [isLoadingConfigs, setIsLoadingConfigs] = useState(true);

    // const flaskHOST = process.env.REACT_APP_FLASK_HOST;
    //const flaskPORT = process.env.REACT_APP_FLASK_PORT;


    const location = useLocation(); 
    const chatMessagesRef = useRef(null);

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailStatus, setEmailStatus] = useState('');


    const [messages, setMessages] = useState(mockMessages);
    const [language, setLanguage] = useState("");


    // Theme change handler
    const handleThemeChange = (newTheme) => {
        setCurrentTheme(newTheme);
        localStorage.setItem('appTheme', newTheme);
    };

    // Create theme based on current selection
    const theme = createAppTheme(currentTheme);

    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [availableLanguages, setAvailableLanguages] = useState([]);

    const getUniqueLanguages = (configs) => {
        const languages = Object.values(configs).map(config => config.language);
        return [...new Set(languages)].sort();
    };


    

    // =============================================
    // FETCH CHATBOT CONFIGURATIONS
    // =============================================
    const fetchChatbotConfigs = useCallback(async () => {
        try {
            setIsLoadingConfigs(true);
            const response = await axios.get(`/api/data`);

            console.log('Fetched chatbot configs:', response.data);

            if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
                setChatbotConfigs(response.data);
                const languages = getUniqueLanguages(response.data);
                setAvailableLanguages(languages);
            } else {
                console.error('Unexpected data format:', response.data);
                setChatbotConfigs({});
                setAvailableLanguages([]);
            }
        } catch (error) {
            console.error('Error fetching chatbot configs:', error);
            setChatbotConfigs({});
        } finally {
            setIsLoadingConfigs(false);
        }
    }, []); 

    // =============================================
    // CONVERSATION MANAGEMENT FUNCTIONS
    // =============================================

    // Wrapped in useCallback to ensure a stable function reference
    const generateNewUserToken = useCallback(async () => {
        try {
            console.log('Requesting new user token from backend...');
            const response = await axios.post(`/api/start_conversation`);
            const newToken = response.data.user_token;
            return newToken;
        } catch (error) {
            console.error('Error generating new user token:', error);
            return null;
        }
    }, []); // Empty dependency array for stability

    // =============================================
    // COMPONENT INITIALIZATION EFFECT
    // =============================================
    useEffect(() => {
        let isMounted = true; // Flag to track if component is mounted

        const initializeApp = async () => {
            // Only proceed if the component is still mounted
            if (!isMounted) return;

            // Call fetchChatbotConfigs here. Since it's memoized with useCallback,
            // React knows it's the same function reference, and it will only execute
            // its internal logic once per mount cycle (even in Strict Mode's double render).
            await fetchChatbotConfigs();

            // Check localStorage for an existing token first.
            // Only generate a new token if one truly doesn't exist.
            let storedToken = localStorage.getItem('userToken');
            if (!storedToken) {
                const newToken = await generateNewUserToken();
                if (isMounted && newToken) { // Check isMounted again before setting state
                    localStorage.setItem('userToken', newToken);
                    setUserToken(newToken);
                    console.log('App initialized with NEW token::', newToken);
                }
            } else {
                if (isMounted) { // Check isMounted before setting state
                    setUserToken(storedToken);
                    console.log('App initialized with EXISTING token::', storedToken);
                }
            }

            // Set the initial greeting message. This should happen regardless of token generation.
            if (isMounted) {
                setMessages(mockMessages);
            }
        };

        initializeApp();

        // Cleanup function: set isMounted to false when component unmounts
        return () => {
            isMounted = false;
        };
    }, [fetchChatbotConfigs, generateNewUserToken]);



    // =============================================
    // CLEAR CONVERSATION HISTORY FUNCTION
    // =============================================
    const clearConversationHistory = useCallback(async () => {
        try {
            if (userToken) {
                await axios.post(`/api/clear_conversation`, {
                    user_token: userToken
                });
                console.log(`Cleared history for token: ${userToken}`);
            }

            const newToken = await generateNewUserToken();
            if (newToken) {
                localStorage.setItem('userToken', newToken);
                setUserToken(newToken); // Update state with the new token
                setConversationLength(0); // Reset conversation length here for the new token
            }
            setMessages(mockMessages);
            setEmailStatus('');
        } catch (error) {
            console.error('Error clearing conversation:', error);
        }
    }, [userToken, generateNewUserToken, setMessages, setUserToken, setConversationLength, setEmailStatus]); 

    const loadConversationHistory = async () => {
        try {
            //const response = await axios.get(`https://${flaskHOST}:${flaskPORT}/get_conversation?user_token=${userToken}`);
            const response = await axios.get(`/api/get_conversation?user_token=${userToken}`);
            setConversationHistory(response.data.conversations);
            setShowHistory(true);
        } catch (error) {
            console.error('Error loading conversation history:', error);
        }
    };

    // =============================================
    // TEXT-TO-SPEECH (TTS) FUNCTION
    // =============================================
    const generateTTSAudio = useCallback(async (text) => {
        try {
            //const response = await axios.post(`https://${flaskHOST}:${flaskPORT}/tts`, {
            const response = await axios.post(`/api/tts`, {
                text: text,
                voice: 'alloy'
            });

            if (response.data && response.data.audio_filename) {
                //const audioUrl = `https://${flaskHOST}:${flaskPORT}/audio/${response.data.audio_filename}`;
                const audioUrl = `/api/audio/${response.data.audio_filename}`;
                console.log("Generating text to speech");
                return audioUrl;
            }
            return null;
        } catch (error) {
            console.error('Error generating TTS:', error);
            return null;
        }
    }, []);

    //Config Change Starts Here
    // =============================================
    // HANDLE CHATBOT CHANGE FUNCTION
    // =============================================
    const handleChatbotChange = useCallback(async (event) => {
        const chatbot = event.target.value;
        setSelectedChatbot(chatbot);

        if (!chatbot || !chatbotConfigs[chatbot]) {
            setMessages(mockMessages);
            return;
        }

        // When a new chatbot is selected, always generate a new token for the new conversation.
        const newToken = await generateNewUserToken();
        if (!newToken) {
            console.error("Failed to generate new token on chatbot change.");
            return;
        }
        setUserToken(newToken);
        localStorage.setItem('userToken', newToken);
        setConversationLength(0); // Reset conversation length here for the new token

        const config = chatbotConfigs[chatbot];
        setLanguage(config.language);
        localStorage.setItem("chatbotLanguage", config.language);

        const initialGreetingMessage = {
            role: 'assistant',
            content: config.initialText,
            text: config.initialText
        };
        setMessages([initialGreetingMessage]);

        const audioUrl = await generateTTSAudio(config.initialText);

        // Only update the initial greeting with audioUrl if it's still the current message
        setMessages(prevMessages => {
            if (prevMessages.length === 1 && prevMessages[0].content === config.initialText) {
                return [{ ...prevMessages[0], audioUrl: audioUrl }];
            }
            return prevMessages;
        });
        // Removed redundant generateNewUserToken() call here.
    }, [chatbotConfigs, generateNewUserToken, generateTTSAudio, setMessages, setLanguage, setSelectedChatbot, setUserToken, setConversationLength]);

    const handleLanguageChange = (event) => {
        const language = event.target.value;
        setSelectedLanguage(language);
        setSelectedChatbot(""); // Reset chatbot selection when language changes
        setMessages(mockMessages);
    };

    const getFilteredChatbots = () => {
        if (!selectedLanguage) return {};
        
        return Object.fromEntries(
            Object.entries(chatbotConfigs).filter(([key, config]) => 
                config.language === selectedLanguage
            )
        );
    };

    // =============================================
    // AUDIO RECORDING COMPONENT
    // =============================================
    const AudioControls = () => {
        const [isRecording, setIsRecording] = useState(false);
        const mediaRecorderRef = useRef(null);
        const audioChunksRef = useRef([]);
        const mediaStreamRef = useRef(null);

        useEffect(() => {
            return () => {
                if (mediaStreamRef.current) {
                    mediaStreamRef.current.getTracks().forEach(track => track.stop());
                }
            };
        }, []);

        const startRecording = async () => {
            try {
                setAudioFile(null);
                setRecordedAudioUrl(null);
                mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current, {
                    mimeType: 'audio/webm;codecs=opus'
                });
                audioChunksRef.current = [];
                mediaRecorderRef.current.start();
                setIsRecording(true);

                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
                    const audioFile = new File([audioBlob], "voice-message.webm", {
                        type: 'audio/webm;codecs=opus',
                        lastModified: Date.now(),
                    });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setRecordedAudioUrl(audioUrl);
                    setIsRecording(false);
                    setAudioFile(audioFile);
                };
            } catch (e) {
                console.error("Error accessing microphone:", e);
                alert("Error accessing microphone: " + e.message);
                setIsRecording(false);
            }
        };
        
        const stopRecording = () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }
        };

        const playRecording = () => {
            if (recordedAudioUrl) {
                const audio = new Audio(recordedAudioUrl);
                audio.play().catch(error => {
                    console.error('Error playing recording:', error);
                });
            }
        };

        return (
            <Container>
                <Box sx={{ width: "100%", mt: 4 }}>
        		<Grid container spacing={1} justifyContent="center" alignItems="center" sx={{ flexWrap: 'nowrap' }}>
            		  <Grid item xs="auto">
                            <IconButton
                                color="primary"
                                aria-label="start recording"
                                onClick={startRecording}
                                disabled={isRecording}
                                sx={{
                                    backgroundColor: 'background.paper',
                                    boxShadow: 2,
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: 4,
                                    },
                                }}
                            >
                                <MicIcon />
                            </IconButton>
                        </Grid>
                        <Grid item xs={12} md>
                            <IconButton
                                color="secondary"
                                aria-label="stop recording"
                                onClick={stopRecording}
                                disabled={!isRecording}
                                sx={{
                                    backgroundColor: 'background.paper',
                                    boxShadow: 2,
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: 4,
                                    },
                                }}
                            >
                                <FiberManualRecordIcon />
                            </IconButton>
                        </Grid>
                        <Grid item xs="auto">
                            <Button
                                variant="outlined"
                                disableElevation
                                onClick={playRecording}
                                disabled={isRecording || !recordedAudioUrl}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                }}
                            >
                                Preview Recording
                            </Button>
                        </Grid>
                        <Grid item xs="auto">
                            <Button
                                variant="contained"
                                color="primary"
                                disableElevation
                                onClick={() => uploadAudio()}
                                disabled={!audioFile}
                                startIcon={<CloudUploadIcon />}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                }}
                            >
                                Send Audio
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        );
    };

    // =============================================
    // MESSAGE INPUT COMPONENT
    // =============================================
    const MessageInput = ({ message, setMessage, handleSendMessage }) => {
        const handleInputChange = (event) => {
            setMessage(event.target.value);
        };

        const handleKeyPress = (event) => {
            if (event.key === "Enter") {
                handleSendMessage();
            }
        };

        return (
            <Box sx={{ display: "flex", alignItems: "center", marginTop: 2, width: "100%" }}>
                <TextField
                    variant="outlined"
                    fullWidth
                    autoFocus
                    label="Type your message"
                    value={message}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    sx={{
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                            paddingRight: '8px',
                            borderRadius: 2,
                        },
                    }}
                />
                <IconButton
                    color="primary"
                    onClick={() => handleSendMessage()}
                    disabled={message.trim() === ""}
                    sx={{
                        marginLeft: '8px',
                        backgroundColor: 'background.paper',
                        boxShadow: 2,
                        '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: 4,
                        },
                    }}
                >
                    <SendIcon />
                </IconButton>
            </Box>
        );
    };



    // =============================================
    // MESSAGE HANDLING FUNCTIONS
    // =============================================

    const handleSendMessage = useCallback(async () => {
        if (!message && !audioFile) return;
        if (!selectedChatbot) {
            setMessages(prevMessages => [...prevMessages, {
                role: 'assistant',
                content: 'Please select a chatbot first.',
                text: 'Please select a chatbot first.'
            }]);
            setMessage('');
            setAudioFile(null);
            setRecordedAudioUrl(null);
            return;
        }

        let currentToken = userToken;
        // Only generate a new token if userToken is truly null (e.g., first message in a fresh session).
        if (!currentToken) {
            currentToken = await generateNewUserToken();
            if (!currentToken) {
                console.error("Failed to get a user token for sending message.");
                return;
            }
            setUserToken(currentToken);
            localStorage.setItem('userToken', currentToken);
        }

        setMessages(prevMessages => [...prevMessages, {
            role: 'user',
            content: message || 'Audio message',
            text: message || 'Audio message',
            audioUrl: recordedAudioUrl
        }]);

        const config = chatbotConfigs[selectedChatbot];

        setMessage('');
        setAudioFile(null);
        setRecordedAudioUrl(null);
        const languageToUse = config.language || "English";
        setLanguage(languageToUse);

        try {
            const response = await axios.post(`/api/get_response`, {
                message: message || 'Audio message',
                selectedChatbot: selectedChatbot,
                user_token: currentToken,
                language : language,
            });

            if (response.data.conversation_length !== undefined) {
                setConversationLength(response.data.conversation_length);
            }

            const responseText = response.data.response;

            setMessages(prevMessages => [...prevMessages, {
                role: 'assistant',
                content: responseText,
                text: responseText,
            }]);
            if (chatMessagesRef.current && chatMessagesRef.current.scrollToBottom) {
                chatMessagesRef.current.scrollToBottom();
            }
        } catch (error) {
            console.error('Error sending message:', error);
            if (error.message.includes('certificate') || error.message.includes('SSL')) {
                setMessages(prevMessages => [...prevMessages, {
                    role: 'assistant',
                    content: 'Connection error: SSL certificate issue.',
                    text: 'Connection error: SSL certificate issue.'
                }]);
            } else {
                setMessages(prevMessages => [...prevMessages, {
                    role: 'assistant',
                    content: `Error: ${error.message || 'Unknown error'}`,
                    text: `Error: ${error.message || 'Unknown error'}`
                }]);
            }
            if (chatMessagesRef.current && chatMessagesRef.current.scrollToBottom) {
                chatMessagesRef.current.scrollToBottom();
            }
        }
    }, [message, audioFile, selectedChatbot, userToken, chatbotConfigs, generateNewUserToken, setMessages, setMessage, setAudioFile, setRecordedAudioUrl, setConversationLength, setLanguage, language, recordedAudioUrl, chatMessagesRef]);


    // =============================================
    // UPLOAD AUDIO FUNCTION
    // =============================================
    //Config Change Starts Here
    const uploadAudio = useCallback(async () => {
        if (!audioFile) {
            console.log("No audio file to upload");
            return;
        }

        let currentToken = userToken;
        // If no token exists, generate a new one.
        if (!currentToken) {
            currentToken = await generateNewUserToken();
            if (!currentToken) {
                console.error("Failed to get a user token for audio upload.");
                return;
            }
            setUserToken(currentToken);
            localStorage.setItem('userToken', currentToken);
        }

        console.log("Uploading audio with token:", currentToken);
        const formData = new FormData();
        formData.append("audio", audioFile);
        formData.append("user_token", currentToken);

        const currentRecordedUrl = recordedAudioUrl;

        const placeholderMessage = {
            role: "user",
            content: "🎤 Processing audio...",
            text: "🎤 Processing audio...",
            audioUrl: currentRecordedUrl
        };
        setMessages((prevMessages) => [...prevMessages, placeholderMessage]);
        const placeholderMessageIndex = messages.length;

        if (selectedChatbot) {
            formData.append("selectedChatbot", selectedChatbot);
        }

        const config = chatbotConfigs[selectedChatbot];
        const languageToUse = config?.language || "English";
        const whisperLanguage = LANGUAGE_MAP[languageToUse] || 'en';

        formData.append("language", languageToUse);
        formData.append("language_code", whisperLanguage);

        setLanguage(languageToUse);

        console.log("Uploading audio with:", {
            selectedChatbot,
            languageToUse,
            whisperLanguage,
            user_token: currentToken
        });

        try {
            const response = await axios.post(`/api/whisper`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            });

            if (response.data && response.data[0]) {
                const { transcript, openai_response, filename } = response.data[0];
                const responseText = openai_response.response;

                setMessages(prevMessages => {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[placeholderMessageIndex] = {
                        role: "user",
                        content: transcript,
                        text: transcript,
                        audioUrl: `/api/audio/${filename}`
                    };
                    return updatedMessages;
                });

                setMessages(prevMessages => [
                    ...prevMessages,
                    {
                        role: "assistant",
                        content: responseText,
                        text: responseText
                    }
                ]);

                if (response.data[0].conversation_length !== undefined) {
                    setConversationLength(response.data[0].conversation_length);
                }

                console.log("Audio processed successfully, transcript:", transcript);
            } else {
                throw new Error("Unexpected response structure");
            }
        } catch (error) {
            console.error("Error processing audio:", error);
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                updatedMessages[placeholderMessageIndex] = {
                    role: "user",
                    content: "Error processing audio",
                    text: "Error processing audio",
                    audioUrl: currentRecordedUrl
                };
                return [
                    ...updatedMessages,
                    {
                        role: "assistant",
                        content: "Error processing audio",
                        text: "Error processing audio"
                    }
                ];
            });
        }

        setAudioFile(null);
        setRecordedAudioUrl(null);
    }, [audioFile, userToken, selectedChatbot, chatbotConfigs, generateNewUserToken, messages.length, recordedAudioUrl, setMessages, setAudioFile, setRecordedAudioUrl, setConversationLength, setLanguage, LANGUAGE_MAP]);

    // =============================================
    // SEND TRANSCRIPT FUNCTION
    // =============================================
    const handleSendTranscript = useCallback(async (studentName, studentEmail, professorEmail, professorName, extraNote) => {
        if (!userToken) {
            setEmailStatus('No active conversation to send.');
            return;
        }
        if (!professorEmail) {
            setEmailStatus('Professor email is required.');
            return;
        }

        setEmailStatus('Sending transcript...');
        try {
            const response = await axios.post(`/api/send_transcript`, {
                user_token: userToken,
                professor_email: professorEmail,
                professor_name: professorName,
                extra_note: extraNote,
                student_email: studentEmail,
                student_name: studentName,
                chatbot_name: selectedChatbot || 'General Chatbot'
            });
            const data = response.data;

            if (response.status === 200) {
                setEmailStatus('Transcript sent successfully!');
            } else {
                setEmailStatus(`Failed to send transcript: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error sending transcript:', error);
            setEmailStatus(`Failed to send transcript: ${error.response?.data?.error || error.message}`);
        }
    }, [userToken, selectedChatbot, setEmailStatus]);


    function getParameterByName(name, url = window.location.href) {
        name = name.replace(/[[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    const isProfessorMode = getParameterByName('prof') === 'true';


    function returnStudentNavbar() {
        const isProfessorRoute = location.pathname === '/profprompt' || location.pathname === '/professor-view';
        
        if (!isProfessorMode && !isProfessorRoute) {
            return (
                <AppBar position="fixed" sx={{
                    backgroundColor: 'primary.main',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                    <Toolbar>
                      
                        <ThemeSwitcher currentTheme={currentTheme} onThemeChange={handleThemeChange} />
                    </Toolbar>
                </AppBar>
            );
        }
        return null;
    }
    
    function ProfessorNavbar() {
        const [anchorEl, setAnchorEl] = React.useState(null);
        const navigate = useNavigate();
        const location = useLocation(); // Get current route path

        const handleMenuOpen = (event) => {
            setAnchorEl(event.currentTarget);
        };

        const handleMenuClose = () => {
            setAnchorEl(null);
        };

        const handleNavigation = (path) => {
            navigate(path);
            handleMenuClose();
        };

        // Check if we're in professor mode OR on professor routes
        const isProfessorMode = getParameterByName('prof') === 'true';
        const isProfessorRoute = location.pathname === '/profprompt' || location.pathname === '/professor-view';

        if (!isProfessorMode && !isProfessorRoute) {
            return null; // Don't render the navbar unless in professor context
        }

        return (
            <AppBar position="fixed" sx={{ backgroundColor: 'primary.main' }}>
                <Toolbar>
                    {/* Logo / Title */}
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ flexGrow: 1, fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => navigate('/?prof=true')}
                    >
                        Professor Dashboard
                    </Typography>

                    {/* Theme switcher next to title */}
                    <ThemeSwitcher currentTheme={currentTheme} onThemeChange={handleThemeChange} />


                    {/* Hamburger Icon */}
                    <IconButton
                        edge="end"
                        color="inherit"
                        aria-label="menu"
                        onClick={handleMenuOpen}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Dropdown Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.2))',
                                mt: 1.5,
                                '& .MuiList-root': { py: 0 },
                                '& .MuiMenuItem-root': {
                                    px: 2,
                                    py: 1.2,
                                    transition: 'background-color 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'primary.light',
                                        color: 'primary.contrastText',
                                    },
                                },
                            },
                        }}
                    >
                        <MenuItem onClick={() => handleNavigation("/profprompt")}>
                            Prompt
                        </MenuItem>
                        <MenuItem onClick={() => handleNavigation("/professor-view")}>
                            View Students
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {/* Password Dialog */}
            <PasswordDialog
                open={showPasswordDialog}
                onClose={() => setShowPasswordDialog(false)}
                error={passwordError}
                onAuthenticate={(success) => {
                    if (success) {
                        setIsProfessorAuthenticated(true);
                        setPasswordError('');
                    } else {
                        setPasswordError('Incorrect password. Please try again.');
                    }
                }}
            />
            <Box sx={{
                display: 'flex',
                minHeight: '100vh',
                background: currentTheme === 'gradient' ?
                    'linear-gradient(135deg, #FFE0E6 0%, #FFE5E0 50%, #FFF0F5 100%)' :
                    'background.default',
                transition: 'all 0.3s ease',
            }}>
                <ProfessorNavbar />
                {returnStudentNavbar()}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        width: { xs: '100%', sm: (isProfessorMode || location.pathname === '/profprompt' || location.pathname === '/professor-view') ? `calc(100% - 140px)` : '100%'},
                        mt: (isProfessorMode || location.pathname === '/profprompt' || location.pathname === '/professor-view') ? 0 : 8,
                    }}
                >
                    {(isProfessorMode || location.pathname === '/profprompt' || location.pathname === '/professor-view') && <Toolbar />}
                    <Routes>
                        <Route path="/profprompt" element={
                            <ProtectedRoute
                                isAuthenticated={isProfessorAuthenticated}
                                onAuthRequired={() => setShowPasswordDialog(true)}
                            >
                                <PromptEditor />
                            </ProtectedRoute>
                        } />
                        <Route path="/professor-view" element={
                            <ProtectedRoute
                                isAuthenticated={isProfessorAuthenticated}
                                onAuthRequired={() => setShowPasswordDialog(true)}
                            >
                                <ProfessorView />
                            </ProtectedRoute>
                        } />
                        <Route path="/" element={
                            <Container maxWidth="md" className="main-container" sx={{ px: { xs: 1, sm: 3 } }}> {/* Added responsive padding */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
                                    <Typography variant="h4" component="h1" sx={{
                                        textAlign: "center",
                                        color: 'primary.main',
                                        fontWeight: 600,
                                        textShadow: currentTheme === 'dark' ? '0 2px 4px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.1)',
                                    }}>
                                        Voice Chatbot
                                    </Typography>
                                </Box>

                                {/* Language Selection */}
                                <FormControl fullWidth className="language-select" sx={{ mb: 2 }}>
                                    <InputLabel id="language-select-label">Select Language</InputLabel>
                                    <Select
                                        labelId="language-select-label"
                                        id="language-select"
                                        value={selectedLanguage}
                                        label="Select Language"
                                        onChange={handleLanguageChange}
                                        disabled={isLoadingConfigs}
                                        sx={{
                                            backgroundColor: 'background.paper',
                                            borderRadius: 2,
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'primary.main',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'primary.dark',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'primary.main',
                                            },
                                        }}
                                    >
                                        {isLoadingConfigs ? (
                                            <MenuItem disabled>Loading languages...</MenuItem>
                                        ) : availableLanguages.length === 0 ? (
                                            <MenuItem disabled>No languages available</MenuItem>
                                        ) : (
                                            availableLanguages.map((language) => (
                                                <MenuItem key={language} value={language}>
                                                    {language}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </FormControl>

                                {/* Chatbot Selection - only show if language is selected */}
                                {selectedLanguage && (
                                    <FormControl fullWidth className="chatbot-select" sx={{ mb: 3 }}>
                                        <InputLabel id="chatbot-select-label">Select Chatbot</InputLabel>
                                        <Select
                                            labelId="chatbot-select-label"
                                            id="chatbot-select"
                                            value={selectedChatbot}
                                            label="Select a Chatbot"
                                            onChange={handleChatbotChange}
                                            disabled={isLoadingConfigs}
                                            sx={{
                                                backgroundColor: 'background.paper',
                                                borderRadius: 2,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'primary.main',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'primary.dark',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'primary.main',
                                                },
                                            }}
                                        >
                                            {Object.keys(getFilteredChatbots()).length === 0 ? (
                                                <MenuItem disabled>No chatbots available for this language</MenuItem>
                                            ) : (
                                                Object.entries(getFilteredChatbots()).map(([key, config]) => (
                                                    <MenuItem key={key} value={key}>
                                                        {config.name} ({config.level})
                                                    </MenuItem>
                                                ))
                                            )}
                                        </Select>
                                    </FormControl>
                                )}

                                <Box className="chat-window-wrapper">
                                    <ChatMessages
                                        ref={chatMessagesRef}
                                        messages={messages}
                                        playAudio={playAudio}
                                        generateTTSAudio={generateTTSAudio}
                                        setMessages={setMessages}
                                        className="chat-window"
                                    />
                                </Box>

                                <Box className="message-input">
                                    <MessageInput
                                        message={message}
                                        setMessage={setMessage}
                                        handleSendMessage={handleSendMessage}
                                    />
                                </Box>

                                <Box className="audio-controls">
                                    <AudioControls />
                                </Box>


                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>


                                    <Button
                                        variant="outlined"
                                        fullWidth={true} // Ensure buttons take full width when wrapped
                                        onClick={clearConversationHistory}
                                        sx={{
                                            borderRadius: 2,
                                            py: 1.5,
                                            borderColor: 'primary.main',
                                            color: 'primary.main',
                                            '&:hover': {
                                                borderColor: 'primary.dark',
                                                backgroundColor: 'primary.main',
                                                color: 'primary.contrastText',
                                            },
                                            mb: { xs: 1, sm: 0 } // Add margin-bottom for stacking on small screens
                                        }}
                                    >
                                        Clear History
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        fullWidth={true} // Ensure buttons take full width when wrapped
                                        onClick={loadConversationHistory}
                                        disabled={!userToken}
                                        sx={{
                                            borderRadius: 2,
                                            py: 1.5,
                                            borderColor: 'primary.main',
                                            color: 'primary.main',
                                            '&:hover': {
                                                borderColor: 'primary.dark',
                                                backgroundColor: 'primary.main',
                                                color: 'primary.contrastText',
                                            },
                                            mb: { xs: 1, sm: 0 } // Add margin-bottom for stacking on small screens
                                        }}
                                    >
                                        View History ({conversationLength})
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        fullWidth={true} // Ensure buttons take full width when wrapped
                                        onClick={() => setShowEmailModal(true)}
                                        disabled={!userToken || conversationLength === 0}
                                        sx={{
                                            borderRadius: 2,
                                            py: 1.5,
                                            borderColor: 'primary.main',
                                            color: 'primary.main',
                                            '&:hover': {
                                                borderColor: 'primary.dark',
                                                backgroundColor: 'primary.main',
                                                color: 'primary.contrastText',
                                            },
                                            mb: { xs: 1, sm: 0 } // Add margin-bottom for stacking on small screens
                                        }}
                                    >
                                        Email Transcript
                                    </Button>

                                </Box>
                                <Box sx={{ mt: 4, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Please contact{' '}
                                        <a
                                            href={`mailto:${process.env.REACT_APP_SUPPORT_EMAIL}`}
                                            style={{ color: theme.palette.primary.main, textDecoration: 'none' }}
                                        >
                                            {process.env.REACT_APP_SUPPORT_EMAIL}
                                        </a>{' '}
                                        for support.
                                    </Typography>
                                </Box>
                                <ConversationHistoryDialog
                                    showHistory={showHistory}
                                    setShowHistory={setShowHistory}
                                    conversationHistory={conversationHistory}
                                />

                                <EmailTranscriptDialog
                                    showEmailModal={showEmailModal}
                                    setShowEmailModal={setShowEmailModal}
                                    emailStatus={emailStatus}
                                    setEmailStatus={setEmailStatus}
                                    handleSendTranscript={handleSendTranscript}
                                    selectedChatbot={selectedChatbot}
                                    chatbotConfigs={chatbotConfigs}
                                />
                            </Container>
                        } />
                    </Routes>
                </Box>

            </Box>
        </ThemeProvider>
    );
}

export default App;
