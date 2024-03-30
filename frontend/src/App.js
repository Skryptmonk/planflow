import './App.css';
import { Provider } from 'react-redux';
import store from './store.js';
import Home from './v2/home/home';
import MainScreen from './mainscreen/mainscreen';

function App(props) {
  return (
    <Provider store={store}>
      <div className="App">
        <header className="App-header">
          {window.location.pathname == "/mockup/v2" ? <Home /> : <MainScreen/>}
        </header>
      </div>
    </Provider>
  );
}

export default App;
