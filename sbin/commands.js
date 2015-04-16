module.exports = {
  echo: {
    cmd: 'ebin/echo',
    description: 'Execute commands in series'
  },
  file: {
    cmd: 'ebin/pluck',
    description: 'Read json from filesystem and pluck field'
  },
  lscat: {
    cmd: 'ebin/lscat',
    description: 'Pipe stdout of a command to the stdin of the next command'
  },
  whoami: {
    cmd: 'ebin/whoami',
    description: 'Execute an external command with callback'
  },
  who: {
    cmd: 'who | ebin/who',
    description: 'Pipe stdin to various plugins to produce json'
  },
}
