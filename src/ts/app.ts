import xs from 'xstream'
import { run } from '@cycle/run'
import { makeDOMDriver, div, p, h2 } from '@cycle/dom'
import '../scss/index.scss'
import onionify from 'cycle-onionify'

function main(sources) {
	const state$ = sources.onion.state$

	const initialReducer$ = xs.of(function initialReducer() { return 0 })
	const addOneReducer$ = xs.periodic(1000)
		.mapTo(function addOneReducer(prev) { return prev + 1 })

	const reducer$ = xs.merge(initialReducer$, addOneReducer$)

	const vdom$ =
		state$.map(state =>
			div([
				h2('App Level State'),
				p(JSON.stringify(state)),
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
