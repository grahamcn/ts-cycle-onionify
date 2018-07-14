import xs from 'xstream'
import { run } from '@cycle/run'
import isolate from '@cycle/isolate'
import onionify from 'cycle-onionify'
import { makeDOMDriver, div, p, h2 } from '@cycle/dom'
import '../scss/index.scss'
import Child from './child'

function main(sources): any {
	const state$ = sources.onion.state$

	// 'child'
	// The property child will host the state for the child component. The parent component
	// needs to isolate the child component under the scope 'child'
	const childSinks = isolate(Child, 'child')(sources)

	const initialReducer$ =
		xs.of(function initialReducer() {
			return {
				elapsed: 0,
			}
		})

	const addOneReducer$ =
		xs.periodic(1000)
			.mapTo(function addOneReducer(prev) {
				return Object.assign({}, {...prev}, {
					elapsed: prev.elapsed + 1,
				})
			})

	const parentReducer$ = xs.merge(initialReducer$, addOneReducer$)
	const childReducer$ = childSinks.onion
	const reducer$ = xs.merge(parentReducer$, childReducer$)

	const parentDOM$ =
		state$.map(state =>
			div([
				h2('App Level State'),
				p(JSON.stringify(state)),
			])
		)

	const vdom$ =
		xs.combine(
			parentDOM$,
			childSinks.DOM
		).map(([parentDOM, childDom]) =>
			div([
				parentDOM,
				childDom,
			])
		)

	return {
		DOM: vdom$,
		onion: reducer$,
	}
}

const wrappedMain = onionify(main)

const drivers = {
	DOM: makeDOMDriver('#app')
}

run(wrappedMain, drivers)
