import fs from 'fs'

// Read env file
const envContent = fs.readFileSync('.env.local', 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const parts = line.split('=')
  if (parts.length >= 2) {
    const key = parts[0].trim()
    const val = parts.slice(1).join('=').trim()
    env[key] = val
  }
})

async function run() {
  const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/frete?select=*`
  const res = await fetch(url, {
    headers: {
      'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
    }
  })
  if (!res.ok) {
    console.error('HTTP Error:', res.status, await res.text())
    return
  }
  const data = await res.json()
  console.log('Frete rows count:', data?.length)
  console.log('Frete rows:', JSON.stringify(data, null, 2))
}

run()
