import { div, p } from '@cycle/dom'

function Child3(sources): any {
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
