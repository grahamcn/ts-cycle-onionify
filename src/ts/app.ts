import xs from 'xstream'
import { run } from '@cycle/run'
import isolate from '@cycle/isolate'
import onionify, { makeCollection } from 'cycle-onionify'
import { makeDOMDriver, div, p, h2, ul, VNode } from '@cycle/dom'
import '../scss/index.scss'
import Child from './child'

function main(sources): any {
	const state$ = sources.onion.state$

	const initialReducer$ =
		xs.of(function initialReducer() {
			return []
		})

	const addOneItemReducer$ =
		xs.periodic(1000)
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
				onion: instances.pickMerge('onion'),
				DOM: instances.pickCombine('DOM')
					.map(itemVNodes => {
						return itemVNodes
					})
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
		).map(([parentDOM, childDom]: any) =>
			div([
				parentDOM,
				ul([...childDom]), // Array<VNode>
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
