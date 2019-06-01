'use strict'
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const pokemon = require('./pokemon')
const voice = require('./voice')
const beebotte = require('beebotte')
const express = require('express')
const googlehome = require('google-home-notifier')
const internalIp = require('internal-ip')

const GOOGLE_HOME_NAME = process.env.GOOGLE_HOME_NAME
const GOOGLE_HOME_LANG = process.env.GOOGLE_HOME_LANG || 'ja'
const TEMP_DIR = fs.mkdtempSync('/tmp/pokemon')

const app = express()
const beebotteClient = new beebotte.Stream({
  transport: {
    type: 'mqtt',
    token: process.env.BEEBOTTE_CHANNEL_TOKEN
  }
})
const ip = internalIp.v4.sync()

const main = () => {
  // connect to google home
  googlehome.device(GOOGLE_HOME_NAME, GOOGLE_HOME_LANG)

  // subscribe beebotte
  beebotteClient.on('connected', subscribe)

  // start express server
  app.use(express.static(TEMP_DIR))
  app.listen(3000)
}

const subscribe = () => {
  beebotteClient.subscribe(
    process.env.BEEBOTTE_CHANNEL,
    process.env.BEEBOTTE_RESOURCE,
    handleMessage
  )
}

const handleMessage = message => {
  ;(async () => {
    const name = message.data
    const data = await pokemon.getData(name)
    await notify(data)
  })()
}

const notify = async data => {
  const message = `${data.name}。${data.genus}。${data.flavorText}`
  const filePath = await voice.download(message, TEMP_DIR)
  const filename = path.basename(filePath)
  googlehome.play(`http://${ip}:3000/${filename}`, () => {
    setTimeout(() => {
      fs.unlinkSync(filePath)
    }, 10000)
  })
}

main()
