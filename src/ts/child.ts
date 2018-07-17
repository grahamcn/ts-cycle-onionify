import xs, { Stream } from 'xstream'
import { button, li, h3, p, DOMSource, VNode } from '@cycle/dom'
import { StateSource, Reducer } from '../../node_modules/cycle-onionify';
import {ListItem} from './app'

export interface State extends ListItem {}

export interface Sources {
	DOM: DOMSource,
	onion: StateSource<State>
}

export interface Sinks {
	DOM: Stream<VNode>,
	onion: Stream<Reducer<State>>,
}

function Child(sources): any {
	const state$ = sources.onion.state$

	const incrementReducer$ =
		sources.DOM
			.select('.increment')
			.events('click')
			.mapTo(function incrementReducer(prev) {
				return {
					id: prev.id,
					count: prev.count + 1
				}
			})

		const deleteReducer$ =
			sources.DOM
				.select('.delete')
				.events('click')
				.mapTo(function deleteReducer() {
					return undefined
				})

	const reducer$ = xs.merge(incrementReducer$, deleteReducer$)

	const vdom$ =
		state$.map(state =>
			li([
				h3('Child Instance State'),
				p(JSON.stringify(state)),
				button('.increment', {
					attrs: {
						type: 'button',
					},
					style: {
						border: 'solid 1px rgba(0,0,0,0.8)',
					},
				}, 'Increment child instance state'),
				button('.delete', {
					attrs: {
						type: 'button',
					},
					style: {
						border: 'solid 1px Red',
					},
				}, 'Delete child instance')
			])
		)

	return {
		DOM: vdom$,
		onion: reducer$,
	}
}

export default Child
