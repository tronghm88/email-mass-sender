import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
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
    days.push(dayjs().subtract(i, 'day').format('YYYYMMDD'));
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
  const [hasMore, setHasMore] = useState(true);
  const [jobCount, setJobCount] = useState(0);
  const loader = useRef(null);
  // --- fix closure bug ---
  const selectedDateRef = useRef(selectedDate);
  const pageRef = useRef(page);
  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);
  useEffect(() => { pageRef.current = page; }, [page]);

  // Fetch logs and job count in one call
  const fetchLogs = async (date: string, pageNum: number, append = false) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/bulk-email/logs`, {
        params: { date, page: pageNum },
      });
      const data = res.data;
      setJobCount(data.jobCount || 0);
      setTotal(data.doneCount || 0);
      setHasMore((pageNum * 100) < (data.doneCount || 0));
      setLogs((prev) => (append ? [...prev, ...data.logs] : data.logs));
    } catch (e) {
      setLogs([]);
      setTotal(0);
      setJobCount(0);
      setHasMore(false);
    }
    setLoading(false);
  };

  // Long polling for today
  useEffect(() => {
    const today = dayjs().format('YYYYMMDD');
    let polling: NodeJS.Timeout | null = null;
    setPage(1);
    fetchLogs(selectedDate, 1, false);
    if (selectedDate === today) {
      polling = setInterval(() => {
        setPage(1);
        fetchLogs(selectedDate, 1, false);
        // Reset scroll to top
        window.scrollTo({ top: 0, behavior: 'auto' });
      }, 5000);
    }
    return () => {
      if (polling) clearInterval(polling);
    };
    // eslint-disable-next-line
  }, [selectedDate]);

  // Infinite scroll
  // Infinite scroll only if NOT today
  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          // Always use latest selectedDate and page
          const date = selectedDateRef.current;
          const nextPage = pageRef.current + 1;
          fetchLogs(date, nextPage, true);
          setPage((p) => p + 1);
        }
      },
      { threshold: 1.0 }
    );
    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
    // eslint-disable-next-line
  }, [loader, hasMore, loading]);

  const days = getRecentDays(10);

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
              {dayjs(day, 'YYYYMMDD').format('DD/MM/YYYY')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="warning.main">
          Cuộn xuống để load thêm log.
          Đối với ngày hiện tại, trang sẽ tự động tải lại dữ liệu mỗi 5 giây (và cuộn về đầu trang),
          dù bạn đang cuộn xuống để xem thêm, dữ liệu sẽ được làm mới lại sau mỗi lần tải lại.
        </Typography>
      </Box>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Số job thành công: {total} / Tổng job: {jobCount}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Receiver Email</TableCell>
              <TableCell>Sender Email</TableCell>
              <TableCell>Thời gian gửi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell>{log.recipient}</TableCell>
                <TableCell>{log.sender}</TableCell>
                <TableCell>{dayjs(log.timestamp).format('DD/MM/YYYY HH:mm:ss')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
        <div ref={loader} />
      </TableContainer>
    </Box>
  );
}
