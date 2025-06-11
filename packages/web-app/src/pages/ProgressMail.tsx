import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
} from '@mui/material';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export default function ProgressMail() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/bulk-email/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Lỗi khi lấy tiến độ gửi mail');
        const data = await res.json();
        setProgress(data);
      } catch (err: any) {
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Tiến độ gửi mail hôm nay
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : progress ? (
          <>
            <Box mb={2}>
              <Typography>
                Tiến độ: <b>{progress.sentJobs} / {progress.totalJobs}</b>&nbsp; (Đã gửi / Tổng email cần gửi)
              </Typography>
              <Typography>
                Thành công: <b style={{color:'green'}}>{progress.successJobs}</b>&nbsp;
                Thất bại: <b style={{color:'red'}}>{progress.failJobs}</b>
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>Danh sách lô gửi</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Email gửi</TableCell>
                    <TableCell>Số thứ tự lô (theo email gửi)</TableCell>
                    <TableCell>Số lượng email</TableCell>
                    <TableCell>Thời gian tạo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {progress.batches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">Không có batch nào trong hôm nay</TableCell>
                    </TableRow>
                  ) : (
                    progress.batches.map((batch: any, idx: number) => (
                      <TableRow key={batch.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{batch.sender_email}</TableCell>
                        <TableCell>{batch.batchIndex + 1}</TableCell>
                        <TableCell>{batch.count}</TableCell>
                        <TableCell>{new Date(batch.datetime).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
