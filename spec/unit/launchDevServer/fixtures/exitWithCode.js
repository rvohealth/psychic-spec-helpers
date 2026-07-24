// spec fixture: exits immediately with the given code, never listening on any port
process.exit(Number(process.argv[2] ?? 1))
