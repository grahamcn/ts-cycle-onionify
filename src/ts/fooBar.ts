import xs, { Stream } from 'xstream'
import { button, li, h3, p, DOMSource, VNode } from '@cycle/dom'
import { StateSource, Reducer } from '../../node_modules/cycle-onionify'

export interface State {
	val: Date,
	status: Date,
}

export interface Sources {
	DOM: DOMSource,
	onion: StateSource<State>
}

export interface Sinks {
	DOM: Stream<VNode>,
	onion: Stream<Reducer<State>>,
}

function FooBar(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const statusReducer$ =
		sources.DOM
			.select('.updateStatus')
			.events('click')
			.mapTo(function statusReducer(prev) {
				return {
					...prev,
					status: Date.now(),
				}
			})

	const valReducer$ =
		sources.DOM
			.select('.updateVal')
			.events('click')
			.mapTo(function valReducer(prev) {
				return {
					...prev,
					val: Date.now(),
				}
			})

	const reducer$ = xs.merge(statusReducer$, valReducer$)

	const vdom$ =
		state$.map(state =>
			li([
				h3('FooBar'),
				p(JSON.stringify(state)),
				button('.updateStatus', {
					attrs: {
						type: 'button',
					},
					style: {
						border: 'solid 1px rgba(0,0,0,0.8)',
					},
				}, 'Update status'),
				button('.updateVal', {
					attrs: {
						type: 'button',
					},
					style: {
						border: 'solid 1px Red',
					},
				}, 'Update value')
			])
		)

	return {
		DOM: vdom$,
		onion: reducer$,
	}
}

export default FooBar
