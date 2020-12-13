import create from "zustand"

const useStore = create(
  (set, get, api) => ({
    advance: (type, key, callback) => {
      set(state => {
        const newValue = callback(state)
        return {
          ...state,
          [type]: {
            ...state[type],
            [key]: newValue,
          },
        }
      })
      return get()[type][key]
    },
    setInitialState: (type, initialState) => {
      set(state => {
        return {
          ...state,
          [type]: initialState,
        }
      })
    },
  })
)

const subscribe = useStore.subscribe
const getState = useStore.getState
const setState = useStore.setState

export { useStore, subscribe, getState, setState }
