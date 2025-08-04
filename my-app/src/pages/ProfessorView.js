import React, { useState, useCallback } from "react";
import axios from 'axios';
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Container,
  Card,
  CardContent,
  CircularProgress,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { styled } from '@mui/system';

const getDesignTokens = (mode) => {
    // Base light theme that will be used for most components
    const baseTheme = {
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
                default: '#ffffff', // Always white background
                paper: '#ffffff',   // Always white paper
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
            divider: '#e0e0e0',
            action: {
                selected: 'rgba(211, 47, 47, 0.08)',
                hover: 'rgba(211, 47, 47, 0.04)',
            },
        },
    };

    return createTheme({
        ...baseTheme,
        typography: {
            fontFamily: 'Roboto, sans-serif',
            h4: {
                fontWeight: 500,
            },
        },
        components: {
            // Force Container to always have light background
            MuiContainer: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'transparent',
                    },
                },
            },
            // Selectively apply dark styling to CardContent only when mode is dark
            MuiCardContent: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
                        color: mode === 'dark' ? '#ffffff' : '#000000',
                    },
                },
            },
            // Keep Card itself light but allow CardContent to override
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#ffffff',
                        border: '1px solid #e0e0e0',
                    },
                },
            },
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
                        backgroundColor: '#ffffff', // Always light
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
            // Selectively apply dark styling to TextField inputs only when mode is dark
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
                            color: mode === 'dark' ? '#ffffff' : '#000000',
                            '& fieldset': {
                                borderWidth: '1px',
                                borderColor: mode === 'dark' ? '#555555' : '#c4c4c4',
                            },
                            '&:hover fieldset': {
                                borderWidth: '1px',
                                borderColor: mode === 'dark' ? '#777777' : '#999999',
                            },
                            '&.Mui-focused fieldset': {
                                borderWidth: '2px',
                                borderColor: '#D32F2F',
                                boxShadow: 'none',
                            },
                            '& input': {
                                color: mode === 'dark' ? '#ffffff' : '#000000',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: mode === 'dark' ? '#B0B0B0' : '#666666',
                            '&.Mui-focused': {
                                color: '#D32F2F',
                            },
                        },
                    },
                },
            },
            // Keep ListItems light themed regardless of mode
            MuiListItem: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#ffffff', // Always light
                        '&.Mui-selected': {
                            backgroundColor: 'rgba(211, 47, 47, 0.08)',
                            '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.12)',
                            },
                        },
                        '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.04)',
                        },
                    },
                },
            },
        },
    });
};

