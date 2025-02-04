import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'
import { Sound } from '~/src/types/sound'
import { Timeline } from '~/src/types/timeline'
import { BaseConfig, General, Other } from '~/src/types/preference'
import { MyWindow } from '~/src/types/global'

const win = (window as any) as MyWindow

export type GeneralState = {
  general: General
  loading: boolean
}

const state = (): GeneralState => ({
  general: {
    sound: {
      fav_rb: true,
      toot: true
    },
    timeline: {
      cw: false,
      nsfw: false,
      hideAllAttachments: false
    },
    other: {
      launch: false
    }
  },
  loading: false
})

export const MUTATION_TYPES = {
  UPDATE_GENERAL: 'updateGeneral',
  CHANGE_LOADING: 'changeLoading'
}

const mutations: MutationTree<GeneralState> = {
  [MUTATION_TYPES.UPDATE_GENERAL]: (state, conf: General) => {
    state.general = conf
  },
  [MUTATION_TYPES.CHANGE_LOADING]: (state, value: boolean) => {
    state.loading = value
  }
}

const actions: ActionTree<GeneralState, RootState> = {
  loadGeneral: async ({ commit }) => {
    const conf: BaseConfig = await win.ipcRenderer.invoke('get-preferences').finally(() => {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
    })
    commit(MUTATION_TYPES.UPDATE_GENERAL, conf.general as General)
    return conf
  },
  updateSound: async ({ commit, state }, sound: object) => {
    commit(MUTATION_TYPES.CHANGE_LOADING, true)
    const newSound: Sound = Object.assign({}, state.general.sound, sound)
    const newGeneral: General = Object.assign({}, state.general, {
      sound: newSound
    })
    const config = {
      general: newGeneral
    }
    const conf: BaseConfig = await win.ipcRenderer.invoke('update-preferences', config).finally(() => {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
    })
    commit(MUTATION_TYPES.UPDATE_GENERAL, conf.general as General)
  },
  updateTimeline: async ({ commit, state, dispatch }, timeline: object) => {
    commit(MUTATION_TYPES.CHANGE_LOADING, true)
    const newTimeline: Timeline = Object.assign({}, state.general.timeline, timeline)
    const newGeneral: General = Object.assign({}, state.general, {
      timeline: newTimeline
    })
    const config = {
      general: newGeneral
    }
    const conf: BaseConfig = await win.ipcRenderer.invoke('update-preferences', config).finally(() => {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
    })
    commit(MUTATION_TYPES.UPDATE_GENERAL, conf.general as General)
    dispatch('App/loadPreferences', null, { root: true })
  },
  updateOther: async ({ commit, state, dispatch }, other: {}) => {
    commit(MUTATION_TYPES.CHANGE_LOADING, true)
    const newOther: Other = Object.assign({}, state.general.other, other)
    const newGeneral: General = Object.assign({}, state.general, {
      other: newOther
    })
    const config = {
      general: newGeneral
    }
    const conf: BaseConfig = await win.ipcRenderer.invoke('update-preferences', config).finally(() => {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
    })
    commit(MUTATION_TYPES.UPDATE_GENERAL, conf.general as General)
    dispatch('App/loadPreferences', null, { root: true })
    await win.ipcRenderer.invoke('change-auto-launch', newOther.launch)
  },
  reset: async ({ commit, dispatch }): Promise<string> => {
    commit(MUTATION_TYPES.CHANGE_LOADING, true)
    try {
      const conf: BaseConfig = await win.ipcRenderer.invoke('reset-preferences')
      await dispatch('Preferences/Language/changeLanguage', conf.language.language, { root: true })
      await dispatch('App/loadPreferences', null, { root: true })
      commit(MUTATION_TYPES.UPDATE_GENERAL, conf.general as General)
      return conf.language.language
    } finally {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
    }
  }
}

const getters: GetterTree<GeneralState, RootState> = {
  notDarwin: () => {
    return win.platform !== 'darwin'
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
} as Module<GeneralState, RootState>
