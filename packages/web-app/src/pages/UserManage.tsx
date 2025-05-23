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
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

interface User {
    email: string;
    role: string;
}

export const UserManage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            setError('Lỗi khi tải danh sách user');
        }
    };

    const validateEmail = (value: string) => {
        // Simple email regex
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    const handleAdd = async () => {
        setError('');
        if (!validateEmail(email)) {
            setError('Email không hợp lệ');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/users`, { email }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers((prev) => [...prev, res.data]);
            setEmail('');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Thêm user thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (targetEmail: string) => {
        setError('');
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_BASE_URL}/users/${encodeURIComponent(targetEmail)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers((prev) => prev.filter(u => u.email !== targetEmail));
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Xoá user thất bại';
            setError(msg);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Quản lý người dùng
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <TextField
                        label="Email người dùng"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!error}
                        helperText={error}
                        size="small"
                        fullWidth
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAdd}
                        disabled={loading}
                    >
                        Thêm
                    </Button>
                </Stack>
                <List>
                    {users.map((user, idx) => (
                        <ListItem key={idx} divider
                            secondaryAction={
                                user.role !== 'admin' && (
                                    <IconButton edge="end" onClick={() => handleDelete(user.email)}>
                                        <DeleteIcon />
                                    </IconButton>
                                )
                            }
                        >
                            <ListItemText
                                primary={user.email}
                                secondary={`Role: ${user.role}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};