// Styled components for better visual hierarchy
const StyledListItem = styled(ListItem)(({ theme }) => ({
  transition: 'background-color 0.2s ease',
  backgroundColor: '#ffffff', // Always light
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));
//const ProfessorView = ({ flaskHOST, flaskPORT, themeMode = 'light' }) => {
  const ProfessorView = ({ themeMode = 'light' }) => {
  const [email, setEmail] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedChatbot, setSelectedChatbot] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Create theme based on the themeMode prop
  const theme = createTheme(getDesignTokens(themeMode));

  const handleEmailSubmit = useCallback(async () => {
    if (!email) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      //const res = await axios.get(`https://${flaskHOST}:${flaskPORT}/professor/students?email=${encodeURIComponent(email)}`);
      console.log('DEBUG Todd: Fetching students for email:', email);
      const res = await axios.get(`/api/professor/students?email=${encodeURIComponent(email)}`);
      console.log('DEBUG Todd2: Fetching students for email:', email);
      setStudents(res.data.students || []);
      setSelectedStudent(null);
      setSelectedChatbot(null);
      setConversation([]);
    } catch (e) {
      setErrorMessage('Error fetching student list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  
  }, [email]);
  // }, [email, flaskHOST, flaskPORT]);

  const handleStudentClick = useCallback((student) => {
    setSelectedStudent(student);
    setSelectedChatbot(null);
    setConversation([]);
    setErrorMessage('');
  }, []);

  const handleChatbotClick = useCallback(async (chatbotName) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      //const res = await axios.get(`https://${flaskHOST}:${flaskPORT}/professor/conversation`, {
        const res = await axios.get(`/api/professor/conversation`, {
        params: {
          prof_email: email,
          student_key: selectedStudent.key,
          chatbot_name: chatbotName,
        },
      });
      if (res.data.conversation && res.data.conversation.length > 0) {
        setSelectedChatbot(chatbotName);
        setConversation(res.data.conversation);
      } else {
        setSelectedChatbot(null);
        setConversation([]);
        setErrorMessage(`No conversation found for ${chatbotName}.`);
        setTimeout(() => setErrorMessage(''), 3000); // Clear message after 3s
      }
    } catch (e) {
      setSelectedChatbot(null);
      setConversation([]);
      setErrorMessage('Failed to load conversation. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
    //}, [email, selectedStudent, flaskHOST, flaskPORT]);
  }, [email, selectedStudent]);

  return (
    <ThemeProvider theme={theme}>
      {/* Force light background for the entire component */}
      <Box sx={{ 
        backgroundColor: '#ffffff', 
        minHeight: '100vh',
        color: '#000000'
      }}>
        <Container maxWidth="md" sx={{ py: 4, backgroundColor: 'transparent' }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#000000' }}>
            Professor View
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
            <TextField
              label="Professor Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleEmailSubmit}
              disabled={isLoading}
              sx={{ minWidth: '120px' }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Load Students'}
            </Button>
          </Box>

          {errorMessage && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
          )}

          {students.length > 0 && (
            <Card sx={{ mb: 4, backgroundColor: '#ffffff' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: themeMode === 'dark' ? '#ffffff' : '#000000' }}>
                  Students
                </Typography>
                <List>
                  {students.map((student, i) => (
                    <StyledListItem
                      key={i}
                      button
                      onClick={() => handleStudentClick(student)}
                      selected={selectedStudent && selectedStudent.key === student.key}
                    >
                      <ListItemText
                        primary={`${student.name} (${student.email})`}
                        primaryTypographyProps={{
                          fontWeight: selectedStudent && selectedStudent.key === student.key ? 'bold' : 'medium',
                          color: '#000000' // Always black text for list items
                        }}
                      />
                    </StyledListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {selectedStudent && !selectedChatbot && !errorMessage && (
            <Card sx={{ mb: 4, backgroundColor: '#ffffff' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: themeMode === 'dark' ? '#ffffff' : '#000000' }}>
                  Chatbots Used by {selectedStudent.name}
                </Typography>
                <List>
                  {Object.entries(selectedStudent.chatbots || {})
                    .sort((a, b) => new Date(b[1].last_used) - new Date(a[1].last_used))
                    .map(([chatbotName], i) => (
                      <StyledListItem
                        key={i}
                        button
                        onClick={() => handleChatbotClick(chatbotName)}
                      >
                        <ListItemText 
                          primary={chatbotName}
                          primaryTypographyProps={{
                            color: '#000000' // Always black text for list items
                          }}
                        />
                      </StyledListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          )}

          {selectedChatbot && conversation.length > 0 && (
            <Card sx={{ backgroundColor: '#ffffff' }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 'bold', color: '#D32F2F' }}
                >
                  {selectedChatbot}
                </Typography>
                {conversation.map((msg, i) => (
                  <Box 
                    key={i} 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      borderRadius: '8px',
                      border: 1,
                      borderColor: themeMode === 'dark' ? '#555555' : '#e0e0e0',
                      backgroundColor: themeMode === 'dark' ? '#1a1a1a' : '#f5f5f5',
                      color: themeMode === 'dark' ? '#ffffff' : '#000000',
                    }}
                  >
                    <Typography variant="body2" component="div" sx={{ color: 'inherit' }}>
                      <strong>User:</strong> {msg.user}
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mt: 1, color: 'inherit' }}>
                      <strong>Assistant:</strong> {msg.assistant}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ProfessorView;
