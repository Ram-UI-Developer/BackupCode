import { createStore } from 'redux' // Importing the createStore function from Redux to create the Redux store
import rootReducer from '../reducers' // Importing the root reducer which combines all reducers in the app

// Function to save the Redux state to localStorage
const saveToLocalStorage = (state) => {
    try {
        const seriealizedState = JSON.stringify(state)
        localStorage.setItem('state', seriealizedState)
    } catch (error) {
        console.log(error)
    }
}

// Function to load the Redux state from localStorage
const loadFromLocalStorage = () => {
    try {
        const serializedState = localStorage.getItem('state')
        if (serializedState === null) return undefined
        return JSON.parse(serializedState)
    } catch (error) {
        return undefined
    }
}
// Try to get persisted state from localStorage
const persistedState = loadFromLocalStorage()
// Create the Redux store with the root reducer and the persisted state (if any)
const store = createStore(rootReducer, persistedState)
// it gets saved to localStorage
store.subscribe(() => saveToLocalStorage(store.getState()))

export default store
