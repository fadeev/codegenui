import { txClient, queryClient } from './module'

const getDefaultState = () => {
	return {
		_Structure: {
			Post: {
				fields: [
					{
						name: 'creator',
						type: 'string'
					},
					{
						name: 'id',
						type: 'string'
					},
					{
						name: 'title',
						type: 'string'
					},
					{
						name: 'body',
						type: 'string'
					},
					{
						name: 'votes',
						type: 'int'
					}
				]
			}
		},
		Post: {},
		PostAll: {},
		_Subscriptions: new Set()
	}
}
// initial state
const state = getDefaultState()

export default {
	namespaced: true,
	state,
	mutations: {
		RESET_STATE(state) {
			Object.assign(state, getDefaultState())
		},
		POST(state, { queryParams, post }) {
			state.Post[queryParams] = post
		},
		POST_ALL(state, { post }) {
			state.PostAll = post
		},
		SUBSCRIBE(state, subscription) {
			state._Subscriptions.add(subscription)
		},
		UNSUBSCRIBE(state, subscription) {
			state._Subscriptions.delete(subscription)
		}
	},
	getters: {
		getPost: (state) => (id) => {
			if (id != '' && state.Post['/' + id]) {
				return state.Post['/' + id].Post
			} else {
				return {}
			}
		},
		getPostAll: (state) => () => {
			return state.PostAll.Post
		},
		getTypeStructure: (state) => (type) => {
			return state._Structure[type].fields
		}
	},
	actions: {
		init({ dispatch, rootGetters }) {
			if (rootGetters['chain/common/env/client']) {
				rootGetters['chain/common/env/client'].on('newblock', () => {
					dispatch('StoreUpdate')
				})
			}
		},
		resetState({ commit }) {
			commit('RESET_STATE')
		},
		async StoreUpdate({ state, dispatch }) {
			state._Subscriptions.forEach((subscription) => {
				dispatch(subscription.action, subscription.payload)
			})
		},
		unsubscribe({ commit }, subscription) {
			commit('UNSUBSCRIBE', subscription)
		},
		async QueryPost({ commit, rootGetters }, { id, subscribe = false }) {
			try {
				const post = (
					await (
						await queryClient({
							addr: rootGetters['chain/common/env/apiCosmos']
						})
					).queryPost(id)
				).data
				const queryParams = '/' + id
				commit('POST', { queryParams, post })
				if (subscribe) {
					commit('SUBSCRIBE', {
						action: 'QueryPost',
						payload: { id }
					})
				}
			} catch (e) {
				console.log('Query Failed: API node unavailable')
			}
		},

		async QueryPostAll({ commit, rootGetters }, { subscribe = false }) {
			try {
				const post = (
					await (
						await queryClient({
							addr: rootGetters['chain/common/env/apiCosmos']
						})
					).queryPostAll()
				).data
				commit('POST_ALL', { post })
				if (subscribe) {
					commit('SUBSCRIBE', {
						action: 'QueryPostAll',
						payload: {}
					})
				}
			} catch (e) {
				console.log('Query Failed: API node unavailable')
			}
		},
		async MsgCreatePost({ rootGetters }, { value }) {
			try {
				const msg = await (
					await txClient(rootGetters['chain/common/wallet/signer'], {
						addr: rootGetters['chain/common/env/apiTendermint']
					})
				).msgCreatePost(value)
				await (
					await txClient(rootGetters['chain/common/wallet/signer'], {
						addr: rootGetters['chain/common/env/apiTendermint']
					})
				).signAndBroadcast([msg])
			} catch (e) {
				throw 'Failed to broadcast transaction: ' + e
			}
		},
		async MsgUpdatePost({ rootGetters }, { value }) {
			try {
				const msg = await (
					await txClient(rootGetters['chain/common/wallet/signer'], {
						addr: rootGetters['chain/common/env/apiTendermint']
					})
				).msgUpdatePost(value)
				await (
					await txClient(rootGetters['chain/common/wallet/signer'], {
						addr: rootGetters['chain/common/env/apiTendermint']
					})
				).signAndBroadcast([msg])
			} catch (e) {
				throw 'Failed to broadcast transaction: '
			}
		},
		async MsgDeletePost({ rootGetters }, { value }) {
			try {
				const msg = await (
					await txClient(rootGetters['chain/common/wallet/signer'], {
						addr: rootGetters['chain/common/env/apiTendermint']
					})
				).msgDeletePost(value)
				await (
					await txClient(rootGetters['chain/common/wallet/signer'], {
						addr: rootGetters['chain/common/env/apiTendermint']
					})
				).signAndBroadcast([msg])
			} catch (e) {
				throw 'Failed to broadcast transaction: ' + e
			}
		}
	}
}
