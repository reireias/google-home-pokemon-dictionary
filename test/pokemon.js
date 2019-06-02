const test = require('ava')
const pokemon = require('../src/pokemon.js')

test('flavorText', async t => {
  const data = await pokemon.getData('フシギダネ')
  t.is(data.name, 'フシギダネ')
  t.is(data.genus, 'たねポケモン')
  t.is(
    data.flavorText,
    '日なたで昼寝をする姿を見かける。太陽の光をいっぱい浴びることで背中のタネが大きく育つのだ。'
  )
})

test('flavorText not found', async t => {
  const data = await pokemon.getData('not exist')
  t.is(data, null)
})

test('Random', async t => {
  const data = await pokemon.getData('random')
  t.true(data.name !== null)
  t.true(data.genus !== null)
  t.true(data.flavorText !== null)
})
