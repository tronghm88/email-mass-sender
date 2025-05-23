import React, { useState } from 'react';
import {
  Card, CardContent, Typography, TextField, Button, Stack, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function parseCSV(content: string): string[] {
  // Simple CSV parser for one column (email)
  return content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(line));
}

export const BulkEmail: React.FC = () => {
  const [senderList, setSenderList] = useState<string[]>([]);
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    const fetchSenders = async () => {
      try {
        setSender('');
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/sender-email`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(response.data) && response.data.length > 0) {
          setSenderList(response.data);
        } else {
          setSenderList([]);
        }
      } catch (err) {
        setSenderList([]);
        setError('Không thể tải danh sách sender email.');
      }
    };
    fetchSenders();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccess('');
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const emails = parseCSV(content);
      if (emails.length === 0) {
        setError('Không tìm thấy email hợp lệ trong file CSV.');
        setRecipients([]);
      } else {
        setRecipients(emails);
      }
    };
    reader.readAsText(file);
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleSend = async () => {
    setError('');
    setSuccess('');
    if (!sender) {
      setError('Vui lòng chọn sender email.');
      return;
    }
    if (!subject || !body || recipients.length === 0) {
      setError('Vui lòng nhập đủ thông tin và upload danh sách email hợp lệ.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/bulk-email/send`,
        {
          sender,
          subject,
          body,
          recipients,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(`Đã tạo job gửi email tới ${recipients.length} địa chỉ. Hệ thống sẽ gửi lần lượt!`);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        'Gửi email thất bại, vui lòng thử lại hoặc liên hệ admin.'
      );
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>Gửi email hàng loạt (Demo UI)</Typography>
        <Stack spacing={2}>
          <TextField
            select
            label="Chọn sender"
            value={sender}
            onChange={e => setSender(e.target.value)}
            fullWidth
            disabled={senderList.length === 0}
            helperText={senderList.length === 0 ? 'Bạn cần xác thực ít nhất 1 sender email trước.' : ''}
            error={!sender && !!error}
          >
            <MenuItem value="">-- Chọn sender --</MenuItem>
            {senderList.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            component="label"
            color={recipients.length > 0 ? 'success' : 'primary'}
          >
            {fileName ? `Đã chọn: ${fileName}` : 'Upload file CSV danh sách email'}
            <input type="file" hidden accept=".csv" onChange={handleFileChange} />
          </Button>
          <Typography variant="body2" color="text.secondary">
            File CSV chỉ cần 1 cột email, mỗi dòng 1 email. Ví dụ:<br />
            <code>user1@gmail.com<br />user2@gmail.com</code>
          </Typography>
          <TextField
            label="Tiêu đề"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            fullWidth
          />
          <TextField
            label="Nội dung email (HTML)"
            value={body}
            onChange={e => setBody(e.target.value)}
            fullWidth
            multiline
            minRows={6}
            placeholder="<h1>Xin chào</h1><p>Đây là email demo</p>"
          />
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" onClick={handleSend}>Gửi</Button>
            <Button variant="outlined" onClick={handlePreview}>Preview HTML</Button>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <Typography variant="body2" color="text.secondary">
            Số lượng email nhận: <b>{recipients.length}</b>
          </Typography>
        </Stack>
      </CardContent>
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Xem trước nội dung HTML</DialogTitle>
        <DialogContent>
          <div style={{ border: '1px solid #eee', padding: 16, minHeight: 120 }}
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
