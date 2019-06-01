require('dotenv').config()
const test = require('ava')
const fs = require('fs')
const voice = require('../src/voice')

test('download', async t => {
  const path = await voice.download('hoge', '/tmp')
  t.true(fs.existsSync(path))
  fs.unlinkSync(path)
})
