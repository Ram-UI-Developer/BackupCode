import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import AppRouter from './Routes'
import store from './store'
import './Common/Styles/Common.css'
import 'antd/dist/antd.css'

function App() {
    useEffect(() => {
        document.title = 'Workshine'
    }, [])
    return (
        <div className="app">
            <Provider store={store}>
                <AppRouter />
            </Provider>
        </div>
    )
}

export default App
