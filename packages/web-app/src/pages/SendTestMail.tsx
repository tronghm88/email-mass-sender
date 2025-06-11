import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Alert,
} from '@mui/material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const DEFAULT_SUBJECT = 'MES test chức năng gửi mail';
const DEFAULT_BODY = 'MES test chức năng gửi mail';

export default function SendTestMail() {
  const [senders, setSenders] = useState<string[]>([]);
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchSenders = async () => {
      try {
        setSender('');
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/sender-email`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(response.data) && response.data.length > 0) {
          setSenders(response.data);
          setSender(response.data[0]);
        } else {
          setSenders([]);
        }
      } catch (err) {
        setSenders([]);
      }
    };
    fetchSenders();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/sender-email/send-test`, {
        sender,
        recipient,
        subject,
        body,
      });
      if (res.data.success) {
        setResult({ success: true, message: 'Gửi mail thành công!' });
      } else {
        setResult({ success: false, message: res.data.error || 'Gửi mail thất bại!' });
      }
    } catch (err: any) {
      setResult({ success: false, message: err.response?.data?.message || err.message || 'Gửi mail thất bại!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 3 }} elevation={3}>
      <Typography variant="h5" gutterBottom>
        Send Test Mail
      </Typography>
      <Box component="form" onSubmit={handleSend}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="sender-label">Sender</InputLabel>
          <Select
            labelId="sender-label"
            value={sender}
            label="Sender"
            onChange={e => setSender(e.target.value)}
            required
          >
            {senders.map(email => (
              <MenuItem key={email} value={email}>{email}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Recipient Email"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Body"
          value={body}
          onChange={e => setBody(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          minRows={4}
        />
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi test'}
          </Button>
        </Box>
        {result && (
          <Box mt={2}>
            <Alert severity={result.success ? 'success' : 'error'}>{result.message}</Alert>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
