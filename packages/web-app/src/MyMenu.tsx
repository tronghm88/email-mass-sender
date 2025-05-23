import { Menu } from 'react-admin';
import EmailIcon from '@mui/icons-material/Email';
import UserIcon from '@mui/icons-material/Person';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { useAuth } from './hooks/useAuth';

export const MyMenu = () => {
    const { user } = useAuth();
    return (
        <Menu>
            <Menu.ResourceItems />
            <Menu.Item
                to="/bulk-email"
                primaryText="Gửi email hàng loạt"
                leftIcon={<MarkEmailReadIcon />}
            />
            {user?.role === 'admin' && (
                <Menu.Item
                    to="/user-manage"
                    primaryText="Quản lý người dùng"
                    leftIcon={<UserIcon />}
                />
            )}
            {user?.role === 'admin' && (
                <Menu.Item
                    to="/send-email-manage"
                    primaryText="Quản lý sender email"
                    leftIcon={<EmailIcon />}
                />
            )}
        </Menu>
    );
};