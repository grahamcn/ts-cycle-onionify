import xs from 'xstream'
import { run } from '@cycle/run'
import onionify, { makeCollection } from 'cycle-onionify'
import { makeDOMDriver, div, p, h2, ul, VNode, a, map } from '@cycle/dom'
import '../scss/index.scss'
import Child from './child'
import Child2 from './child2'

function main(sources): any {
	const state$ = sources.onion.state$

	// child sink 2 has a child itself: Child3
	// the instantiation of Child 3 with a Lens shows the map state to props equivelance,
	// or the injetion of some sub state in MobX, say (based on the little i know of MobX),
	// in CycleJS.
	// multiple components can act on the same piece of state
	const child2Sinks = Child2(sources)

	const initialReducer$ =
		xs.of(function initialReducer() {
			return []
		})

	const addOneItemReducer$ =
		xs.periodic(2000)
			.map(i =>
				function addOneItemReducer(prev) {
					return [...prev, {
						id: i,
						count: i,
					}]
				}
			)

	const parentDOM$: xs<VNode> =
		state$.map(state =>
			div([
				h2('App Level State'),
				p(JSON.stringify(state)),
			])
		)

	const List = makeCollection({
		item: Child,
		itemKey: (item: any) => item.id,
		itemScope: key => key,
		collectSinks: instances => {
			return {
				onion: instances.pickMerge('onion'), // merge all the state streams
				DOM: instances.pickCombine('DOM') // combine all the dom streams
					.map(itemVNodes => itemVNodes)
			}
		}
	})

	const listSinks = List(sources)

	// just to show the type, asssign to a typed const
	const listSinksDOM: xs<Array<VNode>> = listSinks.DOM

	const parentReducer$ = xs.merge(initialReducer$, addOneItemReducer$)
	const reducer$ = xs.merge(parentReducer$, listSinks.onion)

	const vdom$ =
		xs.combine(
			parentDOM$, // xs<VNode>
			listSinksDOM, // xs<Array<VNode>>
			child2Sinks.DOM,
		).map(([parentDOM, childDom, child2DOM]: any) =>
			div([
				parentDOM,
				child2DOM,
				ul([...childDom]), // Array<VNode>,
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
