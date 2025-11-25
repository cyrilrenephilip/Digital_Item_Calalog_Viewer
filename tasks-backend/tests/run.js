import axios from 'axios'
axios.defaults.timeout = 5000

function assert(cond, msg) {
  if (!cond) {
    console.error('TEST FAIL:', msg)
    process.exit(1)
  }
}

async function main() {
  const base = 'http://127.0.0.1:3001'

  // GET /tasks
  let listRes
  try {
    listRes = await axios.get(base + '/tasks')
  } catch (e) {
    console.error('GET /tasks failed', e.code || e.message)
    throw e
  }
  assert(listRes.status === 200, 'GET /tasks status')
  assert(Array.isArray(listRes.data), 'GET /tasks body array')

  // POST /tasks create new with max_submissions: 2
  const createRes = await axios.post(base + '/tasks', {
    title: 'Test Task',
    description: 'Testing',
    max_submissions: 2
  })
  assert(createRes.status === 201, 'POST /tasks status')
  const task = createRes.data
  assert(task.id, 'created task has id')

  // Concurrent submissions: 3 attempts, expect last to fail with 409
  const payload = { name: 'Alice', email: 'alice@example.com', message: 'hi' }
  const reqs = [0,1,2].map(() => axios.post(`${base}/tasks/${task.id}/submit`, payload).then(r => ({ ok: true, status: r.status, data: r.data })).catch(err => ({ ok: false, status: err.response?.status, data: err.response?.data })))
  const results = await Promise.all(reqs)
  const successCount = results.filter(r => r.ok && r.status === 200).length
  const conflictCount = results.filter(r => r.status === 409).length
  assert(successCount === 2, `expected 2 successes, got ${successCount}`)
  assert(conflictCount === 1, `expected 1 conflict, got ${conflictCount}`)

  // Verify count
  const getRes = await axios.get(`${base}/tasks/${task.id}`)
  assert(getRes.data.submissions_count === 2, 'submissions_count is 2')

  console.log('All tests passed')
  process.exit(0)
}

main().catch(e => {
  if (e.response) {
    console.error('TEST ERROR', e.response.status, e.response.data)
  } else {
    console.error('TEST ERROR', e.message)
  }
  process.exit(1)
})
