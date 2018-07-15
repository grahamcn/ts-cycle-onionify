import xs from 'xstream'
import { button, div, h3, p } from '@cycle/dom'

function Child(sources): any {
	const state$ = sources.onion.state$

	const defaultReducer$ = xs.of(function defaultReducer(prevState) {
		// Parent didn't provide state for the child, so initialize it.
		if (typeof prevState === 'undefined') {
			return {
				count: 0
			}
		} else {
			return prevState // Let's just use the state given from the parent.
		}
	})

	// this reducer acts upon the 'child' piece of state, as the Child component
	// is isolated by the Parent under the scope 'child'
	// child is a primitive in this example (number), so the initial / default reducer and
	// all other reducers merged must act on and return that piece of state.
	// state for a component would be defined via an interface.
	const incrementReducer$ =
		sources.DOM
			.select('.increment')
			.events('click')
			.mapTo(function incrementReducer(prev) {
				return {
					count: prev.count + 1
				}
			})

	const reducer$ = xs.merge(defaultReducer$, incrementReducer$)

	const vdom$ =
		state$.map(state =>
			div([
				div([
					h3('Child Instance State'),
					p(JSON.stringify(state)),
				]),
				button('.increment', {
					attrs: {
						type: 'button',
					},
					style: {
						border: 'solid 1px rgba(0,0,0,0.8)',
					},
				}, 'Increment child state')
			])
		)

	return {
		DOM: vdom$,
		onion: reducer$,
	}
}

export default Child
