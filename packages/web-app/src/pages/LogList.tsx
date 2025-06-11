import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import dayjs from 'dayjs';

const getRecentDays = (n = 10) => {
  const days = [];
  for (let i = 0; i < n; i++) {
    days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
  }
  return days;
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export default function LogList() {
  const [selectedDate, setSelectedDate] = useState(getRecentDays(10)[0]);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [jobCount, setJobCount] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const today = dayjs().format('YYYY-MM-DD');

  // Fetch logs and job count in one call
  const fetchLogs = async (date: string, pageNum: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/bulk-email/logs`, {
        params: { date, page: pageNum },
      });
      const data = res.data;
      setJobCount(data.jobCount || 0);
      setTotal(data.total || 0);
      setLogs(data.logs || []);
      setPageSize(data.pageSize || 100);
    } catch (e) {
      setLogs([]);
      setTotal(0);
      setJobCount(0);
    }
    setLoading(false);
  };

  // Long polling cho ngày hiện tại (5 phút)
  useEffect(() => {
    setPage(1);
    fetchLogs(selectedDate, 1);
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (selectedDate === today) {
      pollingRef.current = setInterval(() => {
        setPage(1);
        fetchLogs(selectedDate, 1);
        window.scrollTo({ top: 0, behavior: 'auto' });
      }, 5 * 60 * 1000); // 5 phút
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line
  }, [selectedDate]);

  // Khi đổi trang (pagination)
  useEffect(() => {
    fetchLogs(selectedDate, page);
    // eslint-disable-next-line
  }, [page, selectedDate]);

  const days = getRecentDays(10);
  const totalPages = Math.ceil((total || 0) / pageSize);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Log gửi mail
      </Typography>
      <FormControl sx={{ minWidth: 180, mb: 2 }}>
        <InputLabel id="select-day-label">Chọn ngày</InputLabel>
        <Select
          labelId="select-day-label"
          value={selectedDate}
          label="Chọn ngày"
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setPage(1);
          }}
        >
          {days.map((day) => (
            <MenuItem key={day} value={day}>
              {dayjs(day, 'YYYY-MM-DD').format('DD/MM/YYYY')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="warning.main">
          Dữ liệu sẽ tự động tải lại mỗi 5 phút nếu bạn đang xem ngày hôm nay.<br/>
          Bạn có thể chuyển trang để xem thêm log các trang trước đó.
        </Typography>
      </Box>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Tổng job: {total}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Địa chỉ gửi</TableCell>
              <TableCell>Địa chỉ nhận</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Thời gian gửi</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell>{log.sender}</TableCell>
                <TableCell>{log.recipient}</TableCell>
                <TableCell>{log.subject}</TableCell>
                <TableCell>
                  {dayjs(log.timestamp).format('DD/MM/YYYY HH:mm:ss')}
                </TableCell>
                <TableCell>
                  {log.status === 'success' && (
                    <Typography variant="body2" color="success" sx={{ mt: 0.5 }}>
                      {log.status}
                    </Typography>
                  )}
                  {log.status === 'fail' && (
                    <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                      {log.error}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
      </TableContainer>
      <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
}
