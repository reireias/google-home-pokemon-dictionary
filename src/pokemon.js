const axios = require('axios')

const LANG = 'ja'
const VERSION = 'omega-ruby'
const POKEMON_ID_MAP = require('./pokemon.json')
const BASE_URL = 'https://pokeapi.co/api/v2/pokemon-species'

exports.getData = async name => {
  if (name === 'random') {
    const names = Object.keys(POKEMON_ID_MAP)
    name = names[Math.floor(Math.random() * names.length)]
  }
  if (!(name in POKEMON_ID_MAP)) {
    return null
  }

  const url = `${BASE_URL}/${POKEMON_ID_MAP[name]}`
  const res = await axios.get(url)
  const genusObj = res.data.genera.find(genus => genus.language.name === LANG)
  const flavorTextObj = res.data.flavor_text_entries.find(
    text => text.language.name === LANG && text.version.name === VERSION
  )
  return {
    name: name,
    genus: genusObj.genus,
    flavorText: flavorTextObj.flavor_text.replace(/\s/g, '')
  }
}
