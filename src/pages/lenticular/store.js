import create from 'zustand'

const useStore = create(set => ({
  lastClickedIndex: 0,
  setClickedIndex: (val) => set({ lastClickedIndex: val }),

  lenticularTweenProgress: 0,
  setLenticularTweenProgress: (val) => set({lenticularTweenProgress: val}),

  lenticularTweenProgress: 0,
  setLenticularTweenProgress: (val) => set({lenticularTweenProgress: val}),

  isLenticularTweenScrollingDown: 1,
  setIsLenticularTweenScrollingDown: (val) => set({isLenticularTweenScrollingDown: val > 0}),
}))

export default useStore