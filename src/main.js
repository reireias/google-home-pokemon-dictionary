const bodyParser = require('body-parser')
const config = require('config')
const express = require('express')
const fs = require('fs')
const googlehome = require('google-home-notifier')
const path = require('path')
const request = require('request')
const VoiceText = require('voicetext')

const searchUrl = 'https://pokeapi.co/api/v2/pokemon-species/'
const nameIdMap = JSON.parse(fs.readFileSync('./pokemon.json', 'utf-8'))
const voice = new VoiceText(config.voice.key)
const app = express()

const main = () => {
  googlehome.ip(config.googlehome.ip, config.googlehome.language)
  app.use(express.static(path.join(__dirname, '/tmp')))
  app.use(bodyParser.json())
  app.post('/pokemon', postPokemon)
  app.listen(config.port, () => {
    console.log('started')
  })
}

const postPokemon = (req, res) => {
  var promise = Promise.resolve(req.body.name)
  promise.then(search).then(notify).catch(handleError)
  res.send('ok')
}

const search = name => {
  return new Promise((resolve, reject) => {
    if (nameIdMap[name]) {
      let options = {
        url: searchUrl + nameIdMap[name],
        json: true
      }
      request.get(options, (error, response, body) => {
        if (error) {
          reject(error)
        }
        if (response.statusCode === 200) {
          let message = createNotifyMessage(body)
          resolve(message)
        } else {
          reject(new Error('検索時にエラーが発生しました。'))
        }
      })
    } else {
      reject(new Error('ポケモンが見つかりませんでした。'))
    }
  })
}

const notify = message => {
  return new Promise((resolve, reject) => {
    console.info(message)
    voice.speaker(voice.SPEAKER.HIKARI).speak(message, (error, buf) => {
      if (error) {
        reject(error)
      }
      fs.writeFileSync('./tmp/tmp.wav', buf, 'binary')
      googlehome.play(`http://${config.server.ip}:${config.port}/tmp.wav`, response => {
        console.info(response)
      })
    })
  })
}

const handleError = error => {
  googlehome.notify(error.message, () => {
    console.error(error)
  })
}

const createNotifyMessage = body => {
  let language = config.pokeapi.language
  let ftLanguage = config.pokeapi.flavorText.language
  let version = config.pokeapi.flavorText.version
  let names = body.names.filter(name => language === name.language.name)
  let genera = body.genera.filter(genus => language === genus.language.name)
  let flavorTexts = body.flavor_text_entries.filter(text => {
    return ftLanguage === text.language.name && version === text.version.name
  })
  let message =
    names[0].name + '。' + genera[0].genus + '。' + flavorTexts[0].flavor_text
  message = message.replace(/\s/g, '')
  return message
}

if (require.main === module) {
  main()
}
