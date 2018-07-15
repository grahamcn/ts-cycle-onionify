import xs from 'xstream'
import { p, div } from '@cycle/dom'
import Child3 from './child3'
import isolate from '../../node_modules/@cycle/isolate'

function Child2(sources): any {

	const derivedItemDataLens = {
		get: state => ({
			itemCount: state.length,
			averageCount: state.reduce((a, b) => a + b.count, 0) / state.length
		}),
		set: (state, childState) => state // ignore updates for now (also, this then does not create a property on the top level state atom, state is local)
	}

	const child3Sinks = isolate(Child3, {onion: derivedItemDataLens})(sources)

	const vdom$ =
		xs.combine(
			xs.of(p('Hello from child 2 - i am not isolated')),
			child3Sinks.DOM,
		).map(([child2Dom, child3Dom]) =>
			div([
				child2Dom,
				child3Dom,
			])
		)

	return {
		DOM: vdom$,
	}
}

export default Child2
