import { div, p, VNode } from '@cycle/dom'
import { StateSource } from '../../node_modules/cycle-onionify'
import { Stream } from '../../node_modules/xstream'

export interface State {
	itemCount: number,
	averageCount: number,
}

export interface Sources {
	onion: StateSource<State>
}

export interface Sinks {
	DOM: Stream<VNode>
}

function Child3(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const vdom$ =
		state$.map(state =>
			div([
				p('Child 3, isolated, with access to the single state atom via a Lens'),
				JSON.stringify(state),
			])
		)

	return {
		DOM: vdom$,
	}
}

export default Child3
