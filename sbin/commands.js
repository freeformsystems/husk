module.exports = {
  echo: {
    cmd: 'ebin/echo',
    description: 'Execute commands in series'
  },
  lscat: {
    cmd: 'ebin/lscat',
    description: 'Pipe stdout of a command to the stdin of the next command'
  },
  pwd: {
    cmd: 'ebin/pwd',
    description: 'Execute a single command'
  },
  who: {
    cmd: 'who | ebin/who',
    description: 'Pipe stdin to various plugins to produce json'
  },
}
