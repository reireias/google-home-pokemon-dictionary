const fs = require('fs')
const path = require('path')
const voiceText = require('@shooontan/voicetext')
const voice = voiceText(process.env.VOICETEXT_API_TOKEN)

exports.download = async (text, root) => {
  const date = new Date()
  const filePath = path.join(root, `${date.getTime()}.mp3`)
  const buffer = await voice.mp3(text, 'hikari')
  fs.writeFileSync(filePath, buffer)
  return filePath
}
