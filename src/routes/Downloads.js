import React, { Component } from 'react'
import moment from 'moment'
import Chart from 'chart.js'

import Heading from '../components/Heading'

const DATE_FORMAT = 'YYYY-MM-DD'

class Downloads extends Component {
  state = {
    data: [],
    dirty: false,
    filename: '',
    gte: moment({
      day: 1,
    }).format(DATE_FORMAT),
    lte: moment({
      day: moment().daysInMonth(),
    }).format(DATE_FORMAT),
    pending: false,
  }
  componentDidMount () {
    if ('chart' in this.refs && this.refs.chart.nodeName.toLowerCase() === 'canvas') {
      this.chart = new Chart(this.refs.chart, {
        type: 'bar',
        data: {},
        options: {
          animation: false,
          scales: {
            xAxes: [{
              ticks: {
                fontFamily: 'sans-serif',
                fontSize: 10,
              },
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
                fontFamily: 'sans-serif',
                fontSize: 10,
                min: 0,
                stepSize: 1,
                suggestedMax: 10,                
              }
            }]
          },
          tooltips: {
            callbacks: {
              title: function (tooltipItem) {
                return moment(tooltipItem[0].xLabel).format('LL')
              }
            },
          }
        }
      })
    }
  }
  componentWillUnmount () {
    this.chart.destroy()
  }
  componentDidUpdate () {
    const { dirty } = this.state
    if (dirty) {
      this.setState({
        dirty: false,
      }, this.draw)
    }
  }
  render () {
    const { filename, gte, lte } = this.state
    return (
      <div className="container">
        <Heading title="Nedlastinger" />
        
        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
              <label htmlFor="filename">Filnavn</label>
              <div className="input-group">
                <span className="input-group-addon">
                  <span className="glyphicon glyphicon-file" />
                </span>
                <input className="form-control" id="filename" name="filename" onChange={this.changeHandler} value={ filename } />
              </div>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form-group">
              <label htmlFor="gte">Fra</label>
              <div className="input-group">
                <input className="form-control" id="gte" name="gte" onChange={this.changeHandler} value={ gte } />
                <div className="input-group-btn">
                  <button aria-label="Help" className="btn btn-default" type="button">
                    <span className="glyphicon glyphicon-calendar" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form-group">
              <label htmlFor="lte">Til</label>
              <div className="input-group">
                <input className="form-control" id="lte" name="lte" onChange={this.changeHandler} value={ lte } />
                <div className="input-group-btn">
                  <button aria-label="Help" className="btn btn-default" type="button">
                    <span className="glyphicon glyphicon-calendar" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-2 col-sm-offset-10">
            <div className="form-group">
              <button className="btn btn-default btn-block" onClick={this.clickHandler.bind(this)} type="button">Hent</button>
            </div>
          </div>
        </div>
        <div className="panel panel-default">
          <div className="panel-heading">Resultat</div>
          <div>
            <canvas ref="chart" />
          </div>
        </div>
      </div>
    );
  }
  changeHandler = event => {
    const { name, value } = event.target
    this.setState({
      [name]: value,
    })
  }
  clickHandler () {
    this.setState({
      pending: true,
    }, this.dataLoadFetch)
  }
  dataLoadFetch () {
    const { filename , gte , lte } = this.state
    fetch(`https://status.geonorge.no/statistikkApi/nedlastinger?filnavn=${filename}&fra=${gte}&til=${lte}`)
    .then( r => r.json() )
		.then( result => {
      this.setState({
        data: result,
        dirty: true,
        pending: false,
      })
    })
  }
  draw () {
    const { data, filename } = this.state
    this.chart.data = {
      labels: data.map(dataPoint => {
        return dataPoint.dato
      }),
      datasets: [{
        backgroundColor: 'red',
        data: data.map(dataPoint => {
          return dataPoint.nedlastinger
        }),
        label: filename,
      }]
    }
    this.chart.update()
  }
}

export default Downloads;
