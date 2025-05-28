import { Admin, CustomRoutes, Resource } from 'react-admin';
import { SenderEmailManage } from './SenderEmailManage';
import { UserManage } from './pages/UserManage';
import { BulkEmail } from './pages/BulkEmail';
import ProtectedRoute from './ProtectedRoute';
import { authProvider } from './authProvider';
import { dataProvider } from './dataProvider';
import Login from './Login';
import { Route } from 'react-router-dom';
import { MyLayout } from './MyLayout';
import LogList from './pages/LogList';

function App() {

  return (
    <Admin
      authProvider={authProvider}
      dataProvider={dataProvider}
      loginPage={Login}
      layout={MyLayout}
    >
        <CustomRoutes>
            <Route
                path="/send-email-manage"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <SenderEmailManage />
                  </ProtectedRoute>
                }
            />
            <Route
                path="/user-manage"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManage />
                  </ProtectedRoute>
                }
            />
            <Route
                path="/bulk-email"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'user']}>
                    <BulkEmail />
                  </ProtectedRoute>
                }
            />
            <Route
                path="/log-mail"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'user']}>
                    <LogList />
                  </ProtectedRoute>
                }
            />
        </CustomRoutes>
    </Admin>
  );
}


export default App;
