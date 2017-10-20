import xs from 'xstream'
import {run} from '@cycle/run'
import {makeDOMDriver, h3} from '@cycle/dom'
import './scss/index.scss';

const formatSeconds = (value: number): string => `seconds elapsed: ${value} `

function main() {
  const sinks = {
    DOM: xs.periodic(1000)
          .map(i =>
            h3(formatSeconds(i))
          )
  };

  return sinks;
}

const drivers = {
  DOM: makeDOMDriver('#app')
};

run(main, drivers);
