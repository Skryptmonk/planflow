import { combineReducers } from '@reduxjs/toolkit';
import mainscreenReducer from './mainscreen/reducer/mainscreenReducer';

export default combineReducers({mainscreen:mainscreenReducer});