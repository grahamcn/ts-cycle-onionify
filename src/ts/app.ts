import xs, { Stream } from 'xstream'
import { run } from '@cycle/run'
import onionify, { makeCollection, StateSource, Reducer } from 'cycle-onionify'
import { makeDOMDriver, div, p, h2, ul, VNode, a, map, DOMSource } from '@cycle/dom'
import '../scss/index.scss'
import Child from './child'
import Child2 from './child2'
import isolate from '../../node_modules/@cycle/isolate'
import FooBar from './fooBar'

export interface ListItem {
	count: number,
	id: number,
}

export interface State {
	list: Array<ListItem>
	foo?: Date,
	bar?: Date,
	status?: Date,
}

export interface Sources {
	DOM: DOMSource,
	onion: StateSource<State>
}

export interface Sinks {
	DOM: Stream<VNode>,
	onion: Stream<Reducer<State>>,
}

function main(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	// child sink 2 has a child itself: Child3
	// the instantiation of Child 3 with a Lens shows the map state to props equivelance,
	// or the injetion of some sub state in MobX, say (based on the little i know of MobX),
	// in CycleJS.
	// multiple components can act on the same piece of state
	const child2Sinks = Child2(sources)

	const initialReducer$: Stream<Reducer<State>> =
		xs.of(function initialReducer(prev: State): State {
			return {
				list: []
			}
		})

	const addOneItemReducer$: Stream<Reducer<State>> =
		xs.periodic(2000)
			.map(i =>
				function addOneItemReducer(prev: State): State {
					return {
						...prev,
						list: [...prev.list, {
							id: i,
							count: i,
						}]
					}
				}
			)

	const parentDOM$: xs<VNode> =
		state$.map((state: State) =>
			div([
				h2('App Level State'),
				p(JSON.stringify(state)),
			])
		)

	const fooLens = { //    { val: 3, status: 'ready' }
		get: state => ({ val: state.foo, status: state.status }),
		set: (state, childState): any => ({ ...state, foo: childState.val, status: childState.status })
	}

	const barLens = { //    { val: 8, status: 'ready' }
		get: state => ({ val: state.bar, status: state.status }),
		set: (state, childState): any => ({ ...state, bar: childState.val, status: childState.status })
	}

	// wrong type of state at the moment.
	const fooSinks: any = isolate(FooBar, { onion: fooLens })(sources)
	const barSinks: any = isolate(FooBar, { onion: barLens })(sources)

	const List: any = makeCollection({
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

	const listSinks = isolate(List, 'list')(sources)

	// just to show the type, asssign to a typed const
	const listSinksDOM: xs<Array<VNode>> = listSinks.DOM

	const parentReducer$: Stream<Reducer<State>> = xs.merge(initialReducer$, addOneItemReducer$)
	const reducer$: Stream<Reducer<State>> =
		xs.merge(
			parentReducer$,
			// listSinks.onion,
			// fooSinks.onion,
			// barSinks.onion,
		)

	const vdom$ =
		xs.combine(
			parentDOM$, // xs<VNode>
			listSinksDOM, // xs<Array<VNode>>
			fooSinks.DOM,
			barSinks.DOM,
			child2Sinks.DOM,
		).map(([parentDOM, childDOM, fooDOM, barDOM, child2DOM]: any) =>
			div([
				parentDOM,
				child2DOM,
				fooDOM,
				barDOM,
				ul([...childDOM]), // Array<VNode>,
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
