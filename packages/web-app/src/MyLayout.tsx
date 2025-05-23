import { Layout } from 'react-admin';
import { MyMenu } from './MyMenu';

export const MyLayout = ({ children }: { children: React.ReactNode }) => {
    return <Layout menu={MyMenu}>{children}</Layout>;
};