import xs from 'xstream'
import { run } from '@cycle/run'
import { makeDOMDriver, h3, img, div } from '@cycle/dom'
import '../scss/index.scss'
import * as logoImage from '../assets/logo.png'

const formatSeconds = (value: number): string => `seconds elapsed: ${value} `

function main() {
	const sinks = {
		DOM: xs.periodic(1000)
			.startWith(-1)
			.map(i =>
				div([
					h3(formatSeconds(i + 1)),
					img({ attrs: { src: logoImage } })
				])
			)
	}

	return sinks
}

const drivers = {
	DOM: makeDOMDriver('#app')
}

run(main, drivers)
