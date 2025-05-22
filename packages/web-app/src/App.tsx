import { Admin, Resource } from 'react-admin';
import SenderEmailManager from './SenderEmailManager';
import { authProvider } from './authProvider';
import { dataProvider } from './dataProvider';
import Login from './Login';

function App() {

  return (
    <Admin authProvider={authProvider} dataProvider={dataProvider} loginPage={Login} >
      
      {/* <Resource name="senders" list={SenderEmailManager} /> */}
      <Resource name="users" list={() => <div>Quản lý người dùng</div>} />
      <Resource name="emails" list={() => <div>Màn hình gửi email</div>} />
    </Admin>
  );
}

export default App;
