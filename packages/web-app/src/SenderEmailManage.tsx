// src/pages/WhitelistEmails.tsx
import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

interface GoogleAuthResponse {
    code: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const LoginButton: React.FC<{ onAddEmail: (email: string) => void }> = ({ onAddEmail }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const googleLogin = useGoogleLogin({
      flow: 'auth-code',
      scope: 'email profile https://www.googleapis.com/auth/gmail.send',
      onSuccess: async (codeResponse: GoogleAuthResponse) => {

        try {
          setIsLoading(true);
          setError('');
          console.log(codeResponse.code);
          // Gửi authentication code đến backend
          const response = await axios.post(`${API_BASE_URL}/sender-email/verify`, {
            token: codeResponse.code
          });
          if (response.data.email) {
            onAddEmail(response.data.email);
          }
        } catch (err: any) {
          if (axios.isAxiosError(err) && err.response?.data?.message) {
            setError(err.response.data.message);
          } else {
            setError('Đăng nhập thất bại. Vui lòng thử lại.');
          }
        } finally {
          setIsLoading(false);
        }
      },
      onError: (errorResponse) => {
        console.error('Google login failed:', errorResponse);
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      },
    });
  
    return (
      <div className="login-button-container">
        {error && <div className="error-message">{error}</div>}
        
        <button 
          className="google-login-button" 
          onClick={() => googleLogin()}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <>
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="google-icon" 
              />
              <span>Xác thực với Google để thêm sender email</span>
            </>
          )}
        </button>
      </div>
    );
  };

export const SenderEmailManage: React.FC = () => {
    const [emails, setEmails] = useState<string[]>([]);

    useEffect(() => {
      const fetchEmails = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_BASE_URL}/sender-email`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (Array.isArray(response.data)) {
            setEmails(response.data);
          }
        } catch (err) {
          console.error('Lỗi khi tải danh sách email:', err);
        }
      };
      fetchEmails();
    }, []);

    const handleDelete = async (target: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/sender-email/${encodeURIComponent(target)}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setEmails(emails.filter(e => e !== target));
        } catch (err) {
            alert('Xoá thất bại!');
        }
    };


    const handleAddEmail = (email: string) => {
        setEmails((prev) => prev.includes(email) ? prev : [...prev, email]);
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Quản lý sender email
                </Typography>

                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <LoginButton onAddEmail={handleAddEmail}/>
                </GoogleOAuthProvider>

                <List>
                    {emails.map((item) => (
                        <ListItem
                            key={item}
                            secondaryAction={
                                <IconButton edge="end" onClick={() => handleDelete(item)}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText primary={item} />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};
